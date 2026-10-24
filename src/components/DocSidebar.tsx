import { NavLink } from "react-router-dom"
import Logo from "../assets/blaze-cache-logo.png"
import { cn } from "../lib/utils"
import { ChevronRight } from "lucide-react"

interface DocNavItem {
  to: string
  label: string
  sub?: string
  children?: { to: string; label: string }[]
}

export default function DocSidebar({ items }: { items: DocNavItem[] }) {
  return (
    <aside className="w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-4 overflow-y-auto">
      <div className="flex h-full items-start gap-2 overflow-hidden px-3 py-6">
        <img src={Logo} alt="Blaze Cache logo" className="mt-0.5 h-7 w-auto shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-tight tracking-tight text-sm text-primary-foreground">Blaze Cache</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground truncate">Client-side caching for the browser.</p>
        </div>
      </div>

      <nav className="mt-8 space-y-1 pr-3">
        {items.map((item) => (
          <div key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#8a1e2e] text-white shadow-md"
                    : "text-muted-foreground hover:bg-accent hover:text-primary-foreground"
                )
              }
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="truncate">{item.label}</span>
                <ChevronRight className="h-4 w-4 shrink-0 opacity-50 md:hidden" />
              </span>
              {item.sub && <span className="hidden truncate md:inline text-xs text-muted-foreground">{item.sub}</span>}
            </NavLink>
            {item.children?.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                className={({ isActive }) =>
                  cn(
                    "ml-8 rounded-md pl-3 pr-8 text-xs font-medium transition-colors",
                    isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-primary-foreground hover:bg-accent/50"
                  )
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}
