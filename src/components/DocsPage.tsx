import { useEffect, useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import Logo from "../assets/blaze-cache-logo.png"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Badge } from "./ui/badge"
import { Separator } from "./ui/separator"
import { Button } from "./ui/button"
import { Flame, Zap, ShieldCheck, Database, BookOpen, Terminal, Component, Menu, X, Globe, Sparkles, Radio } from "lucide-react"
import ArchitectureDiagram from "./ArchitectureDiagram"
import CopyButton from "./CopyButton"
import { RELEASES, type ReleaseId } from "../lib/releases"

/** Renders `backticked` spans in release copy as inline code. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/g).map((part, i) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code key={i} className="font-mono text-[0.9em] text-foreground">{part.slice(1, -1)}</code>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

/** Chip colours for the "What's New" kinds declared in lib/releases.ts. */
const KIND_CLS: Record<string, string> = {
  new: "border-[#8a1e2e] text-[#e8a0aa]",
  fixed: "border-emerald-700/60 text-emerald-300",
  testing: "border-amber-600/60 text-amber-300",
}

/** Commit URLs on the "What's New" cards — every claim links back to the diff that made it. */
const COMMIT_BASE = "https://github.com/blaze-cache/blaze-cache/commit/"

/** Version chip used in the header and the mobile drawer; the current route renders active. */
function VersionLink({ to, active, children }: { to: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      to={to}
      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
        active ? "bg-[#8a1e2e] text-white" : "text-muted-foreground hover:text-[#f2f0eb]"
      }`}
    >
      {children}
    </Link>
  )
}

export default function DocsPage({ release: releaseId }: { release: ReleaseId }) {
  const release = RELEASES[releaseId]
  const isBeta = release.isBeta
  const navItems = release.nav
  const quickStart = release.quickStart.join("\n")

  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeId, setActiveId] = useState("overview")

  useEffect(() => {
    document.title = RELEASES[releaseId].isBeta
      ? `Blaze Cache — ${RELEASES[releaseId].badge} (prerelease) documentation`
      : "Blaze Cache — Rust / WebAssembly Client-Side Caching Library"
    // Switching versions rewrites the URL without a reload — keep deep links where they are.
    if (!window.location.hash) window.scrollTo({ top: 0 })
  }, [releaseId])

  useEffect(() => {
    document.documentElement.classList.add("dark")
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    )
    RELEASES[releaseId].nav.forEach((n) => {
      const el = document.getElementById(n.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [releaseId])

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f2f0eb] selection:bg-[#8a1e2e]/30">
      {/* Top header */}
      <header className="sticky top-0 z-50 border-b border-[#2a1818] bg-[#0a0a0b]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-6">
          <img src={Logo} alt="Blaze Cache" className="h-9 w-auto" />
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight leading-none">Blaze Cache</h1>
            <Badge className={isBeta ? "border-transparent bg-amber-500 text-black hover:bg-amber-500" : undefined}>{release.badge}</Badge>
          </div>
          {/* Version switcher — stable tracks npm's `latest` tag, beta tracks `@beta`. Labels come
              from the release record, so a version bump happens in exactly one place. */}
          <nav aria-label="Documentation version" className="hidden items-center rounded-lg border border-[#2a1818] bg-[#121012] p-0.5 px-3 lg:flex">
            <VersionLink to="/" active>{RELEASES.stable.badge}</VersionLink>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#2a1818] bg-[#121012] text-[#f2f0eb] hover:bg-[#8a1e2e] hover:text-white" aria-label="Open menu"><Menu size={18} /></button>
            <Button size="sm" variant="outline" className="hidden md:inline-flex border-[#2a1818] bg-[#121012] text-[#f2f0eb] hover:bg-[#8a1e2e] hover:text-white hover:border-[#8a1e2e]"><a href="https://github.com/blaze-cache/blaze-cache" target="_blank" rel="noreferrer">GitHub <span className="ml-1 rounded-full bg-[#8a1e2e] px-1.5 text-[10px] font-bold">1</span></a></Button>
            <Button size="sm" className="hidden md:inline-flex bg-[#8a1e2e] text-white hover:bg-[#a0283a] shadow-[0_0_20px_rgba(138,30,46,0.35)]" onClick={() => document.getElementById("install")?.scrollIntoView({ behavior: "smooth" })}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-[#121012] border-r border-[#2a1818] shadow-2xl shadow-black/40 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <img src={Logo} alt="Blaze Cache" className="h-8 w-auto" />
              <button onClick={() => setMobileOpen(false)} className="rounded-md p-2 text-muted-foreground hover:text-white hover:bg-[#8a1e2e]" aria-label="Close menu"><X size={20} /></button>
            </div>
            <nav className="space-y-2">
              {navItems.map((n) => (
                <a key={n.id} href={`#${n.id}`} onClick={() => setMobileOpen(false)} className={`block rounded-lg px-3 py-3 text-sm font-medium transition-colors ${activeId === n.id ? "text-primary-foreground bg-[#8a1e2e]" : "text-muted-foreground hover:bg-[#8a1e2e] hover:text-white"}`}>
                  {n.label}
                </a>
              ))}
            </nav>
            <div className="mt-6 border-t border-[#2a1818] pt-5">
              <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Docs version</p>
              <div className="flex flex-wrap gap-2 px-1">
                <VersionLink to="/" active>{RELEASES.stable.badge}</VersionLink>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3">
              <a href="https://github.com/blaze-cache/blaze-cache" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-lg border border-[#2a1818] bg-[#121012] px-4 py-2.5 text-sm font-medium text-[#f2f0eb] hover:bg-[#8a1e2e]">GitHub</a>
            </div>
          </aside>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24">
              <div className="relative pl-4">
                {/* Vertical line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-[#2a1818] rounded-full" />
                {navItems.map((n, idx) => {
                  const active = activeId === n.id;
                  const group = n.id === "core" ? "Core" : n.id === "rq" || n.id === "swr" || n.id === "axios" || n.id === "fetch" ? "Adapters" : n.id === "usage" ? "Usage" : n.id === "repo" ? "Repo" : "";
                  const prev = navItems[idx - 1];
                  const prevGroup = prev ? (prev.id === "core" ? "Core" : prev.id === "rq" || prev.id === "swr" || prev.id === "axios" || prev.id === "fetch" ? "Adapters" : prev.id === "usage" ? "Usage" : prev.id === "repo" ? "Repo" : "") : "";
                  return (
                    <>
                      {group && group !== prevGroup && (
                        <div className="mt-3 mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-[#8a1e2e]">{group}</div>
                      )}
                    <a key={n.id} href={`#${n.id}`} className="relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors mb-1 group">
                      {/* Dot */}
                      <span className={`absolute -left-[11px] top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 shadow-md transition-all duration-300 z-10 ${active ? "bg-[#8a1e2e] border-[#8a1e2e] shadow-[#8a1e2e]/40 scale-125" : "bg-[#121012] border-[#3a1818] group-hover:border-[#8a1e2e]"}`} />
                      {/* Label */}
                      <span className={`truncate transition-colors ${active ? "text-[#fff5f0] font-semibold" : "text-muted-foreground group-hover:text-primary-foreground"}`}>
                        {n.label}
                      </span>
                    </a>
                    </>
                  )
                })}
              </div>
            </nav>
          </aside>

          <main className="min-w-0">
            {/* Which release these docs describe */}
            {isBeta ? (
              <div className="mb-10 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
                <Badge className="border-transparent bg-amber-500 text-black hover:bg-amber-500">BETA</Badge>
                <span>These docs describe the <strong>{release.badge}</strong> prerelease.</span>
                <Link to="/" className="font-medium text-amber-300 underline underline-offset-4 hover:text-white">Latest stable is {RELEASES.stable.badge} →</Link>
              </div>
            ) : (
              <div className="mb-10 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-[#2a1818] bg-[#121012] px-5 py-4 text-sm text-muted-foreground">
                <Badge variant="outline">stable</Badge>
                <span>Documenting release <strong>{release.badge}</strong>.</span>
              </div>
            )}

            {/* Hero */}
            <section id="overview" className="mb-20">
              <div className="relative overflow-hidden rounded-3xl border border-[#2a1818] bg-gradient-to-br from-[#121012] via-[#0f0a0a] to-[#121012] shadow-2xl shadow-[#8a1e2e]/10 px-8 py-14 md:px-14 md:py-16">
                <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[#8a1e2e]/20 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#6b1020]/20 blur-3xl" />
                <div className="relative">
                  <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] bg-gradient-to-br from-[#fff5f0] via-[#f2dcda] to-[#8a1e2e] bg-clip-text text-transparent mb-6">Blaze Cache</h2>
                  <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed">Blazingly fast client-side caching library powered by Rust → WebAssembly. Features synchronous reads, SIEVE eviction, tag invalidation, and optional IndexedDB persistence.</p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Badge className="text-sm px-3 py-1">Wasm hot path</Badge>
                    <Badge className="text-sm px-3 py-1">O(1) eviction</Badge>
                    <Badge className="text-sm px-3 py-1">ESM only</Badge>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-[#2a1818] bg-[#121012]/60 backdrop-blur">
                  <CardHeader>
                    <Zap className="h-6 w-6 text-[#8a1e2e] mb-2" />
                    <CardTitle>Synchronous</CardTitle>
                    <CardDescription>After initialization, every get/set is fully synchronous—no Promises on the hot path.</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="border-[#2a1818] bg-[#121012]/60 backdrop-blur">
                  <CardHeader>
                    <Flame className="h-6 w-6 text-[#8a1e2e] mb-2" />
                    <CardTitle>SIEVE Eviction</CardTitle>
                    <CardDescription>Scan-resistant, O(1)-amortised eviction with a tiny footprint and no JS object churn.</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="border-[#2a1818] bg-[#121012]/60 backdrop-blur">
                  <CardHeader>
                    <Database className="h-6 w-6 text-[#8a1e2e] mb-2" />
                    <CardTitle>IndexedDB</CardTitle>
                    <CardDescription>Optional write-through persistence that hydrates before createCache() resolves.</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </section>

            <Separator className="my-16 bg-[#2a1818]" />

            {/* What's new in this release */}
            {release.whatsNew.length > 0 && (
              <>
                <section id="whatsnew" className="mb-20 scroll-mt-28">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8a1e2e]/20 text-[#8a1e2e] shadow-lg shadow-[#8a1e2e]/10"><Sparkles size={20} /></div>
                    <h3 className="text-3xl font-extrabold tracking-tight">What's New</h3>
                    <Badge variant="outline" className="text-[11px]">{release.badge}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-6 max-w-3xl">
                    Everything the 0.2 line adds over the stable {RELEASES.stable.badge} — newest
                    first, {release.badge} at the top — each card linking to the section that
                    documents it.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {release.whatsNew.map((item) => (
                      <Card key={item.title} className="border-[#2a1818] bg-[#121012] hover:border-[#8a1e2e] transition-colors">
                        <CardHeader>
                          <Badge variant="outline" className={`w-fit ${KIND_CLS[item.kind] ?? KIND_CLS.new}`}>{item.kind}</Badge>
                          <CardTitle><RichText text={item.title} /></CardTitle>
                          <CardDescription className="leading-relaxed"><RichText text={item.desc} /></CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap items-center justify-between gap-3">
                          <a href={item.href} className="inline-flex items-center gap-1 text-sm font-medium text-[#e8a0aa] hover:text-[#fff5f0] transition-colors">
                            {item.more} <span aria-hidden="true">→</span>
                          </a>
                          {item.commits.length > 0 && (
                            <span className="flex flex-wrap items-center gap-1.5" aria-label="Commits behind this change">
                              {item.commits.map((sha) => (
                                <a
                                  key={sha}
                                  href={`${COMMIT_BASE}${sha}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  title={`commit ${sha}`}
                                  className="rounded bg-[#0a0a0b] px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-[#8a1e2e]/20 hover:text-[#e8a0aa]"
                                >
                                  {sha.slice(0, 7)}
                                </a>
                              ))}
                            </span>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>

                <Separator className="my-16 bg-[#2a1818]" />
              </>
            )}

            {/* Installation */}
            <section id="install" className="mb-20 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8a1e2e]/20 text-[#8a1e2e] shadow-lg shadow-[#8a1e2e]/10"><Terminal size={20} /></div>
                <h3 className="text-3xl font-extrabold tracking-tight">Installation</h3>
              </div>
              <div className={`grid grid-cols-1 gap-6 ${isBeta ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
                {release.packages.map((i) => (
                  <Card key={i.pkg} className="border-[#2a1818] bg-[#121012]">
                    <CardHeader>
                      <CardTitle className="font-mono text-base break-words">{i.pkg}</CardTitle>
                      <CardDescription className="text-xs">{i.note}</CardDescription>
                      <div className="mt-2 break-all rounded-md bg-[#0a0a0b] p-3 font-mono text-xs text-[#f2f0eb] border border-[#2a1818]">npm install {i.pkg}{release.installTag}</div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">Peer dependencies: <span className="font-medium text-foreground">{i.peers}</span></p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-[#2a1818] bg-[#121012] p-6 shadow-xl shadow-black/20 relative">
                <h4 className="font-semibold text-lg mb-1">Quick Start</h4>
                <p className="mb-3 text-sm text-muted-foreground">Core is the only requirement — copy the lines for the integrations you actually use.</p>
                <pre className="overflow-x-auto rounded-lg bg-[#0a0a0b] p-4 text-sm font-mono leading-7 border border-[#2a1818] text-[#e8cfc8]"><code>{quickStart}</code></pre><CopyButton text={quickStart} />
              </div>
            </section>

            <Separator className="my-16 bg-[#2a1818]" />

            {/* Core API */}
            <section id="core" className="mb-20 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8a1e2e]/20 text-[#8a1e2e] shadow-lg shadow-[#8a1e2e]/10"><Component size={20} /></div>
                <h3 className="text-3xl font-extrabold tracking-tight">Core API</h3>
              </div>
              <p className="text-muted-foreground mb-6">Create a cache instance. All reads/writes are synchronous after initialization.</p>
              <Card className="border-[#2a1818] bg-[#121012] overflow-hidden">
                <CardHeader className="border-b border-[#2a1818]">
                  <code className="font-mono text-sm text-amber-200">createCache(options?) → Promise&lt;BlazeCache&gt;</code>
                </CardHeader>
                <CardContent className="pt-6 relative">
                  <pre className="overflow-x-auto rounded-lg bg-[#0a0a0b] p-4 text-sm font-mono leading-7 border border-[#2a1818] text-[#e8cfc8]"><code>{`import { createCache } from '@blaze-cache/core';
import wasmUrl from '@blaze-cache/core/pkg/blaze_cache_wasm_bg.wasm?url';

const cache = await createCache({
  capacity: 1000,
  persistence: { namespace: 'my-app' },
  wasm: wasmUrl,
});`}</code></pre><CopyButton text="import { createCache } from '@blaze-cache/core';
import wasmUrl from '@blaze-cache/core/pkg/blaze_cache_wasm_bg.wasm?url';

const cache = await createCache({
  capacity: 1000,
  persistence: { namespace: 'my-app' },
  wasm: wasmUrl,
});" />
                </CardContent>
              </Card>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                {release.coreMethods.map(({ name, sig, desc, isNew }) => (
                  <div key={name} className="text-left rounded-xl border border-[#2a1818] bg-[#121012] px-4 py-3 shadow-sm hover:border-[#8a1e2e] transition-colors group">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold text-[#f2f0eb] group-hover:text-[#fff5f0]">.{name}()</span>
                      <span className="flex items-center gap-2">
                        {isNew && <Badge variant="outline" className="border-[#8a1e2e] px-1.5 py-0 text-[10px] text-[#e8a0aa]">new</Badge>}
                        <span className="text-xs text-muted-foreground font-mono">{sig}</span>
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground leading-relaxed">{desc}</div>
                  </div>
                ))}
              </div>
            </section>

            <Separator className="my-16 bg-[#2a1818]" />

            {/* Events */}
            <>
                <section id="events" className="mb-20 scroll-mt-28">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8a1e2e]/20 text-[#8a1e2e] shadow-lg shadow-[#8a1e2e]/10"><Radio size={20} /></div>
                    <h3 className="text-3xl font-extrabold tracking-tight">Events</h3>
                  </div>
                  <p className="mb-6 max-w-3xl text-muted-foreground">
                    Everything the cache does is observable through a typed event system.
                    <code className="text-amber-200"> on(type, listener)</code> subscribes to one
                    event type — the payload typed to exactly that event —{" "}
                    <code className="text-amber-200">on(listener)</code> subscribes to{" "}
                    <strong className="text-foreground">all</strong> of them (wildcard), both
                    return their own unsubscribe function, and <code>once</code> /{" "}
                    <code>off</code> complete the API.
                  </p>
                  <Card className="border-[#2a1818] bg-[#121012] overflow-hidden">
                    <CardHeader className="border-b border-[#2a1818]">
                      <code className="font-mono text-sm text-amber-200">typed per event — or one listener for every event</code>
                    </CardHeader>
                    <CardContent className="pt-6 relative">
                      <pre className="overflow-x-auto rounded-lg bg-[#0a0a0b] p-4 text-sm font-mono leading-7 border border-[#2a1818] text-[#e8cfc8]"><code>{`// One event type — the payload is typed to exactly that event.
const offEvict = cache.on('evict', ({ key, value }) => {
  console.log('the cache dropped', key, value);
});

// Wildcard: every event, payload the full union (narrow on event.type).
cache.on((event) => {
  if (event.type === 'hit') console.log('hit', event.key, event.value);
});

cache.once('clear', () => console.log('first clear, only once'));

cache.off('evict');   // every evict listener
cache.off();          // every listener, period
offEvict();           // …or just this one handle (idempotent)`}</code></pre><CopyButton text={`// One event type — the payload is typed to exactly that event.
const offEvict = cache.on('evict', ({ key, value }) => {
  console.log('the cache dropped', key, value);
});

// Wildcard: every event, payload the full union (narrow on event.type).
cache.on((event) => {
  if (event.type === 'hit') console.log('hit', event.key, event.value);
});

cache.once('clear', () => console.log('first clear, only once'));

cache.off('evict');   // every evict listener
cache.off();          // every listener, period
offEvict();           // …or just this one handle (idempotent)`} />
                    </CardContent>
                  </Card>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { name: "hit", when: "`get()` / `getMany()` found a live entry", payload: "key, value", core: false },
                      { name: "miss", when: "a lookup found nothing — absent or expired", payload: "key", core: false },
                      { name: "set", when: "a key was stored (insert or replace)", payload: "key", core: false },
                      { name: "delete", when: "a key was removed and was present", payload: "key", core: false },
                      { name: "clear", when: "the cache was emptied", payload: "—", core: false },
                      { name: "invalidate", when: "`invalidateTags()` removed entries", payload: "keys", core: false },
                      { name: "prune", when: "`prune()` removed expired entries", payload: "keys", core: false },
                      { name: "touch", when: "`touch()` renewed a live entry's deadline", payload: "key", core: false },
                      { name: "evict", when: "the core dropped an entry to stay within capacity", payload: "key, value", core: true },
                      { name: "expire", when: "the core reclaimed an entry whose TTL elapsed", payload: "key, value", core: true },
                    ].map((e) => (
                      <div key={e.name} className="text-left rounded-xl border border-[#2a1818] bg-[#121012] px-4 py-3 shadow-sm hover:border-[#8a1e2e] transition-colors group">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-sm font-semibold text-[#f2f0eb] group-hover:text-[#fff5f0]">'{e.name}'</span>
                          {e.core && <Badge variant="outline" className="border-amber-600/60 px-1.5 py-0 text-[10px] text-amber-300">rust core</Badge>}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground leading-relaxed"><RichText text={e.when} /></div>
                        <div className="mt-2 font-mono text-[11px] text-muted-foreground">payload: {e.payload}</div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-6 max-w-3xl text-muted-foreground">
                    Eight of those are raised in TypeScript around the call you made.{" "}
                    <code>evict</code> and <code>expire</code> happen{" "}
                    <em className="text-foreground not-italic font-medium">inside the Rust core</em>{" "}
                    and are delivered from an opt-in drop log: the first listener interested in
                    them switches it on through the wasm binding, and with no such listener the hot
                    path pays a single predictable branch — never a boundary crossing. Drains run
                    after <code>get</code>, <code>getMany</code>, <code>set</code> and{" "}
                    <code>setMany</code>, so an <code>evict</code> or <code>expire</code> lands right
                    after the operation that caused it. Listeners run
                    synchronously in registration order, a throwing listener is logged and skipped —
                    never able to undo a mutation — and reads that record nothing (<code>peek</code>,{" "}
                    <code>has</code>, <code>ttl</code>, <code>size</code>) emit nothing.{" "}
                    <code>dispose()</code> clears every listener along with the wasm memory.
                  </p>
                </section>

                <Separator className="my-16 bg-[#2a1818]" />
              </>

            {/* Axios */}
            <section id="axios" className="mb-20 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8a1e2e]/20 text-[#8a1e2e] shadow-lg shadow-[#8a1e2e]/10"><ShieldCheck size={20} /></div>
                <h3 className="text-3xl font-extrabold tracking-tight">Axios Adapter</h3>
              </div>
              <p className="mb-6 max-w-3xl text-muted-foreground">
                The adapter sits between axios and the network: a <code>MISS</code> goes out and
                comes back cached, a <code>HIT</code> replays the stored status, headers and data
                without touching the network. Both entry points are exported from{" "}
                <code className="text-amber-200">@blaze-cache/axios</code> — pick the one that
                matches how you create your instance.
              </p>
              {isBeta && (
                <>
                  <p className="mb-6 max-w-3xl text-muted-foreground">
                    The adapter stores headers that describe the stored bytes:{" "}
                    <code>content-encoding</code> is dropped and <code>content-length</code> rewritten
                    to the decoded payload, so a cache hit can never contradict its own{" "}
                    <code>data.byteLength</code>.
                  </p>
                  <p className="mb-6 max-w-3xl text-muted-foreground">
                    It also keys on the URL axios will actually request — an absolute{" "}
                    <code>url</code> ignores <code>baseURL</code> and slashes collapse exactly as{" "}
                    <code>buildFullPath</code> does, so one endpoint occupies one entry. A response
                    carrying <code>Vary: *</code>, or varying on a header outside{" "}
                    <code>varyHeaders</code>, is never stored rather than risk replaying the wrong
                    variant to the wrong caller, and the response's <code>Age</code> shortens the
                    freshness window the adapter enforces on every read.
                  </p>
                </>
              )}
              <div className="grid grid-cols-1 gap-6">
                <Card className="border-[#2a1818] bg-[#121012]">
                  <CardHeader>
                    <CardTitle>installBlazeCache(api, options)</CardTitle>
                    <CardDescription>
                      Retrofit an instance you already have. It captures the adapter the instance is
                      currently using before replacing it, so the wrapper can never call itself.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <pre className="overflow-x-auto rounded-lg bg-[#0a0a0b] p-4 text-sm font-mono leading-7 border border-[#2a1818] text-[#e8cfc8]"><code>{`import { createCache } from '@blaze-cache/core';
import axios from 'axios';
import { installBlazeCache } from '@blaze-cache/axios';
import type { CachedAxiosResponse } from '@blaze-cache/axios';

const cache = await createCache({ persistence: { namespace: 'api' } });
const api = axios.create({ baseURL: 'https://api.example.com' });
installBlazeCache(api, { cache, ttlMs: 30_000 });

const res = await api.get('/users/42');
res.headers['x-blaze-cache'];   // 'MISS' — went to the network

const again = (await api.get('/users/42')) as CachedAxiosResponse;
again.fromBlazeCache;           // true — replayed from the cache
again.headers['x-blaze-cache']; // 'HIT'`}</code></pre><CopyButton text={`import { createCache } from '@blaze-cache/core';
import axios from 'axios';
import { installBlazeCache } from '@blaze-cache/axios';
import type { CachedAxiosResponse } from '@blaze-cache/axios';

const cache = await createCache({ persistence: { namespace: 'api' } });
const api = axios.create({ baseURL: 'https://api.example.com' });
installBlazeCache(api, { cache, ttlMs: 30_000 });

const res = await api.get('/users/42');
res.headers['x-blaze-cache'];   // 'MISS' — went to the network

const again = (await api.get('/users/42')) as CachedAxiosResponse;
again.fromBlazeCache;           // true — replayed from the cache
again.headers['x-blaze-cache']; // 'HIT'`} />
                  </CardContent>
                </Card>
                <Card className="border-[#2a1818] bg-[#121012]">
                  <CardHeader>
                    <CardTitle>blazeAdapter(options)</CardTitle>
                    <CardDescription>
                      Attach it to a new instance: the returned adapter is handed straight to{" "}
                      <code>axios.create()</code> and wraps the default network adapter (xhr, http
                      or fetch).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <pre className="overflow-x-auto rounded-lg bg-[#0a0a0b] p-4 text-sm font-mono leading-7 border border-[#2a1818] text-[#e8cfc8]"><code>{`import { createCache } from '@blaze-cache/core';
import axios from 'axios';
import { blazeAdapter } from '@blaze-cache/axios';

const cache = await createCache({ persistence: { namespace: 'api' } });

const api = axios.create({
  adapter: blazeAdapter({ cache, ttlMs: 30_000 }),
});`}</code></pre><CopyButton text={`import { createCache } from '@blaze-cache/core';
import axios from 'axios';
import { blazeAdapter } from '@blaze-cache/axios';

const cache = await createCache({ persistence: { namespace: 'api' } });

const api = axios.create({
  adapter: blazeAdapter({ cache, ttlMs: 30_000 }),
});`} />
                  </CardContent>
                </Card>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { name: "cache", sig: "BlazeAxiosCacheLike", desc: isBeta
                    ? "The cache backing the adapter — required. Anything with get/set fits; each record carries its own freshUntil deadline, and an optional delete() drops one the adapter finds expired."
                    : "The cache backing the adapter — required. Anything with get/set fits, so a real Blaze Cache in production or a stub in tests." },
                  { name: "ttlMs", sig: "number | (response, config) => number", desc: isBeta
                    ? "Freshness window in ms. Default 60_000; a response Cache-Control: max-age overrides it, minus the response's Age. A value <= 0 means don't store."
                    : "Freshness window in ms. Default 60_000; a response Cache-Control: max-age overrides it. A value <= 0 means don't store." },
                  { name: "key", sig: "(config) => string", desc: isBeta
                    ? "Builds the cache key from the final (post-interceptor) config — the URL axios will actually request, joined like buildFullPath and canonicalised. Default hashes method, URL, params and varyHeaders, keeping bearer tokens out of stored keys."
                    : "Builds the cache key from the final (post-interceptor) config. Default hashes method, URL, params and varyHeaders, keeping bearer tokens out of stored keys." },
                  { name: "shouldCache", sig: "(response, config) => boolean", desc: "Decides what gets stored. Default: GET answering 2xx without no-store / no-cache. Rejected responses still return — just marked MISS." },
                  { name: "tags", sig: "(response, config) => string[]", desc: "Tags attached to stored responses. Default ['axios', '<METHOD> <url>'] — drop them together with cache.invalidateTags()." },
                  { name: "varyHeaders", sig: "string[]", desc: isBeta
                    ? "Request headers hashed into the key — and the whitelist the response's Vary is checked against: Vary: * is never stored, and one varying on a header outside this list is left uncached. Default ['Authorization'] so a personalised response never crosses users. Values are hashed, never stored."
                    : "Request headers hashed into the key. Default ['Authorization'] so a personalised response never crosses users. Values are hashed, never stored." },
                  { name: "markerHeader", sig: "string | false", desc: "Response header written as HIT / MISS. Default 'x-blaze-cache'; pass false to turn the marker off." },
                  { name: "adapter", sig: "AxiosAdapter | AxiosAdapter[] | string[]", desc: "Adapter performing the real network call. installBlazeCache fills it in from the instance's defaults, so you rarely set it by hand." },
                ].map((o) => (
                  <div key={o.name} className="text-left rounded-xl border border-[#2a1818] bg-[#121012] px-4 py-3 shadow-sm hover:border-[#8a1e2e] transition-colors group">
                    <div className="font-mono text-sm font-semibold text-[#f2f0eb] group-hover:text-[#fff5f0]">{o.name}</div>
                    <div className="mt-0.5 font-mono text-xs text-muted-foreground break-words">{o.sig}</div>
                    <div className="mt-2 text-xs text-muted-foreground leading-relaxed">{o.desc}</div>
                  </div>
                ))}
              </div>
            </section>

            <Separator className="my-16 bg-[#2a1818]" />

            <>
                <section id="fetch" className="mb-20 scroll-mt-28">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8a1e2e]/20 text-[#8a1e2e] shadow-lg shadow-[#8a1e2e]/10"><Globe size={20} /></div>
                    <h3 className="text-3xl font-extrabold tracking-tight">Fetch Adapter</h3>
                  </div>
                  <p className="text-muted-foreground mb-6 max-w-3xl">
                    <code className="text-amber-200">createBlazeFetch(cache, options?) → typeof fetch</code>{" "}
                    is a drop-in replacement for the global <code>fetch</code>, backed by the same
                    cache: TTLs, <code>Cache-Control</code>, stale-while-revalidate, and an{" "}
                    <code>x-blaze-cache: HIT | MISS | STALE</code> marker on every response it returns.
                  </p>
                  <p className="text-muted-foreground mb-6 max-w-3xl">
                    Identical concurrent requests <strong className="text-foreground">coalesce</strong>:
                    one caller leads and the rest replay the record it stored, so a burst of the same{" "}
                    <code>GET</code> opens a single connection instead of N. A cache that throws costs
                    one console warning — never a failed response.
                  </p>

                  <div className="grid grid-cols-1 gap-6">
                    <Card className="border-[#2a1818] bg-[#121012] overflow-hidden">
                      <CardHeader className="border-b border-[#2a1818]">
                        <code className="font-mono text-sm text-amber-200">first call → MISS, second → HIT</code>
                      </CardHeader>
                      <CardContent className="pt-6 relative">
                        <pre className="overflow-x-auto rounded-lg bg-[#0a0a0b] p-4 text-sm font-mono leading-7 border border-[#2a1818] text-[#e8cfc8]"><code>{`import { createBlazeFetch } from '@blaze-cache/fetch';

const cachedFetch = createBlazeFetch(cache, { ttlMs: 30_000 });

const res = await cachedFetch('/api/users');
res.headers.get('x-blaze-cache');   // 'MISS'

const again = await cachedFetch('/api/users');
again.headers.get('x-blaze-cache'); // 'HIT'
await again.json();                 // replayed from the cache`}</code></pre><CopyButton text={`import { createBlazeFetch } from '@blaze-cache/fetch';

const cachedFetch = createBlazeFetch(cache, { ttlMs: 30_000 });

const res = await cachedFetch('/api/users');
res.headers.get('x-blaze-cache');   // 'MISS'

const again = await cachedFetch('/api/users');
again.headers.get('x-blaze-cache'); // 'HIT'
await again.json();                 // replayed from the cache`} />
                      </CardContent>
                    </Card>
                    <Card className="border-[#2a1818] bg-[#121012] overflow-hidden">
                      <CardHeader className="border-b border-[#2a1818]">
                        <code className="font-mono text-sm text-amber-200">assignable to typeof fetch</code>
                      </CardHeader>
                      <CardContent className="pt-6 relative">
                        <pre className="overflow-x-auto rounded-lg bg-[#0a0a0b] p-4 text-sm font-mono leading-7 border border-[#2a1818] text-[#e8cfc8]"><code>{`const asFetch: typeof fetch = cachedFetch;
window.fetch = cachedFetch;  // caches every request in the app

// skip the read and refresh the stored entry
await cachedFetch('/api/users', { forceRefresh: true });

// drop everything this wrapper has stored
cache.invalidateTags('fetch');`}</code></pre><CopyButton text={`const asFetch: typeof fetch = cachedFetch;
window.fetch = cachedFetch;  // caches every request in the app

// skip the read and refresh the stored entry
await cachedFetch('/api/users', { forceRefresh: true });

// drop everything this wrapper has stored
cache.invalidateTags('fetch');`} />
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { name: "ttlMs", sig: "number | (response, url, init) => number", desc: "Freshness window in ms. Default 60_000; a response Cache-Control: max-age overrides it, minus its Age." },
                      { name: "methods", sig: "string[]", desc: "Methods eligible for caching. Default ['GET'] — pass ['GET', 'HEAD'] to include HEAD. Anything else always hits the network." },
                      { name: "cacheControl", sig: "boolean", desc: "Honour Cache-Control on both sides. On the request, no-store / no-cache and max-age=0 skip the read; on the response, max-age sets the TTL (minus Age), no-store and no-cache — the per-field no-cache=\"field\" form included — stop it being stored, and must-revalidate / proxy-revalidate closes the stale window entirely. Default true. If a server responds with no-cache (e.g. catfact.ninja/breeds), the entry is never written — set false and rely on ttlMs if you need to cache it anyway." },
                      { name: "staleWhileRevalidate", sig: "boolean | number", desc: "Serve responses past freshness while a background refresh runs — those are marked STALE. A response carrying must-revalidate is never served stale. Default false." },
                      { name: "key", sig: "(url, init) => string", desc: "Builds the cache key. Default is '<method> <url>' plus a hash of varyHeaders; replace it wholesale if you override it." },
                      { name: "shouldCache", sig: "(response, url, init) => boolean", desc: "Decides what gets stored. Default: 2xx only. Rejected responses still return — just marked MISS." },
                      { name: "tags", sig: "(response, url, init) => string[]", desc: "Tags on stored responses. Default ['fetch', '<method> <url>'] — invalidateTags('fetch') drops them all at once." },
                      { name: "varyHeaders", sig: "string[]", desc: "Request headers hashed into the key — and the whitelist the response's Vary is checked against: Vary: * is never stored, and one varying on a header outside this list is left uncached rather than replay a variant to the wrong caller. Checked on every store, cacheControl or not. Default ['authorization'], so a personalised response never crosses users. Values are never stored." },
                      { name: "markerHeader", sig: "string | false", desc: "Header written as HIT / MISS / STALE. Default 'x-blaze-cache'; pass false to disable the marker." },
                      { name: "fetch", sig: "typeof fetch", desc: "The function performing the real network call. Defaults to the global fetch — inject a stub to test without a server." },
                    ].map((o) => (
                      <div key={o.name} className="text-left rounded-xl border border-[#2a1818] bg-[#121012] px-4 py-3 shadow-sm hover:border-[#8a1e2e] transition-colors group">
                        <div className="font-mono text-sm font-semibold text-[#f2f0eb] group-hover:text-[#fff5f0]">{o.name}</div>
                        <div className="mt-0.5 font-mono text-xs text-muted-foreground break-words">{o.sig}</div>
                        <div className="mt-2 text-xs text-muted-foreground leading-relaxed">{o.desc}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { marker: "MISS", cls: "border-[#2a1818] text-muted-foreground", desc: "Came from the network." },
                      { marker: "HIT", cls: "border-emerald-700/60 text-emerald-300", desc: "Served from the cache while still fresh." },
                      { marker: "STALE", cls: "border-amber-600/60 text-amber-300", desc: "Served past freshness with stale-while-revalidate on — a refresh is already running, so the next request is a HIT." },
                    ].map((m) => (
                      <div key={m.marker} className={`rounded-xl border bg-[#121012] px-4 py-3 ${m.cls}`}>
                        <div className="font-mono text-sm font-bold tracking-wide">x-blaze-cache: {m.marker}</div>
                        <div className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{m.desc}</div>
                      </div>
                    ))}
                  </div>
                </section>

                <Separator className="my-16 bg-[#2a1818]" />
              </>

            {/* React Query */}
            <section id="rq" className="mb-20 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8a1e2e]/20 text-[#8a1e2e] shadow-lg shadow-[#8a1e2e]/10"><BookOpen size={20} /></div>
                <h3 className="text-3xl font-extrabold tracking-tight">React Query</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="border-[#2a1818] bg-[#121012]">
                  <CardHeader><CardTitle>createBlazeQueryClient</CardTitle><CardDescription>Create a QueryClient that mirrors every query.</CardDescription></CardHeader>
                  <CardContent className="relative"><pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-[#0a0a0b] p-3 text-xs font-mono border border-[#2a1818]">const client = createBlazeQueryClient(&#123; cache &#125;)</pre><CopyButton text="const client = createBlazeQueryClient({ cache })" /></CardContent>
                </Card>
                <Card className="border-[#2a1818] bg-[#121012]">
                  <CardHeader><CardTitle>useBlazeQuery</CardTitle><CardDescription>Starts from Blaze Cache with original dataUpdatedAt.</CardDescription></CardHeader>
                  <CardContent className="relative"><pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-[#0a0a0b] p-3 text-xs font-mono border border-[#2a1818]">const data = useBlazeQuery(cache, &#123; ...options &#125;)</pre><CopyButton text="const data = useBlazeQuery(cache, { ...options })" /></CardContent>
                </Card>
                <Card className="border-[#2a1818] bg-[#121012]">
                  <CardHeader><CardTitle>syncBlazeQueryCache</CardTitle><CardDescription>Manual event subscription.</CardDescription></CardHeader>
                  <CardContent className="relative"><pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-[#0a0a0b] p-3 text-xs font-mono border border-[#2a1818]">const unsub = syncBlazeQueryCache(client, &#123; cache &#125;)</pre><CopyButton text="const unsub = syncBlazeQueryCache(client, { cache })" /></CardContent>
                </Card>
                <Card className="border-[#2a1818] bg-[#121012]">
                  <CardHeader><CardTitle>useBlazeInfiniteQuery</CardTitle><CardDescription>Infinite scroll that seeds from the mirror.</CardDescription></CardHeader>
                  <CardContent className="relative"><pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-[#0a0a0b] p-3 text-xs font-mono border border-[#2a1818]"><code>{`const { data } = useBlazeInfiniteQuery(cache, { queryKey: ['posts'], queryFn })`}</code></pre><CopyButton text={`const { data } = useBlazeInfiniteQuery(cache, { queryKey: ['posts'], queryFn })`} /></CardContent>
                </Card>
                <Card className="border-[#2a1818] bg-[#121012]">
                  <CardHeader><CardTitle>useBlazeMutation</CardTitle><CardDescription>Invalidates both caches after a successful mutation.</CardDescription></CardHeader>
                  <CardContent className="relative"><pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-[#0a0a0b] p-3 text-xs font-mono border border-[#2a1818]"><code>{`const mutation = useBlazeMutation(cache, { mutationFn })`}</code></pre><CopyButton text={`const mutation = useBlazeMutation(cache, { mutationFn })`} /></CardContent>
                </Card>
                <Card className="border-[#2a1818] bg-[#121012]">
                  <CardHeader><CardTitle>useBlazeQueries</CardTitle><CardDescription>Batch of queries, all painting from the mirror.</CardDescription></CardHeader>
                  <CardContent className="relative"><pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-[#0a0a0b] p-3 text-xs font-mono border border-[#2a1818]"><code>{`const results = useBlazeQueries(cache, [{ queryKey, queryFn }])`}</code></pre><CopyButton text={`const results = useBlazeQueries(cache, [{ queryKey, queryFn }])`} /></CardContent>
                </Card>
                <Card className="border-[#2a1818] bg-[#121012]">
                  <CardHeader><CardTitle>prefetchBlazeQuery</CardTitle><CardDescription>Imperative prefetch that writes to the mirror.</CardDescription></CardHeader>
                  <CardContent className="relative"><pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-[#0a0a0b] p-3 text-xs font-mono border border-[#2a1818]"><code>{`await prefetchBlazeQuery(queryClient, { queryKey, queryFn })`}</code></pre><CopyButton text={`await prefetchBlazeQuery(queryClient, { queryKey, queryFn })`} /></CardContent>
                </Card>
                <Card className="border-[#2a1818] bg-[#121012]">
                  <CardHeader><CardTitle>dehydrate / hydrate</CardTitle><CardDescription>Persistence round trip for SSR / reload.</CardDescription></CardHeader>
                  <CardContent className="relative"><pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-[#0a0a0b] p-3 text-xs font-mono border border-[#2a1818]">const state = dehydrateBlazeQueryClient(queryClient); hydrateBlazeQueryClient(queryClient, state);</pre><CopyButton text="const state = dehydrateBlazeQueryClient(queryClient); hydrateBlazeQueryClient(queryClient, state);" /></CardContent>
                </Card>
              </div>
              <p className="mt-6 max-w-3xl text-muted-foreground">
                    The mirror only loses a query to an explicit{" "}
                    <code>removeQueries</code> or <code>clear</code>: a query left unobserved past{" "}
                    <code>gcTime</code> keeps its copy, so the next session still paints instantly.
                    Lookups honour a custom <code>queryKeyHashFn</code>, a caller-supplied{" "}
                    <code>initialData</code> is never overwritten, and the render-time read goes
                    through <code>peek()</code> so a StrictMode double render cannot move the hit rate.
                  </p>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { name: "Mirror persistence", desc: "Only explicit removeQueries / clear deletes the persisted copy — unobserved past gcTime still paints instantly." },
                      { name: "Custom queryKeyHashFn", desc: "Resolved on both sides so your custom key matches the stored record exactly." },
                      { name: "initialData preserved", desc: "Caller-supplied initialData is never overwritten by the mirror." },
                      { name: "peek() reads", desc: "Render-time lookups go through peek() so StrictMode cannot shift hit/miss counts." },
                    ].map((f) => (
                      <div key={f.name} className="rounded-xl border border-[#2a1818] bg-[#121012] px-4 py-3 shadow-sm hover:border-[#8a1e2e] transition-colors">
                        <div className="font-mono text-sm font-semibold text-[#f2f0eb]">{f.name}</div>
                        <div className="mt-2 text-xs text-muted-foreground leading-relaxed">{f.desc}</div>
                      </div>
                    ))}
                  </div>
            </section>

            {/* SWR */}
            <section id="swr" className="mb-20 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8a1e2e]/20 text-[#8a1e2e] shadow-lg shadow-[#8a1e2e]/10"><Component size={20} /></div>
                <h3 className="text-3xl font-extrabold tracking-tight">SWR</h3>
              </div>
              <p className="text-muted-foreground mb-6 max-w-3xl">
                The <code className="text-amber-200">@blaze-cache/swr</code> package gives SWR the same persistent backing that the other adapters get — a first render from the Blaze Cache, followed by a background revalidate that writes back with TTL and tags.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="border-[#2a1818] bg-[#121012]">
                  <CardHeader><CardTitle>useBlazeSWR</CardTitle><CardDescription>Hook that paints instantly from Blaze Cache.</CardDescription></CardHeader>
                  <CardContent className="relative"><pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-[#0a0a0b] p-3 text-xs font-mono border border-[#2a1818]"><code>{`const { data } = useBlazeSWR(cache, '/api/users', fetcher, { ttlMs: 60_000, tags: ['users'] })`}</code></pre><CopyButton text={`const { data } = useBlazeSWR(cache, '/api/users', fetcher, { ttlMs: 60_000, tags: ['users'] })`} /></CardContent>
                </Card>
                <Card className="border-[#2a1818] bg-[#121012]">
                  <CardHeader><CardTitle>blazeSWRMiddleware</CardTitle><CardDescription>Wires the same behaviour into SWRConfig.</CardDescription></CardHeader>
                  <CardContent className="relative"><pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-[#0a0a0b] p-3 text-xs font-mono border border-[#2a1818]"><code>{`SWRConfig value={{ provider: () => new Map(), use: [blazeSWRMiddleware({ cache })] }}`}</code></pre><CopyButton text={`SWRConfig value={{ provider: () => new Map(), use: [blazeSWRMiddleware({ cache })] }}`} /></CardContent>
                </Card>
                <Card className="border-[#2a1818] bg-[#121012]">
                  <CardHeader><CardTitle>resolveBlazeKey</CardTitle><CardDescription>Imperative key for direct cache reads.</CardDescription></CardHeader>
                  <CardContent className="relative"><pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-[#0a0a0b] p-3 text-xs font-mono border border-[#2a1818]"><code>{`cache.get(resolveBlazeKey('/api/users'))`}</code></pre><CopyButton text={`cache.get(resolveBlazeKey('/api/users'))`} /></CardContent>
                </Card>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { name: "ttlMs", sig: "number", desc: "Freshness in ms. Default 60_000; a revalidated response writes back with its own TTL." },
                  { name: "tags", sig: "string[]", desc: "Tags on stored responses. Default ['swr', '<key>'] — drop with cache.invalidateTags()." },
                  { name: "staleWhileRevalidate", sig: "boolean | number", desc: "Serve past freshness while a background refresh runs, just like the fetch adapter." },
                  { name: "seed", sig: "(key, data) => void", desc: "Optional seed that writes a persistent record without fetching — useful for SSR or hydrated data." },
                ].map((o) => (
                  <div key={o.name} className="text-left rounded-xl border border-[#2a1818] bg-[#121012] px-4 py-3 shadow-sm hover:border-[#8a1e2e] transition-colors group">
                    <div className="font-mono text-sm font-semibold text-[#f2f0eb] group-hover:text-[#fff5f0]">{o.name}</div>
                    <div className="mt-0.5 font-mono text-xs text-muted-foreground break-words">{o.sig}</div>
                    <div className="mt-2 text-xs text-muted-foreground leading-relaxed">{o.desc}</div>
                  </div>
                ))}
              </div>
            </section>

            <Separator className="my-16 bg-[#2a1818]" />

            {/* Usage */}
            <section id="usage" className="mb-20 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8a1e2e]/20 text-[#8a1e2e] shadow-lg shadow-[#8a1e2e]/10"><Terminal size={20} /></div>
                <h3 className="text-3xl font-extrabold tracking-tight">Usage Examples</h3>
              </div>
              <div className="space-y-4">
                <Card className="border-[#2a1818] bg-[#121012]">
                  <CardHeader><CardTitle>Basic Cache Usage</CardTitle></CardHeader>
                  <CardContent className="relative">
                    <pre className="overflow-x-auto rounded-lg bg-[#0a0a0b] p-4 text-sm font-mono leading-7 border border-[#2a1818] text-[#e8cfc8]"><code>{`cache.set('user:42', { name: 'Ada' }, { ttlMs: 30_000, tags: ['user:42'] });
const user = cache.get('user:42');
cache.invalidateTags('user:42');`}</code></pre><CopyButton text="cache.set('user:42', { name: 'Ada' }, { ttlMs: 30_000, tags: ['user:42'] });
const user = cache.get('user:42');
cache.invalidateTags('user:42');" />
                  </CardContent>
                </Card>
                <Card className="border-[#2a1818] bg-[#121012]">
                  <CardHeader>
                    <CardTitle>Event Listeners</CardTitle>
                    {isBeta && <CardDescription>Typed per event — or one wildcard listener for all ten.</CardDescription>}
                  </CardHeader>
                  <CardContent className="relative">
                    <pre className="overflow-x-auto rounded-lg bg-[#0a0a0b] p-4 text-sm font-mono leading-7 border border-[#2a1818] text-[#e8cfc8]"><code>{isBeta ? `cache.on('evict', ({ key, value }) => console.log('dropped', key, value));
cache.on((event) => console.log(event.type));   // wildcard — every event` : `const unsubscribe = cache.on((change) => {
  if (change.type === 'set') console.log('set:', change.key);
});`}</code></pre><CopyButton text={isBeta ? `cache.on('evict', ({ key, value }) => console.log('dropped', key, value));
cache.on((event) => console.log(event.type));   // wildcard — every event` : `const unsubscribe = cache.on((change) => {
  if (change.type === 'set') console.log('set:', change.key);
});`} />
                  </CardContent>
                </Card>
                {isBeta && (
                  <Card className="border-[#2a1818] bg-[#121012]">
                    <CardHeader><CardTitle>Introspection without side effects</CardTitle><CardDescription>New in the 0.2 line — none of these records a hit or a miss.</CardDescription></CardHeader>
                    <CardContent className="relative">
                      <pre className="overflow-x-auto rounded-lg bg-[#0a0a0b] p-4 text-sm font-mono leading-7 border border-[#2a1818] text-[#e8cfc8]"><code>{`cache.size();                                // entries present and unexpired
cache.capacity();                           // the maximum you configured
cache.peek('user:42');                      // read without a hit/miss
cache.ttl('user:42');                       // ms left, or undefined
cache.touch('user:42', { ttlMs: 60_000 });  // renew the deadline, keep the value`}</code></pre><CopyButton text={`cache.size();                                // entries present and unexpired
cache.capacity();                           // the maximum you configured
cache.peek('user:42');                      // read without a hit/miss
cache.ttl('user:42');                       // ms left, or undefined
cache.touch('user:42', { ttlMs: 60_000 });  // renew the deadline, keep the value`} />
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>

            <Separator className="my-16 bg-[#2a1818]" />

            {/* Architecture */}
            <section id="architecture" className="mb-20 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8a1e2e]/20 text-[#8a1e2e] shadow-lg shadow-[#8a1e2e]/10"><Flame size={20} /></div>
                <h3 className="text-3xl font-extrabold tracking-tight">Architecture</h3>
              </div>
              <ArchitectureDiagram />
            </section>

            <Separator className="my-16 bg-[#2a1818]" />

            {/* Problems Solved */}
            <section id="problems" className="mb-20 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8a1e2e]/20 text-[#8a1e2e] shadow-lg shadow-[#8a1e2e]/10"><ShieldCheck size={20} /></div>
                <h3 className="text-3xl font-extrabold tracking-tight">Problems Solved</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Unpredictable JS eviction", desc: "LRU and WeakRef heuristics create object churn and non-deterministic cache hits. SIEVE offers a scan-resistant, O(1)-amortised algorithm with a tiny footprint." },
                  { title: "Async overhead on hot path", desc: "Standard caches return Promises for reads after initialization. Blaze Cache instantiates Wasm once during createCache(), so every get/set is fully synchronous." },
                  { title: "No durable persistence", desc: isBeta
                    ? "Most browser caches are memory-only. The optional IndexedDB adapter hydrates before resolve, writes are debounced, flushes trigger on pagehide / visibilitychange, and a flush that fails re-queues its records instead of dropping them."
                    : "Most browser caches are memory-only. The optional IndexedDB adapter hydrates before resolve, writes are debounced, and flushes trigger on pagehide / visibilitychange." },
                  { title: "Missing tag invalidation", desc: "Bulk removal by tag is rare in JS caches. Blaze Cache assigns monotonic tag IDs and performs invalidation via set difference — no full scan required." },
                  { title: "Fragmented integrations", desc: isBeta ? "Axios, fetch() and TanStack Query need separate caching solutions. Blaze provides a single core with first-class adapters for all three, sharing the same persistence and stats model." : "Axios and TanStack Query need separate caching solutions. Blaze provides a single core with first-class adapters for both, sharing the same persistence and stats model." },
                  { title: "Bundler / asset complexity", desc: "Many Wasm libraries require separate binary downloads or CDN configuration. The .wasm binary ships inside @blaze-cache/core; the package resolves it relative to its own URL." },
                ].map((p) => (
                  <Card key={p.title} className="border-[#2a1818] bg-[#121012]/60">
                    <CardHeader>
                      <CardTitle className="text-base">{p.title}</CardTitle>
                    </CardHeader>
                    <CardContent><p className="text-sm text-muted-foreground">{p.desc}</p></CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Philosophy */}
            <section id="philosophy" className="mb-20 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8a1e2e]/20 text-[#8a1e2e] shadow-lg shadow-[#8a1e2e]/10"><Flame size={20} /></div>
                <h3 className="text-3xl font-extrabold tracking-tight">Philosophy</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-[#2a1818] bg-[#121012]">
                  <CardHeader><CardTitle>One core, many adapters</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">A single Rust / Wasm engine powers all integrations. Whether using axios, fetch, TanStack Query or SWR, the same persistence, stats, and eviction model applies.</p></CardContent>
                </Card>
                <Card className="border-[#2a1818] bg-[#121012]">
                  <CardHeader><CardTitle>Synchronous hot path</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">After initialization, every read and write is fully synchronous — no Promises on the hot path. The Wasm module loads once; the rest is pure JS.</p></CardContent>
                </Card>
                <Card className="border-[#2a1818] bg-[#121012]">
                  <CardHeader><CardTitle>Durable by default</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">Optional IndexedDB persistence hydrates before the first get, writes are debounced, and flush recoveries mean a failed flush never loses data.</p></CardContent>
                </Card>
                <Card className="border-[#2a1818] bg-[#121012]">
                  <CardHeader><CardTitle>Observable and typed</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">Every mutation emits a typed event. Listeners can subscribe to one event with a precise payload, or to all events at once — and they never block mutations.</p></CardContent>
                </Card>
              </div>
            </section>

            <Separator className="my-16 bg-[#2a1818]" />

            {/* Repo & Development */}
            <section id="repo" className="mb-20 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8a1e2e]/20 text-[#8a1e2e] shadow-lg shadow-[#8a1e2e]/10"><BookOpen size={20} /></div>
                <h3 className="text-3xl font-extrabold tracking-tight">Repo & Development</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-[#2a1818] bg-[#121012]">
                  <CardHeader>
                    <CardTitle>Repository</CardTitle>
                    <CardDescription>Public MIT-licensed monorepo at github.com/blaze-cache/blaze-cache</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p><strong className="text-foreground">Description:</strong> Blazingly fast client-side caching library powered by Rust → WebAssembly.</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{release.badge}</Badge>
                      <Badge variant="outline">MIT</Badge>
                      <Badge variant="outline">ESM</Badge>
                      <Badge variant="outline">Browser</Badge>
                    </div>
                    <p><strong className="text-foreground">Stars / Watch:</strong> 1 star, 0 watching, 0 forks (as of repo state).</p>
                    <a href="https://github.com/blaze-cache/blaze-cache" target="_blank" rel="noreferrer" className="inline-block rounded-lg bg-[#8a1e2e] px-4 py-2 text-sm font-medium text-white hover:bg-[#a0283a]">View on GitHub</a>
                  </CardContent>
                </Card>
                <Card className="border-[#2a1818] bg-[#121012]">
                  <CardHeader>
                    <CardTitle>Development Commands</CardTitle>
                    <CardDescription>Workspace commands using pnpm</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <table className="w-full text-sm text-muted-foreground">
                      <tbody className="divide-y divide-[#2a1818]">
                        {release.commands.map((cmd) => (
                          <tr key={cmd}><td className="py-1.5 font-mono text-xs text-foreground">{cmd}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6 border-[#2a1818] bg-[#121012]/60">
                <CardHeader><CardTitle>Repository Layout</CardTitle></CardHeader>
                <CardContent>
                  <pre className="overflow-x-auto rounded-lg bg-[#0a0a0b] p-4 text-xs font-mono border border-[#2a1818] text-[#e8cfc8]"><code>{release.layout}</code></pre>
                </CardContent>
              </Card>

              <Card className="mt-6 border-[#2a1818] bg-[#121012]/60">
                <CardHeader><CardTitle>Why Wasm</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground leading-7">
                  <p><strong className="text-foreground">Predictable eviction.</strong> SIEVE is scan-resistant, O(1)-amortised with a tiny footprint — no JS object churn, no WeakRef heuristics.</p>
                  <p><strong className="text-foreground">Real data structures.</strong> Slab allocator plus hash index means lookups are a single map hit; entries are nodes in a queue rather than scattered objects.</p>
                  <p><strong className="text-foreground">Tested core.</strong> Eviction, TTL and tag logic is unit-tested in Rust (<code>cargo test --workspace</code>), independent of any browser or bundler.</p>
                </CardContent>
              </Card>
            </section>

            {/* Footer */}
            <footer className="mt-20 border-t border-[#2a1818] pt-10 text-sm text-muted-foreground">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={Logo} alt="Blaze Cache" className="h-8 w-auto" />
                  <span>Blaze Cache — Rust / Wasm client-side caching.</span>
                </div>
                <div className="flex gap-6">
              <a href="https://github.com/blaze-cache/blaze-cache" target="_blank" rel="noreferrer" className="hover:text-foreground">GitHub</a>
                  <a href="#overview" className="hover:text-foreground">Overview</a>
                  <a href="#install" className="hover:text-foreground">Install</a>
                  <a href="#core" className="hover:text-foreground">API</a>
                </div>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  )
}
