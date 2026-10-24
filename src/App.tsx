import { useEffect, useState } from "react"
import Logo from "./assets/blaze-cache-logo.png"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./components/ui/card"
import { Badge } from "./components/ui/badge"
import { Separator } from "./components/ui/separator"
import { Button } from "./components/ui/button"
import { Flame, Zap, ShieldCheck, Database, BookOpen, Terminal, Component, Menu, X } from "lucide-react"
import ArchitectureDiagram from "./components/ArchitectureDiagram"
import CopyButton from "./components/CopyButton"

const navItems = [
  { id: "overview", label: "Overview" },
  { id: "install", label: "Installation" },
  { id: "core", label: "Core API" },
  { id: "axios", label: "Axios Adapter" },
  { id: "rq", label: "React Query" },
  { id: "usage", label: "Usage Examples" },
  { id: "architecture", label: "Architecture" },
  { id: "problems", label: "Problems Solved" },
  { id: "repo", label: "Repo & Development" },
]

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeId, setActiveId] = useState("overview")

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
    navItems.forEach((n) => {
      const el = document.getElementById(n.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f2f0eb] selection:bg-[#8a1e2e]/30">
      {/* Top header */}
      <header className="sticky top-0 z-50 border-b border-[#2a1818] bg-[#0a0a0b]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-6">
          <img src={Logo} alt="Blaze Cache" className="h-9 w-auto" />
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight leading-none">Blaze Cache</h1>
            <Badge>v0.1.1</Badge>
          </div>
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
                {navItems.map((n) => {
                  const active = activeId === n.id
                  return (
                    <a key={n.id} href={`#${n.id}`} className="relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors mb-1 group">
                      {/* Dot */}
                      <span className={`absolute -left-[11px] top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 shadow-md transition-all duration-300 z-10 ${active ? "bg-[#8a1e2e] border-[#8a1e2e] shadow-[#8a1e2e]/40 scale-125" : "bg-[#121012] border-[#3a1818] group-hover:border-[#8a1e2e]"}`} />
                      {/* Label */}
                      <span className={`truncate transition-colors ${active ? "text-[#fff5f0] font-semibold" : "text-muted-foreground group-hover:text-primary-foreground"}`}>
                        {n.label}
                      </span>
                    </a>
                  )
                })}
              </div>
            </nav>
          </aside>

          <main className="min-w-0">
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

            {/* Installation */}
            <section id="install" className="mb-20 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8a1e2e]/20 text-[#8a1e2e] shadow-lg shadow-[#8a1e2e]/10"><Terminal size={20} /></div>
                <h3 className="text-3xl font-extrabold tracking-tight">Installation</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { pkg: "@blaze-cache/core", note: "Cache engine (Wasm + TS bindings)", peers: "None" },
                  { pkg: "@blaze-cache/axios", note: "Axios HTTP adapter", peers: "axios >= 1.7.0" },
                  { pkg: "@blaze-cache/react-query", note: "TanStack Query v5 integration", peers: "@tanstack/react-query >= 5.0.0" },
                ].map((i) => (
                  <Card key={i.pkg} className="border-[#2a1818] bg-[#121012]">
                    <CardHeader>
                      <CardTitle className="font-mono text-base">{i.pkg}</CardTitle>
                      <CardDescription className="text-xs">{i.note}</CardDescription>
                      <div className="mt-2 rounded-md bg-[#0a0a0b] p-3 font-mono text-xs text-[#f2f0eb] border border-[#2a1818]">npm install {i.pkg}</div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">Peer dependencies: <span className="font-medium text-foreground">{i.peers}</span></p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-[#2a1818] bg-[#121012] p-6 shadow-xl shadow-black/20 relative">
                <h4 className="font-semibold text-lg mb-2">Quick-Start Combined Install</h4>
                <pre className="overflow-x-auto rounded-lg bg-[#0a0a0b] p-4 text-sm font-mono leading-7 border border-[#2a1818] text-[#e8cfc8]"><code>npm install @blaze-cache/core @blaze-cache/axios @blaze-cache/react-query
npm install axios @tanstack/react-query</code></pre><CopyButton text="npm install @blaze-cache/core @blaze-cache/axios @blaze-cache/react-query\nnpm install axios @tanstack/react-query" />
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
                {[
                  { name: "get", sig: "(key: string) => V | undefined", desc: "Value stored under key, or undefined when missing/expired. Counts as hit/miss." },
                  { name: "set", sig: "(key: string, value: V, options?: SetOptions) => void", desc: "Stores or replaces key. Replacing refreshes TTL and replaces tags." },
                  { name: "delete", sig: "(key: string) => boolean", desc: "Removes key, returning whether it was there." },
                  { name: "has", sig: "(key: string) => boolean", desc: "True when key is present and not expired. Never mutates eviction state." },
                  { name: "entry", sig: "(key: string) => CacheEntry<V> | undefined", desc: "Live entry — value, remaining TTL and tags — without touching statistics." },
                  { name: "entries", sig: "() => CacheEntry<V>[]", desc: "Snapshot of every live entry, oldest first." },
                  { name: "keys", sig: "() => string[]", desc: "Live keys, oldest first." },
                  { name: "keysWithTag", sig: "(tag: string) => string[]", desc: "Live keys carrying tag." },
                  { name: "tagsOf", sig: "(key: string) => string[]", desc: "Tags attached to key (empty when unknown)." },
                  { name: "hasTag", sig: "(key: string, tag: string) => boolean", desc: "True when key carries tag." },
                  { name: "stats", sig: "() => CacheStats", desc: "Cumulative counters plus computed hitRate." },
                  { name: "clear", sig: "() => void", desc: "Empties the cache entirely." },
                  { name: "prune", sig: "() => string[]", desc: "Removes every expired entry, returning removed keys." },
                  { name: "invalidateTags", sig: "(...tags: string[]) => string[]", desc: "Removes every entry carrying any of tags, returning removed keys." },
                  { name: "flush", sig: "() => Promise<void>", desc: "Writes pending changes to storage immediately (persistence only)." },
                  { name: "dispose", sig: "() => Promise<void>", desc: "Flushes, unbinds page-lifecycle listeners, frees wasm memory. Unusable afterwards." },
                  { name: "on", sig: "(listener: CacheListener) => () => void", desc: "Subscribes to mutations. Returns unsubscribe function." },
                ].map(({ name, sig, desc }) => (
                  <div key={name} className="text-left rounded-xl border border-[#2a1818] bg-[#121012] px-4 py-3 shadow-sm hover:border-[#8a1e2e] transition-colors group">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold text-[#f2f0eb] group-hover:text-[#fff5f0]">.{name}()</span>
                      <span className="text-xs text-muted-foreground font-mono">{sig}</span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground leading-relaxed">{desc}</div>
                  </div>
                ))}
              </div>
            </section>

            <Separator className="my-16 bg-[#2a1818]" />

            {/* Axios */}
            <section id="axios" className="mb-20 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8a1e2e]/20 text-[#8a1e2e] shadow-lg shadow-[#8a1e2e]/10"><ShieldCheck size={20} /></div>
                <h3 className="text-3xl font-extrabold tracking-tight">Axios Adapter</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-[#2a1818] bg-[#121012]">
                  <CardHeader><CardTitle>installBlazeCache</CardTitle></CardHeader>
                  <CardContent className="relative">
                    <pre className="overflow-x-auto rounded-lg bg-[#0a0a0b] p-4 text-sm font-mono border border-[#2a1818] text-[#e8cfc8]"><code>{`installBlazeCache(api, {
  cache,
  ttlMs: 30_000,
});`}</code></pre><CopyButton text="installBlazeCache(api, {\n  cache,\n  ttlMs: 30_000,\n});" />
                  </CardContent>
                </Card>
                <Card className="border-[#2a1818] bg-[#121012]">
                  <CardHeader><CardTitle>blazeAdapter</CardTitle></CardHeader>
                  <CardContent className="relative">
                    <pre className="overflow-x-auto rounded-lg bg-[#0a0a0b] p-4 text-sm font-mono border border-[#2a1818] text-[#e8cfc8]"><code>{`const api = axios.create({
  adapter: blazeAdapter({ cache })
});`}</code></pre><CopyButton text="const api = axios.create({\n  adapter: blazeAdapter({ cache })\n});" />
                  </CardContent>
                </Card>
              </div>
            </section>

            <Separator className="my-16 bg-[#2a1818]" />

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
                  <CardHeader><CardTitle>Event Listeners</CardTitle></CardHeader>
                  <CardContent className="relative">
                    <pre className="overflow-x-auto rounded-lg bg-[#0a0a0b] p-4 text-sm font-mono leading-7 border border-[#2a1818] text-[#e8cfc8]"><code>{`const unsubscribe = cache.on((change) => {
  if (change.type === 'set') console.log('set:', change.key);
});`}</code></pre><CopyButton text="const unsubscribe = cache.on((change) => {
  if (change.type === 'set') console.log('set:', change.key);
});" />
                  </CardContent>
                </Card>
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
                  { title: "No durable persistence", desc: "Most browser caches are memory-only. The optional IndexedDB adapter hydrates before resolve, writes are debounced, and flushes trigger on pagehide / visibilitychange." },
                  { title: "Missing tag invalidation", desc: "Bulk removal by tag is rare in JS caches. Blaze Cache assigns monotonic tag IDs and performs invalidation via set difference — no full scan required." },
                  { title: "Fragmented integrations", desc: "Axios and TanStack Query need separate caching solutions. Blaze provides a single core with first-class adapters for both, sharing the same persistence and stats model." },
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
                      <Badge>v0.1.1</Badge>
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
                        {["pnpm install", "pnpm build", "pnpm build:wasm", "pnpm test", "pnpm test:js", "pnpm lint", "pnpm dev", "pnpm clean"].map((cmd) => (
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
                  <pre className="overflow-x-auto rounded-lg bg-[#0a0a0b] p-4 text-xs font-mono border border-[#2a1818] text-[#e8cfc8]"><code>{`crates/
  blaze-cache-core/      Rust engine: slab store, SIEVE queue, tags, TTL, stats
  blaze-cache-wasm/      wasm-bindgen bindings
packages/
  core/                  @blaze-cache/core  (wasm loader, persistence, createCache)
  axios/                 @blaze-cache/axios (HTTP adapter)
  react-query/           @blaze-cache/react-query (v5 mirror + hook)
examples/
  browser/               Vite + React demo with mock API + latency counter
scripts/
  smoke.mjs              End-to-end tests against built artifacts
`}</code></pre>
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
