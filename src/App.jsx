import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import SettingsDialog from './components/SettingsDialog.jsx'
import UrlInput from './components/UrlInput.jsx'
import VideoPlaceholder from './components/VideoPlaceholder.jsx'
import VideoCard from './components/VideoCard.jsx'
import DownloadQueue from './components/DownloadQueue.jsx'
import PlaylistModal from './components/PlaylistModal.jsx'
import Library from './components/Library.jsx'
import BrowserModal from './components/BrowserModal.jsx'

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [browserOpen, setBrowserOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [url, setUrl] = useState('')
  const [video, setVideo] = useState(null)
  const [playlist, setPlaylist] = useState(null)
  const [selectedFormat, setSelectedFormat] = useState('best')
  const [advancedOptions, setAdvancedOptions] = useState({
    subtitles: false,
    thumbnail: false,
    embedMetadata: false,
    speedLimit: 'none',
    compression: 'original',
    startTime: '',
    endTime: '',
  })
  const [analyzing, setAnalyzing] = useState(false)
  const [queue, setQueue] = useState([])
  const [history, setHistory] = useState([])
  const [queuePaused, setQueuePaused] = useState(false)
  const [preferences, setPreferences] = useState({
    downloadDirectory: '',
    theme: 'dark',
    cookiesFilePath: null,
  })
  const [error, setError] = useState('')
  const [clipboardToastUrl, setClipboardToastUrl] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  function handleExternalAnalysis(incomingUrl) {
    setActiveTab('home')
    setUrl(incomingUrl)
    runAnalysis(incomingUrl)
  }

  useEffect(() => {
    if (!toastMessage) return undefined
    const timer = window.setTimeout(() => {
      setToastMessage('')
      setClipboardToastUrl('')
    }, 5000)
    return () => window.clearTimeout(timer)
  }, [toastMessage])

  async function runAnalysis(inputUrl) {
    setAnalyzing(true)
    setVideo(null)
    setPlaylist(null)
    setError('')

    try {
      if (!window.downloader?.analyzeVideo) {
        throw new Error('A ponte do Electron não está disponível.')
      }
      const result = await window.downloader.analyzeVideo(inputUrl.trim())
      if (result.type === 'playlist') {
        setPlaylist({ ...result, url: inputUrl.trim() })
      } else {
        setVideo(result)
        setSelectedFormat('best')
      }
    } catch (analysisError) {
      setError(analysisError.message || 'Não foi possível analisar este vídeo.')
    } finally {
      setAnalyzing(false)
    }
  }

  useEffect(() => {
    if (!window.downloader) return undefined

    const unsubscribeQueue = window.downloader.onDownloadQueueUpdated((snapshot) => {
      setQueue(snapshot.items)
      setQueuePaused(snapshot.paused)
    })
    const unsubscribePreferences = window.downloader.onPreferencesUpdated((saved) => {
      setPreferences(saved)
    })
    const unsubscribeClipboard = window.downloader.onClipboardLinkDetected((detectedUrl) => {
      setClipboardToastUrl(detectedUrl)
      setToastMessage('Link detectado na área de transferência. Deseja analisar?')
    })
    const unsubscribeShortcut = window.downloader.onGlobalShortcutLink(handleExternalAnalysis)
    const unsubscribeBrowser = window.downloader.onBrowserVideoSelected(handleExternalAnalysis)
    const unsubscribeBrowserError = window.downloader.onBrowserSearchError(setError)
    const unsubscribeHistory = window.downloader.onDownloadHistoryUpdated(setHistory)

    window.downloader.getDownloadQueue().then((snapshot) => {
      setQueue(snapshot.items)
      setQueuePaused(snapshot.paused)
    }).catch((queueError) => {
      setError(queueError.message || 'Não foi possível carregar a fila de downloads.')
    })
    window.downloader.getPreferences().then(setPreferences).catch((preferencesError) => {
      setError(preferencesError.message || 'Não foi possível carregar as preferências.')
    })
    window.downloader.getDownloadHistory().then(setHistory).catch((historyError) => {
      setError(historyError.message || 'Não foi possível carregar a biblioteca.')
    })

    return () => {
      unsubscribeQueue()
      unsubscribePreferences()
      unsubscribeClipboard()
      unsubscribeShortcut()
      unsubscribeBrowser()
      unsubscribeBrowserError()
      unsubscribeHistory()
    }
  }, [])

  async function handleAnalyze(event) {
    event.preventDefault()
    await runAnalysis(url)
  }

  async function handlePaste() {
    setError('')
    try {
      const text = await navigator.clipboard.readText()
      if (!text.trim()) throw new Error('A área de transferência está vazia.')
      setUrl(text.trim())
    } catch (pasteError) {
      setError(pasteError.message || 'Não foi possível ler a área de transferência.')
    }
  }

  async function handleDownload() {
    setError('')

    try {
      if (!window.downloader?.downloadVideo) {
        throw new Error('A ponte do Electron não está disponível.')
      }
      await window.downloader.downloadVideo(
        url.trim(),
        selectedFormat,
        video.title,
        advancedOptions,
        { thumbnail: video.thumbnail },
      )
    } catch (downloadError) {
      setError(downloadError.message || 'Não foi possível concluir o download.')
    }
  }

  async function handlePlaylistChoice(mode) {
    if (!playlist) return
    setError('')
    try {
      await window.downloader.downloadPlaylist(
        playlist.url,
        selectedFormat,
        advancedOptions,
        playlist.entries,
        mode,
      )
      setPlaylist(null)
      setClipboardToastUrl('')
      setToastMessage(
        mode === 'all'
          ? `${playlist.entries.length} vídeos adicionados à fila.`
          : 'O primeiro vídeo foi adicionado à fila.',
      )
    } catch (playlistError) {
      setPlaylist(null)
      setError(playlistError.message || 'Não foi possível adicionar a playlist à fila.')
    }
  }

  function handleClipboardToastAction() {
    const detectedUrl = clipboardToastUrl
    setToastMessage('')
    setClipboardToastUrl('')
    setUrl(detectedUrl)
    runAnalysis(detectedUrl)
  }

  async function handleCancelDownload(id) {
    try {
      await window.downloader.cancelDownload(id)
    } catch (cancelError) {
      setError(cancelError.message || 'Não foi possível cancelar o download.')
    }
  }

  async function handleTogglePause(paused) {
    try {
      const state = await window.downloader.setDownloadsPaused(paused)
      setQueuePaused(state)
    } catch (pauseError) {
      setError(pauseError.message || 'Não foi possível atualizar a fila.')
    }
  }

  async function handleChooseDirectory() {
    return window.downloader.chooseDownloadDirectory()
  }

  async function handleChooseCookiesFile() {
    return window.downloader.chooseCookiesFile()
  }

  async function handleSavePreferences(nextPreferences) {
    const saved = await window.downloader.savePreferences(nextPreferences)
    setPreferences(saved)
  }

  async function handleOpenDownloads() {
    try {
      await window.downloader.openDownloadsFolder()
    } catch (openError) {
      setError(openError.message || 'Não foi possível abrir a pasta Downloads.')
    }
  }

  async function handleShowLibraryItem(id) {
    try {
      await window.downloader.showDownloadedItem(id)
    } catch (openError) {
      setError(openError.message || 'Não foi possível localizar o arquivo.')
    }
  }

  async function handleBrowserSearch(query) {
    await window.downloader.openBrowserSearch(query)
  }

  return (
    <div
      data-theme={preferences.theme}
      className="app-shell min-h-screen bg-canvas pb-6 text-slate-100"
    >
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab)
          setError('')
        }}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="mx-auto flex w-full max-w-5xl flex-col px-5 pb-16 pt-12 sm:px-8 sm:pt-16">
        {activeTab === 'library' ? (
          <Library
            items={history}
            onShowItem={handleShowLibraryItem}
            onStartDownload={() => setActiveTab('home')}
          />
        ) : (
          <>
            <section className="mb-10 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-panel/80 px-3 py-1 text-xs font-medium text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Privado, open-source e executado localmente
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Seus vídeos, sem complicação.
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted sm:text-base">
                Cole um link para começar. Seus downloads ficam sob seu controle.
              </p>
            </section>

            <UrlInput
              value={url}
              onChange={setUrl}
              onSubmit={handleAnalyze}
              onPaste={handlePaste}
              onSearch={() => setBrowserOpen(true)}
              disabled={analyzing}
            />
            {error && (
              <p className="mt-4 text-center text-sm text-rose-300" role="alert">
                {error}
              </p>
            )}

            {analyzing ? (
              <section
                aria-label="Analisando vídeo"
                aria-busy="true"
                className="mt-8 animate-pulse rounded-2xl border border-line bg-panel p-5 sm:p-6"
              >
                <div className="flex flex-col gap-5 sm:flex-row">
                  <div className="aspect-video w-full rounded-xl bg-slate-800 sm:w-64 sm:shrink-0" />
                  <div className="flex flex-1 flex-col justify-center gap-4">
                    <div className="h-5 w-3/4 rounded bg-slate-800" />
                    <div className="h-4 w-1/3 rounded bg-slate-800" />
                    <div className="mt-2 h-11 w-full rounded-lg bg-slate-800" />
                    <div className="h-11 w-36 rounded-lg bg-slate-800" />
                  </div>
                </div>
              </section>
            ) : video ? (
              <div className="mt-8 space-y-4">
                <VideoCard
                  video={video}
                  selectedFormat={selectedFormat}
                  onFormatChange={setSelectedFormat}
                  onDownload={handleDownload}
                  advancedOptions={advancedOptions}
                  onAdvancedOptionsChange={setAdvancedOptions}
                />
              </div>
            ) : (
              <VideoPlaceholder />
            )}
          </>
        )}
      </main>

      {settingsOpen && (
        <SettingsDialog
          onClose={() => setSettingsOpen(false)}
          preferences={preferences}
          onChooseDirectory={handleChooseDirectory}
          onChooseCookiesFile={handleChooseCookiesFile}
          onSavePreferences={handleSavePreferences}
        />
      )}
      <PlaylistModal
        playlist={playlist}
        onChoose={handlePlaylistChoice}
      />
      {browserOpen && (
        <BrowserModal
          onClose={() => setBrowserOpen(false)}
          onSearch={handleBrowserSearch}
        />
      )}
      {toastMessage && (
        <aside
          className="clipboard-toast fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-line bg-panel p-4 shadow-2xl"
          role="status"
          aria-live="polite"
        >
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-5 text-slate-200">{toastMessage}</p>
            {clipboardToastUrl && (
              <button
                type="button"
                onClick={handleClipboardToastAction}
                className="mt-2 text-xs font-semibold text-accent-bright hover:text-white"
              >
                Analisar link
              </button>
            )}
          </div>
          <button
            type="button"
            aria-label="Fechar notificação"
            onClick={() => {
              setToastMessage('')
              setClipboardToastUrl('')
            }}
            className="text-sm text-muted hover:text-white"
          >
            ×
          </button>
        </aside>
      )}
      <DownloadQueue
        items={queue}
        paused={queuePaused}
        onCancel={handleCancelDownload}
        onTogglePause={handleTogglePause}
        onOpenFolder={handleOpenDownloads}
      />
    </div>
  )
}

export default App
