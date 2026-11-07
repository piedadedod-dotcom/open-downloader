function DownloadProgress({ percent, status, onOpenFolder }) {
  const complete = status === 'completed'
  const safePercent = Math.min(100, Math.max(0, percent))

  return (
    <section
      aria-live="polite"
      className={`rounded-xl border p-4 ${
        complete
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : 'border-line bg-panel'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className={`text-sm font-semibold ${complete ? 'text-emerald-300' : 'text-white'}`}>
            {complete ? 'Download concluído!' : 'Baixando seu vídeo...'}
          </p>
          <p className="mt-1 text-xs text-muted">
            {complete
              ? 'O arquivo foi salvo na pasta Downloads.'
              : `${safePercent.toFixed(1)}% concluído`}
          </p>
        </div>
        {complete && (
          <button
            type="button"
            onClick={onOpenFolder}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-emerald-500/30 px-3 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M3.5 7.5h6l2 2h9v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-10Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M3.5 7.5v-1a2 2 0 0 1 2-2H9l2 2h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            Abrir Pasta
          </button>
        )}
      </div>

      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800"
        role="progressbar"
        aria-label="Progresso do download"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safePercent}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ease-out ${
            complete ? 'bg-emerald-400' : 'bg-accent'
          }`}
          style={{ width: `${safePercent}%` }}
        />
      </div>
    </section>
  )
}

export default DownloadProgress
