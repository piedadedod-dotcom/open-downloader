import { useEffect, useRef, useState } from 'react'

function VideoPlayerModal({ src, title, onClose }) {
  const [unavailable, setUnavailable] = useState(!src)
  const playerRef = useRef(null)

  useEffect(() => {
    const player = playerRef.current

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      player?.pause()
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-black/85 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-title"
        className="w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[#090a0d] shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
          <h2 id="preview-title" className="truncate text-sm font-medium text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar prévia"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="aspect-video bg-black">
          {unavailable ? (
            <div className="grid h-full place-items-center px-6 text-center">
              <div>
                <p className="text-sm font-medium text-white">Preview indisponível</p>
                <p className="mt-2 max-w-md text-xs leading-5 text-slate-400">
                  Este site não oferece um stream que possa ser reproduzido diretamente
                  ou requer cabeçalhos de autenticação específicos.
                </p>
              </div>
            </div>
          ) : (
            <video
              ref={playerRef}
              src={src}
              controls
              autoPlay
              playsInline
              onError={() => setUnavailable(true)}
              className="h-full w-full"
            />
          )}
        </div>
      </section>
    </div>
  )
}

export default VideoPlayerModal
