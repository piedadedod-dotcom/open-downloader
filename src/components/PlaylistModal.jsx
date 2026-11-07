function PlaylistModal({ playlist, onChoose }) {
  if (!playlist) return null

  const count = playlist.playlistCount
  const countLabel = Number.isFinite(count)
    ? `${count} vídeo${count === 1 ? '' : 's'}`
    : 'vários vídeos'

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="playlist-title"
        className="w-full max-w-lg rounded-2xl border border-line bg-panel p-6 shadow-2xl sm:p-7"
      >
        <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          Playlist detectada
        </p>
        <h2 id="playlist-title" className="mt-2 text-xl font-semibold text-white">
          {playlist.title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Este link é uma playlist com <strong className="font-semibold text-slate-200">{countLabel}</strong>.
          Deseja baixar todos ou apenas o primeiro?
        </p>
        {playlist.entries?.[0]?.title && (
          <p className="mt-3 truncate rounded-lg bg-canvas px-3 py-2 text-xs text-slate-300">
            Primeiro vídeo: {playlist.entries[0].title}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onChoose('first')}
            className="h-11 rounded-lg border border-line px-4 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-white/5"
          >
            Apenas o primeiro
          </button>
          <button
            type="button"
            onClick={() => onChoose('all')}
            className="h-11 rounded-lg bg-accent px-4 text-sm font-semibold text-slate-950 transition hover:bg-accent-bright"
          >
            Baixar todos
          </button>
        </div>
      </section>
    </div>
  )
}

export default PlaylistModal
