"use client"

import { useCallback, useSyncExternalStore } from "react"

function subscribeTheme(onStoreChange: () => void) {
  const el = document.documentElement
  const mo = new MutationObserver(onStoreChange)
  mo.observe(el, { attributes: true, attributeFilter: ["class"] })
  return () => mo.disconnect()
}

function isDarkMode() {
  return !document.documentElement.classList.contains("light")
}

function isDarkModeServer() {
  return true
}

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const dark = useSyncExternalStore(subscribeTheme, isDarkMode, isDarkModeServer)

  const toggleTheme = useCallback(() => {
    const nextLight = !document.documentElement.classList.contains("light")
    document.documentElement.classList.toggle("light", nextLight)
    localStorage.setItem("portfolio-theme", nextLight ? "light" : "dark")
  }, [])

  return (
    <div className="relative min-h-full text-[color:var(--foreground)]">
      <div className="pointer-events-none fixed inset-0 portfolio-aurora portfolio-grid opacity-100" />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:border focus:border-[color:var(--line)] focus:bg-[color:var(--surface)] focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-50 border-b border-[color:var(--line)] bg-[color-mix(in_oklab,var(--background)_82%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4 sm:px-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
            Salman Fiqi
          </span>
          <button
            type="button"
            onClick={toggleTheme}
            className="cursor-pointer rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] px-2.5 py-1 font-mono text-[11px] text-[color:var(--muted)] transition-colors hover:bg-[color:var(--surface-hover)] hover:text-[color:var(--foreground)]"
          >
            {dark ? "light" : "dark"}
          </button>
        </div>
      </header>
      <main id="main" className="relative z-10">
        {children}
      </main>
    </div>
  )
}
