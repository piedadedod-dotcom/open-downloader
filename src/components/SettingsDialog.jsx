import { useState } from 'react'

function SettingsDialog({
  onClose,
  preferences,
  onChooseDirectory,
  onChooseCookiesFile,
  onSavePreferences,
}) {
  const [activeTab, setActiveTab] = useState('preferences')
  const [draft, setDraft] = useState(preferences)
  const [checking, setChecking] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')

  async function checkYtDlp() {
    setChecking(true)
    setResult('')
    setError('')

    try {
      if (!window.downloader?.getYtDlpVersion) {
        throw new Error('A ponte do Electron não está disponível.')
      }
      const version = await window.downloader.getYtDlpVersion()
      setResult(`yt-dlp ${version} está funcionando.`)
    } catch (checkError) {
      setError(checkError.message || 'Não foi possível iniciar o yt-dlp.')
    } finally {
      setChecking(false)
    }
  }

  async function chooseDirectory() {
    setError('')
    try {
      const directory = await onChooseDirectory()
      if (directory) {
        setDraft((current) => ({ ...current, downloadDirectory: directory }))
      }
    } catch (chooseError) {
      setError(chooseError.message || 'Não foi possível escolher a pasta.')
    }
  }

  async function chooseCookiesFile() {
    setError('')
    try {
      const cookiesFilePath = await onChooseCookiesFile()
      if (cookiesFilePath) {
        setDraft((current) => ({ ...current, cookiesFilePath }))
        setResult('Arquivo selecionado. Salve as preferências para ativá-lo.')
      }
    } catch (chooseError) {
      setError(chooseError.message || 'Não foi possível selecionar o arquivo.')
    }
  }

  function removeCookiesFile() {
    setDraft((current) => ({ ...current, cookiesFilePath: null }))
    setResult('O arquivo será removido ao salvar as preferências.')
    setError('')
  }

  async function savePreferences(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      await onSavePreferences(draft)
      setResult('Preferências salvas.')
    } catch (saveError) {
      setError(saveError.message || 'Não foi possível salvar as preferências.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-30 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="w-full max-w-md rounded-2xl border border-line bg-panel p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="settings-title" className="text-lg font-semibold text-white">
              Configurações
            </h2>
            <p className="mt-1 text-sm text-muted">Personalize o Open Downloader.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar configurações"
            className="rounded-lg p-2 text-muted transition hover:bg-white/5 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="mt-5 flex gap-2 border-b border-line">
          {[
            ['preferences', 'Preferências'],
            ['components', 'Componentes'],
          ].map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab)
                setError('')
                setResult('')
              }}
              className={`border-b-2 px-2 pb-3 text-sm font-medium transition ${
                activeTab === tab
                  ? 'border-accent text-white'
                  : 'border-transparent text-muted hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'preferences' ? (
          <form onSubmit={savePreferences}>
            <div className="mt-5">
              <label htmlFor="download-directory" className="text-sm font-medium text-slate-200">
                Pasta de destino
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="download-directory"
                  value={draft.downloadDirectory || ''}
                  readOnly
                  placeholder="Pasta Downloads padrão"
                  className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-canvas px-3 text-xs text-slate-300 outline-none"
                />
                <button
                  type="button"
                  onClick={chooseDirectory}
                  className="shrink-0 rounded-lg border border-line px-3 text-xs font-semibold text-slate-200 transition hover:border-accent hover:text-white"
                >
                  Escolher
                </button>
              </div>
              <p className="mt-2 break-all text-xs text-muted">
                Os próximos downloads serão salvos nesta pasta.
              </p>
            </div>

            <div className="mt-5">
              <label htmlFor="app-theme" className="text-sm font-medium text-slate-200">
                Tema
              </label>
              <select
                id="app-theme"
                value={draft.theme}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, theme: event.target.value }))
                }
                className="mt-2 h-10 w-full rounded-lg border border-line bg-canvas px-3 text-sm text-slate-100 outline-none focus:border-accent"
              >
                <option value="dark">Escuro (padrão)</option>
                <option value="light">Claro</option>
              </select>
            </div>

            <section className="mt-5 rounded-xl border border-line bg-canvas p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-slate-200">Autenticação</h3>
                  {draft.cookiesFilePath ? (
                    <p
                      className="mt-2 truncate text-xs text-muted"
                      title={draft.cookiesFilePath}
                    >
                      {draft.cookiesFilePath}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-muted">Nenhum arquivo selecionado</p>
                  )}
                </div>
                {draft.cookiesFilePath && (
                  <button
                    type="button"
                    onClick={removeCookiesFile}
                    aria-label="Remover arquivo de cookies"
                    title="Remover arquivo"
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted transition hover:bg-rose-500/10 hover:text-rose-300"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={chooseCookiesFile}
                className="mt-3 h-9 w-full rounded-lg border border-line px-3 text-xs font-semibold text-slate-200 transition hover:border-accent hover:text-white"
              >
                Selecionar Arquivo de Cookies
              </button>
              <p className="mt-2 text-xs leading-5 text-muted">
                Exporte manualmente um cookies.txt no formato Netscape. O arquivo
                é usado localmente pelo yt-dlp e o conteúdo não é exibido no app.
                Proteja-o como uma credencial e remova-o quando não precisar mais.
              </p>
            </section>

            <button
              type="submit"
              disabled={saving}
              className="mt-5 h-10 w-full rounded-lg bg-accent px-4 text-sm font-semibold text-slate-950 transition hover:bg-accent-bright disabled:cursor-wait disabled:opacity-60"
            >
              {saving ? 'Salvando...' : 'Salvar preferências'}
            </button>
          </form>
        ) : (
          <div className="mt-5 rounded-xl border border-line bg-canvas p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-200">yt-dlp</p>
                <p className="mt-1 text-xs text-muted">bin/yt-dlp.exe</p>
              </div>
              <button
                type="button"
                onClick={checkYtDlp}
                disabled={checking}
                className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-accent hover:text-white disabled:cursor-wait disabled:opacity-60"
              >
                {checking ? 'Verificando...' : 'Testar binário'}
              </button>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted">
              yt-dlp.exe e ffmpeg.exe devem estar na pasta bin.
            </p>
          </div>
        )}

        {result && <p className="mt-4 text-sm text-emerald-300" role="status">{result}</p>}
        {error && <p className="mt-4 text-sm text-rose-300" role="alert">{error}</p>}
      </section>
    </div>
  )
}

export default SettingsDialog
