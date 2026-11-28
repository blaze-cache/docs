import { Fragment, useEffect, useRef, useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import Logo from "../assets/blaze-cache-logo.png"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Badge } from "./ui/badge"
import { Separator } from "./ui/separator"
import { Button } from "./ui/button"
import { Flame, Zap, ShieldCheck, Database, BookOpen, Terminal, Component, Menu, X, Globe, Sparkles, Radio, Wind, PlayCircle, ExternalLink, Search, Bug } from "lucide-react"
import ArchitectureDiagram from "./ArchitectureDiagram"
import CopyButton from "./CopyButton"
import ThemeToggle from "./ThemeToggle"
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
  new: "border-primary text-flame",
  fixed: "border-emerald-600/60 text-emerald-700 dark:text-emerald-300",
  testing: "border-amber-600/60 text-amber-700 dark:text-amber-300",
  perf: "border-violet-600/60 text-violet-700 dark:text-violet-300",
}

/** Commit URLs on the "What's New" cards — every claim links back to the diff that made it. */
const COMMIT_BASE = "https://github.com/blaze-cache/blaze-cache/commit/"

/** Version chip used in the header and the mobile drawer; the current route renders active. */
function VersionLink({ to, active, children, isNew }: { to: string; active: boolean; children: ReactNode; isNew?: boolean }) {
  return (
    <Link
      to={to}
      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
        active ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
      {isNew && <span className="ml-1 rounded bg-flame/15 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-flame">new</span>}
    </Link>
  )
}

/** Sidebar group heading for a nav id — '' when the item belongs to no group. */
function navGroup(id: string): string {
  if (["core", "query", "devtools", "shared", "persistence", "wasm", "storage", "multitab"].includes(id)) return "Core"
  if (["rq", "swr", "axios", "fetch", "ky", "ofetch"].includes(id)) return "Adapters"
  if (id === "usage") return "Usage"
  if (["benchmarks", "examples", "repo"].includes(id)) return "Repo"
  return ""
}

export default function DocsPage({ release: releaseId }: { release: ReleaseId }) {
  const release = RELEASES[releaseId]
  // Every non-legacy line — stable, the beta and the archived 0.3.0 — renders the modern adapter/API content.
  const isCurrent = !release.legacy
  // The 0.5 beta is 0.4.0 plus the devtools/query work, so it carries everything the
  // current stable line carries: persistence, wasm loading, storage modes, multi-tab
  // sync, benchmarks and the ofetch adapter.
  const has040 = release.id === "stable" || release.id === "beta"
  // Only the archived lines render an archive banner — the prerelease gets its own.
  const isArchived = releaseId !== "stable" && releaseId !== "beta"
  const isBeta = release.prerelease
  // The sections rendered here (persistence, wasm, storage, multi-tab, benchmarks,
  // ofetch, subscriptions) were introduced by the 0.4 line — on the beta route
  // `release.version` is 0.5.0-beta, so name the line that actually added them.
  const newIn = isBeta ? "0.4.0" : release.version
  const navItems = release.nav
  const quickStart = release.quickStart.join("\n")
  // The core example doubles as the wasm-loading story: 0.4 points at one explicit
  // source (or none — the shipped binary is the default), 0.3 at the low-level `wasm`.
  const coreExample = has040
    ? `import { createCache } from '@blaze-cache/core';

const cache = await createCache({
  capacity: 1000,
  persistence: { namespace: 'my-app' },
  // wasmUrl: '/assets/blaze_cache_wasm_bg.wasm', // optional — the default resolves the shipped binary
});`
    : `import { createCache } from '@blaze-cache/core';
import wasmUrl from '@blaze-cache/core/pkg/blaze_cache_wasm_bg.wasm?url';

const cache = await createCache({
  capacity: 1000,
  persistence: { namespace: 'my-app' },
  wasm: wasmUrl,
});`
  // 0.4-only example blocks — each string lives once and feeds both the <pre> and its
  // copy button.
  const persistenceExample = `const cache = await createCache({
  persistence: {
    namespace: 'app',        // isolates this cache from others in the database
    debounceMs: 250,         // coalesce writes for 250 ms before hitting storage
    maxEntries: 2000,        // cap on records written by a single flush
    restoreExpired: false,   // never resurrect records that expired while away
    writeMode: 'debounce',   // or 'immediate' — flush on the next task
    onError: (err) => report(err),   // failures nobody awaited
    onActivity: (a) => debug(a),     // hydrate/flush/rotate lifecycle
  },
});`
  const controlExample = `await cache.persistence.flush();    // write pending changes now (same as cache.flush())
await cache.persistence.clear();    // empty this namespace in storage + drop queued writes — memory untouched
await cache.persistence.hydrate();  // reload storage into memory (merge, not replace)
cache.persistence.stats();          // { enabled, namespace, generation, pending, hydrates,
                                    //   restored, skipped, flushes, recordsWritten, aborted,
                                    //   rotations, errors, lastError, lastFlushAt, lastHydrateAt }
await cache.persistence.rotate('user:42'); // switch the session bucket — see below
cache.persistence.enabled;          // false when persistence was never attached
cache.persistence.generation;       // the current session token ('' when unused)`
  const accountsExample = `// login — the previous session's queued + in-flight writes are dropped
await cache.persistence.rotate(\`user:\${userId}\`);
await cache.persistence.hydrate();   // pull the new account's rows in (optional)

// logout — back to the anonymous bucket
await cache.persistence.rotate('');
cache.clear();                       // memory is the caller's to drop`
  const adapterExample = `interface CachePersistence {
  load(): Promise<PersistedRecord[]>;
  save(records: PersistedRecord[]): Promise<void>;
  remove(keys: string[]): Promise<void>;
  clear(): Promise<void>;
  keys?(): Promise<string[]>;                             // reconciliation
  write?(ops: { clear, save, remove }): Promise<void>;    // one batch, one transaction
  rotate?(generation: string): void | Promise<void>;      // adopt a session bucket
  close?(): Promise<void>;
}`
  const wasmExample = `// default — the shipped binary, resolved relative to the package (Vite needs no config)
await createCache({ capacity: 1000 });

// explicit URL — a public/ asset, a CDN, another origin
await createCache({ wasmUrl: '/assets/blaze_cache_wasm_bg.wasm' });

// precompiled — you already hold a WebAssembly.Module
await createCache({ module });

// custom loader — the fetch needs auth headers, retries, or bytes already in memory
await createCache({
  instantiate: async () => (await fetch(url, { headers: { authorization } })).arrayBuffer(),
});`
  const ofetchWrapExample = `import { ofetch } from 'ofetch';
import { blazeOfetch } from '@blaze-cache/ofetch';

// wrap an existing instance (including ofetch.create() ones)
const api = blazeOfetch(ofetch.create({ baseURL: 'https://api.example.com/v1' }), cache, {
  ttlMs: 30_000,
  tags: () => ['v1'],
});

await api('/users/42');      // MISS — network, parsed JSON stored in the background
await api('/users/42');      // HIT  — replayed from cache
await api.raw('/users/42');  // HIT  — FetchResponse with x-blaze-cache: HIT`
  const ofetchCreateExample = `import { createBlazeOfetch } from '@blaze-cache/ofetch';

// ofetch defaults and cache options in one bag
const api = createBlazeOfetch(cache, {
  baseURL: 'https://api.example.com/v1',
  ttlMs: 30_000,
  tags: () => ['v1'],
});

const users = await api('/users');`
  const bytesExample = `import { createCache } from '@blaze-cache/core';

const cache = await createCache({ capacity: 1000 });

// raw bytes: one copy into Wasm linear memory, zero-copy reads
cache.setBytes('image', new Uint8Array(buffer), { ttlMs: 30_000 });
const view = cache.getBytes('image');        // Uint8Array view onto Wasm memory
const snapshot = cache.getBytesCopy('image'); // owned — keep this one
// set()/get() still work on the same cache, unchanged.

// advanced: a decoder already wrote the region — adopt it without another copy
// const ptr = wasmCache.bytesReserve(len); /* …write through wasmLinearMemory()… */
// cache.setBytesReserved('frame', ptr, len);`
  const hybridExample = `// values live in a JS Map; Wasm keeps keys, TTL, tags and stable ids
const cache = await createCache({ capacity: 1000, storage: 'js' });

cache.set('user:42', user, { tags: ['user'] }); // the same reference stays in JS
cache.get('user:42');                          // Wasm hit by id, then Map.get
// events, tag invalidation, entries(), stats and persistence behave identically`
  const multiTabExample = `// opt in — without it no channel is opened and nothing changes
const cache = await createCache({
  capacity: 1000,
  persistence: { namespace: 'app' },
  multiTab: { enabled: true, strategy: 'value' },
});

cache.on('remote-set', ({ key }) => console.log('another tab wrote', key));
// strategy: 'value'    structured-clone payloads (fallback: invalidate tombstone)
// strategy: 'invalidate'  send tombstones only — the app refetches on focus`
  const queryExample = `import { createCache } from '@blaze-cache/core';

// Opt in once — with indexes off the hot path pays nothing.
const cache = await createCache({ capacity: 1000, indexes: true });

cache.set('user:1', { name: 'Ada' }, { ttlMs: 60_000, tags: ['user', 'api'] });
cache.set('user:2', { name: 'Lin' }, { ttlMs: 120_000, tags: ['user'] });

// Metadata-only by default — items are { key, ttlMs, tags }.
const page = cache.query({
  prefix: 'user:',
  tags: { all: ['user'] },     // any / all / none
  ttlRange: { min: 30_000 },   // remaining TTL, in ms
  limit: 20,                   // required page size
});
// page.nextCursor → 'user:1' | null  (opaque last-key anchor)

const more = cache.query({ prefix: 'user:', limit: 20, cursor: page.nextCursor! });
cache.queryKeys({ prefix: 'user:', limit: 20 }); // keys only
cache.count({ prefix: 'user:' });                // matches, no paging

// Live by-reference values need BOTH caps; truncated says a page was cut short.
const rows = cache.query({
  prefix: 'user:', limit: 50, includeValues: true,
  maxEntries: 10, maxValueBytes: 64 * 1024, withTotal: true,
});

// Without indexes, an explicit full scan is the only O(n) path:
// cache.query({ fullScan: true, limit: 20, where: (s) => s.tags.includes('user') });`
  const devtoolsExample = `import { createCache } from '@blaze-cache/core';
import { attach, detach, onEvent, summarize } from '@blaze-cache/devtools';

const cache = await createCache({ indexes: true });

// Nothing is registered until attach() — no listeners, timers or snapshots.
const handle = attach(cache, { label: 'HTTP responses' });

// Snapshots are built on demand, never on the hot path, and always bounded.
const snap = handle.snapshot({ maxEntries: 20, maxValueBytes: 32 * 1024 });
console.log(snap.protocol);          // 1 — the versioned protocol
console.log(snap.payload.entries);   // { key, ttlMs, tags, value: <summary> }[]
console.log(snap.payload.truncated); // { entries, bytes }

// One wildcard listener feeds a ring buffer (500 by default).
const off = onEvent((e) => console.log(e.type, e.key, e.ts));
cache.set('user:1', { token: 'abc123' }, { tags: ['user'] });
console.log(handle.events());        // recent events, oldest first

// Values never leak: summarize() is cycle-safe and redacts shared patterns.
console.log(summarize({ authorization: 'Bearer abc' })); // → [redacted]

// …later — hands the core's drop-log state back exactly
off();
handle.detach(); // or detach(cache) / dispose() for every handle`
  const sharedExample = `// No wasm, no IndexedDB, no DOM — safe in Node, SSR and serializers.
import {
  REDACT_KEY_PATTERNS, isRedactedKey, redactKey,
  isBlazeRecord, makeBlazeKind, bindingFromKind, featureFromKind,
} from '@blaze-cache/core/shared';

// Deny-by-default redaction, shared by every transport and the event feed.
isRedactedKey('Authorization');   // true
redactKey('session:abc');         // '[redacted]'
redactKey('user:42');             // 'user:42'
REDACT_KEY_PATTERNS.length;       // 9 frozen patterns

// Frozen, version-tolerant guard — future envelope versions still pass.
const record = { kind: 'next:route', v: 2, data: { id: 1 }, storedAt: Date.now() };
isBlazeRecord(record);            // true — data is never inspected
isBlazeRecord({ kind: 'x', v: 1 }); // false

// One naming convention for every binding's records.
const kind = makeBlazeKind('next', 'route'); // 'next:route'
bindingFromKind(kind);  // 'next'
featureFromKind(kind);  // 'route'`
  const benchmarkExample = `pnpm bench            # Node: 10 scenarios × 5 payload sizes × 2 kinds
pnpm bench:browser    # the identical suite in headless Chrome
pnpm bench:framework  # TanStack Query / SWR cache-store point operations
pnpm bench:ci         # --quick run + 20% regression gate
# raw JSON and the full methodology: docs/benchmarks/RESULTS.md`

  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeId, setActiveId] = useState("overview")
  const sidebarRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // The SPA ships one index.html for every route, so title, description, canonical and
    // the social tags are rewritten here for whichever release the URL selected — the
    // crawlers that render JS see per-page metadata, the rest fall back to index.html.
    const r = RELEASES[releaseId]
    const title = r.prerelease
      ? `Blaze Cache ${r.version} (prerelease) — Docs`
      : isArchived
        ? `Blaze Cache ${r.version} (archive) — Docs`
        : "Blaze Cache 0.4.0 — Full-Featured Client-Side Cache"
    const routePath =
      releaseId === "beta" ? "/beta" : releaseId === "stable" ? "/" : releaseId === "previous" ? "/0.3.0" : "/0.2.5"
    const canonical = `https://blaze-cache.github.io${import.meta.env.BASE_URL.replace(/\/+$/, "")}${routePath}`
    const setMeta = (selector: string, attr: "content" | "href", value: string) => {
      document.querySelector(selector)?.setAttribute(attr, value)
    }

    document.title = title
    setMeta('meta[name="title"]', "content", title)
    setMeta('meta[name="description"]', "content", r.metaDescription)
    setMeta('meta[property="og:title"]', "content", title)
    setMeta('meta[property="og:description"]', "content", r.metaDescription)
    setMeta('meta[property="og:url"]', "content", canonical)
    setMeta('meta[name="twitter:title"]', "content", title)
    setMeta('meta[name="twitter:description"]', "content", r.metaDescription)
    setMeta('meta[name="twitter:url"]', "content", canonical)
    setMeta('link[rel="canonical"]', "href", canonical)

    // Switching versions rewrites the URL without a reload — keep deep links where they are.
    if (!window.location.hash) window.scrollTo({ top: 0 })
  }, [releaseId, isArchived])

  // Sidebar highlight — the section whose heading has passed the sticky header wins.
  // A narrow IntersectionObserver band can report several sections in one batch in an
  // arbitrary order, so a jump (or two long sections overlapping the band) used to leave
  // the highlight on the previous item. Reading the nav order on each frame is deterministic.
  useEffect(() => {
    let frame = 0
    let lastHighlighted = ""
    const update = () => {
      frame = 0
      const nav = RELEASES[releaseId].nav
      // Sticky header (64px) plus the sections' scroll-mt-28 (112px).
      const anchorLine = 140
      let current = nav[0]?.id ?? "overview"
      for (const item of nav) {
        const el = document.getElementById(item.id)
        if (el && el.getBoundingClientRect().top <= anchorLine) current = item.id
      }
      // The last section's heading may never reach the anchor line on a short page.
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        current = nav[nav.length - 1]?.id ?? current
      }
      if (current === lastHighlighted) return
      lastHighlighted = current
      setActiveId(current)
      // The nav list is taller than a viewport: keep the highlighted item visible inside
      // the sidebar's own scroll area so a jump never highlights an off-screen row.
      const navEl = sidebarRef.current
      const link = navEl?.querySelector<HTMLElement>(`[data-nav-id="${current}"]`)
      if (navEl && link) {
        const navRect = navEl.getBoundingClientRect()
        const linkRect = link.getBoundingClientRect()
        if (linkRect.top < navRect.top + 8) navEl.scrollTop -= navRect.top + 8 - linkRect.top
        else if (linkRect.bottom > navRect.bottom - 8) navEl.scrollTop += linkRect.bottom - navRect.bottom + 8
      }
    }
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    window.addEventListener("hashchange", schedule)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      window.removeEventListener("hashchange", schedule)
    }
  }, [releaseId])

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Top header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-6">
          <img src={Logo} alt="Blaze Cache" className="h-9 w-auto" />
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight leading-none">Blaze Cache</h1>
            <Badge>{release.badge}</Badge>
            {release.isNew && <Badge variant="outline" className="border-primary text-flame">new</Badge>}
          </div>
          {/* Version switcher — the beta tracks npm's `beta` tag, stable tracks `latest`,
              and the two older lines are archived routes. Labels come from the release
              record, so a version bump happens in exactly one place. */}
          <nav aria-label="Documentation version" className="hidden items-center gap-1 rounded-lg border border-border bg-card p-0.5 px-3 lg:flex">
            <VersionLink to="/beta" active={releaseId === "beta"}>{RELEASES.beta.badge}</VersionLink>
            <VersionLink to="/" active={releaseId === "stable"} isNew>{RELEASES.stable.badge}</VersionLink>
            <VersionLink to="/0.3.0" active={releaseId === "previous"}>{RELEASES.previous.badge}</VersionLink>
            <VersionLink to="/0.2.5" active={releaseId === "legacy"}>{RELEASES.legacy.badge}</VersionLink>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground hover:bg-primary hover:text-white" aria-label="Open menu"><Menu size={18} /></button>
            {/* max-md:hidden, not hidden md:inline-flex: the shadcn base class sets
                inline-flex, which Tailwind emits after .hidden — so `hidden` never wins. */}
            <Button size="sm" variant="outline" className="max-md:hidden border-border bg-card text-foreground hover:bg-primary hover:text-white hover:border-primary"><a href="https://github.com/blaze-cache/blaze-cache" target="_blank" rel="noreferrer">GitHub <span className="ml-1 rounded-full bg-primary px-1.5 text-[10px] font-bold">3</span></a></Button>
            <Button size="sm" className="max-md:hidden bg-primary text-white hover:bg-[#a0283a] shadow-[0_0_20px_rgba(138,30,46,0.35)]" onClick={() => document.getElementById("install")?.scrollIntoView({ behavior: "smooth" })}>Get Started</Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-60 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-card border-r border-border shadow-2xl shadow-black/40 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <img src={Logo} alt="Blaze Cache" className="h-8 w-auto" />
              <button onClick={() => setMobileOpen(false)} className="rounded-md p-2 text-muted-foreground hover:text-white hover:bg-primary" aria-label="Close menu"><X size={20} /></button>
            </div>
            <nav className="space-y-2">
              {navItems.map((n) => (
                <a key={n.id} href={`#${n.id}`} onClick={() => setMobileOpen(false)} className={`block rounded-lg px-3 py-3 text-sm font-medium transition-colors ${activeId === n.id ? "text-primary-foreground bg-primary" : "text-muted-foreground hover:bg-primary hover:text-white"}`}>
                  {n.label}
                </a>
              ))}
            </nav>
            <div className="mt-6 border-t border-border pt-5">
              <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Docs version</p>
              <div className="flex flex-wrap gap-2 px-1">
                <VersionLink to="/beta" active={releaseId === "beta"}>{RELEASES.beta.badge}</VersionLink>
                <VersionLink to="/" active={releaseId === "stable"} isNew>{RELEASES.stable.badge}</VersionLink>
                <VersionLink to="/0.3.0" active={releaseId === "previous"}>{RELEASES.previous.badge}</VersionLink>
                <VersionLink to="/0.2.5" active={releaseId === "legacy"}>{RELEASES.legacy.badge}</VersionLink>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3">
              <a href="https://github.com/blaze-cache/blaze-cache" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-primary hover:text-white">GitHub</a>
            </div>
          </aside>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[260px_1fr]">
          {/* Sidebar — sticky and vertically scrollable: the 0.4 route lists 22
              sections, which can exceed a short viewport. The scrollbar itself is
              hidden (still wheel/trackpad/keyboard scrollable). */}
          <aside className="hidden lg:block">
            <nav ref={sidebarRef} className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain pr-1 scrollbar-none [&::-webkit-scrollbar]:hidden">
              <div className="relative pl-4">
                {/* Vertical line */}
                <div className="absolute left-2.75 top-2 bottom-2 w-0.5 bg-secondary rounded-full" />
                {navItems.map((n, idx) => {
                  const active = activeId === n.id;
                  const group = navGroup(n.id);
                  const prev = navItems[idx - 1];
                  const prevGroup = prev ? navGroup(prev.id) : "";
                  return (
                    <Fragment key={n.id}>
                      {group && group !== prevGroup && (
                        <div className="mt-3 mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-flame">{group}</div>
                      )}
                    <a data-nav-id={n.id} href={`#${n.id}`} className="relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors mb-1 group">
                      {/* Dot */}
                      <span className={`absolute -left-2.75 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 shadow-md transition-all duration-300 z-10 ${active ? "bg-primary border-primary shadow-[#8a1e2e]/40 scale-125" : "bg-card border-stroke group-hover:border-primary"}`} />
                      {/* Label */}
                      <span className={`truncate transition-colors ${active ? "text-foreground font-semibold" : "text-muted-foreground group-hover:text-primary-foreground"}`}>
                        {n.label}
                      </span>
                    </a>
                    </Fragment>
                  )
                })}
              </div>
            </nav>
          </aside>

          <main className="min-w-0">
            {/* Which release these docs describe */}
            {isBeta ? (
              <div className="mb-10 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-amber-600/50 bg-card px-5 py-4 text-sm text-muted-foreground">
                <Badge variant="outline" className="border-amber-600/60 text-amber-700 dark:text-amber-300">beta</Badge>
                <span>These docs describe <strong>{release.badge}</strong>, a prerelease — install it with <code className="font-mono text-foreground">{release.installTag}</code>, or leave the tag off for the stable release.</span>
                <Link to="/" className="font-medium text-flame underline underline-offset-4 hover:text-foreground">Stable docs are {RELEASES.stable.badge} →</Link>
              </div>
            ) : isArchived ? (
              <div className="mb-10 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
                <Badge variant="outline">archive</Badge>
                <span>These docs describe <strong>{release.badge}</strong>, an earlier release.</span>
                <Link to="/" className="font-medium text-flame underline underline-offset-4 hover:text-foreground">Current docs are {RELEASES.stable.badge} →</Link>
              </div>
            ) : (
              <div className="mb-10 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-primary/40 bg-card px-5 py-4 text-sm text-muted-foreground">
                <Badge variant="outline">stable</Badge>
                <Badge variant="outline" className="border-primary text-flame">new</Badge>
                <span>Documenting the latest release, <strong className="text-foreground">{release.badge}</strong> — published benchmarks, opt-in memory modes, multi-tab sync and a faster write path.</span>
                <a href="#whatsnew" className="font-medium text-flame underline underline-offset-4 hover:text-foreground">See what's new →</a>
              </div>
            )}

            {/* Hero */}
            <section id="overview" className="mb-20">
              <div className="relative overflow-hidden rounded-3xl border border-border bg-linear-to-br from-card via-background to-card shadow-2xl shadow-[#8a1e2e]/10 px-8 py-14 md:px-14 md:py-16">
                <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#6b1020]/20 blur-3xl" />
                <div className="relative">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-flame mb-4">Blaze Cache</p>
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.15] bg-linear-to-br from-foreground via-foreground to-primary bg-clip-text text-transparent mb-6 max-w-4xl">A full-featured client-side cache for the browser: TTL, tags, SIEVE eviction, and IndexedDB persistence, powered by Rust and WebAssembly.</h2>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Badge className="text-sm px-3 py-1">Wasm hot path</Badge>
                    <Badge className="text-sm px-3 py-1">O(1) eviction</Badge>
                    <Badge className="text-sm px-3 py-1">ESM only</Badge>
                    <Badge variant="outline" className="text-sm px-3 py-1">{release.tests.total} tests</Badge>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Verified by <strong className="text-foreground">{release.tests.total} automated tests</strong> — {release.tests.detail}. The offline suites need no network.
                  </p>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-border bg-card/60 backdrop-blur">
                  <CardHeader>
                    <Zap className="h-6 w-6 text-flame mb-2" />
                    <CardTitle>Synchronous</CardTitle>
                    <CardDescription>After initialization, every get/set is fully synchronous—no Promises on the hot path.</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="border-border bg-card/60 backdrop-blur">
                  <CardHeader>
                    <Flame className="h-6 w-6 text-flame mb-2" />
                    <CardTitle>SIEVE Eviction</CardTitle>
                    <CardDescription>Scan-resistant, O(1)-amortised eviction with a tiny footprint and no JS object churn.</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="border-border bg-card/60 backdrop-blur">
                  <CardHeader>
                    <Database className="h-6 w-6 text-flame mb-2" />
                    <CardTitle>IndexedDB</CardTitle>
                    <CardDescription>Optional write-through persistence that hydrates before createCache() resolves.</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </section>

            <Separator className="my-16 bg-border" />

            {/* What's new in this release */}
            {release.whatsNew.length > 0 && (
              <>
                <section id="whatsnew" className="mb-20 scroll-mt-28">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-flame shadow-lg shadow-[#8a1e2e]/10"><Sparkles size={20} /></div>
                    <h3 className="text-3xl font-bold font-mono tracking-tight">What's New</h3>
                    <Badge variant="outline" className="text-[11px]">{release.badge}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-6 max-w-3xl">
                    What shipped in <strong className="text-foreground">{release.badge}</strong> —
                    newest first, each card linking to the section that documents it.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {release.whatsNew.map((item) => (
                      <Card key={item.title} className="border-border bg-card hover:border-primary transition-colors">
                        <CardHeader>
                          <Badge variant="outline" className={`w-fit ${KIND_CLS[item.kind] ?? KIND_CLS.new}`}>{item.kind}</Badge>
                          <CardTitle><RichText text={item.title} /></CardTitle>
                          <CardDescription className="leading-relaxed"><RichText text={item.desc} /></CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap items-center justify-between gap-3">
                          <a href={item.href} className="inline-flex items-center gap-1 text-sm font-medium text-flame hover:text-foreground transition-colors">
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
                                  className="rounded bg-code px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-primary/20 hover:text-flame"
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

                <Separator className="my-16 bg-border" />
              </>
            )}

            {/* Installation */}
            <section id="install" className="mb-20 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-flame shadow-lg shadow-[#8a1e2e]/10"><Terminal size={20} /></div>
                <h3 className="text-3xl font-bold font-mono tracking-tight">Installation</h3>
              </div>
              <div className={`grid grid-cols-1 gap-6 ${isCurrent ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
                {release.packages.map((i) => (
                  <Card key={i.pkg} className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="font-mono text-base wrap-break-word">{i.pkg}</CardTitle>
                      <CardDescription className="text-xs">{i.note}</CardDescription>
                      <div className="mt-2 break-all rounded-md bg-code p-3 font-mono text-xs text-foreground border border-border">npm install {i.pkg}{release.installTag}</div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">Peer dependencies: <span className="font-medium text-foreground">{i.peers}</span></p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-xl shadow-black/20 relative">
                <h4 className="font-semibold text-lg mb-1">Quick Start</h4>
                <p className="mb-3 text-sm text-muted-foreground">Core is the only requirement — copy the lines for the integrations you actually use.</p>
                <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm font-mono leading-7 border border-border text-foreground"><code>{quickStart}</code></pre><CopyButton text={quickStart} />
              </div>
            </section>

            <Separator className="my-16 bg-border" />

            {/* Core API */}
            <section id="core" className="mb-20 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-flame shadow-lg shadow-[#8a1e2e]/10"><Component size={20} /></div>
                <h3 className="text-3xl font-bold font-mono tracking-tight">Core API</h3>
              </div>
              <p className="text-muted-foreground mb-6">Create a cache instance. All reads/writes are synchronous after initialization.</p>
              <Card className="border-border bg-card overflow-hidden">
                <CardHeader className="border-b border-border">
                  <code className="font-mono text-sm text-flame">createCache(options?) → Promise&lt;BlazeCache&gt;</code>
                </CardHeader>
                <CardContent className="pt-6 relative">
                  <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm font-mono leading-7 border border-border text-foreground"><code>{coreExample}</code></pre><CopyButton text={coreExample} />
                </CardContent>
              </Card>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                {release.coreMethods.map(({ name, sig, desc, isNew }) => (
                  <div key={name} className="text-left rounded-xl border border-border bg-card px-4 py-3 shadow-sm hover:border-primary transition-colors group">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold text-foreground group-hover:text-foreground">.{name}()</span>
                      <span className="flex items-center gap-2">
                        {isNew && <Badge variant="outline" className="border-primary px-1.5 py-0 text-[10px] text-flame">new</Badge>}
                        <span className="text-xs text-muted-foreground font-mono">{sig}</span>
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground leading-relaxed">{desc}</div>
                  </div>
                ))}
              </div>
            </section>

            <Separator className="my-16 bg-border" />

            {/* Events */}
            <>
                <section id="events" className="mb-20 scroll-mt-28">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-flame shadow-lg shadow-[#8a1e2e]/10"><Radio size={20} /></div>
                    <h3 className="text-3xl font-bold font-mono tracking-tight">Events</h3>
                  </div>
                  <p className="mb-6 max-w-3xl text-muted-foreground">
                    Everything the cache does is observable through a typed event system.
                    <code className="text-flame"> on(type, listener)</code> subscribes to one
                    event type — the payload typed to exactly that event —{" "}
                    <code className="text-flame">on(listener)</code> subscribes to{" "}
                    <strong className="text-foreground">all</strong> of them (wildcard), both
                    return their own unsubscribe function, and <code>once</code> /{" "}
                    <code>off</code> complete the API.
                  </p>
                  <Card className="border-border bg-card overflow-hidden">
                    <CardHeader className="border-b border-border">
                      <code className="font-mono text-sm text-flame">typed per event — or one listener for every event</code>
                    </CardHeader>
                    <CardContent className="pt-6 relative">
                      <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm font-mono leading-7 border border-border text-foreground"><code>{`// One event type — the payload is typed to exactly that event.
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
                      <div key={e.name} className="text-left rounded-xl border border-border bg-card px-4 py-3 shadow-sm hover:border-primary transition-colors group">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-sm font-semibold text-foreground group-hover:text-foreground">'{e.name}'</span>
                          {e.core && <Badge variant="outline" className="border-amber-600/60 px-1.5 py-0 text-[10px] text-amber-700 dark:text-amber-300">rust core</Badge>}
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

                  {has040 && (
                    <div className="mt-8 space-y-6">
                      <Card className="border-border bg-card overflow-hidden">
                        <CardHeader className="border-b border-border">
                          <code className="font-mono text-sm text-flame">subscribe / subscribeMany / subscribeTag — new in {newIn}</code>
                        </CardHeader>
                        <CardContent className="pt-6 relative">
                          <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm font-mono leading-7 border border-border text-foreground"><code>{`// The value-oriented front end of events: hand over a key, get the current value back.
const stop = cache.subscribe('user:42', (user, change) => {
  console.log(change.type, user);      // 'set' → the new value, 'delete' → undefined
});

const stopMany = cache.subscribeMany(['a', 'b'], (key, value, change) => {
  console.log(key, value, change.type);
});

const stopTag = cache.subscribeTag('user', ({ tag, keys, change }) => {
  console.log(tag, keys, change.type); // 'user', ['user:42'], 'invalidate'
});

stop(); stopMany(); stopTag();         // idempotent — also safe from inside a listener`}</code></pre><CopyButton text={`// The value-oriented front end of events: hand over a key, get the current value back.
const stop = cache.subscribe('user:42', (user, change) => {
  console.log(change.type, user);      // 'set' → the new value, 'delete' → undefined
});

const stopMany = cache.subscribeMany(['a', 'b'], (key, value, change) => {
  console.log(key, value, change.type);
});

const stopTag = cache.subscribeTag('user', ({ tag, keys, change }) => {
  console.log(tag, keys, change.type); // 'user', ['user:42'], 'invalidate'
});

stop(); stopMany(); stopTag();         // idempotent — also safe from inside a listener`} />
                        </CardContent>
                      </Card>
                      <p className="text-muted-foreground max-w-3xl">
                        The value is what the cache holds <em className="text-foreground not-italic font-medium">now</em>: the new
                        value after <code>set</code>, the unchanged one after <code>touch</code>, and{" "}
                        <code>undefined</code> after a removal — for <code>evict</code> /{" "}
                        <code>expire</code> the dropped reference is still on{" "}
                        <code>change.value</code>. <code>hit</code> and <code>miss</code> are not part
                        of a subscription at all: a lookup never wakes one. Tag subscriptions are the
                        part raw events cannot express — a removal carries no tags, so the layer keeps
                        a per-tag mirror of the live keys and attributes every removal to the tags it
                        actually hit, including entries dropped by a capacity sweep or a lapsed TTL.
                        Delivery matches the event system: synchronous, a throwing subscriber logged
                        and skipped, <code>{'{ once: true }'}</code> fires once then unsubscribes
                        itself. Everything is opt-in — with no subscription alive the layer does not
                        exist, and <code>get</code>/<code>set</code> are exactly what they were.
                      </p>
                    </div>
                  )}
                </section>

                <Separator className="my-16 bg-border" />
              </>

            {/* Typed Query API — the 0.5 beta's own section, with its runnable example */}
            {isBeta && (
              <>
                <section id="query" className="mb-20 scroll-mt-28">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-flame shadow-lg shadow-[#8a1e2e]/10"><Search size={20} /></div>
                    <h3 className="text-3xl font-bold font-mono tracking-tight">Typed Query API</h3>
                    <Badge className="text-xs px-2 py-0.5">New in {release.badge}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-6 max-w-3xl">
                    Paged, typed lookups over the live cache. Opt in once with <code>indexes: true</code> —
                    with indexes off the hot path pays nothing and <code>query()</code> throws instead of
                    silently walking every entry. An explicit <code>fullScan: true</code> is the only O(n)
                    path, and rejects every constraint it would have to ignore.
                  </p>
                  <Card className="border-border bg-card overflow-hidden">
                    <CardHeader className="border-b border-border">
                      <code className="font-mono text-sm text-flame">createCache(&#123; indexes: true &#125;) → query / queryKeys / count</code>
                    </CardHeader>
                    <CardContent className="pt-6 relative">
                      <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm font-mono leading-7 border border-border text-foreground"><code>{queryExample}</code></pre><CopyButton text={queryExample} />
                    </CardContent>
                  </Card>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { name: "prefix", sig: "string", desc: "Only keys starting with this string." },
                      { name: "tags", sig: "{ any?, all?, none? }", desc: "Tag set logic: at least one, every one, or none of the listed tags." },
                      { name: "ttlRange", sig: "{ min?, max? }", desc: "Remaining TTL in milliseconds, not the original write window." },
                      { name: "keys", sig: "readonly string[]", desc: "Allow-list — only these keys are considered." },
                      { name: "limit", sig: "number (required)", desc: "Positive integer page size; query() throws without it." },
                      { name: "cursor", sig: "string", desc: "Opaque last-key anchor from a previous page, surviving deletion of that key." },
                      { name: "includeValues", sig: "boolean = false", desc: "Return live by-reference values — legal only with both maxEntries and maxValueBytes." },
                      { name: "maxEntries / maxValueBytes", sig: "number", desc: "Hard caps on rows and estimated value bytes; truncated reports a cut-short page." },
                      { name: "withTotal", sig: "boolean = false", desc: "Adds a separate full count pass as total." },
                      { name: "fullScan / where", sig: "boolean / (summary) => boolean", desc: "Explicit O(n) path with an optional post-filter; rejects prefix, tags, ttlRange and keys." },
                    ].map((o) => (
                      <div key={o.name} className="text-left rounded-xl border border-border bg-card px-4 py-3 shadow-sm hover:border-primary transition-colors group">
                        <div className="font-mono text-sm font-semibold text-foreground group-hover:text-foreground">{o.name}</div>
                        <div className="mt-0.5 font-mono text-xs text-muted-foreground wrap-break-word">{o.sig}</div>
                        <div className="mt-2 text-xs text-muted-foreground leading-relaxed">{o.desc}</div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-6 max-w-3xl text-muted-foreground">
                    The same filters work on <code>queryKeys()</code> (keys only) and{" "}
                    <code>count()</code> (which takes every filter except <code>limit</code> and{" "}
                    <code>cursor</code>). Cursors are last-key anchors in ascending key order — they
                    survive deletion of the anchor key, and dropping the cursor restarts at page one.
                    The wasm bindings expose the same query across the boundary.
                  </p>
                </section>

                <Separator className="my-16 bg-border" />
              </>
            )}

            {/* Devtools — the 0.5 beta's zero-cost observability section */}
            {isBeta && (
              <>
                <section id="devtools" className="mb-20 scroll-mt-28">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-flame shadow-lg shadow-[#8a1e2e]/10"><Bug size={20} /></div>
                    <h3 className="text-3xl font-bold font-mono tracking-tight">Devtools</h3>
                    <Badge className="text-xs px-2 py-0.5">New in {release.badge}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-6 max-w-3xl">
                    <code>@blaze-cache/devtools</code> observes a cache without instrumenting application
                    code. Importing it costs nothing: only <code>attach()</code> subscribes, and{" "}
                    <code>detach()</code> hands back the exact unsubscribe function so the core's opt-in
                    drop log switches off again. Snapshots are versioned (<code>protocol: 1</code>), bounded,
                    and built on demand — never on the hot path.
                  </p>
                  <Card className="border-border bg-card overflow-hidden">
                    <CardHeader className="border-b border-border">
                      <code className="font-mono text-sm text-flame">attach → snapshot / events / onEvent → detach</code>
                    </CardHeader>
                    <CardContent className="pt-6 relative">
                      <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm font-mono leading-7 border border-border text-foreground"><code>{devtoolsExample}</code></pre><CopyButton text={devtoolsExample} />
                    </CardContent>
                  </Card>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { name: "attach(cache, options?)", sig: "→ DevtoolsHandle", desc: "Registers one weak-reference handle with a wildcard listener. Idempotent only while options agree; re-attaching with different options throws." },
                      { name: "handle.snapshot(options?)", sig: "→ versioned envelope", desc: "On-demand stats, size, capacity, keys, summarized entries, TTL/tags and persistence stats. maxEntries / maxValueBytes cap rows and bytes with explicit truncation markers." },
                      { name: "handle.events() / onEvent(fn)", sig: "→ events / unsubscribe", desc: "A ring buffer (default 500) of the live feed plus subscriptions — no timers or polling; events arrive from the cache's own listener." },
                      { name: "detach(handle | cache) / dispose()", sig: "→ number / void", desc: "Removes one handle or every attachment and restores the cache's prior drop-log state exactly." },
                      { name: "list()", sig: "→ attachment[]", desc: "The live cacheId, clientId and label of every attached handle." },
                      { name: "summarize(value, options?)", sig: "→ ValueSummary", desc: "Bounded, cycle-safe clone-or-describe walk. BigInt, Maps, hostile getters and deep nesting degrade to markers, never throw." },
                      { name: "createEnvelope / isDevtoolsEnvelope", sig: "protocol: 1", desc: "The versioned { protocol, tabId, clientId, cacheId, ts, kind, payload } envelope shared by every transport." },
                      { name: "label", sig: "string", desc: "A human label for the handle, carried through list() and snapshots." },
                      { name: "redactKeys", sig: "readonly RegExp[]", desc: "Overrides the frozen @blaze-cache/core/shared patterns. Matching keys render as [redacted] at every level; a broken pattern fails closed." },
                      { name: "valueMode", sig: "'summary' | 'full'", desc: "'summary' (default) summarizes values; 'full' is an explicit opt-in that still returns clones, never live references." },
                      { name: "maxEvents", sig: "number = 500", desc: "Ring-buffer size for this handle's event feed." },
                    ].map((o) => (
                      <div key={o.name} className="text-left rounded-xl border border-border bg-card px-4 py-3 shadow-sm hover:border-primary transition-colors group">
                        <div className="font-mono text-sm font-semibold text-foreground group-hover:text-foreground">{o.name}</div>
                        <div className="mt-0.5 font-mono text-xs text-muted-foreground wrap-break-word">{o.sig}</div>
                        <div className="mt-2 text-xs text-muted-foreground leading-relaxed">{o.desc}</div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-6 max-w-3xl text-muted-foreground">
                    Snapshots use the indexed <code>query()</code> API with caps when indexes are enabled,
                    and fall back to a bounded full scan otherwise — so a cache created without indexes is
                    still inspectable. The versioned envelope and the frozen redaction contract come from{" "}
                    <code>@blaze-cache/core/shared</code>, which is wasm-free and safe to import on a server.
                  </p>
                </section>

                <Separator className="my-16 bg-border" />
              </>
            )}

            {/* The frozen shared contract — the 0.5 beta's server-safe subpath */}
            {isBeta && (
              <>
                <section id="shared" className="mb-20 scroll-mt-28">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-flame shadow-lg shadow-[#8a1e2e]/10"><ShieldCheck size={20} /></div>
                    <h3 className="text-3xl font-bold font-mono tracking-tight">Shared Contract</h3>
                    <code className="font-mono text-sm text-muted-foreground">@blaze-cache/core/shared</code>
                    <Badge className="text-xs px-2 py-0.5">New in {release.badge}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-6 max-w-3xl">
                    A wasm-free, server-safe subpath that imports nothing from the cache runtime, IndexedDB
                    or the DOM. Bindings, snapshot bridges and devtools all import the same frozen shapes —
                    so what counts as a secret, and how a binding record is named, can never drift apart.
                  </p>
                  <Card className="border-border bg-card overflow-hidden">
                    <CardHeader className="border-b border-border">
                      <code className="font-mono text-sm text-flame">REDACT_KEY_PATTERNS · isBlazeRecord · &lt;binding&gt;:&lt;feature&gt;</code>
                    </CardHeader>
                    <CardContent className="pt-6 relative">
                      <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm font-mono leading-7 border border-border text-foreground"><code>{sharedExample}</code></pre><CopyButton text={sharedExample} />
                    </CardContent>
                  </Card>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { name: "REDACT_KEY_PATTERNS", sig: "readonly RegExp[] (frozen)", desc: "Nine deny-by-default patterns: authorization, token, cookie, credential, password, passwd, secret, api[-_]?key and session — matched case-insensitively against the whole key." },
                      { name: "isRedactedKey(key, patterns?)", sig: "boolean", desc: "True when the key matches any pattern. A pattern that throws, or is a stateful frozen global, fails closed — redaction never silently switches off." },
                      { name: "redactKey(key, patterns?, replacement?)", sig: "string", desc: "Returns the opaque [redacted] marker for sensitive keys, the key itself otherwise." },
                      { name: "BlazeRecord<V>", sig: "{ kind, v, data, storedAt }", desc: "The envelope written by framework bindings; storedAt breaks restore ties, v is guard-tested as any finite number." },
                      { name: "isBlazeRecord(value)", sig: "value is BlazeRecord", desc: "Frozen duck-typed guard, tolerant of older and newer envelope versions. Never inspects data, so a future record is still shown as a record — never expanded in the UI." },
                      { name: "makeBlazeKind(binding, feature)", sig: "string", desc: "Builds a namespaced kind such as next:route from the one shared separator." },
                      { name: "bindingFromKind / featureFromKind", sig: "string | undefined", desc: "Parse either half of a kind; undefined when it does not follow the convention (empty side or no separator)." },
                      { name: "KIND_SEPARATOR", sig: "':'", desc: "The single separator the convention is built on, exported so every binding agrees on it." },
                    ].map((o) => (
                      <div key={o.name} className="text-left rounded-xl border border-border bg-card px-4 py-3 shadow-sm hover:border-primary transition-colors group">
                        <div className="font-mono text-sm font-semibold text-foreground group-hover:text-foreground">{o.name}</div>
                        <div className="mt-0.5 font-mono text-xs text-muted-foreground wrap-break-word">{o.sig}</div>
                        <div className="mt-2 text-xs text-muted-foreground leading-relaxed">{o.desc}</div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-6 max-w-3xl text-muted-foreground">
                    Nothing here loads wasm or touches a browser API, so a Node server, an SSR bundle or a
                    snapshot serialiser can import it safely. Devtools re-exports the same helpers — a summary
                    and a binding write therefore agree on what is secret and how records are named.
                  </p>
                </section>

                <Separator className="my-16 bg-border" />
              </>
            )}

            {/* Persistence, wasm loading, storage, multi-tab and benchmarks — the 0.4 line's own sections */}
            {has040 && (
              <>
                <section id="persistence" className="mb-20 scroll-mt-28">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-flame shadow-lg shadow-[#8a1e2e]/10"><Database size={20} /></div>
                    <h3 className="text-3xl font-bold font-mono tracking-tight">Persistence</h3>
                    <Badge className="text-xs px-2 py-0.5">New in {newIn}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-6 max-w-3xl">
                    Optional write-through storage, off by default: pass{" "}
                    <code className="text-flame">persistence</code> to{" "}
                    <code className="text-flame">createCache()</code> and it hydrates before the
                    promise resolves, then keeps writing in the background — debounced, coalesced
                    per key, flushed on <code>pagehide</code> and <code>visibilitychange</code>.
                    This release adds a control surface, session isolation and a schema stamp on
                    top of that.
                  </p>

                  <Card className="border-border bg-card overflow-hidden">
                    <CardHeader className="border-b border-border">
                      <code className="font-mono text-sm text-flame">createCache(&#123; persistence: … &#125;)</code>
                    </CardHeader>
                    <CardContent className="pt-6 relative">
                      <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm font-mono leading-7 border border-border text-foreground"><code>{persistenceExample}</code></pre><CopyButton text={persistenceExample} />
                    </CardContent>
                  </Card>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { name: "namespace", sig: "string = 'default'", desc: "Key prefix isolating this cache in the store — two caches in one database never collide. Never contains \\0; the key is built as namespace\\0generation\\0key." },
                      { name: "generation", sig: "string = ''", desc: "Session bucket folded into the key space: rows written under one generation are invisible to every other. Change it through persistence.rotate(), never by hand." },
                      { name: "debounceMs", sig: "number = 400", desc: "How long a write waits for more writes before reaching storage — the window where coalescing happens (three writes to one key produce one row). Finite, >= 0. Legacy alias: flushDelayMs." },
                      { name: "maxEntries", sig: "number = 2000", desc: "Records one flush writes at most, newest dirty keys win. Integer >= 1 — validated, because 0 would persist everything. Legacy alias: maxRecords." },
                      { name: "restoreExpired", sig: "boolean = false", desc: "Restore records whose TTL elapsed while the tab was away — with their original window restarted from now, never the dead remainder." },
                      { name: "writeMode", sig: "'debounce' | 'immediate'", desc: "'debounce' (default) waits debounceMs; 'immediate' flushes on the next task after a mutation, still coalescing everything written within it into one pass." },
                      { name: "onError", sig: "(error) => void", desc: "Receives failures nobody awaited — the timer's flush, the pagehide flush, a startup that fell back to memory-only. Awaited calls still reject. Default: console.error." },
                      { name: "onActivity", sig: "(activity) => void", desc: "Hydrate and flush start/finish, passes aborted by a rotation, rotations and errors — a channel deliberately separate from the cache's event bus." },
                    ].map((o) => (
                      <div key={o.name} className="text-left rounded-xl border border-border bg-card px-4 py-3 shadow-sm hover:border-primary transition-colors group">
                        <div className="font-mono text-sm font-semibold text-foreground group-hover:text-foreground">{o.name}</div>
                        <div className="mt-0.5 font-mono text-xs text-muted-foreground wrap-break-word">{o.sig}</div>
                        <div className="mt-2 text-xs text-muted-foreground leading-relaxed">{o.desc}</div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-6 max-w-3xl text-muted-foreground">
                    The legacy spellings <code>flushDelayMs</code> and <code>maxRecords</code>{" "}
                    still work as aliases; passing both spellings with different values throws. Every
                    option is validated when persistence is attached — a negative{" "}
                    <code>debounceMs</code>, a <code>maxEntries</code> below <code>1</code>, an
                    unknown <code>writeMode</code> or a NUL in the namespace throws from{" "}
                    <code>create</code> rather than misbehaving later.
                  </p>

                  <h4 className="mt-10 mb-4 text-xl font-bold font-mono tracking-tight">The control API: cache.persistence</h4>
                  <Card className="border-border bg-card overflow-hidden">
                    <CardHeader className="border-b border-border">
                      <code className="font-mono text-sm text-flame">flush · clear · hydrate · stats · rotate</code>
                    </CardHeader>
                    <CardContent className="pt-6 relative">
                      <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm font-mono leading-7 border border-border text-foreground"><code>{controlExample}</code></pre><CopyButton text={controlExample} />
                    </CardContent>
                  </Card>
                  <p className="mt-6 max-w-3xl text-muted-foreground">
                    Every method is safe to call on a cache created{" "}
                    <strong className="text-foreground">without</strong> persistence: they resolve as
                    no-ops and <code>stats()</code> reports <code>enabled: false</code>, so
                    application code never has to branch. <code>hydrate()</code> merges — memory-only
                    entries survive — which makes it usable as a "storage caught up, pull it in"
                    call. A failure rejects <em className="text-foreground not-italic font-medium">that</em>{" "}
                    promise while leaving persistence attached and healthy; core reads and writes are
                    never affected.
                  </p>

                  <h4 className="mt-10 mb-4 text-xl font-bold font-mono tracking-tight">Accounts and logout/login</h4>
                  <Card className="border-border bg-card overflow-hidden">
                    <CardHeader className="border-b border-border">
                      <code className="font-mono text-sm text-flame">rotate() switches the session bucket</code>
                    </CardHeader>
                    <CardContent className="pt-6 relative">
                      <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm font-mono leading-7 border border-border text-foreground"><code>{accountsExample}</code></pre><CopyButton text={accountsExample} />
                    </CardContent>
                  </Card>
                  <p className="mt-6 max-w-3xl text-muted-foreground">
                    Rotation is stronger than clearing memory. Every write{" "}
                    <strong className="text-foreground">queued</strong> by the previous session is
                    discarded before it reaches storage, and every flush or hydrate still{" "}
                    <strong className="text-foreground">in flight</strong> fails its next epoch check
                    and drops the work it claimed — counted in <code>stats().aborted</code>, never
                    as an error — so a slow write cannot repopulate the next session's rows. The
                    adapter snapshots its bucket per operation, so a write that started before{" "}
                    <code>rotate()</code> lands in the <em className="text-foreground not-italic font-medium">previous</em>{" "}
                    generation's rows, invisible to the new one. Rows already stored are preserved —
                    log back in as that account and they are there; call <code>clear()</code> first
                    if you want them wiped instead.
                  </p>

                  <h4 className="mt-10 mb-4 text-xl font-bold font-mono tracking-tight">Schema versioning and failure containment</h4>
                  <p className="max-w-3xl text-muted-foreground">
                    Rows carry a schema stamp (<code>v</code>). Unversioned rows written by older
                    releases are adopted in place on first load; rows from a{" "}
                    <strong className="text-foreground">newer</strong> schema — a downgrade — reset
                    the namespace with a console warning rather than being misread. Individual
                    corrupt rows (missing key, bad tags, bad TTL) cost exactly themselves: the rest
                    of the hydrate proceeds, with a single warning for the run. Failures are
                    contained at both ends — an adapter that cannot open at all (private mode,
                    enterprise policy) degrades to memory-only with a warning instead of breaking
                    the app, and a flush that fails later puts every record it claimed straight back
                    on the queue so the next flush retries them. A record that fails on its own earns
                    one strike per pass and is dropped after three (the entry stays in memory), so
                    one poison record cannot block every later flush; any successful pass clears the
                    strikes.
                  </p>

                  <h4 className="mt-10 mb-4 text-xl font-bold font-mono tracking-tight">Custom adapters</h4>
                  <Card className="border-border bg-card overflow-hidden">
                    <CardHeader className="border-b border-border">
                      <code className="font-mono text-sm text-flame">interface CachePersistence</code>
                    </CardHeader>
                    <CardContent className="pt-6 relative">
                      <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm font-mono leading-7 border border-border text-foreground"><code>{adapterExample}</code></pre><CopyButton text={adapterExample} />
                    </CardContent>
                  </Card>
                  <p className="mt-6 max-w-3xl text-muted-foreground">
                    Any storage plugs in through the <code>adapter</code> option.{" "}
                    <code>keys()</code> keeps it honest — the core drops entries on its own (a
                    capacity eviction or a lapsed TTL never queues a delete), so without a listing
                    those rows would outlive every flush and re-hydrate at the next startup.{" "}
                    <code>write()</code> hands the whole flush over as one unit of work so an
                    adapter can commit it in a single transaction — the built-in adapter does
                    exactly that. <code>rotate()</code> tells the adapter to switch buckets, with
                    the same in-flight guarantee as above; adapters without these hooks keep working
                    exactly as before.
                  </p>

                  <p className="mt-6 max-w-3xl text-muted-foreground">
                    <strong className="text-foreground">Multiple tabs</strong> share one IndexedDB
                    namespace, and each still holds its own wasm instance — but they no longer have
                    to disagree. Opt in to <a href="#multitab" className="text-flame underline underline-offset-4">multi-tab sync</a>{" "}
                    to order writes across tabs and keep a hidden tab from flushing a stale value
                    over the focused tab's newer one. Without the option the old last-writer-wins
                    behavior is unchanged.
                  </p>
                </section>

                <Separator className="my-16 bg-border" />

                <section id="wasm" className="mb-20 scroll-mt-28">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-flame shadow-lg shadow-[#8a1e2e]/10"><Zap size={20} /></div>
                    <h3 className="text-3xl font-bold font-mono tracking-tight">Wasm Loading</h3>
                    <Badge className="text-xs px-2 py-0.5">New in {newIn}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-6 max-w-3xl">
                    <code className="text-flame">createCache()</code> loads the{" "}
                    <code>.wasm</code> binary exactly once per page, no matter how many caches you
                    create. The load is explicit and async — nothing is inlined as base64 — and
                    this release standardises where the bytes come from: one source option, or the
                    shipped default.
                  </p>

                  <Card className="border-border bg-card overflow-hidden">
                    <CardHeader className="border-b border-border">
                      <code className="font-mono text-sm text-flame">four ways to name the binary — or none</code>
                    </CardHeader>
                    <CardContent className="pt-6 relative">
                      <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm font-mono leading-7 border border-border text-foreground"><code>{wasmExample}</code></pre><CopyButton text={wasmExample} />
                    </CardContent>
                  </Card>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { name: "(none)", sig: "the shipped default", desc: "The package fetches the binary shipped inside @blaze-cache/core, resolved relative to its own module URL — bundlers rewrite that into an emitted asset, so Vite needs no configuration at all. Concurrent createCache() calls share one download and one compile." },
                      { name: "wasmUrl", sig: "string | URL", desc: "Where the binary actually lives: a public/ asset path, a CDN, another origin, a signed path. The right call when a bundler pre-bundles dependencies and rewrites import.meta.url." },
                      { name: "module", sig: "WebAssembly.Module", desc: "A precompiled module — no fetch and no compile at all. For a service worker, a warm WebAssembly.compileStream, a test fixture." },
                      { name: "instantiate", sig: "() => source | Promise<source>", desc: "A full custom loader for auth headers, retries, or bytes already in memory. It must resolve to a source — URL, Request, bytes, module — never an Instance: the generated glue owns linking." },
                      { name: "wasm", sig: "WasmInitInput", desc: "Low-level passthrough straight to wasm-bindgen's init() — equivalent to wasmUrl for a URL, and the way to hand over pre-read bytes (what the Node test suites do)." },
                    ].map((o) => (
                      <div key={o.name} className="text-left rounded-xl border border-border bg-card px-4 py-3 shadow-sm hover:border-primary transition-colors group">
                        <div className="font-mono text-sm font-semibold text-foreground group-hover:text-foreground">{o.name}</div>
                        <div className="mt-0.5 font-mono text-xs text-muted-foreground wrap-break-word">{o.sig}</div>
                        <div className="mt-2 text-xs text-muted-foreground leading-relaxed">{o.desc}</div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-6 max-w-3xl text-muted-foreground">
                    Pass at most one of <code>wasmUrl</code>, <code>module</code> and{" "}
                    <code>instantiate</code> — two at once throws a <code>TypeError</code> rather
                    than silently picking one. Failures are explicit: a wrong path reports the HTTP
                    status and the URL, an unreachable server reports the fetch error (kept on{" "}
                    <code>error.cause</code>), and corrupt bytes report the compile failure — each
                    with what to try instead. The pre-bundling caveat still applies: exclude{" "}
                    <code>@blaze-cache/core</code> from pre-bundling (as every example here does) or
                    point at the binary with <code>wasmUrl</code>.
                  </p>
                </section>

                <Separator className="my-16 bg-border" />

                <section id="storage" className="mb-20 scroll-mt-28">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-flame shadow-lg shadow-[#8a1e2e]/10"><Database size={20} /></div>
                    <h3 className="text-3xl font-bold font-mono tracking-tight">Storage &amp; Memory</h3>
                    <Badge className="text-xs px-2 py-0.5">New in {newIn}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-6 max-w-3xl">
                    By default values stay <strong className="text-foreground">by reference</strong> in
                    the Rust slab — <code>get</code>/<code>set</code> never clone or serialise them.
                    Two opt-in modes change ownership for workloads that need it; neither is the
                    default, and both were measured before shipping.
                  </p>
                  <div className="grid grid-cols-1 gap-6">
                    <Card className="border-border bg-card overflow-hidden">
                      <CardHeader className="border-b border-border">
                        <CardTitle className="font-mono text-sm text-flame">Binary values — zero-copy reads</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6 relative">
                        <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm font-mono leading-7 border border-border text-foreground"><code>{bytesExample}</code></pre><CopyButton text={bytesExample} />
                      </CardContent>
                    </Card>
                    <Card className="border-border bg-card overflow-hidden">
                      <CardHeader className="border-b border-border">
                        <CardTitle className="font-mono text-sm text-flame">JS-authoritative hybrid mode</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6 relative">
                        <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm font-mono leading-7 border border-border text-foreground"><code>{hybridExample}</code></pre><CopyButton text={hybridExample} />
                      </CardContent>
                    </Card>
                  </div>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { name: "storage", sig: "'wasm' | 'js'", desc: "Defaults to 'wasm' — values are externrefs in the slab. 'js' moves values into a JS Map<id, V> while Wasm keeps keys, TTL, tags, SIEVE bookkeeping and stable ids." },
                      { name: "setBytes", sig: "(key, view, options?) => void", desc: "Copies raw bytes once into a chunked linear-memory arena. Views detach on memory.grow or region reuse — use getBytesCopy for anything long-lived." },
                      { name: "getBytes", sig: "(key) => Uint8Array | undefined", desc: "A zero-copy view onto the region. entries()/entry() and persistence see a copied Uint8Array so those paths stay structured-cloneable." },
                      { name: "setBytesReserved", sig: "(key, ptr, len, options?) => void", desc: "Advanced: a decoder that already wrote into the arena adopts the region with no JS→Wasm copy. The public setBytes contract is unchanged." },
                    ].map((o) => (
                      <div key={o.name} className="text-left rounded-xl border border-border bg-card px-4 py-3 shadow-sm hover:border-primary transition-colors group">
                        <div className="font-mono text-sm font-semibold text-foreground group-hover:text-foreground">{o.name}</div>
                        <div className="mt-0.5 font-mono text-xs text-muted-foreground wrap-break-word">{o.sig}</div>
                        <div className="mt-2 text-xs text-muted-foreground leading-relaxed">{o.desc}</div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-6 max-w-3xl text-muted-foreground">
                    Both modes are capabilities, not speed stories: the published deltas show{" "}
                    <code>storage: 'js'</code> slower than the default on every measured workload
                    (the key scratch buffer already removed the cost it targeted), and bytes mode
                    trades a copy on write for a view on read. <code>setBytes</code> is unavailable
                    with <code>storage: 'js'</code> and throws a clear error. See{" "}
                    <a href="#benchmarks" className="text-flame underline underline-offset-4">Benchmarks</a>.
                  </p>
                </section>

                <Separator className="my-16 bg-border" />

                <section id="multitab" className="mb-20 scroll-mt-28">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-flame shadow-lg shadow-[#8a1e2e]/10"><Radio size={20} /></div>
                    <h3 className="text-3xl font-bold font-mono tracking-tight">Multi-Tab Sync</h3>
                    <Badge className="text-xs px-2 py-0.5">New in {newIn}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-6 max-w-3xl">
                    The old "no coordination between tabs" limitation is gone. Opt in and each
                    namespace opens one <code>BroadcastChannel</code> keyed by namespace and session
                    generation; <code>set</code>, <code>delete</code>, <code>clear</code>, tag
                    invalidation and rotation propagate between instances, with a{" "}
                    <code>hello</code>/<code>state</code> handshake on focus so a tab that was asleep
                    can catch up.
                  </p>
                  <Card className="border-border bg-card overflow-hidden">
                    <CardHeader className="border-b border-border">
                      <code className="font-mono text-sm text-flame">multiTab: &#123; enabled: true, strategy: 'value' &#125;</code>
                    </CardHeader>
                    <CardContent className="pt-6 relative">
                      <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm font-mono leading-7 border border-border text-foreground"><code>{multiTabExample}</code></pre><CopyButton text={multiTabExample} />
                    </CardContent>
                  </Card>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { name: "strategy", sig: "'value' | 'invalidate'", desc: "'value' (default) structured-clones payloads over the channel, falling back to an invalidate tombstone for non-cloneable values. 'invalidate' only sends tombstones for apps that refetch on focus." },
                      { name: "ordering", sig: "HLC + seq + clientId", desc: "A hybrid logical clock, a per-client sequence and a deterministic client-id tiebreaker order writes. Each key remembers the last version it saw, so a late stale message never wins — the hidden-tab flush bug is fixed." },
                      { name: "remote events", sig: "remote-*", desc: "Remote changes fire remote-set / remote-delete / remote-clear / remote-invalidate / remote-rotate. They are applied through an internal path that bypasses publishing, so there are no echo storms and no duplicate flush." },
                      { name: "lifecycle", sig: "Web Lock · dispose", desc: "A Web Lock serialises IndexedDB flushes across tabs where available. The channel closes on dispose; where BroadcastChannel is missing (workers, older browsers) the layer degrades silently with no channel opened." },
                    ].map((o) => (
                      <div key={o.name} className="text-left rounded-xl border border-border bg-card px-4 py-3 shadow-sm hover:border-primary transition-colors group">
                        <div className="font-mono text-sm font-semibold text-foreground group-hover:text-foreground">{o.name}</div>
                        <div className="mt-0.5 font-mono text-xs text-muted-foreground wrap-break-word">{o.sig}</div>
                        <div className="mt-2 text-xs text-muted-foreground leading-relaxed">{o.desc}</div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-6 max-w-3xl text-muted-foreground">
                    The option is off by default: without <code>multiTab.enabled</code> no channel is
                    created, no version state is kept and the hot path is byte-for-byte what it was.
                  </p>
                </section>

                <Separator className="my-16 bg-border" />

                <section id="benchmarks" className="mb-20 scroll-mt-28">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-flame shadow-lg shadow-[#8a1e2e]/10"><Zap size={20} /></div>
                    <h3 className="text-3xl font-bold font-mono tracking-tight">Benchmarks</h3>
                    <Badge className="text-xs px-2 py-0.5">New in {newIn}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-6 max-w-3xl">
                    Ten scenarios — fill, hit, miss, mixed, the <code>full-featured</code> headline,
                    TTL churn, eviction pressure, tag invalidation, persistence flush and hydration —
                    across five payload sizes (≤64 B → 1 MB) and both structured-cloneable objects
                    and <code>Uint8Array</code>, in Node <em className="text-foreground not-italic font-medium">and</em>{" "}
                    headless Chrome. Every adapter must produce deeply equal probe observations
                    before timing starts; the reported number is a calibrated median with its spread.
                    A separate <code>bench:framework</code> suite compares point operations against
                    the real TanStack Query and SWR cache stores.
                  </p>
                  <Card className="border-border bg-card overflow-hidden">
                    <CardHeader className="border-b border-border">
                      <CardTitle className="font-mono text-sm text-flame">full-featured, small payload — ns/op, lower is better</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <table className="w-full text-sm text-muted-foreground">
                        <thead><tr className="border-b border-border text-left"><th className="py-2">Adapter</th><th className="py-2 text-right">Node / object</th><th className="py-2 text-right">Browser / object</th></tr></thead>
                        <tbody className="divide-y divide-border">
                          <tr><td className="py-2">Map + LRU + TTL + tags</td><td className="py-2 text-right font-mono">211.2</td><td className="py-2 text-right font-mono">190.3</td></tr>
                          <tr><td className="py-2">QuickLRU + tag index</td><td className="py-2 text-right font-mono text-emerald-600 dark:text-emerald-300">109.3</td><td className="py-2 text-right font-mono text-emerald-600 dark:text-emerald-300">88.2</td></tr>
                          <tr><td className="py-2">lru-cache + tag index</td><td className="py-2 text-right font-mono">231.3</td><td className="py-2 text-right font-mono">100.0</td></tr>
                          <tr><td className="py-2 font-semibold text-foreground">blaze-cache</td><td className="py-2 text-right font-mono font-semibold text-foreground">183.6</td><td className="py-2 text-right font-mono font-semibold text-foreground">208.6</td></tr>
                        </tbody>
                      </table>
                      <p className="mt-4 text-xs text-muted-foreground">
                        Feature-equivalent (mixed 90/10, no TTL or tags): blaze 119.3 Node / 113.4
                        browser versus QuickLRU 73.9 / 66.2 and plain Map 52.6 / 42.7 — the comparison
                        that matters when you do not need the features.
                      </p>
                    </CardContent>
                  </Card>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-border bg-card">
                      <CardHeader><CardTitle className="text-base">No payload-size cliff</CardTitle></CardHeader>
                      <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p>A 16 000× increase from tiny to 1 MB moves a hot read by roughly 10–20 ns and a full-featured operation by 10–25 ns — inside the suite's spread. Values are held by reference, never serialised on the hot path.</p>
                        <p className="font-mono text-xs">get-hit: 93 → 108 ns (Node), 86 → 90 ns (browser)<br />full-featured: 169 → 191 ns (Node), 184 → 193 ns (browser)</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border bg-card">
                      <CardHeader><CardTitle className="text-base">Stage 4: write-path tuning</CardTitle></CardHeader>
                      <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p className="font-mono text-xs">full-featured: 175.3 → 171.4 ns Node (−2%)<br />full-featured: 190.1 → 182.8 ns browser (−4%)<br />fill: flat/slightly slower · get-hit: unchanged</p>
                        <p>Tagged raw-key writes removed per-set key and tag allocations. The write-path premium against native LRU peers is real but small in absolute terms.</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="mt-6 border-border bg-card overflow-hidden">
                    <CardHeader className="border-b border-border">
                      <CardTitle className="font-mono text-sm text-flame">Framework cache stores — Node, ns/op (1 KB, capacity 10 000)</CardTitle>
                      <CardDescription className="text-xs">pnpm bench:framework — point operations of the real TanStack Query and SWR stores.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <table className="w-full text-sm text-muted-foreground">
                        <thead><tr className="border-b border-border text-left"><th className="py-2">Scenario</th><th className="py-2 text-right">Blaze</th><th className="py-2 text-right">TanStack Query</th><th className="py-2 text-right">SWR</th></tr></thead>
                        <tbody className="divide-y divide-border">
                          <tr><td className="py-2 font-mono text-xs">warm-hit</td><td className="py-2 text-right font-mono font-semibold text-foreground">40.5</td><td className="py-2 text-right font-mono">518.7</td><td className="py-2 text-right font-mono">11.9</td></tr>
                          <tr><td className="py-2 font-mono text-xs">miss</td><td className="py-2 text-right font-mono font-semibold text-foreground">28.2</td><td className="py-2 text-right font-mono">504.9</td><td className="py-2 text-right font-mono">11.6</td></tr>
                          <tr><td className="py-2 font-mono text-xs">write</td><td className="py-2 text-right font-mono font-semibold text-foreground">175.3</td><td className="py-2 text-right font-mono">1831.7</td><td className="py-2 text-right font-mono">130.8</td></tr>
                          <tr><td className="py-2 font-mono text-xs">invalidate-by-key</td><td className="py-2 text-right font-mono font-semibold text-foreground">142.7</td><td className="py-2 text-right font-mono">1 427 377.4</td><td className="py-2 text-right font-mono">100.0</td></tr>
                        </tbody>
                      </table>
                      <p className="mt-4 text-xs text-muted-foreground">
                        These are different shapes of API doing different amounts of work — TanStack's
                        numbers include query-key hashing and query-cache bookkeeping, and a real SWR
                        app also pays key serialisation. This is <strong className="text-foreground">not</strong>{" "}
                        the feature-equivalent table for the headline (that is the Map / QuickLRU /
                        lru-cache comparison above); "faster than a framework cache store" is only a
                        claim about the store's point operations.
                      </p>
                    </CardContent>
                  </Card>

                  <p className="mt-6 max-w-3xl text-muted-foreground">
                    <strong className="text-foreground">The honest caveat:</strong> the cost under
                    test is the boundary crossing and bookkeeping, not object copying — that premise
                    was disproven. Blaze replaces a stack of application code at roughly the same
                    cost, beats it on Node reads, and pays a write-path premium against native LRU
                    libraries. There is no unqualified "faster than JavaScript" claim. Full
                    methodology, hardware, raw JSON and stage-by-stage deltas live in the repo's{" "}
                    <a href="https://github.com/blaze-cache/blaze-cache/blob/main/docs/benchmarks/RESULTS.md" target="_blank" rel="noreferrer" className="text-flame underline underline-offset-4">published results</a>.
                  </p>
                  <div className="mt-6 rounded-xl border border-border bg-card p-6 relative">
                    <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm font-mono leading-7 border border-border text-foreground"><code>{benchmarkExample}</code></pre><CopyButton text={benchmarkExample} />
                  </div>
                </section>

                <Separator className="my-16 bg-border" />
              </>
            )}

            {/* Axios */}
            <section id="axios" className="mb-20 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-flame shadow-lg shadow-[#8a1e2e]/10"><ShieldCheck size={20} /></div>
                <h3 className="text-3xl font-bold font-mono tracking-tight">Axios Adapter</h3>
              </div>
              <p className="mb-6 max-w-3xl text-muted-foreground">
                The adapter sits between axios and the network: a <code>MISS</code> goes out and
                comes back cached, a <code>HIT</code> replays the stored status, headers and data
                without touching the network. Both entry points are exported from{" "}
                <code className="text-flame">@blaze-cache/axios</code> — pick the one that
                matches how you create your instance.
              </p>
              {isCurrent && (
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
                  <p className="mb-6 max-w-3xl text-muted-foreground">
                    This cycle hardened the adapter further: a{" "}
                    <strong className="text-foreground">stream response body</strong> is never
                    stored (it would be consumed before it could be replayed),{" "}
                    <code>URLSearchParams</code>, <code>FormData</code> and <code>Map</code> params
                    key correctly, the <code>x-blaze-cache</code> marker is stripped from stored
                    headers so a replayed response never carries two, a replayed 4xx error surfaces
                    as axios's <code>ERR_BAD_REQUEST</code> instead of a generic one, and
                    malformed <code>Cache-Control</code> directives are ignored rather than read
                    as zero.
                  </p>
                </>
              )}
              {has040 && (
                <p className="mb-6 max-w-3xl text-muted-foreground">
                  This cycle added <strong className="text-foreground">per-request control</strong>:
                  pass <code>blazeCache</code> on any request config to override{" "}
                  <code>enabled</code>, <code>ttlMs</code>, <code>tags</code>, <code>key</code>,{" "}
                  <code>varyHeaders</code> and <code>forceRefresh</code> for that one call —{" "}
                  <code>blazeCache: false</code> bypasses the cache entirely, an{" "}
                  <code>invalidateTags</code> list purges after a mutation, and{" "}
                  <code>invalidateCacheTags(cache, ...tags)</code> is the standalone helper.
                  Request bodies join the default key as well: an opted-in <code>POST</code> with
                  two payloads occupies two entries, and a body no encoder can read leaves that
                  request uncached rather than replaying one response for the other.
                </p>
              )}
              <div className="grid grid-cols-1 gap-6">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle>installBlazeCache(api, options)</CardTitle>
                    <CardDescription>
                      Retrofit an instance you already have. It captures the adapter the instance is
                      currently using before replacing it, so the wrapper can never call itself.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm font-mono leading-7 border border-border text-foreground"><code>{`import { createCache } from '@blaze-cache/core';
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
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle>blazeAdapter(options)</CardTitle>
                    <CardDescription>
                      Attach it to a new instance: the returned adapter is handed straight to{" "}
                      <code>axios.create()</code> and wraps the default network adapter (xhr, http
                      or fetch).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm font-mono leading-7 border border-border text-foreground"><code>{`import { createCache } from '@blaze-cache/core';
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
                  { name: "cache", sig: "BlazeAxiosCacheLike", desc: isCurrent
                    ? "The cache backing the adapter — required. Anything with get/set fits; each record carries its own freshUntil deadline, and an optional delete() drops one the adapter finds expired."
                    : "The cache backing the adapter — required. Anything with get/set fits, so a real Blaze Cache in production or a stub in tests." },
                  { name: "ttlMs", sig: "number | (response, config) => number", desc: isCurrent
                    ? "Freshness window in ms. Default 60_000; a response Cache-Control: max-age overrides it, minus the response's Age. A value <= 0 means don't store."
                    : "Freshness window in ms. Default 60_000; a response Cache-Control: max-age overrides it. A value <= 0 means don't store." },
                  { name: "key", sig: "(config) => string", desc: isCurrent
                    ? "Builds the cache key from the final (post-interceptor) config — the URL axios will actually request, joined like buildFullPath and canonicalised. Default hashes method, URL, params and varyHeaders, keeping bearer tokens out of stored keys."
                    : "Builds the cache key from the final (post-interceptor) config. Default hashes method, URL, params and varyHeaders, keeping bearer tokens out of stored keys." },
                  { name: "shouldCache", sig: "(response, config) => boolean", desc: "Decides what gets stored. Default: GET answering 2xx without no-store / no-cache. Rejected responses still return — just marked MISS." },
                  { name: "tags", sig: "(response, config) => string[]", desc: "Tags attached to stored responses. Default ['axios', '<METHOD> <url>'] — drop them together with cache.invalidateTags()." },
                  { name: "varyHeaders", sig: "string[]", desc: isCurrent
                    ? "Request headers hashed into the key — and the whitelist the response's Vary is checked against: Vary: * is never stored, and one varying on a header outside this list is left uncached. Default ['Authorization'] so a personalised response never crosses users. Values are hashed, never stored."
                    : "Request headers hashed into the key. Default ['Authorization'] so a personalised response never crosses users. Values are hashed, never stored." },
                  { name: "markerHeader", sig: "string | false", desc: "Response header written as HIT / MISS. Default 'x-blaze-cache'; pass false to turn the marker off." },
                  { name: "adapter", sig: "AxiosAdapter | AxiosAdapter[] | string[]", desc: "Adapter performing the real network call. installBlazeCache fills it in from the instance's defaults, so you rarely set it by hand." },
                ].map((o) => (
                  <div key={o.name} className="text-left rounded-xl border border-border bg-card px-4 py-3 shadow-sm hover:border-primary transition-colors group">
                    <div className="font-mono text-sm font-semibold text-foreground group-hover:text-foreground">{o.name}</div>
                    <div className="mt-0.5 font-mono text-xs text-muted-foreground wrap-break-word">{o.sig}</div>
                    <div className="mt-2 text-xs text-muted-foreground leading-relaxed">{o.desc}</div>
                  </div>
                ))}
              </div>
            </section>

            <Separator className="my-16 bg-border" />

            <>
                <section id="fetch" className="mb-20 scroll-mt-28">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-flame shadow-lg shadow-[#8a1e2e]/10"><Globe size={20} /></div>
                    <h3 className="text-3xl font-bold font-mono tracking-tight">Fetch Adapter</h3>
                  </div>
                  <p className="text-muted-foreground mb-6 max-w-3xl">
                    <code className="text-flame">createBlazeFetch(cache, options?) → typeof fetch</code>{" "}
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
                  {isCurrent && (
                    <p className="text-muted-foreground mb-6 max-w-3xl">
                      This cycle closed four edge cases: status <code>101</code> never lands in
                      the null-body set, an in-flight joiner honours its own{" "}
                      <code>AbortSignal</code> instead of waiting for the leader, a caller's abort
                      stays out of the background revalidate (a stale refresh keeps running for
                      everyone else), and malformed <code>Cache-Control</code> directives are
                      ignored rather than read as zero.
                    </p>
                  )}
                  {has040 && (
                    <p className="text-muted-foreground mb-6 max-w-3xl">
                      Per-request overrides land here too: <code>forceRefresh</code> (or the
                      standard <code>cache: 'reload'</code>) skips the read and rewrites the entry,
                      so the next request is a HIT again, and <code>blazeCache</code> on the init —{" "}
                      <code>false</code> to bypass, or{" "}
                      <code>&#123; enabled, ttlMs, tags, key, varyHeaders, forceRefresh, invalidateTags &#125;</code>{" "}
                      — tunes a single call. A mutation can purge its tags straight from the
                      request, and <code>invalidateCacheTags()</code> exports the same helper the
                      axios adapter has.
                    </p>
                  )}

                  <div className="grid grid-cols-1 gap-6">
                    <Card className="border-border bg-card overflow-hidden">
                      <CardHeader className="border-b border-border">
                        <code className="font-mono text-sm text-flame">first call → MISS, second → HIT</code>
                      </CardHeader>
                      <CardContent className="pt-6 relative">
                        <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm font-mono leading-7 border border-border text-foreground"><code>{`import { createBlazeFetch } from '@blaze-cache/fetch';

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
                    <Card className="border-border bg-card overflow-hidden">
                      <CardHeader className="border-b border-border">
                        <code className="font-mono text-sm text-flame">assignable to typeof fetch</code>
                      </CardHeader>
                      <CardContent className="pt-6 relative">
                        <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm font-mono leading-7 border border-border text-foreground"><code>{`const asFetch: typeof fetch = cachedFetch;
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
                      <div key={o.name} className="text-left rounded-xl border border-border bg-card px-4 py-3 shadow-sm hover:border-primary transition-colors group">
                        <div className="font-mono text-sm font-semibold text-foreground group-hover:text-foreground">{o.name}</div>
                        <div className="mt-0.5 font-mono text-xs text-muted-foreground wrap-break-word">{o.sig}</div>
                        <div className="mt-2 text-xs text-muted-foreground leading-relaxed">{o.desc}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { marker: "MISS", cls: "border-border text-muted-foreground", desc: "Came from the network." },
                      { marker: "HIT", cls: "border-emerald-600/60 text-emerald-700 dark:text-emerald-300", desc: "Served from the cache while still fresh." },
                      { marker: "STALE", cls: "border-amber-600/60 text-amber-700 dark:text-amber-300", desc: "Served past freshness with stale-while-revalidate on — a refresh is already running, so the next request is a HIT." },
                    ].map((m) => (
                      <div key={m.marker} className={`rounded-xl border bg-card px-4 py-3 ${m.cls}`}>
                        <div className="font-mono text-sm font-bold tracking-wide">x-blaze-cache: {m.marker}</div>
                        <div className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{m.desc}</div>
                      </div>
                    ))}
                  </div>
                </section>

                {isCurrent && (
                  <>
                <section id="ky" className="mb-20 scroll-mt-28">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-flame shadow-lg shadow-[#8a1e2e]/10"><Wind size={20} /></div>
                    <h3 className="text-3xl font-bold font-mono tracking-tight">Ky Adapter</h3>
                    {!has040 && <Badge className="text-xs px-2 py-0.5">New in {newIn}</Badge>}
                  </div>
                  <p className="text-muted-foreground mb-6 max-w-3xl">
                    The <code className="text-flame">@blaze-cache/ky</code> package caches ky
                    requests through two hooks: one answers from the cache by returning a real{" "}
                    <code>Response</code> — ky skips the network entirely — and one stores the
                    response worth keeping. Works on <strong className="text-foreground">ky v1
                    and v2</strong>, whose hook signatures differ: the hooks recognise whichever
                    shape they are called with, from one implementation.
                  </p>

                  <div className="grid grid-cols-1 gap-6">
                    <Card className="border-border bg-card overflow-hidden">
                      <CardHeader className="border-b border-border">
                        <code className="font-mono text-sm text-flame">blazeKyHook(cache, options) → hooks</code>
                      </CardHeader>
                      <CardContent className="pt-6 relative">
                        <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm font-mono leading-7 border border-border text-foreground"><code>{`import ky from 'ky';
import { blazeKyHook } from '@blaze-cache/ky';
import { createCache } from '@blaze-cache/core';

const cache = await createCache({ capacity: 1000 });

const api = ky.extend({
  hooks: {
    ...blazeKyHook(cache, { ttlMs: 30_000, tags: (res, req) => ['api'] }),
  },
});

const res = await api.get('https://api.example.com/users');
res.headers.get('x-blaze-cache'); // 'MISS'

const again = await api.get('https://api.example.com/users');
again.headers.get('x-blaze-cache'); // 'HIT'`}</code></pre><CopyButton text={`import ky from 'ky';
import { blazeKyHook } from '@blaze-cache/ky';
import { createCache } from '@blaze-cache/core';

const cache = await createCache({ capacity: 1000 });

const api = ky.extend({
  hooks: {
    ...blazeKyHook(cache, { ttlMs: 30_000, tags: (res, req) => ['api'] }),
  },
});

const res = await api.get('https://api.example.com/users');
res.headers.get('x-blaze-cache'); // 'MISS'

const again = await api.get('https://api.example.com/users');
again.headers.get('x-blaze-cache'); // 'HIT'`} />
                      </CardContent>
                    </Card>
                    <Card className="border-border bg-card overflow-hidden">
                      <CardHeader className="border-b border-border">
                        <code className="font-mono text-sm text-flame">createBlazeKy(cache, options) → ky instance</code>
                      </CardHeader>
                      <CardContent className="pt-6 relative">
                        <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm font-mono leading-7 border border-border text-foreground"><code>{`import { createBlazeKy } from '@blaze-cache/ky';

const api = createBlazeKy(cache, {
  prefixUrl: 'https://api.example.com', // ky v1; ky v2 spells this baseUrl
  ttlMs: 30_000,
});

const users = await api.get('users').json();`}</code></pre><CopyButton text={`import { createBlazeKy } from '@blaze-cache/ky';

const api = createBlazeKy(cache, {
  prefixUrl: 'https://api.example.com', // ky v1; ky v2 spells this baseUrl
  ttlMs: 30_000,
});

const users = await api.get('users').json();`} />
                      </CardContent>
                    </Card>
                  </div>

                  <p className="mt-6 text-muted-foreground max-w-3xl">
                    Your own hooks keep working — <code>ky.extend</code> appends, so your{" "}
                    <code>beforeRequest</code> hooks run before the cache (any header they set
                    is folded into the key) and your <code>afterResponse</code> hooks run before
                    the response is stored. A hit is a real <code>Response</code> — status,
                    headers, body and redirect state replayed exactly — and never re-stores
                    itself, so reads leave the entry's TTL where it was.
                  </p>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { name: "ttlMs", sig: "number | (response, request) => number", desc: "Freshness window in ms. Default 60_000; a response Cache-Control: max-age overrides it, minus its Age." },
                      { name: "methods", sig: "string[]", desc: "Methods eligible for caching. Default ['GET'] — pass ['GET', 'HEAD'] to include HEAD. Anything else always hits the network." },
                      { name: "cacheControl", sig: "boolean", desc: "Honour Cache-Control on both sides: request no-store / no-cache / max-age=0 skip the read, response max-age sets the TTL and no-store / no-cache stop it being stored. Malformed directives are ignored rather than read as zero. Default true." },
                      { name: "key", sig: "(request) => string", desc: "Builds the cache key. Default is method + URL + a hash of varyHeaders; defaultCacheKey is exported if you want to build on it." },
                      { name: "shouldCache", sig: "(response, request) => boolean", desc: "Decides what gets stored. Default: 2xx only. A cached non-2xx still throws ky's HTTPError on replay exactly like the network one." },
                      { name: "tags", sig: "(response, request) => string[]", desc: "Tags on stored responses. Default ['ky', '<method> <url>'] — the same per-resource spelling fetch and axios use, so shared caches invalidate together." },
                      { name: "varyHeaders", sig: "string[]", desc: "Request headers folded into the default key — and the whitelist the response's Vary is checked against: Vary: * is never stored, and one varying outside the list is left uncached. Default ['authorization']." },
                      { name: "markerHeader", sig: "string | false", desc: "Header written as HIT / MISS. Default 'x-blaze-cache'; pass false to disable the marker." },
                    ].map((o) => (
                      <div key={o.name} className="text-left rounded-xl border border-border bg-card px-4 py-3 shadow-sm hover:border-primary transition-colors group">
                        <div className="font-mono text-sm font-semibold text-foreground group-hover:text-foreground">{o.name}</div>
                        <div className="mt-0.5 font-mono text-xs text-muted-foreground wrap-break-word">{o.sig}</div>
                        <div className="mt-2 text-xs text-muted-foreground leading-relaxed">{o.desc}</div>
                      </div>
                    ))}
                  </div>

                  {isCurrent && (
                    <p className="mt-6 text-muted-foreground max-w-3xl">
                      New in this cycle alongside the package itself: status <code>101</code>{" "}
                      never lands in the null-body set, and malformed{" "}
                      <code>Cache-Control</code> directives are ignored rather than read as zero
                      — the same parser <code>@blaze-cache/fetch</code> uses.
                    </p>
                  )}
                </section>

                  </>
                )}

                {has040 && (
                  <section id="ofetch" className="mb-20 scroll-mt-28">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-flame shadow-lg shadow-[#8a1e2e]/10"><Wind size={20} /></div>
                      <h3 className="text-3xl font-bold font-mono tracking-tight">Ofetch Adapter</h3>
                      <Badge className="text-xs px-2 py-0.5">New in {newIn}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-6 max-w-3xl">
                      The <code className="text-flame">@blaze-cache/ofetch</code> package brings the
                      same cache to ofetch / <code>$fetch</code> — the HTTP client behind Nuxt and
                      Nitro. Wrap an instance you already have, or create one from scratch with
                      ofetch defaults and cache options in a single bag; every eligible response is
                      stored in the same cache and replayed from it.
                    </p>

                    <div className="grid grid-cols-1 gap-6">
                      <Card className="border-border bg-card overflow-hidden">
                        <CardHeader className="border-b border-border">
                          <code className="font-mono text-sm text-flame">blazeOfetch(instance, cache, options) → cached $fetch</code>
                        </CardHeader>
                        <CardContent className="pt-6 relative">
                          <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm font-mono leading-7 border border-border text-foreground"><code>{ofetchWrapExample}</code></pre><CopyButton text={ofetchWrapExample} />
                        </CardContent>
                      </Card>
                      <Card className="border-border bg-card overflow-hidden">
                        <CardHeader className="border-b border-border">
                          <code className="font-mono text-sm text-flame">createBlazeOfetch(cache, options) → one bag, split apart</code>
                        </CardHeader>
                        <CardContent className="pt-6 relative">
                          <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm font-mono leading-7 border border-border text-foreground"><code>{ofetchCreateExample}</code></pre><CopyButton text={ofetchCreateExample} />
                        </CardContent>
                      </Card>
                    </div>

                    <p className="mt-6 text-muted-foreground max-w-3xl">
                      The wrapped instance keeps ofetch's full API — call it directly for parsed
                      data, <code>.raw()</code> for the <code>FetchResponse</code> carrying the{" "}
                      <code>x-blaze-cache</code> marker, <code>.native</code> for the underlying
                      fetch, and <code>.create()</code> for derived instances, whose defaults apply
                      to both the request and the cache key. <code>Cache-Control</code> is honoured
                      on both sides when <code>cacheControl</code> is on, and <code>Vary</code> is
                      always honoured. There is no stale-while-revalidate here — for SWR with an{" "}
                      <code>STALE</code> marker, use <code className="text-flame">@blaze-cache/fetch</code>.
                    </p>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { name: "ttlMs", sig: "number | (response, ctx) => number", desc: "Freshness window in ms. Default 60_000; a response Cache-Control: max-age overrides it, minus its Age. <= 0 means don't store." },
                        { name: "methods", sig: "string[]", desc: "Methods eligible for caching. Default ['GET'] — pass ['GET', 'HEAD'] to include HEAD. Anything else always hits the network." },
                        { name: "cacheControl", sig: "boolean", desc: "Honour Cache-Control on both sides: request no-store skips read and write, no-cache / max-age=0 skip the read, response max-age sets the TTL and no-store / no-cache stop it being stored. Vary is always honoured. Default true." },
                        { name: "key", sig: "(ctx) => string", desc: "Builds the cache key from the resolved request identity. Default is '<method> <url>' plus a hash of varyHeaders and the request body — defaultCacheKey, exported for building on." },
                        { name: "shouldCache", sig: "(response, ctx) => boolean", desc: "Decides what gets stored. Default: 2xx only. A callback that throws is treated as a rejection after one console warning — a cache failure never fails a response." },
                        { name: "tags", sig: "(response, ctx) => string[]", desc: "Tags on stored responses. Default ['ofetch', '<method> <url>'] — invalidateTags('ofetch') drops them all at once, the second drops one resource." },
                        { name: "varyHeaders", sig: "string[]", desc: "Request headers folded into the key — and the whitelist the response's Vary is checked against: Vary: * is never stored, and one varying outside the list is left uncached. Default ['authorization']." },
                        { name: "markerHeader", sig: "string | false", desc: "Header written as HIT / MISS on replayed responses. Default 'x-blaze-cache'; pass false to disable the marker." },
                      ].map((o) => (
                        <div key={o.name} className="text-left rounded-xl border border-border bg-card px-4 py-3 shadow-sm hover:border-primary transition-colors group">
                          <div className="font-mono text-sm font-semibold text-foreground group-hover:text-foreground">{o.name}</div>
                          <div className="mt-0.5 font-mono text-xs text-muted-foreground wrap-break-word">{o.sig}</div>
                          <div className="mt-2 text-xs text-muted-foreground leading-relaxed">{o.desc}</div>
                        </div>
                      ))}
                    </div>

                    <p className="mt-6 text-muted-foreground max-w-3xl">
                      Two fixes landed alongside the package: defaults passed to{" "}
                      <code>ofetch.create()</code> now apply to both the request and the cache key
                      — an instance's own <code>baseURL</code>, hidden in a closure, is learned
                      from the first response instead of being invisible to the key — and two
                      different origins can no longer share one cache entry.
                    </p>
                  </section>
                )}

                <Separator className="my-16 bg-border" />
              </>

            {/* React Query */}
            <section id="rq" className="mb-20 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-flame shadow-lg shadow-[#8a1e2e]/10"><BookOpen size={20} /></div>
                <h3 className="text-3xl font-bold font-mono tracking-tight">React Query</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="border-border bg-card">
                  <CardHeader><CardTitle>createBlazeQueryClient</CardTitle><CardDescription>Create a QueryClient that mirrors every query.</CardDescription></CardHeader>
                  <CardContent className="relative"><pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-code p-3 text-xs font-mono border border-border">const client = createBlazeQueryClient(&#123; cache &#125;)</pre><CopyButton text="const client = createBlazeQueryClient({ cache })" /></CardContent>
                </Card>
                <Card className="border-border bg-card">
                  <CardHeader><CardTitle>useBlazeQuery</CardTitle><CardDescription>Starts from Blaze Cache with original dataUpdatedAt.</CardDescription></CardHeader>
                  <CardContent className="relative"><pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-code p-3 text-xs font-mono border border-border">const data = useBlazeQuery(cache, &#123; ...options &#125;)</pre><CopyButton text="const data = useBlazeQuery(cache, { ...options })" /></CardContent>
                </Card>
                <Card className="border-border bg-card">
                  <CardHeader><CardTitle>syncBlazeQueryCache</CardTitle><CardDescription>Manual event subscription.</CardDescription></CardHeader>
                  <CardContent className="relative"><pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-code p-3 text-xs font-mono border border-border">const unsub = syncBlazeQueryCache(client, &#123; cache &#125;)</pre><CopyButton text="const unsub = syncBlazeQueryCache(client, { cache })" /></CardContent>
                </Card>
                <Card className="border-border bg-card">
                  <CardHeader><CardTitle>useBlazeInfiniteQuery</CardTitle><CardDescription>Infinite scroll that seeds from the mirror.</CardDescription></CardHeader>
                  <CardContent className="relative"><pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-code p-3 text-xs font-mono border border-border"><code>{`const { data } = useBlazeInfiniteQuery(cache, { queryKey: ['posts'], queryFn })`}</code></pre><CopyButton text={`const { data } = useBlazeInfiniteQuery(cache, { queryKey: ['posts'], queryFn })`} /></CardContent>
                </Card>
                <Card className="border-border bg-card">
                  <CardHeader><CardTitle>useBlazeMutation</CardTitle><CardDescription>Invalidates both caches after a successful mutation.</CardDescription></CardHeader>
                  <CardContent className="relative"><pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-code p-3 text-xs font-mono border border-border"><code>{`const mutation = useBlazeMutation(cache, { mutationFn })`}</code></pre><CopyButton text={`const mutation = useBlazeMutation(cache, { mutationFn })`} /></CardContent>
                </Card>
                <Card className="border-border bg-card">
                  <CardHeader><CardTitle>useBlazeQueries</CardTitle><CardDescription>Batch of queries, all painting from the mirror.</CardDescription></CardHeader>
                  <CardContent className="relative"><pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-code p-3 text-xs font-mono border border-border"><code>{`const results = useBlazeQueries(cache, [{ queryKey, queryFn }])`}</code></pre><CopyButton text={`const results = useBlazeQueries(cache, [{ queryKey, queryFn }])`} /></CardContent>
                </Card>
                <Card className="border-border bg-card">
                  <CardHeader><CardTitle>prefetchBlazeQuery</CardTitle><CardDescription>Imperative prefetch that writes to the mirror.</CardDescription></CardHeader>
                  <CardContent className="relative"><pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-code p-3 text-xs font-mono border border-border"><code>{`await prefetchBlazeQuery(queryClient, { queryKey, queryFn })`}</code></pre><CopyButton text={`await prefetchBlazeQuery(queryClient, { queryKey, queryFn })`} /></CardContent>
                </Card>
                <Card className="border-border bg-card">
                  <CardHeader><CardTitle>dehydrate / hydrate</CardTitle><CardDescription>Persistence round trip for SSR / reload.</CardDescription></CardHeader>
                  <CardContent className="relative"><pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-code p-3 text-xs font-mono border border-border">const state = dehydrateBlazeQueryClient(queryClient); hydrateBlazeQueryClient(queryClient, state);</pre><CopyButton text="const state = dehydrateBlazeQueryClient(queryClient); hydrateBlazeQueryClient(queryClient, state);" /></CardContent>
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
                  {isCurrent && (
                    <p className="mt-6 max-w-3xl text-muted-foreground">
                      This cycle tightened the mirror's isolation: <code>removeQueries</code>{" "}
                      and <code>clear</code> delete only mirror records — never a shared
                      neighbour's entry — a refetch keeps the helper's tags and{" "}
                      <code>ttl</code> instead of overwriting them, and non-infinite data is
                      never seeded into the infinite mirror.
                    </p>
                  )}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { name: "Mirror persistence", desc: "Only explicit removeQueries / clear deletes the persisted copy — unobserved past gcTime still paints instantly." },
                      { name: "Custom queryKeyHashFn", desc: "Resolved on both sides so your custom key matches the stored record exactly." },
                      { name: "initialData preserved", desc: "Caller-supplied initialData is never overwritten by the mirror." },
                      { name: "peek() reads", desc: "Render-time lookups go through peek() so StrictMode cannot shift hit/miss counts." },
                    ].map((f) => (
                      <div key={f.name} className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm hover:border-primary transition-colors">
                        <div className="font-mono text-sm font-semibold text-foreground">{f.name}</div>
                        <div className="mt-2 text-xs text-muted-foreground leading-relaxed">{f.desc}</div>
                      </div>
                    ))}
                  </div>
            </section>

            {/* SWR */}
            <section id="swr" className="mb-20 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-flame shadow-lg shadow-[#8a1e2e]/10"><Component size={20} /></div>
                <h3 className="text-3xl font-bold font-mono tracking-tight">SWR</h3>
              </div>
              <p className="text-muted-foreground mb-6 max-w-3xl">
                The <code className="text-flame">@blaze-cache/swr</code> package gives SWR the same persistent backing that the other adapters get — a first render from the Blaze Cache, followed by a background revalidate that writes back with TTL and tags.
              </p>
              {isCurrent && (
                <p className="text-muted-foreground mb-6 max-w-3xl">
                  Per-call stamps win: a <code>ttlMs</code> or <code>tags</code> passed at the
                  call site now beats the provider config instead of losing to it — the options
                  you pass are the ones that stick.
                </p>
              )}
              {has040 && (
                <p className="text-muted-foreground mb-6 max-w-3xl">
                  New in {newIn}: a call-site <code>forceRefresh</code> skips the persisted
                  seed but keeps the write, so the next mount starts from it — pull-to-refresh
                  without going stale; <code>tags</code> accepts a resolver run at write time from
                  the key and data; a cache that throws costs a console warning instead of a
                  broken hook; and <code>invalidateBlazeSWR(cache, ...tags)</code> purges only this
                  package's envelopes — a neighbour integration's entry wearing the same tag
                  survives.
                </p>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="border-border bg-card">
                  <CardHeader><CardTitle>useBlazeSWR</CardTitle><CardDescription>Hook that paints instantly from Blaze Cache.</CardDescription></CardHeader>
                  <CardContent className="relative"><pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-code p-3 text-xs font-mono border border-border"><code>{`const { data } = useBlazeSWR(cache, '/api/users', fetcher, { ttlMs: 60_000, tags: ['users'] })`}</code></pre><CopyButton text={`const { data } = useBlazeSWR(cache, '/api/users', fetcher, { ttlMs: 60_000, tags: ['users'] })`} /></CardContent>
                </Card>
                <Card className="border-border bg-card">
                  <CardHeader><CardTitle>blazeSWRMiddleware</CardTitle><CardDescription>Wires the same behaviour into SWRConfig.</CardDescription></CardHeader>
                  <CardContent className="relative"><pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-code p-3 text-xs font-mono border border-border"><code>{`SWRConfig value={{ provider: () => new Map(), use: [blazeSWRMiddleware({ cache })] }}`}</code></pre><CopyButton text={`SWRConfig value={{ provider: () => new Map(), use: [blazeSWRMiddleware({ cache })] }}`} /></CardContent>
                </Card>
                <Card className="border-border bg-card">
                  <CardHeader><CardTitle>resolveBlazeKey</CardTitle><CardDescription>Imperative key for direct cache reads.</CardDescription></CardHeader>
                  <CardContent className="relative"><pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-code p-3 text-xs font-mono border border-border"><code>{`cache.get(resolveBlazeKey('/api/users'))`}</code></pre><CopyButton text={`cache.get(resolveBlazeKey('/api/users'))`} /></CardContent>
                </Card>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { name: "ttlMs", sig: "number", desc: "Freshness in ms. Default 60_000; a revalidated response writes back with its own TTL." },
                  { name: "tags", sig: "string[]", desc: "Tags on stored responses. Default ['swr', '<key>'] — drop with cache.invalidateTags()." },
                  { name: "staleWhileRevalidate", sig: "boolean | number", desc: "Serve past freshness while a background refresh runs, just like the fetch adapter." },
                  { name: "seed", sig: "(key, data) => void", desc: "Optional seed that writes a persistent record without fetching — useful for SSR or hydrated data." },
                ].map((o) => (
                  <div key={o.name} className="text-left rounded-xl border border-border bg-card px-4 py-3 shadow-sm hover:border-primary transition-colors group">
                    <div className="font-mono text-sm font-semibold text-foreground group-hover:text-foreground">{o.name}</div>
                    <div className="mt-0.5 font-mono text-xs text-muted-foreground wrap-break-word">{o.sig}</div>
                    <div className="mt-2 text-xs text-muted-foreground leading-relaxed">{o.desc}</div>
                  </div>
                ))}
              </div>
            </section>

            <Separator className="my-16 bg-border" />

            {/* Usage */}
            <section id="usage" className="mb-20 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-flame shadow-lg shadow-[#8a1e2e]/10"><Terminal size={20} /></div>
                <h3 className="text-3xl font-bold font-mono tracking-tight">Usage Examples</h3>
              </div>
              <div className="space-y-4">
                <Card className="border-border bg-card">
                  <CardHeader><CardTitle>Basic Cache Usage</CardTitle></CardHeader>
                  <CardContent className="relative">
                    <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm font-mono leading-7 border border-border text-foreground"><code>{`cache.set('user:42', { name: 'Ada' }, { ttlMs: 30_000, tags: ['user:42'] });
const user = cache.get('user:42');
cache.invalidateTags('user:42');`}</code></pre><CopyButton text="cache.set('user:42', { name: 'Ada' }, { ttlMs: 30_000, tags: ['user:42'] });
const user = cache.get('user:42');
cache.invalidateTags('user:42');" />
                  </CardContent>
                </Card>
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle>Event Listeners</CardTitle>
                    {isCurrent && <CardDescription>Typed per event — or one wildcard listener for all ten.</CardDescription>}
                  </CardHeader>
                  <CardContent className="relative">
                    <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm font-mono leading-7 border border-border text-foreground"><code>{isCurrent ? `cache.on('evict', ({ key, value }) => console.log('dropped', key, value));
cache.on((event) => console.log(event.type));   // wildcard — every event` : `const unsubscribe = cache.on((change) => {
  if (change.type === 'set') console.log('set:', change.key);
});`}</code></pre><CopyButton text={isCurrent ? `cache.on('evict', ({ key, value }) => console.log('dropped', key, value));
cache.on((event) => console.log(event.type));   // wildcard — every event` : `const unsubscribe = cache.on((change) => {
  if (change.type === 'set') console.log('set:', change.key);
});`} />
                  </CardContent>
                </Card>
                {has040 && (
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle>Value subscriptions</CardTitle>
                      <CardDescription>New in {newIn} — the value-oriented front end of events.</CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                      <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm font-mono leading-7 border border-border text-foreground"><code>{`const stop = cache.subscribe('user:42', (user, change) => {
  console.log(change.type, user);   // 'set' → new value, 'delete' → undefined
});

cache.set('user:42', { name: 'Ada' });
stop();                             // idempotent — safe from inside a listener`}</code></pre><CopyButton text={`const stop = cache.subscribe('user:42', (user, change) => {
  console.log(change.type, user);   // 'set' → new value, 'delete' → undefined
});

cache.set('user:42', { name: 'Ada' });
stop();                             // idempotent — safe from inside a listener`} />
                    </CardContent>
                  </Card>
                )}
                {isCurrent && (
                  <Card className="border-border bg-card">
                    <CardHeader><CardTitle>Introspection without side effects</CardTitle><CardDescription>New in the 0.3 line — none of these records a hit or a miss.</CardDescription></CardHeader>
                    <CardContent className="relative">
                      <pre className="overflow-x-auto rounded-lg bg-code p-4 text-sm font-mono leading-7 border border-border text-foreground"><code>{`cache.size();                                // entries present and unexpired
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

            <Separator className="my-16 bg-border" />

            {/* Architecture */}
            <section id="architecture" className="mb-20 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-flame shadow-lg shadow-[#8a1e2e]/10"><Flame size={20} /></div>
                <h3 className="text-3xl font-bold font-mono tracking-tight">Architecture</h3>
              </div>
              <p className="mb-6 max-w-3xl text-muted-foreground">
                One Rust engine behind every adapter — and everything around it is TypeScript.
                Adapters feed a single <code>createCache()</code> API whose reads and writes
                cross the wasm boundary once and stay synchronous; persistence is a debounced
                TypeScript layer <em className="text-foreground not-italic font-medium">over</em>{" "}
                IndexedDB, never inside the engine, which keeps no threads, no async and no
                I/O.
              </p>
              <ArchitectureDiagram has040={has040} />
            </section>

            <Separator className="my-16 bg-border" />

            {/* Problems Solved */}
            <section id="problems" className="mb-20 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-flame shadow-lg shadow-[#8a1e2e]/10"><ShieldCheck size={20} /></div>
                <h3 className="text-3xl font-bold font-mono tracking-tight">Problems Solved</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Unpredictable JS eviction", desc: "LRU and WeakRef heuristics create object churn and non-deterministic cache hits. SIEVE offers a scan-resistant, O(1)-amortised algorithm with a tiny footprint." },
                  { title: "Async overhead on hot path", desc: "Standard caches return Promises for reads after initialization. Blaze Cache instantiates Wasm once during createCache(), so every get/set is fully synchronous." },
                  { title: "No durable persistence", desc: has040
                    ? "Most browser caches are memory-only. The optional IndexedDB adapter hydrates before resolve, writes are debounced, and cache.persistence puts flush/clear/hydrate/stats/rotate at your fingertips — with session generations isolating one login from the next and a schema stamp keeping reads safe across versions."
                    : isCurrent
                    ? "Most browser caches are memory-only. The optional IndexedDB adapter hydrates before resolve, writes are debounced, flushes trigger on pagehide / visibilitychange, and a flush that fails re-queues its records instead of dropping them."
                    : "Most browser caches are memory-only. The optional IndexedDB adapter hydrates before resolve, writes are debounced, and flushes trigger on pagehide / visibilitychange." },
                  { title: "Missing tag invalidation", desc: "Bulk removal by tag is rare in JS caches. Blaze Cache assigns monotonic tag IDs and performs invalidation via set difference — no full scan required." },
                  ...(has040 ? [
                    { title: "Cross-session data bleed", desc: "After a logout/login, records restored from IndexedDB can belong to the previous account. Session generations keep each login in its own bucket — rotate() drops the old session's queued and in-flight writes instead of replaying them." },
                    { title: "Multi-tab write races", desc: "Two tabs can disagree about a key. Opt-in BroadcastChannel sync orders writes with a hybrid logical clock and a per-key version guard, so a hidden tab's stale flush can never overwrite a newer value; flushes are serialised with a Web Lock where available." },
                  ] : []),
                  { title: "Fragmented integrations", desc: has040
                    ? "Axios, fetch(), ky, ofetch, TanStack Query and SWR each need their own caching solution. Blaze provides a single core with first-class adapters for all of them, sharing the same persistence, subscriptions and stats model."
                    : isCurrent
                    ? "Axios, fetch(), ky, TanStack Query and SWR each need their own caching solution. Blaze provides a single core with first-class adapters for all of them, sharing the same persistence and stats model."
                    : "Axios, fetch(), TanStack Query and SWR each need their own caching solution. Blaze provides a single core with first-class adapters for all of them, sharing the same persistence and stats model." },
                  { title: "Bundler / asset complexity", desc: has040
                    ? "Many Wasm libraries require separate binary downloads or CDN configuration. The .wasm binary ships inside @blaze-cache/core and resolves relative to its own URL — or you can point at an explicit wasmUrl, a precompiled module, or your own instantiate() loader."
                    : "Many Wasm libraries require separate binary downloads or CDN configuration. The .wasm binary ships inside @blaze-cache/core; the package resolves it relative to its own URL." },
                ].map((p) => (
                  <Card key={p.title} className="border-border bg-card/60">
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-flame shadow-lg shadow-[#8a1e2e]/10"><Flame size={20} /></div>
                <h3 className="text-3xl font-bold font-mono tracking-tight">Philosophy</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-border bg-card">
                  <CardHeader><CardTitle>One core, many adapters</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">{has040
                    ? "A single Rust / Wasm engine powers all integrations. Whether using axios, fetch, ky, ofetch, TanStack Query or SWR, the same persistence, subscriptions, stats and eviction model applies."
                    : isCurrent
                    ? "A single Rust / Wasm engine powers all integrations. Whether using axios, fetch, ky, TanStack Query or SWR, the same persistence, stats and eviction model applies."
                    : "A single Rust / Wasm engine powers all integrations. Whether using axios, fetch, TanStack Query or SWR, the same persistence, stats and eviction model applies."}</p></CardContent>
                </Card>
                <Card className="border-border bg-card">
                  <CardHeader><CardTitle>Synchronous hot path</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">{has040
                    ? "After initialization, every read and write is fully synchronous — no Promises on the hot path. The Wasm module loads once (from the shipped binary, or a source you name); the rest is pure TypeScript."
                    : "After initialization, every read and write is fully synchronous — no Promises on the hot path. The Wasm module loads once; the rest is pure JS."}</p></CardContent>
                </Card>
                <Card className="border-border bg-card">
                  <CardHeader><CardTitle>Durable by default</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">{has040
                    ? "Optional IndexedDB persistence hydrates before the first get, writes are debounced, and a failed flush re-queues instead of losing data. cache.persistence puts flush/clear/hydrate/stats/rotate in reach, and session generations keep one login apart from the next."
                    : isCurrent
                    ? "Optional IndexedDB persistence hydrates before the first get, writes are debounced, and flush recoveries mean a failed flush never loses data."
                    : "Optional IndexedDB persistence hydrates before the first get, writes are debounced, and flushes trigger on pagehide / visibilitychange."}</p></CardContent>
                </Card>
                <Card className="border-border bg-card">
                  <CardHeader><CardTitle>Observable and typed</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">{has040
                    ? "Every mutation emits a typed event. Listeners can subscribe to one event with a precise payload or to all events at once — and subscribe()/subscribeMany()/subscribeTag() hand you the value itself, not just the change. Nothing blocks mutations."
                    : "Every mutation emits a typed event. Listeners can subscribe to one event with a precise payload, or to all events at once — and they never block mutations."}</p></CardContent>
                </Card>
              </div>
            </section>

            <Separator className="my-16 bg-border" />

            {/* Examples */}
            <section id="examples" className="mb-20 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-flame shadow-lg shadow-[#8a1e2e]/10"><PlayCircle size={20} /></div>
                <h3 className="text-3xl font-bold font-mono tracking-tight">Examples</h3>
              </div>
              <p className="mb-6 max-w-3xl text-muted-foreground">
                {isCurrent
                  ? "Every adapter has a runnable playground in the repo — a Vite + React app wired to the real cache, not a snippet. Each dev script builds the workspace first, then serves the example."
                  : "The archived 0.2 line shipped a single browser example. Build the workspace, then serve it."}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {release.examples.map(({ dir, cmd, note }) => (
                  <Card key={dir} className="border-border bg-card/60 flex flex-col">
                    <CardHeader>
                      <CardTitle className="font-mono text-base">{dir.replace("examples/", "")}</CardTitle>
                      <CardDescription>{note}</CardDescription>
                    </CardHeader>
                    <CardContent className="relative mt-auto">
                      <pre className="overflow-x-auto rounded-lg bg-code p-4 pr-16 text-sm font-mono leading-7 border border-border text-foreground"><code>{cmd}</code></pre>
                      <CopyButton text={cmd} />
                      <a
                        href={`https://github.com/blaze-cache/blaze-cache/tree/main/${dir}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-flame hover:underline"
                      >
                        View source <ExternalLink size={12} />
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <Separator className="my-16 bg-border" />

            {/* Repo & Development */}
            <section id="repo" className="mb-20 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-flame shadow-lg shadow-[#8a1e2e]/10"><BookOpen size={20} /></div>
                <h3 className="text-3xl font-bold font-mono tracking-tight">Repo & Development</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle>Repository</CardTitle>
                    <CardDescription>Public MIT-licensed monorepo at github.com/blaze-cache/blaze-cache</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p><strong className="text-foreground">Description:</strong> A full-featured client-side cache for the browser: TTL, tags, SIEVE eviction, and IndexedDB persistence, powered by Rust and WebAssembly.</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{release.badge}</Badge>
                      <Badge variant="outline">MIT</Badge>
                      <Badge variant="outline">ESM</Badge>
                      <Badge variant="outline">Browser</Badge>
                    </div>
                    <p><strong className="text-foreground">Stars / Watch / Forks:</strong> 3 stars, 1 watching, 1 fork, 0 open issues.</p>
                    <p><strong className="text-foreground">Docs:</strong> this site, at blaze-cache.github.io/docs — three routes, one per release line.</p>
                    <a href="https://github.com/blaze-cache/blaze-cache" target="_blank" rel="noreferrer" className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-[#a0283a]">View on GitHub</a>
                  </CardContent>
                </Card>
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle>Development Commands</CardTitle>
                    <CardDescription>Workspace commands using pnpm</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <table className="w-full text-sm text-muted-foreground">
                      <tbody className="divide-y divide-border">
                        {release.commands.map(({ cmd, note }) => (
                          <tr key={cmd}>
                            <td className="py-1.5 pr-4 font-mono text-xs text-foreground whitespace-nowrap">{cmd}</td>
                            <td className="py-1.5 text-right text-xs">{note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6 border-border bg-card/60">
                <CardHeader>
                  <CardTitle>Continuous integration</CardTitle>
                  <CardDescription>Three workflows gate every push — offline first, live on a schedule.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  {[
                    { wf: "rust.yml", desc: "cargo fmt, clippy -D warnings and the full test workspace on every push and PR." },
                    { wf: "js.yml", desc: "The offline suites gate every push and PR; the live suites against real public APIs run nightly and on demand, so a third-party outage can't fail an unrelated PR." },
                    { wf: "security.yml", desc: "gitleaks over the full history, pnpm audit and cargo audit — binaries pinned by sha256, third-party actions by commit SHA, Dependabot re-pinning weekly." },
                  ].map((w) => (
                    <p key={w.wf}><code className="font-mono text-xs text-flame">{w.wf}</code> — {w.desc}</p>
                  ))}
                </CardContent>
              </Card>

              <Card className="mt-6 border-border bg-card/60">
                <CardHeader><CardTitle>Repository Layout</CardTitle></CardHeader>
                <CardContent>
                  <pre className="overflow-x-auto rounded-lg bg-code p-4 text-xs font-mono border border-border text-foreground"><code>{release.layout}</code></pre>
                </CardContent>
              </Card>

              <Card className="mt-6 border-border bg-card/60">
                <CardHeader><CardTitle>Why Wasm</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground leading-7">
                  <p><strong className="text-foreground">Predictable eviction.</strong> SIEVE is scan-resistant, O(1)-amortised with a tiny footprint — no JS object churn, no WeakRef heuristics.</p>
                  <p><strong className="text-foreground">Real data structures.</strong> Slab allocator plus hash index means lookups are a single map hit; entries are nodes in a queue rather than scattered objects.</p>
                  <p><strong className="text-foreground">Tested core.</strong> Eviction, TTL and tag logic is unit-tested in Rust (<code>cargo test --workspace</code>), independent of any browser or bundler.</p>
                </CardContent>
              </Card>
            </section>

            {/* Footer */}
            <footer className="mt-20 border-t border-border pt-10 text-sm text-muted-foreground">
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
