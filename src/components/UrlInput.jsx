function UrlInput({ value, onChange, onSubmit, onPaste, onSearch, disabled }) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-line bg-panel p-2 shadow-2xl shadow-black/20 sm:flex sm:items-center"
    >
      <label htmlFor="video-url" className="sr-only">
        URL do vídeo
      </label>
      <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0 text-muted" aria-hidden="true">
          <path d="M10 13.5a4.8 4.8 0 0 0 6.8 0l2-2a4.8 4.8 0 0 0-6.8-6.8l-1.2 1.2M14 10.5a4.8 4.8 0 0 0-6.8 0l-2 2A4.8 4.8 0 0 0 12 19.3l1.2-1.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        <input
          id="video-url"
          name="url"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
          autoComplete="url"
          disabled={disabled}
          placeholder="Cole a URL do vídeo aqui..."
          className="h-12 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500 sm:text-base"
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-2 sm:mt-0 sm:flex-nowrap">
        <button
          type="button"
          onClick={onSearch}
          disabled={disabled}
          className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-line px-3 text-sm font-medium text-slate-200 transition hover:border-accent hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            <circle cx="10.8" cy="10.8" r="6.3" stroke="currentColor" strokeWidth="1.7" />
            <path d="m15.5 15.5 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          Pesquisar
        </button>
        <button
          type="button"
          onClick={onPaste}
          disabled={disabled}
          className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-line px-4 text-sm font-medium text-slate-200 transition hover:border-accent hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M9 5.5h6a1.5 1.5 0 0 1 1.5 1.5v11A1.5 1.5 0 0 1 15 19.5H7A1.5 1.5 0 0 1 5.5 18V7A1.5 1.5 0 0 1 7 5.5h2ZM9 5.5A2 2 0 0 1 11 3.5h2a2 2 0 0 1 2 2M8.5 11h5M8.5 14h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Colar
        </button>
        <button
          type="submit"
          disabled={disabled}
          className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-slate-950 transition hover:bg-accent-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-60 sm:flex-none sm:px-6"
        >
          {disabled ? 'Aguarde...' : 'Analisar'}
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </form>
  )
}

export default UrlInput
