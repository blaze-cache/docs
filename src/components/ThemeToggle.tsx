import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

/** Paints <html> with the resolved theme; only an explicit choice is persisted. */
function applyTheme(dark: boolean, persist: boolean) {
  document.documentElement.classList.toggle("dark", dark)
  document.documentElement.style.colorScheme = dark ? "dark" : "light"
  const meta = document.getElementById("theme-color") as HTMLMetaElement | null
  if (meta) meta.content = dark ? "#16171d" : "#ffffff"
  if (persist) {
    try {
      localStorage.setItem("theme", dark ? "dark" : "light")
    } catch {
      /* private mode — the OS preference keeps applying */
    }
  }
}

function hasSavedChoice() {
  try {
    return localStorage.getItem("theme") !== null
  } catch {
    return false
  }
}

/**
 * Light/dark switch in the navbar, mirroring vite.dev's: the bootstrap script
 * in index.html has already resolved the theme before first paint (saved
 * choice, else OS preference), so this starts from the DOM's current state.
 */
export default function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"))

  // While no explicit choice exists, follow the OS if it flips mid-session.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = (e: MediaQueryListEvent) => {
      if (hasSavedChoice()) return
      setDark(e.matches)
      applyTheme(e.matches, false)
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    applyTheme(next, true)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-primary hover:text-white"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light theme" : "Dark theme"}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
