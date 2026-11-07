const {
  app,
  BrowserWindow,
  BrowserView,
  clipboard,
  dialog,
  globalShortcut,
  ipcMain,
  Menu,
  nativeImage,
  Notification,
  shell,
  Tray,
} = require('electron')
const { spawn } = require('node:child_process')
const fs = require('node:fs/promises')
const path = require('node:path')
const { randomUUID } = require('node:crypto')

const downloads = new Map()
const downloadQueue = []
const formatSelectors = {
  best: ['-f', 'bv*+ba/b', '--merge-output-format', 'mp4'],
  mp3: ['-f', 'ba', '-x', '--audio-format', 'mp3'],
}

let settingsStore
let mainWindow
let browserWindow
let browserView
let tray
let queuePaused = false
let currentDownload = null
let isQuitting = false
let clipboardMonitor
let lastClipboardText = ''
let pendingAnalysisUrl = null

function getYtDlpPath() {
  const appRoot = app.isPackaged ? process.resourcesPath : app.getAppPath()
  return path.join(appRoot, 'bin', 'yt-dlp.exe')
}

function validateUrl(value) {
  if (typeof value !== 'string') throw new Error('Informe uma URL válida.')

  let url
  try {
    url = new URL(value)
  } catch {
    throw new Error('Informe uma URL válida.')
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('A URL precisa usar HTTP ou HTTPS.')
  }

  return url.href
}

function normalizeAdvancedOptions(value) {
  const options = value && typeof value === 'object' ? value : {}
  const speedLimit = ['none', '5', '1'].includes(options.speedLimit)
    ? options.speedLimit
    : 'none'
  const compression = ['original', 'balanced', 'reduced'].includes(options.compression)
    ? options.compression
    : 'original'
  const startTime = normalizeTimestamp(options.startTime)
  const endTime = normalizeTimestamp(options.endTime)

  return {
    subtitles: options.subtitles === true,
    thumbnail: options.thumbnail === true,
    embedMetadata: options.embedMetadata === true,
    speedLimit,
    compression,
    startTime,
    endTime,
  }
}

function normalizeTimestamp(value) {
  if (typeof value !== 'string' || value === '') return ''
  if (!/^\d{2,}:[0-5]\d:[0-5]\d$/.test(value)) {
    throw new Error('Use o formato HH:MM:SS nos campos do cortador.')
  }
  return value
}

function getCompressionArguments(options, formatId) {
  if (formatId !== 'best' || options.compression === 'original') return []
  if (options.compression === 'balanced') {
    return [
      '--postprocessor-args',
      'ffmpeg:-vcodec libx264 -crf 28 -preset fast',
    ]
  }
  return [
    '--postprocessor-args',
    'ffmpeg:-vcodec libx264 -crf 32 -vf scale=-2:720',
  ]
}

function getAdvancedArguments(options) {
  const args = []
  if (options.subtitles) args.push('--write-subs', '--sub-langs', 'pt.*,en.*')
  if (options.thumbnail) args.push('--write-thumbnail', '--convert-thumbnails', 'jpg')
  if (options.embedMetadata) args.push('--embed-metadata', '--embed-thumbnail')
  if (options.speedLimit !== 'none') args.push('--limit-rate', `${options.speedLimit}M`)
  if (options.startTime && options.endTime) {
    if (timeToSeconds(options.endTime) <= timeToSeconds(options.startTime)) {
      throw new Error('O horário final precisa ser posterior ao horário inicial.')
    }
    args.push('--download-sections', `*${options.startTime}-${options.endTime}`)
  } else if (options.startTime || options.endTime) {
    throw new Error('Preencha os horários de início e fim para cortar o vídeo.')
  }
  return args
}

function timeToSeconds(value) {
  const [hours, minutes, seconds] = value.split(':').map(Number)
  return hours * 3600 + minutes * 60 + seconds
}

function getSafeHttpUrl(value) {
  if (typeof value !== 'string') return ''
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : ''
  } catch {
    return ''
  }
}

function getCookieArguments() {
  const cookieFilePath = settingsStore.get('cookiesFilePath')
  return cookieFilePath ? ['--cookies', cookieFilePath] : []
}

function extractClipboardUrl(text) {
  if (typeof text !== 'string') return null

  const match = text.match(/https?:\/\/[^\s"'<>]+/i)
  if (!match) return null

  try {
    return validateUrl(match[0].replace(/[),.;!?]+$/, ''))
  } catch {
    return null
  }
}

function readClipboardText() {
  try {
    const text = clipboard.readText()
    return typeof text === 'string' ? text : ''
  } catch (error) {
    console.warn('Não foi possível ler a área de transferência:', error)
    return ''
  }
}

function getPreferenceSnapshot() {
  return {
    downloadDirectory: settingsStore.get('downloadDirectory'),
    theme: settingsStore.get('theme'),
    cookiesFilePath: settingsStore.get('cookiesFilePath') || null,
  }
}

function getQueueSnapshot() {
  return {
    paused: queuePaused,
    items: [...downloads.values()].map((item) => ({
      id: item.id,
      title: item.title,
      progress: item.progress,
      status: item.status,
      error: item.error,
      formatId: item.formatId,
    })),
  }
}

function broadcast(channel, payload) {
  if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.webContents.isDestroyed()) {
    mainWindow.webContents.send(channel, payload)
  }
}

function publishQueue() {
  broadcast('download-queue-updated', getQueueSnapshot())
}

function getYtDlpVersion() {
  return new Promise((resolve, reject) => {
    const child = spawn(getYtDlpPath(), ['--version'], { windowsHide: true })
    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data) => {
      stdout += data.toString()
    })
    child.stderr.on('data', (data) => {
      stderr += data.toString()
    })
    child.once('error', reject)
    child.once('close', (code, signal) => {
      if (code === 0) {
        resolve(stdout.trim())
        return
      }

      reject(
        new Error(
          stderr.trim() ||
            `yt-dlp exited with code ${code ?? 'unknown'}${signal ? ` (${signal})` : ''}`,
        ),
      )
    })
  })
}

function analyzeVideo(value) {
  const url = validateUrl(value)

  return new Promise((resolve, reject) => {
    const child = spawn(
      getYtDlpPath(),
      [...getCookieArguments(), '-J', '--', url],
      { windowsHide: true },
    )
    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data) => {
      stdout += data.toString()
    })
    child.stderr.on('data', (data) => {
      stderr += data.toString()
    })
    child.once('error', reject)
    child.once('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `yt-dlp encerrou com código ${code ?? 'desconhecido'}.`))
        return
      }

      try {
        const info = JSON.parse(stdout)
        if (info._type === 'playlist' || info._type === 'multi_video') {
          const entries = Array.isArray(info.entries)
            ? info.entries
                .map((entry, index) =>
                  entry
                    ? {
                        index: Number.isInteger(entry.playlist_index)
                          ? entry.playlist_index
                          : index + 1,
                        title:
                          typeof entry.title === 'string'
                            ? entry.title.slice(0, 500)
                            : `Vídeo ${index + 1}`,
                      }
                    : null,
                )
                .filter(Boolean)
            : []
          resolve({
            type: 'playlist',
            title: typeof info.title === 'string' ? info.title : 'Playlist',
            playlistCount: Number.isFinite(info.playlist_count)
              ? info.playlist_count
              : entries.length,
            entries,
          })
          return
        }

        const formats = Array.isArray(info.formats)
          ? info.formats
              .filter((format) => format && typeof format.format_id === 'string')
              .slice(0, 150)
              .map((format) => ({
                format_id: format.format_id.slice(0, 100),
                ext: typeof format.ext === 'string' ? format.ext.slice(0, 20) : '',
                resolution:
                  typeof format.resolution === 'string'
                    ? format.resolution.slice(0, 50)
                    : Number.isFinite(format.height)
                      ? `${format.height}p`
                      : typeof format.format_note === 'string'
                        ? format.format_note.slice(0, 50)
                        : '',
                vcodec: typeof format.vcodec === 'string' ? format.vcodec.slice(0, 50) : '',
              }))
          : []
        const previewFormat = Array.isArray(info.formats)
          ? info.formats.find(
              (format) =>
                format &&
                format.vcodec !== 'none' &&
                format.acodec !== 'none' &&
                getSafeHttpUrl(format.url),
            ) ||
            info.formats.find(
              (format) =>
                format &&
                format.vcodec !== 'none' &&
                getSafeHttpUrl(format.url),
            )
          : null

        let thumbnail = ''
        if (typeof info.thumbnail === 'string') {
          try {
            const parsedThumbnail = new URL(info.thumbnail)
            if (['http:', 'https:'].includes(parsedThumbnail.protocol)) {
              thumbnail = parsedThumbnail.href
            }
          } catch {
            thumbnail = ''
          }
        }

        resolve({
          type: 'video',
          title: typeof info.title === 'string' ? info.title : 'Vídeo sem título',
          thumbnail,
          duration: Number.isFinite(info.duration) ? info.duration : null,
          previewUrl: previewFormat ? getSafeHttpUrl(previewFormat.url) : '',
          formats,
        })
      } catch {
        reject(new Error('Não foi possível interpretar os dados retornados pelo yt-dlp.'))
      }
    })
  })
}

function addDownload(value, formatId, title, options, playlistIndex = null) {
  const url = validateUrl(value)
  if (typeof formatId !== 'string' || !Object.hasOwn(formatSelectors, formatId)) {
    throw new Error('Formato de download inválido.')
  }

  const item = {
    id: randomUUID(),
    title: typeof title === 'string' && title.trim() ? title.trim().slice(0, 500) : url,
    url,
    thumbnail: '',
    formatId,
    options: normalizeAdvancedOptions(options),
    playlistIndex:
      Number.isInteger(playlistIndex) && playlistIndex > 0 ? playlistIndex : null,
    progress: 0,
    status: 'queued',
    error: '',
    stderr: '',
    stopReason: null,
  }

  downloads.set(item.id, item)
  downloadQueue.push(item.id)
  return item
}

function enqueueDownload(_event, value, formatId, title, options, metadata) {
  const item = addDownload(value, formatId, title, options)
  item.thumbnail = getSafeHttpUrl(metadata?.thumbnail)
  publishQueue()
  processNextDownload()
  return item.id
}

function enqueuePlaylistDownloads(_event, value, formatId, options, entries, mode) {
  const url = validateUrl(value)
  if (typeof formatId !== 'string' || !Object.hasOwn(formatSelectors, formatId)) {
    throw new Error('Formato de download inválido.')
  }
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error('A playlist não contém vídeos para adicionar.')
  }
  if (!['all', 'first'].includes(mode)) throw new Error('Opção de playlist inválida.')

  const selectedEntries = mode === 'first' ? entries.slice(0, 1) : entries
  const items = selectedEntries.map((entry, index) => {
    const playlistIndex = Number.isInteger(entry?.index) && entry.index > 0
      ? entry.index
      : index + 1
    const title =
      typeof entry?.title === 'string' && entry.title.trim()
        ? entry.title
        : `Vídeo ${playlistIndex}`
    return addDownload(url, formatId, title, options, playlistIndex)
  })

  publishQueue()
  processNextDownload()
  return items.map(({ id }) => id)
}

function reportProgress(item, chunk, stream) {
  const remainder = item[stream]
  const lines = (remainder + chunk.toString()).split(/\r\n|\n|\r/)
  item[stream] = lines.pop() || ''

  for (const line of lines) {
    const matches = line.matchAll(/\[download\]\s+(\d{1,3}(?:\.\d+)?)%/g)
    for (const match of matches) {
      const percent = Number(match[1])
      if (Number.isFinite(percent) && percent >= 0 && percent <= 100) {
        item.progress = percent
        publishQueue()
      }
    }
  }
}

function processNextDownload() {
  if (isQuitting || queuePaused || currentDownload) return

  while (downloadQueue.length > 0) {
    const item = downloads.get(downloadQueue.shift())
    if (item && item.status === 'queued') {
      startDownload(item)
      return
    }
  }
}

function startDownload(item) {
  currentDownload = item
  item.status = 'downloading'
  item.error = ''
  item.stopReason = null
  item.stdoutRemainder = ''
  item.stderrRemainder = ''
  item.stderr = ''
  publishQueue()

  const outputTemplate = path.join(
    settingsStore.get('downloadDirectory'),
    '%(uploader)s',
    '%(title)s [%(id)s].%(ext)s',
  )
  let child
  try {
    child = spawn(
      getYtDlpPath(),
      [
        ...formatSelectors[item.formatId],
        ...getCookieArguments(),
        ...getAdvancedArguments(item.options),
        ...getCompressionArguments(item.options, item.formatId),
        '--newline',
        '--print',
        'after_move:filepath',
        '-o',
        outputTemplate,
        ...(item.playlistIndex === null
          ? []
          : ['--playlist-items', String(item.playlistIndex)]),
        '--',
        item.url,
      ],
      { windowsHide: true },
    )
  } catch (error) {
    currentDownload = null
    item.status = 'error'
    item.error = error.message
    publishQueue()
    processNextDownload()
    return
  }

  item.child = child
  child.stdout.on('data', (data) => {
    item.stdoutText = `${item.stdoutText || ''}${data.toString()}`.slice(-32768)
    reportProgress(item, data, 'stdoutRemainder')
  })
  child.stderr.on('data', (data) => {
    item.stderr = (item.stderr + data.toString()).slice(-8000)
    reportProgress(item, data, 'stderrRemainder')
  })

  let finished = false
  async function finish(code, signal, spawnError) {
    if (finished) return
    finished = true
    item.child = null
    currentDownload = null

    if (item.stopReason === 'cancel') {
      item.status = 'cancelled'
      item.stopReason = null
    } else if (item.stopReason === 'pause') {
      item.stopReason = null
      item.status = queuePaused ? 'paused' : 'queued'
      downloadQueue.unshift(item.id)
    } else if (spawnError || code !== 0) {
      item.status = 'error'
      item.error =
        item.stderr?.trim() ||
        spawnError?.message ||
        `O download terminou com código ${code ?? 'desconhecido'}${signal ? ` (${signal})` : ''}.`
    } else {
      item.status = 'completed'
      item.progress = 100
      try {
        await saveCompletedDownload(item)
        broadcast('download-history-updated', getDownloadHistory())
      } catch (error) {
        console.error('Não foi possível registrar o download na biblioteca:', error)
      }
      showDownloadNotification()
    }

    publishQueue()
    processNextDownload()
  }

  child.once('error', (error) => void finish(null, null, error))
  child.once('close', (code, signal) => void finish(code, signal))
}

function getPrintedOutputPath(item) {
  const lines = (item.stdoutText || '').split(/\r\n|\n|\r/).reverse()
  return lines
    .map((line) => line.trim())
    .find((line) => line && path.isAbsolute(line)) || ''
}

async function saveCompletedDownload(item) {
  const filePath = getPrintedOutputPath(item)
  if (!filePath) throw new Error('O yt-dlp não informou o caminho final do arquivo.')

  const file = await fs.stat(filePath)
  if (!file.isFile()) throw new Error('O caminho final do download não é um arquivo.')

  const entry = {
    id: item.id,
    title: item.title,
    thumbnail: item.thumbnail,
    url: item.url,
    path: filePath,
    date: new Date().toISOString(),
    size: file.size,
  }
  const history = getDownloadHistory()
  settingsStore.set('downloadHistory', [entry, ...history.filter(({ id }) => id !== entry.id)])
}

function getDownloadHistory() {
  const history = settingsStore.get('downloadHistory')
  return Array.isArray(history) ? history : []
}

async function showDownloadedItem(_event, id) {
  if (typeof id !== 'string') throw new Error('Item da biblioteca inválido.')
  const item = getDownloadHistory().find((entry) => entry.id === id)
  if (!item || typeof item.path !== 'string' || !path.isAbsolute(item.path)) {
    throw new Error('O arquivo não foi encontrado na biblioteca.')
  }

  const file = await fs.stat(item.path)
  if (!file.isFile()) throw new Error('O arquivo do download não está disponível.')
  shell.showItemInFolder(item.path)
}

function isYouTubeVideoUrl(value) {
  let url
  try {
    url = new URL(value)
  } catch {
    return false
  }
  if (!['http:', 'https:'].includes(url.protocol)) return false

  const host = url.hostname.toLowerCase()
  if (host === 'youtu.be') return url.pathname.length > 1
  if (!['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(host)) return false
  return (
    (url.pathname === '/watch' && url.searchParams.has('v')) ||
    /^\/(shorts|live|embed)\/[^/]+/.test(url.pathname)
  )
}

function selectBrowserVideo(value) {
  if (!isYouTubeVideoUrl(value)) return false
  const url = validateUrl(value)
  if (browserWindow && !browserWindow.isDestroyed()) browserWindow.close()
  showMainWindow()
  broadcast('browser-video-selected', url)
  return true
}

function isAllowedBrowserUrl(value) {
  try {
    const url = new URL(value)
    return (
      url.protocol === 'https:' &&
      ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be',
        'accounts.google.com', 'consent.youtube.com', 'consent.google.com'].includes(
        url.hostname.toLowerCase(),
      )
    )
  } catch {
    return false
  }
}

function openBrowserSearch(_event, query) {
  if (typeof query !== 'string' || !query.trim() || query.trim().length > 300) {
    throw new Error('Informe uma pesquisa válida de até 300 caracteres.')
  }

  if (browserWindow && !browserWindow.isDestroyed()) browserWindow.close()
  const searchUrl = new URL('https://www.youtube.com/results')
  searchUrl.searchParams.set('search_query', query.trim())
  const searchWindow = new BrowserWindow({
    width: 1080,
    height: 760,
    minWidth: 720,
    minHeight: 520,
    title: 'Pesquisar no YouTube - Open Downloader',
    autoHideMenuBar: true,
    backgroundColor: '#0b0d12',
    parent: mainWindow,
    modal: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  })
  const searchView = new BrowserView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  })
  browserWindow = searchWindow
  browserView = searchView
  searchWindow.setBrowserView(searchView)
  const updateBrowserBounds = () => {
    if (searchWindow.isDestroyed()) return
    const [width, height] = searchWindow.getContentSize()
    searchView.setBounds({ x: 0, y: 0, width, height })
  }
  searchWindow.on('resize', updateBrowserBounds)
  searchWindow.on('closed', () => {
    if (!searchView.webContents.isDestroyed()) searchView.webContents.destroy()
    if (browserView === searchView) browserView = null
    if (browserWindow === searchWindow) browserWindow = null
  })
  const handleBrowserNavigation = (event, url) => {
    if (isYouTubeVideoUrl(url)) {
      event.preventDefault()
      selectBrowserVideo(url)
      return
    }
    if (!isAllowedBrowserUrl(url)) event.preventDefault()
  }
  searchView.webContents.on('will-navigate', handleBrowserNavigation)
  searchView.webContents.on('will-redirect', handleBrowserNavigation)
  searchView.webContents.setWindowOpenHandler(({ url }) => {
    selectBrowserVideo(url)
    return { action: 'deny' }
  })
  updateBrowserBounds()
  searchView.webContents.once('did-finish-load', () => {
    if (!searchWindow.isDestroyed()) searchWindow.show()
  })
  searchView.webContents.loadURL(searchUrl.href).catch((error) => {
    console.error('Não foi possível carregar a pesquisa do YouTube:', error)
    broadcast(
      'browser-search-error',
      'Não foi possível carregar a pesquisa do YouTube. Verifique sua conexão e tente novamente.',
    )
    if (!searchWindow.isDestroyed()) searchWindow.close()
  })
}

function showDownloadNotification() {
  if (!Notification.isSupported()) return

  try {
    new Notification({
      title: 'Download Concluído!',
      body: 'O vídeo foi salvo com sucesso na sua pasta.',
    }).show()
  } catch (error) {
    console.error('Não foi possível exibir a notificação do download:', error)
  }
}

function cancelDownload(_event, id) {
  const item = downloads.get(id)
  if (!item || ['completed', 'error', 'cancelled'].includes(item.status)) return false

  if (item === currentDownload && item.child) {
    item.stopReason = 'cancel'
    item.child.kill()
  } else {
    const queueIndex = downloadQueue.indexOf(id)
    if (queueIndex !== -1) downloadQueue.splice(queueIndex, 1)
    item.status = 'cancelled'
    publishQueue()
  }

  return true
}

function setDownloadsPaused(_event, paused) {
  queuePaused = Boolean(paused)
  if (queuePaused && currentDownload?.child) {
    currentDownload.stopReason = 'pause'
    currentDownload.child.kill()
  }
  for (const id of downloadQueue) {
    const item = downloads.get(id)
    if (!item) continue
    if (queuePaused && item.status === 'queued') item.status = 'paused'
    if (!queuePaused && item.status === 'paused') item.status = 'queued'
  }
  if (!queuePaused) {
    processNextDownload()
  }
  publishQueue()
  updateTrayMenu()
  return queuePaused
}

async function openDownloadsFolder() {
  const error = await shell.openPath(settingsStore.get('downloadDirectory'))
  if (error) throw new Error(`Não foi possível abrir a pasta de destino: ${error}`)
}

async function chooseDownloadDirectory() {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Escolher pasta de downloads',
    defaultPath: settingsStore.get('downloadDirectory'),
    properties: ['openDirectory', 'createDirectory'],
  })
  return result.canceled ? null : result.filePaths[0]
}

async function chooseCookiesFile() {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Selecionar arquivo de cookies',
    properties: ['openFile'],
    filters: [{ name: 'Arquivo de cookies Netscape', extensions: ['txt'] }],
  })
  return result.canceled ? null : result.filePaths[0]
}

async function savePreferences(_event, preferences) {
  if (!preferences || typeof preferences !== 'object') {
    throw new Error('Preferências inválidas.')
  }

  if (
    typeof preferences.downloadDirectory !== 'string' ||
    !path.isAbsolute(preferences.downloadDirectory)
  ) {
    throw new Error('Escolha uma pasta de destino válida.')
  }
  const directory = await fs.stat(preferences.downloadDirectory)
  if (!directory.isDirectory()) throw new Error('O destino escolhido não é uma pasta.')

  if (!['dark', 'light'].includes(preferences.theme)) {
    throw new Error('Escolha um tema válido.')
  }

  let cookiesFilePath = null
  if (
    preferences.cookiesFilePath !== undefined &&
    preferences.cookiesFilePath !== null &&
    preferences.cookiesFilePath !== ''
  ) {
    if (
      typeof preferences.cookiesFilePath !== 'string' ||
      !path.isAbsolute(preferences.cookiesFilePath) ||
      path.extname(preferences.cookiesFilePath).toLowerCase() !== '.txt'
    ) {
      throw new Error('Selecione um arquivo de cookies .txt válido.')
    }

    const cookieFile = await fs.stat(preferences.cookiesFilePath)
    if (!cookieFile.isFile()) throw new Error('O arquivo de cookies selecionado não é válido.')
    cookiesFilePath = preferences.cookiesFilePath
  }

  settingsStore.set({
    downloadDirectory: preferences.downloadDirectory,
    theme: preferences.theme,
    cookiesFilePath,
  })
  const saved = getPreferenceSnapshot()
  broadcast('preferences-updated', saved)
  return saved
}

function showMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return
  if (mainWindow.isMinimized()) mainWindow.restore()
  mainWindow.show()
  mainWindow.focus()
}

function requestAnalysisFromClipboard() {
  const url = extractClipboardUrl(readClipboardText())
  if (!url) return
  showMainWindow()
  if (!mainWindow || mainWindow.isDestroyed()) return
  if (mainWindow.webContents.isLoading()) {
    pendingAnalysisUrl = url
    return
  }
  mainWindow.webContents.send('global-shortcut-link', url)
}

function updateTrayMenu() {
  if (!tray) return
  const pauseLabel = queuePaused
    ? 'Retomar Todos os Downloads'
    : 'Pausar Todos os Downloads'

  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Abrir', click: showMainWindow },
      {
        label: pauseLabel,
        click: () => setDownloadsPaused(null, !queuePaused),
      },
      { type: 'separator' },
      {
        label: 'Sair',
        click: () => {
          isQuitting = true
          app.quit()
        },
      },
    ]),
  )
}

async function createTray() {
  let icon = nativeImage.createEmpty()
  try {
    icon = await app.getFileIcon(process.execPath, { size: 'small' })
  } catch (error) {
    console.error('Não foi possível carregar o ícone da bandeja:', error)
  }

  tray = new Tray(icon)
  tray.setToolTip('Open Downloader')
  tray.on('click', showMainWindow)
  updateTrayMenu()
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 800,
    minWidth: 720,
    minHeight: 600,
    autoHideMenuBar: true,
    backgroundColor: '#0b0d12',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
  })
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('download-queue-updated', getQueueSnapshot())
    mainWindow.webContents.send('preferences-updated', getPreferenceSnapshot())
    mainWindow.webContents.send('download-history-updated', getDownloadHistory())
    if (pendingAnalysisUrl) {
      mainWindow.webContents.send('global-shortcut-link', pendingAnalysisUrl)
      pendingAnalysisUrl = null
    }
  })
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  const devServerUrl = process.env.VITE_DEV_SERVER_URL
  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl)
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'))
  }
}

ipcMain.handle('yt-dlp:version', getYtDlpVersion)
ipcMain.handle('video:analyze', (_event, url) => analyzeVideo(url))
ipcMain.handle('video:download', enqueueDownload)
ipcMain.handle('video:download-playlist', enqueuePlaylistDownloads)
ipcMain.handle('video:cancel', cancelDownload)
ipcMain.handle('downloads:pause', setDownloadsPaused)
ipcMain.handle('downloads:open-folder', openDownloadsFolder)
ipcMain.handle('preferences:get', getPreferenceSnapshot)
ipcMain.handle('preferences:choose-directory', chooseDownloadDirectory)
ipcMain.handle('preferences:choose-cookies-file', chooseCookiesFile)
ipcMain.handle('preferences:save', savePreferences)
ipcMain.handle('downloads:get-queue', getQueueSnapshot)
ipcMain.handle('downloads:get-history', getDownloadHistory)
ipcMain.handle('downloads:show-item', showDownloadedItem)
ipcMain.handle('browser:open-search', openBrowserSearch)

app.on('before-quit', () => {
  isQuitting = true
  if (clipboardMonitor) clearInterval(clipboardMonitor)
  globalShortcut.unregisterAll()
  for (const item of downloads.values()) {
    if (item.child) {
      item.stopReason = 'cancel'
      item.child.kill()
    }
  }
})

app.whenReady().then(async () => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('org.opendownloader.app')
  }

  const { default: Store } = await import('electron-store')
  settingsStore = new Store({
    defaults: {
      downloadDirectory: app.getPath('downloads'),
      theme: 'dark',
      cookiesFilePath: null,
      downloadHistory: [],
    },
  })

  createWindow()
  await createTray()
  if (!globalShortcut.register('CommandOrControl+Shift+V', requestAnalysisFromClipboard)) {
    console.error('Não foi possível registrar o atalho global CommandOrControl+Shift+V.')
  }
  lastClipboardText = readClipboardText()
  clipboardMonitor = setInterval(() => {
    try {
      const text = readClipboardText()
      if (text === lastClipboardText) return
      lastClipboardText = text

      const url = extractClipboardUrl(text)
      if (url) broadcast('clipboard-link-detected', url)
    } catch (error) {
      console.warn('Erro ao monitorar a área de transferência:', error)
    }
  }, 2000)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
    else showMainWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && isQuitting) app.quit()
})
