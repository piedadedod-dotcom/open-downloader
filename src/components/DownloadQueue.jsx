const statusLabels = {
  queued: 'Na fila',
  downloading: 'Baixando',
  paused: 'Pausado',
  completed: 'Concluído',
  error: 'Erro',
  cancelled: 'Cancelado',
}

function DownloadQueue({ items, paused, onCancel, onTogglePause, onOpenFolder }) {
  if (items.length === 0) return null

  const activeItems = items.filter((item) =>
    ['queued', 'downloading', 'paused'].includes(item.status),
  )

  return (
    <aside className="download-queue fixed inset-x-0 bottom-0 z-20 border-t border-line bg-panel/95 shadow-[0_-16px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="mx-auto max-h-[42vh] w-full max-w-5xl overflow-y-auto px-4 py-4 sm:px-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white">Downloads</h2>
            <span className="rounded-full bg-canvas px-2 py-0.5 text-xs text-muted">
              {items.length}
            </span>
          </div>
          {activeItems.length > 0 && (
            <button
              type="button"
              onClick={() => onTogglePause(!paused)}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-accent hover:text-white"
            >
              {paused ? 'Retomar todos' : 'Pausar todos'}
            </button>
          )}
        </div>

        <ul className="space-y-2">
          {items.map((item) => {
            const active = ['queued', 'downloading', 'paused'].includes(item.status)
            const progress = Math.min(100, Math.max(0, item.progress || 0))

            return (
              <li
                key={item.id}
                className="queue-item rounded-xl border border-line bg-canvas/70 p-3"
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                      <p className="truncate text-sm font-medium text-slate-200" title={item.title}>
                        {item.title}
                      </p>
                      <span
                        className={`shrink-0 text-xs ${
                          item.status === 'completed'
                            ? 'text-emerald-300'
                            : item.status === 'error'
                              ? 'text-rose-300'
                              : 'text-muted'
                        }`}
                      >
                        {statusLabels[item.status] || item.status}
                      </span>
                    </div>

                    {active && (
                      <div className="mt-2 flex items-center gap-2">
                        <div
                          className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800"
                          role="progressbar"
                          aria-label={`Progresso: ${item.title}`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={progress}
                        >
                          <div
                            className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
                            style={{ width: `${item.status === 'queued' || item.status === 'paused' ? progress : Math.max(progress, 2)}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-xs tabular-nums text-muted">
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                    )}
                    {item.error && (
                      <p className="mt-1 break-words text-xs text-rose-300">{item.error}</p>
                    )}
                  </div>

                  {item.status === 'completed' && (
                    <button
                      type="button"
                      onClick={onOpenFolder}
                      className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-accent-bright transition hover:bg-accent/10"
                    >
                      Abrir pasta
                    </button>
                  )}
                  {active && (
                    <button
                      type="button"
                      onClick={() => onCancel(item.id)}
                      aria-label={`Cancelar ${item.title}`}
                      className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-muted transition hover:bg-rose-500/10 hover:text-rose-300"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}

export default DownloadQueue
