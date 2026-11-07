import { useCallback, useState } from 'react'
import VideoPlayerModal from './VideoPlayerModal.jsx'

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return 'Duração indisponível'
  const totalSeconds = Math.floor(seconds)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const remainder = totalSeconds % 60
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
    : `${minutes}:${String(remainder).padStart(2, '0')}`
}

function VideoCard({
  video,
  selectedFormat,
  onFormatChange,
  onDownload,
  advancedOptions,
  onAdvancedOptionsChange,
}) {
  const [playerOpen, setPlayerOpen] = useState(false)
  const closePlayer = useCallback(() => setPlayerOpen(false), [])

  return (
    <>
      <section className="rounded-2xl border border-line bg-panel p-4 shadow-xl shadow-black/10 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-canvas sm:w-64 sm:shrink-0">
            {video.thumbnail ? (
              <img
                src={video.thumbnail}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center text-sm text-muted">
                Miniatura indisponível
              </div>
            )}
            <button
              type="button"
              onClick={() => setPlayerOpen(true)}
              aria-label={`Reproduzir prévia de ${video.title}`}
              className="absolute inset-0 grid place-items-center bg-black/15 transition hover:bg-black/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-accent"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full border border-white/30 bg-black/60 text-white shadow-xl backdrop-blur transition hover:scale-105">
                <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-5 w-5" aria-hidden="true">
                  <path d="M8 5.8a1 1 0 0 1 1.5-.86l9.1 5.2a1 1 0 0 1 0 1.72l-9.1 5.2a1 1 0 0 1-1.5-.86V5.8Z" />
                </svg>
              </span>
            </button>
            <span className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-1 text-xs font-medium text-white">
              {formatDuration(video.duration)}
            </span>
          </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">
              Vídeo analisado
            </p>
            <h2 className="mt-2 break-words text-lg font-semibold leading-snug text-white sm:text-xl">
              {video.title}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {video.formats.length} formatos disponíveis
            </p>
          </div>

          <label
            htmlFor="download-format"
            className="mb-2 mt-5 text-xs font-medium text-slate-300"
          >
            Formato de download
          </label>
          <select
            id="download-format"
            value={selectedFormat}
            onChange={(event) => onFormatChange(event.target.value)}
            className="h-11 w-full rounded-lg border border-line bg-canvas px-3 text-sm text-slate-100 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
          >
            <option value="best">Melhor vídeo (MP4) + áudio</option>
            <option value="mp3">Apenas áudio (MP3)</option>
          </select>

          <details className="mt-4 rounded-xl border border-line bg-canvas/50 px-3">
            <summary className="cursor-pointer py-3 text-sm font-medium text-slate-300 transition hover:text-white">
              Opções avançadas
            </summary>
            <div className="space-y-3 border-t border-line pb-4 pt-3">
              {[
                ['subtitles', 'Baixar legendas', 'pt.* e en.*'],
                ['thumbnail', 'Baixar thumbnail', 'Converter para JPG'],
                ['embedMetadata', 'Incorporar metadados/capa', 'Recomendado para MP3'],
              ].map(([key, label, description]) => (
                <label key={key} className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={advancedOptions[key]}
                    onChange={(event) =>
                      onAdvancedOptionsChange({
                        ...advancedOptions,
                        [key]: event.target.checked,
                      })
                    }
                    className="mt-0.5 h-4 w-4 accent-violet-400"
                  />
                  <span>
                    <span className="block text-sm text-slate-200">{label}</span>
                    <span className="mt-0.5 block text-xs text-muted">{description}</span>
                  </span>
                </label>
              ))}

              <label
                htmlFor="download-speed-limit"
                className="flex flex-col gap-2 pt-1 text-sm text-slate-200 sm:flex-row sm:items-center sm:justify-between"
              >
                Limite de velocidade
                <select
                  id="download-speed-limit"
                  value={advancedOptions.speedLimit}
                  onChange={(event) =>
                    onAdvancedOptionsChange({
                      ...advancedOptions,
                      speedLimit: event.target.value,
                    })
                  }
                  className="h-9 rounded-lg border border-line bg-panel px-3 text-sm text-slate-100 outline-none focus:border-accent"
                >
                  <option value="none">Sem limite</option>
                  <option value="5">5 MB/s</option>
                  <option value="1">1 MB/s</option>
                </select>
              </label>

              <label
                htmlFor="download-compression"
                className="flex flex-col gap-2 pt-1 text-sm text-slate-200 sm:flex-row sm:items-center sm:justify-between"
              >
                Qualidade / tamanho
                <select
                  id="download-compression"
                  value={advancedOptions.compression}
                  onChange={(event) =>
                    onAdvancedOptionsChange({
                      ...advancedOptions,
                      compression: event.target.value,
                    })
                  }
                  className="h-9 rounded-lg border border-line bg-panel px-3 text-sm text-slate-100 outline-none focus:border-accent"
                >
                  <option value="original">Original</option>
                  <option value="balanced">Equilibrado (Recomendado)</option>
                  <option value="reduced">Tamanho Reduzido (WhatsApp)</option>
                </select>
              </label>

              <div className="grid gap-3 pt-1 sm:grid-cols-2">
                <label className="text-sm text-slate-200">
                  Início
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="HH:MM:SS"
                    pattern="[0-9]{2,}:[0-5][0-9]:[0-5][0-9]"
                    value={advancedOptions.startTime}
                    onChange={(event) =>
                      onAdvancedOptionsChange({
                        ...advancedOptions,
                        startTime: event.target.value,
                      })
                    }
                    className="mt-2 h-9 w-full rounded-lg border border-line bg-panel px-3 font-mono text-sm text-slate-100 outline-none placeholder:text-muted focus:border-accent"
                  />
                </label>
                <label className="text-sm text-slate-200">
                  Fim
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="HH:MM:SS"
                    pattern="[0-9]{2,}:[0-5][0-9]:[0-5][0-9]"
                    value={advancedOptions.endTime}
                    onChange={(event) =>
                      onAdvancedOptionsChange({
                        ...advancedOptions,
                        endTime: event.target.value,
                      })
                    }
                    className="mt-2 h-9 w-full rounded-lg border border-line bg-panel px-3 font-mono text-sm text-slate-100 outline-none placeholder:text-muted focus:border-accent"
                  />
                </label>
              </div>
              <p className="text-xs leading-5 text-muted">
                Preencha início e fim para baixar apenas um trecho. Requer FFmpeg.
              </p>
            </div>
          </details>

          <button
            type="button"
            onClick={onDownload}
            className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-slate-950 transition hover:bg-accent-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-fit"
          >
            Adicionar à fila
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 16v3h14v-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

        {video.formats.length > 0 && (
          <details className="mt-5 border-t border-line pt-4">
          <summary className="cursor-pointer text-xs font-medium text-muted transition hover:text-slate-200">
            Formatos detectados ({video.formats.length})
          </summary>
          <ul className="mt-3 max-h-36 space-y-2 overflow-y-auto pr-2">
            {video.formats.map((format, index) => (
              <li
                key={`${format.format_id}-${index}`}
                className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400"
              >
                <span className="font-mono text-slate-300">{format.format_id}</span>
                <span>{format.ext || 'formato desconhecido'}</span>
                {format.resolution && <span>{format.resolution}</span>}
                {format.vcodec && <span>{format.vcodec}</span>}
              </li>
            ))}
          </ul>
          </details>
        )}
      </section>
      {playerOpen && (
        <VideoPlayerModal
          src={video.previewUrl}
          title={video.title}
          onClose={closePlayer}
        />
      )}
    </>
  )
}

export default VideoCard
