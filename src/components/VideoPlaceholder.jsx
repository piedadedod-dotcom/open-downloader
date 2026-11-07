function VideoPlaceholder() {
  return (
    <section
      aria-label="Prévia do vídeo"
      className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-panel/45 px-6 py-12 text-center sm:min-h-80"
    >
      <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-line bg-panel text-accent">
        <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
          <path d="m10 8 6 4-6 4V8Z" fill="currentColor" />
          <rect x="3.5" y="4.5" width="17" height="15" rx="3.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
      <h2 className="text-base font-semibold text-slate-200">A prévia do vídeo aparecerá aqui</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
        Cole um link acima para preparar a análise e escolher as opções de download.
      </p>
      <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Suporte a sites compatíveis com yt-dlp
      </div>
    </section>
  )
}

export default VideoPlaceholder
