function formatSize(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return 'Tamanho indisponível'
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = -1
  do {
    size /= 1024
    unitIndex += 1
  } while (size >= 1024 && unitIndex < units.length - 1)
  return `${size.toFixed(size < 10 ? 1 : 0)} ${units[unitIndex]}`
}

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Data indisponível'
    : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(date)
}

function Library({ items, onShowItem, onStartDownload }) {
  const totalSize = items.reduce(
    (total, item) =>
      total + (Number.isFinite(item.size) && item.size > 0 ? item.size : 0),
    0,
  )

  return (
    <section aria-labelledby="library-title">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          Sua coleção
        </p>
        <h1 id="library-title" className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
          Biblioteca
        </h1>
        <p className="mt-2 text-sm text-muted">
          Downloads concluídos neste dispositivo.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <article className="flex items-center gap-4 rounded-2xl border border-line bg-panel p-5">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent-bright">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
              <path d="M5 5.5h14v13H5zM8 9h8M8 12h8M8 15h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-sm text-muted">Arquivos baixados</p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {items.length}
            </p>
          </div>
        </article>
        <article className="flex items-center gap-4 rounded-2xl border border-line bg-panel p-5">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
              <path d="M12 3.5v17M16.5 7.5c0-1.7-1.8-3-4.5-3S7.5 5.8 7.5 7.5 9 10 12 10s4.5 1.3 4.5 3-1.8 3.5-4.5 3.5-4.5-1.3-4.5-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-sm text-muted">Espaço ocupado</p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {formatSize(totalSize)}
            </p>
          </div>
        </article>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-line bg-panel px-5 py-12 text-center sm:py-16">
          <svg
            viewBox="0 0 240 160"
            fill="none"
            className="mx-auto mb-6 h-36 w-56 max-w-full text-accent"
            role="img"
            aria-labelledby="empty-library-illustration"
          >
            <title id="empty-library-illustration">Biblioteca de vídeos vazia</title>
            <path d="M31 127.5h178" stroke="currentColor" strokeOpacity=".2" strokeWidth="2" strokeLinecap="round" />
            <rect x="57" y="24" width="126" height="90" rx="14" fill="#171923" stroke="currentColor" strokeOpacity=".45" strokeWidth="2" />
            <rect x="68" y="35" width="104" height="68" rx="8" fill="#0b0d12" />
            <path d="m108 55 27 14-27 14V55Z" fill="currentColor" />
            <path d="M77 128h86" stroke="currentColor" strokeOpacity=".55" strokeWidth="4" strokeLinecap="round" />
            <path d="M105 114v14m30-14v14" stroke="currentColor" strokeOpacity=".35" strokeWidth="3" />
            <circle cx="45" cy="56" r="5" fill="#34d399" fillOpacity=".8" />
            <circle cx="199" cy="76" r="4" fill="currentColor" fillOpacity=".55" />
            <path d="M43 88h13m131-42h12" stroke="currentColor" strokeOpacity=".3" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <h2 className="text-lg font-semibold text-white">
            Nenhum download ainda. Que tal começar agora?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            Seus vídeos concluídos aparecerão aqui, organizados em um só lugar.
          </p>
          <button
            type="button"
            onClick={onStartDownload}
            className="mt-6 inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-slate-950 transition hover:bg-accent-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Começar um download
          </button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="overflow-hidden rounded-2xl border border-line bg-panel"
            >
              <div className="aspect-video bg-canvas">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-sm text-muted">
                    Miniatura indisponível
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-white" title={item.title}>
                  {item.title}
                </h2>
                <p className="mt-2 text-xs text-muted">
                  {formatDate(item.date)} <span aria-hidden="true">·</span> {formatSize(item.size)}
                </p>
                <button
                  type="button"
                  onClick={() => onShowItem(item.id)}
                  className="mt-4 inline-flex h-9 items-center rounded-lg border border-line px-3 text-xs font-medium text-slate-200 transition hover:border-accent hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                >
                  Abrir Pasta
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default Library
