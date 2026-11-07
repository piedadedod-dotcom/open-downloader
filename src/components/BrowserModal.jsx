import { useState } from 'react'

function BrowserModal({ onClose, onSearch }) {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    const search = query.trim()
    if (!search) {
      setError('Digite o que deseja pesquisar.')
      return
    }

    setSearching(true)
    setError('')
    try {
      await onSearch(search)
      onClose()
    } catch (searchError) {
      setError(searchError.message || 'Não foi possível abrir a pesquisa.')
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="browser-modal-title"
        className="w-full max-w-lg rounded-2xl border border-line bg-panel p-6 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Pesquisa integrada
            </p>
            <h2 id="browser-modal-title" className="mt-2 text-xl font-semibold text-white">
              Pesquisar no YouTube
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar pesquisa"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line text-lg text-muted transition hover:text-white"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5">
          <label htmlFor="youtube-search" className="sr-only">
            Pesquisar no YouTube
          </label>
          <input
            id="youtube-search"
            type="search"
            autoFocus
            maxLength={300}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex.: música, canal ou vídeo"
            className="h-12 w-full rounded-lg border border-line bg-canvas px-4 text-sm text-slate-100 outline-none placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          {error && (
            <p className="mt-2 text-sm text-rose-300" role="alert">
              {error}
            </p>
          )}
          <p className="mt-3 text-xs leading-5 text-muted">
            Devido às políticas do YouTube, você pode precisar fazer login nesta janela. A opção de Cookies do app é usada pelo yt-dlp durante a análise e os downloads.
          </p>
          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-line px-4 text-sm font-medium text-slate-200 transition hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={searching}
              className="h-10 rounded-lg bg-accent px-4 text-sm font-semibold text-slate-950 transition hover:bg-accent-bright disabled:opacity-60"
            >
              {searching ? 'Abrindo...' : 'Pesquisar'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default BrowserModal
