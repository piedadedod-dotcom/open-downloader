function Header({ activeTab, onOpenSettings, onTabChange }) {
  return (
    <header className="border-b border-line/80">
      <div className="mx-auto flex h-[68px] w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="/" className="flex items-center gap-3 text-white no-underline">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-canvas shadow-glow">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 16v3h14v-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-sm font-semibold tracking-wide sm:text-base">Open Downloader</span>
        </a>
        <div className="flex items-center gap-2">
          <nav aria-label="Navegação principal" className="flex items-center gap-1">
            {[
              ['home', 'Início'],
              ['library', 'Biblioteca'],
            ].map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                onClick={() => onTabChange(tab)}
                aria-current={activeTab === tab ? 'page' : undefined}
                className={`h-10 rounded-lg px-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                  activeTab === tab
                    ? 'bg-accent/10 text-accent-bright'
                    : 'text-muted hover:bg-white/5 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-panel px-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" stroke="currentColor" strokeWidth="1.7" />
              <path d="m19.4 15 .1.1a1.8 1.8 0 0 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3 .9v.2a1.8 1.8 0 0 1-3.6 0v-.2a1.8 1.8 0 0 0-3-.9l-.1.1a1.8 1.8 0 0 1-2.5-2.5l.1-.1a1.8 1.8 0 0 0-.9-3H3.7a1.8 1.8 0 0 1 0-3.6h.2a1.8 1.8 0 0 0 .9-3l-.1-.1a1.8 1.8 0 0 1 2.5-2.5l.1.1a1.8 1.8 0 0 0 3-.9v-.2a1.8 1.8 0 0 1 3.6 0v.2a1.8 1.8 0 0 0 3 .9l.1-.1a1.8 1.8 0 0 1 2.5 2.5l-.1.1a1.8 1.8 0 0 0 .9 3h.2a1.8 1.8 0 0 1 0 3.6h-.2a1.8 1.8 0 0 0-.9 3Z" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">Configurações</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
