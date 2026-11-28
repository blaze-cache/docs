/**
 * One entry per published release of the library.
 */
export type ReleaseId = "stable" | "previous" | "legacy" | "beta";
export interface NavItem { id: string; label: string; }
export interface MethodInfo { name: string; sig: string; desc: string; isNew?: boolean; }
export interface CommandInfo { cmd: string; note: string; }
export interface ExampleInfo { dir: string; cmd: string; note: string; }
export interface PackageCard { pkg: string; note: string; peers: string; }
export interface WhatsNewItem { kind: string; title: string; desc: string; href: string; more: string; commits: string[]; }
export interface Release {
  id: ReleaseId; version: string; badge: string; legacy: boolean; prerelease: boolean; installTag: string;
  /** Marks the newest stable line in the header and version switcher. */
  isNew: boolean;
  metaDescription: string;
  /** Automated test totals for this release, shown in the Overview hero. */
  tests: { total: number; detail: string };
  packages: PackageCard[]; quickStart: string[]; whatsNew: WhatsNewItem[]; nav: NavItem[];
  coreMethods: MethodInfo[]; commands: CommandInfo[]; examples: ExampleInfo[]; layout: string;
}

/** Sidebar nav for the current release — every section the page renders is reachable. */
const NAV_CURRENT: NavItem[] = [
  { id: "overview", label: "Overview" },
  { id: "whatsnew", label: "What's New" },
  { id: "install", label: "Installation" },
  { id: "core", label: "Core & Events" },
  { id: "axios", label: "Axios" },
  { id: "fetch", label: "Fetch" },
  { id: "ky", label: "Ky" },
  { id: "rq", label: "React Query" },
  { id: "swr", label: "SWR" },
  { id: "usage", label: "Usage" },
  { id: "architecture", label: "Architecture" },
  { id: "problems", label: "Problems Solved" },
  { id: "philosophy", label: "Philosophy" },
  { id: "examples", label: "Examples" },
  { id: "repo", label: "Repo" },
];

/** The archived 0.2.5 nav excludes sections that release never shipped (the Ky adapter). */
const NAV_LEGACY: NavItem[] = NAV_CURRENT.filter((n) => n.id !== "ky");

/**
 * The 0.4.0 stable nav inserts everything the 0.4 line added — persistence, wasm loading,
 * storage/memory modes, multi-tab sync and benchmarks after the core material, plus the
 * ofetch adapter with the other adapters — and keeps every section the previous line had.
 */
const NAV_040: NavItem[] = [
  ...NAV_CURRENT.slice(0, 4), // overview … core (events render beneath it)
  { id: "persistence", label: "Persistence" },
  { id: "wasm", label: "Wasm Loading" },
  { id: "storage", label: "Storage & Memory" },
  { id: "multitab", label: "Multi-Tab" },
  { id: "benchmarks", label: "Benchmarks" },
  ...NAV_CURRENT.slice(4, 7), // axios, fetch, ky
  { id: "ofetch", label: "Ofetch" },
  ...NAV_CURRENT.slice(7), // react-query … repo
];

/** The 0.5 beta inserts its typed query section right after the core material. */
const NAV_BETA: NavItem[] = [
  ...NAV_040.slice(0, 4), // overview … core (events render beneath it)
  { id: "query", label: "Typed Query API" },
  { id: "devtools", label: "Devtools" },
  { id: "shared", label: "Shared Contract" },
  ...NAV_040.slice(4), // persistence … repo
];

const CORE_METHODS: MethodInfo[] = [
  { name: "get", sig: "(key: string) => V | undefined", desc: "Value stored under key, or undefined when missing/expired. Counts as hit/miss." },
  { name: "set", sig: "(key: string, value: V, options?: SetOptions) => void", desc: "Stores or replaces key. Replacing refreshes TTL and replaces tags." },
  { name: "delete", sig: "(key: string) => boolean", desc: "Removes key, returning whether it was there." },
  { name: "has", sig: "(key: string) => boolean", desc: "True when key is present and not expired." },
  { name: "entry", sig: "(key: string) => CacheEntry<V> | undefined", desc: "Live entry without touching statistics." },
  { name: "entries", sig: "() => CacheEntry<V>[]", desc: "Snapshot of every live entry." },
  { name: "keys", sig: "() => string[]", desc: "Live keys, oldest first." },
  { name: "keysWithTag", sig: "(tag: string) => string[]", desc: "Live keys carrying tag." },
  { name: "tagsOf", sig: "(key: string) => string[]", desc: "Tags attached to key." },
  { name: "hasTag", sig: "(key: string, tag: string) => boolean", desc: "True when key carries tag." },
  { name: "stats", sig: "() => CacheStats", desc: "Cumulative counters plus hitRate." },
  { name: "resetStats", sig: "() => void", desc: "Zeroes counters without touching entries." },
  { name: "clear", sig: "() => void", desc: "Empties the cache." },
  { name: "prune", sig: "() => string[]", desc: "Removes expired entries." },
  { name: "invalidateTags", sig: "(...tags: string[]) => string[]", desc: "Removes entries carrying any tag." },
  { name: "flush", sig: "() => Promise<void>", desc: "Writes pending changes." },
  { name: "dispose", sig: "() => Promise<void>", desc: "Flushes and frees wasm memory." },
  { name: "on", sig: "(listener: CacheListener) => () => void", desc: "Subscribes; returns unsubscribe." },
];

/** Reads and batch ops added in the 0.2 line — present in every current release. */
const INTROSPECTION: MethodInfo[] = [
  { name: "size", sig: "() => number", desc: "Stored entries that are present and unexpired.", isNew: true },
  { name: "capacity", sig: "() => number", desc: "The maximum number of entries.", isNew: true },
  { name: "peek", sig: "(key: string) => V | undefined", desc: "Same lookup as get() minus every side effect.", isNew: true },
  { name: "touch", sig: "(key: string, options?: TouchOptions) => boolean", desc: "Marks the entry used and renews TTL.", isNew: true },
  { name: "ttl", sig: "(key: string) => number | undefined", desc: "Milliseconds until it expires.", isNew: true },
  { name: "getMany", sig: "(keys: string[]) => (V | undefined)[]", desc: "Batch lookup in one crossing.", isNew: true },
  { name: "setMany", sig: "(entries: SetManyEntry<V>[]) => void", desc: "Batch store in one crossing.", isNew: true },
  { name: "hasMany", sig: "(keys: string[]) => boolean[]", desc: "One presence flag per key.", isNew: true },
  { name: "deleteMany", sig: "(keys: string[]) => boolean[]", desc: "Removes every listed key.", isNew: true },
  { name: "once", sig: "(type, listener) | (listener) => () => void", desc: "Exactly like on() but removes itself when fired.", isNew: true },
  { name: "off", sig: "(type?) | (listener?) => void", desc: "Removes listeners in bulk.", isNew: true },
];

/** Value-oriented subscriptions added in the 0.4 line. */
const SUBSCRIPTIONS: MethodInfo[] = [
  { name: "subscribe", sig: "(key, listener, options?) => () => void", desc: "Calls back with the current value whenever key changes — set/touch give the value, removals give undefined. Returns an idempotent stop.", isNew: true },
  { name: "subscribeMany", sig: "(keys, listener, options?) => () => void", desc: "One listener for several keys, told which one changed: (key, value, change). Duplicates collapse; an empty list attaches nothing.", isNew: true },
  { name: "subscribeTag", sig: "(tag, listener, options?) => () => void", desc: "Fires when any entry carrying the tag changes — delete, evict, expire, invalidate, prune and clear are attributed through a per-tag mirror.", isNew: true },
];

/** Opt-in memory modes added in 0.4 — by-reference values remain the default. */
const STORAGE_METHODS: MethodInfo[] = [
  { name: "setBytes", sig: "(key, view, options?) => void", desc: "Copies raw bytes once into a Wasm arena region, stored as (offset, length). Not available with storage: 'js'.", isNew: true },
  { name: "getBytes", sig: "(key) => Uint8Array | undefined", desc: "Zero-copy view onto the arena region — valid only until the next allocation or a memory.grow detaches it.", isNew: true },
  { name: "getBytesCopy", sig: "(key) => Uint8Array | undefined", desc: "Owned snapshot of the bytes — safe to retain beyond the next allocation.", isNew: true },
  { name: "setBytesReserved", sig: "(key, ptr, len, options?) => void", desc: "Advanced producer path: adopt a region you already wrote through wasmLinearMemory(), with no JS→Wasm copy.", isNew: true },
];

/** The typed query API added in the 0.5 line — opt-in indexes, cursor paging. */
const QUERY_METHODS: MethodInfo[] = [
  { name: "query", sig: "(filter: QueryOptions) => QueryResult<V>", desc: "Paged lookup by prefix, tags, TTL range or a key allow-list. `limit` is required; the `cursor` resumes after the last key and survives that key's deletion. Needs `indexes: true`, or an explicit `fullScan: true` opt-in — it never guesses an O(n) walk.", isNew: true },
  { name: "queryKeys", sig: "(filter: QueryOptions) => QueryKeysResult", desc: "The same filters as query(), returning only keys with a `nextCursor` — no values cross the boundary.", isNew: true },
  { name: "count", sig: "(filter?) => number", desc: "How many entries match, without paging: accepts every query filter except `limit` and `cursor`.", isNew: true },
];

/** The archived 0.2.5 line — the layout it actually shipped with (no ky yet). */
const LAYOUT_LEGACY = `crates/
  blaze-cache-core/
  blaze-cache-wasm/
packages/
  core/
  axios/
  fetch/
  react-query/
  swr/
  integration-tests/
examples/
  browser/`;

/** Annotated layout of the current monorepo. */
const LAYOUT = `crates/
  blaze-cache-core/    Rust engine: slab store, SIEVE queue, tags, TTL, stats
  blaze-cache-wasm/    wasm-bindgen bindings
packages/
  core/                @blaze-cache/core  (wasm loader, persistence, createCache)
  axios/               @blaze-cache/axios (HTTP adapter)
  fetch/               @blaze-cache/fetch (drop-in fetch() replacement)
  ky/                  @blaze-cache/ky (ky.extend hook, ky v1 + v2)
  react-query/         @blaze-cache/react-query (v5 mirror + hook)
  swr/                 @blaze-cache/swr (SWR persist + hook)
  integration-tests/   several packages sharing one cache
examples/              one Vite playground per package
benchmarks/cache/      pnpm bench — adapters vs React Query and SWR
.github/               rust.yml · js.yml (offline + nightly live) · security.yml`;

/** The 0.4.0 layout adds ofetch and the published benchmark workspaces. */
const LAYOUT_040 = `crates/
  blaze-cache-core/    Rust engine: slab, SIEVE queue, tags, TTL, stats, bytes arena
  blaze-cache-wasm/    wasm-bindgen bindings (raw keys, tagged writes)
packages/
  core/                @blaze-cache/core  (loader, persistence, storage modes, multi-tab)
  axios/               @blaze-cache/axios (HTTP adapter)
  fetch/               @blaze-cache/fetch (drop-in fetch() replacement)
  ky/                  @blaze-cache/ky (ky.extend hook, ky v1 + v2)
  ofetch/              @blaze-cache/ofetch (ofetch / $fetch adapter)
  react-query/         @blaze-cache/react-query (v5 mirror + hook)
  swr/                 @blaze-cache/swr (SWR persist + hook)
  integration-tests/   several packages sharing one cache
examples/              one Vite playground per package
benchmarks/
  cache/               pnpm bench — Node matrix, 10 scenarios × 5 payload sizes
  browser/             pnpm bench:browser — the same suite in headless Chrome
  framework/           TanStack Query / SWR cache-store comparison
  results/             published JSON + checked-in CI baseline
docs/                  benchmarks/RESULTS.md · plan/0.4.0-roadmap.md · security/
.github/               rust.yml · js.yml (offline + live + bench:ci) · security.yml`;

/** The 0.5.0-beta layout adds the devtools package and the query engine to the 0.4 tree. */
const LAYOUT_050 = `crates/
  blaze-cache-core/    Rust engine: slab, SIEVE queue, tags, TTL, stats, bytes arena, opt-in indexes
  blaze-cache-wasm/    wasm-bindgen bindings (raw keys, tagged writes, query bindings)
packages/
  core/                @blaze-cache/core  (loader, persistence, multi-tab, query, shared subpath)
  axios/               @blaze-cache/axios (HTTP adapter)
  fetch/               @blaze-cache/fetch (drop-in fetch() replacement)
  ky/                  @blaze-cache/ky (ky.extend hook, ky v1 + v2)
  ofetch/              @blaze-cache/ofetch (ofetch / $fetch adapter)
  react-query/         @blaze-cache/react-query (v5 mirror + hook)
  swr/                 @blaze-cache/swr (SWR persist + hook)
  devtools/            @blaze-cache/devtools (registry, snapshots, event feed)
  integration-tests/   several packages sharing one cache
examples/              one Vite playground per package
benchmarks/
  cache/               pnpm bench — Node matrix, 10 scenarios × 5 payload sizes
  browser/             pnpm bench:browser — the same suite in headless Chrome
  framework/           TanStack Query / SWR cache-store comparison
  results/             published JSON + checked-in CI baseline
docs/                  benchmarks/RESULTS.md · plan/0.5.0-roadmap.md · plan/0.6.0-roadmap.md · security/
.github/               rust.yml · js.yml (offline + live + bench:ci) · security.yml`;

/** Repo commands, with what each one runs — the current workspace's scripts. */
const COMMANDS_CURRENT: CommandInfo[] = [
  { cmd: "pnpm install", note: "workspace dependencies" },
  { cmd: "pnpm build", note: "wasm + every package, topological" },
  { cmd: "pnpm build:wasm", note: "wasm-pack only" },
  { cmd: "pnpm typecheck", note: "every package, against workspace sources" },
  { cmd: "pnpm test", note: "cargo test --workspace" },
  { cmd: "pnpm test:js", note: "every package suite, against the built dist/" },
  { cmd: "pnpm test:live", note: "opt-in live suites against real public APIs" },
  { cmd: "pnpm bench", note: "adapters vs React Query and SWR" },
  { cmd: "pnpm lint", note: "clippy -D warnings + rustfmt + tsc --noEmit" },
  { cmd: "pnpm clean", note: "remove build outputs" },
];

/** 0.4 adds the browser/framework benches and the same-runner A/B regression gate. */
const COMMANDS_040: CommandInfo[] = [
  ...COMMANDS_CURRENT.map((c) =>
    c.cmd === "pnpm bench" ? { cmd: c.cmd, note: "Node matrix: 10 scenarios × 5 payload sizes" } : c,
  ),
  { cmd: "pnpm bench:browser", note: "the same matrix in headless Chrome" },
  { cmd: "pnpm bench:framework", note: "TanStack Query / SWR cache stores" },
  { cmd: "pnpm bench:ci", note: "quick run + 20% regression gate" },
];

/** The 0.2 line's command set, as that release shipped it. */
const COMMANDS_LEGACY: CommandInfo[] = [
  { cmd: "pnpm install", note: "workspace dependencies" },
  { cmd: "pnpm build", note: "wasm + every package, topological" },
  { cmd: "pnpm build:wasm", note: "wasm-pack only" },
  { cmd: "pnpm test", note: "cargo test --workspace" },
  { cmd: "pnpm lint", note: "clippy + rustfmt + tsc" },
  { cmd: "pnpm dev", note: "build, then serve the example" },
  { cmd: "pnpm clean", note: "remove build outputs" },
];

/** One runnable Vite playground per adapter package — build once, then serve it. */
const EXAMPLES_CURRENT: ExampleInfo[] = [
  { dir: "examples/core", cmd: "pnpm dev:core", note: "Playground for @blaze-cache/core — set, get, tags, TTLs, events and IndexedDB persistence" },
  { dir: "examples/axios", cmd: "pnpm dev:axios", note: "axios responses cached by a WebAssembly cache" },
  { dir: "examples/fetch", cmd: "pnpm dev:fetch", note: "A drop-in fetch() backed by the cache" },
  { dir: "examples/ky", cmd: "pnpm dev:ky", note: "ky hooks backed by the cache" },
  { dir: "examples/react-query", cmd: "pnpm dev:react-query", note: "TanStack Query v5 mirrored into the cache" },
  { dir: "examples/swr", cmd: "pnpm dev:swr", note: "SWR seeded from and persisted into the cache" },
];

/** The 0.2 line shipped a single example app. */
const EXAMPLES_LEGACY: ExampleInfo[] = [
  { dir: "examples/browser", cmd: "pnpm dev", note: "The one browser example the 0.2 line shipped with" },
];

// The current stable release: published on npm as 0.4.0 under the `latest` dist-tag, so
// every install command below is untagged (`installTag` stays empty). It carries the whole
// 0.4 line: published benchmarks, opt-in memory modes, multi-tab sync and a final
// write-path tuning pass, on top of the persistence/adapters work first staged in beta.
const CURRENT_RELEASE: Release = {
  id: "stable", version: "0.4.0", badge: "v0.4.0", legacy: false, prerelease: false, isNew: true, installTag: "",
  metaDescription: "Blaze Cache 0.4.0: published Node and browser benchmarks, zero-copy bytes mode, opt-in JS-authoritative storage, multi-tab synchronization, hardened IndexedDB persistence, value subscriptions, and adapters for axios, fetch, ky, ofetch, React Query and SWR — powered by Rust and WebAssembly.",
  tests: { total: 600, detail: "479 package/integration · 27 benchmark-suite checks · 57 Rust engine · 5 allocation · 4 doctests · 28 wasm" },
  packages: [
    { pkg: "@blaze-cache/core", note: "Cache engine (Wasm + TS bindings)", peers: "None" },
    { pkg: "@blaze-cache/axios", note: "Axios HTTP adapter", peers: "axios >= 1.7.0" },
    { pkg: "@blaze-cache/fetch", note: "Drop-in fetch() with HTTP caching", peers: "None" },
    { pkg: "@blaze-cache/ky", note: "ky HTTP adapter (ky v1 & v2)", peers: "ky >= 1.14 || 2" },
    { pkg: "@blaze-cache/ofetch", note: "ofetch / $fetch HTTP adapter (Nuxt & Nitro)", peers: "ofetch >= 1.0" },
    { pkg: "@blaze-cache/react-query", note: "TanStack Query v5 integration", peers: "@tanstack/react-query >= 5.0.0" },
    { pkg: "@blaze-cache/swr", note: "SWR persist + hook", peers: "swr >= 2" },
  ],
  quickStart: [
    "# core is the only package you must install", "npm install @blaze-cache/core", "",
    "# then only the integrations you use",
    "npm install @blaze-cache/axios",
    "npm install @blaze-cache/fetch",
    "npm install @blaze-cache/ky",
    "npm install @blaze-cache/ofetch",
    "npm install @blaze-cache/react-query",
    "npm install @blaze-cache/swr", "",
    "# peers — only for the adapters above", "npm install axios", "npm install ky", "npm install ofetch", "npm install @tanstack/react-query", "",
    "# optional: SWR config", "npm install swr",
  ],
  whatsNew: [
    { kind: "new", title: "Multi-tab synchronization", desc: "Opt in with `multiTab: { enabled: true }`: one `BroadcastChannel` per namespace and generation carries set, delete, clear, tag-invalidation and rotation, plus a `hello`/`state` handshake on focus. A hybrid logical clock, a per-client sequence and a deterministic `clientId` order writes, and a per-key version guard means a hidden tab can no longer overwrite a newer value with a stale flush. Remote changes fire `remote-*` events without re-broadcasting, and flushes are serialised with a Web Lock where available.", href: "#multitab", more: "Multi-Tab", commits: ["aa19bb5", "6500f8d", "85ec3e0", "f8b9557"] },
    { kind: "new", title: "Zero-copy bytes and JS-authoritative storage", desc: "Two opt-in memory modes join the by-reference default. `setBytes` stores a `Uint8Array` once in a safe Wasm arena and `getBytes` returns a view with no second copy (`getBytesCopy` for a retained snapshot); advanced callers can adopt a pre-written region with `setBytesReserved`. `storage: 'js'` keeps keys, TTL, tags and stable ids in Wasm while values live in a JS `Map`, with by-id hot reads. Both are off by default and measured, not assumed, in the published deltas.", href: "#storage", more: "Storage & Memory", commits: ["22d1568", "4efbec0", "4f703c2", "29396ef"] },
    { kind: "testing", title: "Published benchmarks: Node and a real browser", desc: "Ten scenarios across five payload sizes and two value representations, run in Node and in headless Chrome, with raw JSON, hardware and methodology published. The matrix shows no payload-size cliff — values are held by reference and never serialised on the hot path. The honest caveat stays: the boundary crossing costs real time on writes, so no unqualified 'faster than JS' claim is made.", href: "#benchmarks", more: "Benchmarks", commits: ["b0ac7ac", "f7fdf27", "d1fea0b", "fc4cb54", "a82710a"] },
    { kind: "perf", title: "Tagged raw writes and a bulk producer path", desc: "The final tuning pass removes per-write key and tag allocations from the headline workload: tagged writes take the key from `KeyScratch` and tags from a shared flat buffer, `setManyRaw` extends that to batches, and all offsets are validated in safe Rust. Same-run A/B put `full-featured` 2% faster in Node and 4% in Chrome; the other scenarios stayed inside their spread. Tag-name interning was measured, judged unjustified and left out.", href: "#core", more: "Core API", commits: ["6b0c3c2", "cbeed29", "ce00c07", "3f6808c"] },
    { kind: "new", title: "Persistence, hardened: sessions, schema and a control API", desc: "`cache.persistence` is a full control surface now — `flush()`, `clear()`, `hydrate()`, `stats()` and `rotate()` — over an adapter that folds a rotatable session generation into the key space: rotation drops every queued write and every flush still in flight, so a late save can no longer repopulate the next login's rows. Rows carry a schema stamp — storage written by a newer schema resets the namespace loudly instead of being misread, a corrupt row costs exactly itself — the options gain `namespace`, `debounceMs`, `maxEntries`, `restoreExpired`, `writeMode`, `onError` and `onActivity` (the old spellings remain as aliases), and each flush reaches storage as one batched transaction on a single reused connection.", href: "#persistence", more: "Persistence", commits: ["994c4ae", "a77cb59", "c14740e"] },
    { kind: "new", title: "Value subscriptions: `subscribe`, `subscribeMany`, `subscribeTag`", desc: "Hand a key, a list of keys or a tag to `subscribe` and get the current value back on every change — `hit` and `miss` never wake one. A tag subscription attributes `delete`, `evict`, `expire`, `invalidate`, `prune` and `clear` to the tags they actually hit through a per-tag mirror, `{ once: true }` fires once, a throwing subscriber is logged and skipped, and with no subscription alive the layer does not exist: the hot path is untouched.", href: "#events", more: "Events", commits: ["de3bfa6", "1f90404", "e6e2941"] },
    { kind: "new", title: "New package: `@blaze-cache/ofetch`", desc: "The same cache for ofetch / `$fetch` — the HTTP client behind Nuxt and Nitro. `blazeOfetch(instance, cache, options)` wraps an instance you already have, `createBlazeOfetch(cache, options)` builds one with ofetch defaults and cache options in a single bag, and the wrapped instance keeps the full ofetch API: parsed data, `.raw()` with the `x-blaze-cache` marker, `.native`, and `.create()`.", href: "#ofetch", more: "Ofetch Adapter", commits: ["134fb68", "431fa62"] },
    { kind: "new", title: "Wasm loading, standardized", desc: "`createCache` now takes one explicit source — `wasmUrl`, a precompiled `module`, or an `instantiate` loader (plus the low-level `wasm` passthrough) — instead of a single overloaded option. The default still resolves the shipped binary relative to the package, concurrent creates share one download and compile, two sources at once throw a `TypeError`, and every failure says what to try next: the HTTP status and URL, the fetch error kept on `cause`, or the compile failure.", href: "#wasm", more: "Wasm Loading", commits: ["faab6af", "2be828c", "41e6292"] },
    { kind: "new", title: "Per-request controls on axios and fetch", desc: "Pass `blazeCache` on any axios request config or fetch init to override `enabled`, `ttlMs`, `tags`, `key`, `varyHeaders` and `forceRefresh` for that one call — `blazeCache: false` bypasses the cache entirely, `invalidateTags` purges after a mutation, and `invalidateCacheTags(cache, ...tags)` is the standalone helper. On fetch, `forceRefresh` (or `cache: 'reload'`) skips the read and rewrites the entry, so the next request is a HIT again.", href: "#axios", more: "Axios Adapter", commits: ["414af74", "462e5f7", "e9361ad"] },
    { kind: "new", title: "SWR: `forceRefresh`, tag resolvers, scoped invalidation", desc: "A call-site `forceRefresh` skips the persisted seed but keeps the write — the next mount starts from it — `tags` accepts a resolver run at write time from the key and data, a cache that throws costs a console warning instead of a broken hook, and `invalidateBlazeSWR(cache, ...tags)` purges only this package's envelopes: a neighbour integration's entry wearing the same tag survives.", href: "#swr", more: "SWR", commits: ["ccd41c6", "9f72607", "7f30570", "67480c4"] },
    { kind: "fixed", title: "Raw wasm key methods no longer trust host pointers", desc: "`getRaw` / `setRaw` / `deleteRaw` used to build a `&str` from an arbitrary JS-supplied pointer and length with `from_utf8_unchecked`. They now validate the pointer against the current buffer, bound the length and check UTF-8, degrading to a miss, a no-op or `false` instead of undefined behaviour. Both crates are free of `unsafe` code and release panics abort.", href: "#wasm", more: "Wasm Loading", commits: ["e6ea3f8", "1c74258"] },
    { kind: "perf", title: "Common writes stop allocating; huge capacities stay cheap", desc: "Tag ids live inline for the usual zero-to-two tags, and the wasm `set` / `setMany` paths look keys up by slice instead of cloning them on overwrite. `Cache::new` reserves at most 1024 index buckets rather than the whole declared capacity — a million-slot declaration used to cost ~69 MB before the first insert, and now stays under 1 MB — while still growing on demand up to the logical ceiling.", href: "#core", more: "Core API", commits: ["0a2b98f", "fa61bf9", "f2a293e"] },
    { kind: "fixed", title: "Supply-chain gates", desc: "CI pins every third-party action to a commit SHA, verifies the wasm-pack tarball against a pinned sha256 before extracting it, and runs gitleaks, `pnpm audit` and `cargo audit` on push, PR and nightly — with Dependabot re-pinning the SHAs. `follow-redirects` is overridden to a patched range for CVE-2026-116689.", href: "#repo", more: "Repo & Development", commits: ["2518b33", "34c00c8"] },
    { kind: "testing", title: "600 automated checks, all green", desc: "Every claim above is backed by the suite: 479 offline package and integration tests, 27 benchmark-suite checks, 57 Rust engine tests, 5 allocation tests, 4 doctests and 28 wasm-binding tests. The allocation tests assert that overwrites, byte-region reuse and by-id lookups stay allocation-free; the live network suites remain opt-in.", href: "#repo", more: "Repo & Development", commits: ["7cf1079", "4f703c2", "85ec3e0", "ce00c07"] },
  ],
  nav: NAV_040,
  coreMethods: [...CORE_METHODS, ...INTROSPECTION.map((m) => ({ ...m, isNew: false })), ...SUBSCRIPTIONS, ...STORAGE_METHODS],
  commands: COMMANDS_040, examples: EXAMPLES_CURRENT, layout: LAYOUT_040,
};

// The 0.5.0 beta line: 0.4.0 plus the devtools registry, the typed query API with opt-in
// indexes, and the wasm-free shared contract subpath. Served on /beta under npm's `beta`
// dist-tag, so every install command below carries @beta. It renders the whole 0.4 page —
// nothing the stable route documents was removed — and only adds the query methods to the
// API table.
const BETA_RELEASE: Release = {
  id: "beta", version: "0.5.0-beta", badge: "v0.5.0-beta", legacy: false, prerelease: true, isNew: false, installTag: "@beta",
  metaDescription: "Blaze Cache 0.5.0-beta prerelease documentation: @blaze-cache/devtools for zero-cost observability, the typed query API (query, queryKeys, count) with opt-in indexes and cursor paging, the wasm-free @blaze-cache/core/shared subpath, and additive invalidate tags — powered by Rust and WebAssembly.",
  tests: { total: 644, detail: "510 package/integration · 27 benchmark-suite checks · 67 Rust engine · 7 allocation · 4 doctests · 29 wasm" },
  packages: [
    { pkg: "@blaze-cache/core", note: "Cache engine (Wasm + TS bindings)", peers: "None" },
    { pkg: "@blaze-cache/devtools", note: "Read-only observability: registry, snapshots, event feed", peers: "None" },
    { pkg: "@blaze-cache/axios", note: "Axios HTTP adapter", peers: "axios >= 1.7.0" },
    { pkg: "@blaze-cache/fetch", note: "Drop-in fetch() with HTTP caching", peers: "None" },
    { pkg: "@blaze-cache/ky", note: "ky HTTP adapter (ky v1 & v2)", peers: "ky >= 1.14 || 2" },
    { pkg: "@blaze-cache/ofetch", note: "ofetch / $fetch HTTP adapter (Nuxt & Nitro)", peers: "ofetch >= 1.0" },
    { pkg: "@blaze-cache/react-query", note: "TanStack Query v5 integration", peers: "@tanstack/react-query >= 5.0.0" },
    { pkg: "@blaze-cache/swr", note: "SWR persist + hook", peers: "swr >= 2" },
  ],
  quickStart: [
    "# core is the only package you must install", "npm install @blaze-cache/core@beta", "",
    "# optional: read-only observability for the cache",
    "npm install @blaze-cache/devtools@beta", "",
    "# then only the integrations you use",
    "npm install @blaze-cache/axios@beta",
    "npm install @blaze-cache/fetch@beta",
    "npm install @blaze-cache/ky@beta",
    "npm install @blaze-cache/ofetch@beta",
    "npm install @blaze-cache/react-query@beta",
    "npm install @blaze-cache/swr@beta", "",
    "# peers — only for the adapters above", "npm install axios", "npm install ky", "npm install ofetch", "npm install @tanstack/react-query", "",
    "# optional: SWR config", "npm install swr",
  ],
  whatsNew: [
    { kind: "new", title: "New package: `@blaze-cache/devtools`", desc: "Zero-cost-by-default observability. `attach(cache, { label? })` returns a handle with `detach`, `list` and `dispose`; the registry listens on wildcard events through a weak reference and `dispose()` removes every listener, so the drop log switches back off. Snapshots are built on demand — never on the hot path — with `maxEntries` / `maxValueBytes` caps and explicit truncation markers, values are cloned-or-described through a safe summarizer (`BigInt`, cycles, nested secrets redacted), and a versioned `{ protocol: 1, tabId, cacheId, kind }` envelope carries snapshots, events and actions to any transport.", href: "#devtools", more: "Devtools", commits: ["06023b0", "869f81a", "bf61eda", "7819be6", "985cff8"] },
    { kind: "new", title: "Typed query API: `query()`, `queryKeys()`, `count()`", desc: "Paged lookups over prefix, tags, a TTL range or a key allow-list. `limit` is required, the opaque `cursor` resumes after the last key and survives that key's deletion, `includeValues` returns rows only alongside both `maxEntries` and `maxValueBytes` caps, `withTotal` adds a count pass, and `truncated` says when the caps cut a page short — so a consumer can never mistake a capped page for the end of the results. The wasm bindings expose the same query across the boundary.", href: "#query", more: "Typed Query API", commits: ["967419c", "b96387d", "a5dac81"] },
    { kind: "new", title: "Opt-in indexes, zero cost when off", desc: "`indexes: true` builds prefix, tag and TTL indexes and backfills them once. With indexes off the hot path pays nothing, and `query()` refuses to guess: without an indexed constraint it throws unless the filter explicitly opts into `fullScan: true`. Indexed pages seek to the first match and stop at the first extra one, and allocation tests pin both the off path (zero) and the on path (backfill + one page).", href: "#query", more: "Typed Query API", commits: ["36bb58b", "dcb54bb"] },
    { kind: "new", title: "`@blaze-cache/core/shared` — the wasm-free contract subpath", desc: "A server-safe subpath with no wasm import: the redaction patterns, the frozen duck-typed `BlazeRecord` guard and the `<binding>:<feature>` kind convention. Every transport and the devtools summarizer import the contract from one place, so the shape can never drift between them.", href: "#shared", more: "Shared Contract", commits: ["5f3e1dd", "157c225"] },
    { kind: "new", title: "`invalidate` events now carry `tags`", desc: "The `invalidate` event and `CacheChange` gained a `tags` array alongside `keys`: listeners run after the entries are gone, so `tagsOf(key)` could not recover them after the fact. Additive — existing listeners keep working — and the only shape change in 0.5.0.", href: "#events", more: "Events", commits: ["967419c"] },
    { kind: "testing", title: "644 automated checks, all green", desc: "510 offline package and integration tests (17 of them the new devtools suite), 27 benchmark-suite checks, 67 Rust engine tests, 7 allocation tests — both indexes on and off — 4 doctests and 29 wasm-binding tests. The live network suites remain opt-in, and the same-runner A/B bench gate passed on the release commit.", href: "#repo", more: "Repo & Development", commits: ["1a1e7e0", "db35877"] },
  ],
  nav: NAV_BETA,
  coreMethods: [...CORE_METHODS, ...INTROSPECTION.map((m) => ({ ...m, isNew: false })), ...SUBSCRIPTIONS, ...STORAGE_METHODS, ...QUERY_METHODS],
  commands: COMMANDS_040, examples: EXAMPLES_CURRENT, layout: LAYOUT_050,
};

// The previous stable line, archived at /0.3.0 after 0.4.0 became current. Kept as it
// shipped: untagged installs, the 0.3 What's New set and no 0.4-only sections.
const PREVIOUS_RELEASE: Release = {
  id: "previous", version: "0.3.0", badge: "v0.3.0", legacy: false, prerelease: false, isNew: false, installTag: "",
  metaDescription: "A full-featured client-side cache for the browser: TTL, tags, SIEVE eviction, and IndexedDB persistence, powered by Rust and WebAssembly. Synchronous reads, a drop-in fetch() replacement, axios, ky and SWR adapters, and TanStack Query integration.",
  tests: { total: 350, detail: "286 JS · 43 Rust engine · 4 doctests · 17 wasm" },
  packages: [
    { pkg: "@blaze-cache/core", note: "Cache engine (Wasm + TS bindings)", peers: "None" },
    { pkg: "@blaze-cache/axios", note: "Axios HTTP adapter", peers: "axios >= 1.7.0" },
    { pkg: "@blaze-cache/fetch", note: "Drop-in fetch() with HTTP caching", peers: "None" },
    { pkg: "@blaze-cache/ky", note: "ky HTTP adapter (ky v1 & v2)", peers: "ky >= 1.14 || 2" },
    { pkg: "@blaze-cache/react-query", note: "TanStack Query v5 integration", peers: "@tanstack/react-query >= 5.0.0" },
    { pkg: "@blaze-cache/swr", note: "SWR persist + hook", peers: "swr >= 2" },
  ],
  quickStart: [
    "# core is the only package you must install", "npm install @blaze-cache/core", "",
    "# then only the integrations you use",
    "npm install @blaze-cache/axios",
    "npm install @blaze-cache/fetch",
    "npm install @blaze-cache/ky",
    "npm install @blaze-cache/react-query",
    "npm install @blaze-cache/swr", "",
    "# peers — only for the adapters above", "npm install axios", "npm install ky", "npm install @tanstack/react-query", "",
    "# optional: SWR config", "npm install swr",
  ],
  whatsNew: [
    { kind: "perf", title: "The hot path stops paying for key encoding", desc: "Keys are pre-encoded into wasm memory once per distinct key and handed to the core by pointer, so a read no longer pays `passStringToWasm0`'s per-call malloc + copy + free; a delete hashes its key once instead of twice, an overwrite allocates no key at all, and the event bus short-circuits when nothing is subscribed. In the framework cache-store benchmark (50,000 × 1KB entries) warm reads dropped 21%, misses 54% and writes 26% — deletes improved 23% and now beat SWR.", href: "#core", more: "Core API", commits: ["bdbbd9f", "421aa1c", "7306899", "aff2b32"] },
    { kind: "fixed", title: "ky: the caller's MISS body stays readable", desc: "ky cancels the response an `afterResponse` hook replaces, and the MISS marker rebuild wrapped around that very body — on undici, where headers are immutable, the rebuilt response reached the caller holding an already-consumed stream (`Body is unusable`). The body is now buffered and the rebuild wraps the copy; the store tee was never affected.", href: "#ky", more: "Ky Adapter", commits: ["19346f6", "b8318e7"] },
    { kind: "testing", title: "Live suites against the real GitHub API", desc: "The ky, react-query and swr adapters plus the shared integration package now ship opt-in live tests that run the cache against api.github.com — 28 network tests on top of the offline matrix, started with `pnpm test:live`. The CI live job lists every suite, and the script builds core's dist first so a fresh clone just works.", href: "#repo", more: "Repo & Development", commits: ["ee6b193", "cbe2ac0", "5699592", "28f17f6", "db6de4a", "e9bb985"] },
    { kind: "perf", title: "TTL-free caches skip the clock in bulk reads too", desc: "`entries()`, `keys()`, `keysWithTag()` and `prune()` now share the fast path `get`/`set` already had: with no entry carrying a deadline, the monotonic clock — a `performance.now()` boundary crossing per call on wasm — is never touched. The drop log's soft cap also became a true `O(1)` `VecDeque` pop instead of a scan.", href: "#core", more: "Core API", commits: ["c00f8dd", "291cd37"] },
    { kind: "fixed", title: "setMany clamps malformed tag offsets instead of trapping", desc: "The batch writer's tag offsets arrive from JS, and a non-monotonic or out-of-range pair used to panic mid-slice and trap the whole wasm instance. Bad offsets now degrade to 'no tags for this entry' — every entry is still stored and readable, only its tags are dropped, matching how short arrays were already tolerated.", href: "#core", more: "Core API", commits: ["4dacced"] },
    { kind: "fixed", title: "Persistence that survives a failed flush", desc: "Keys that repeatedly fail to flush are dropped instead of poisoning the queue — everything else stays pending; a malformed IndexedDB body aborts its own transaction; `dispose()` tears down exactly once; and `flushDelayMs` / `maxRecords` are validated at construction.", href: "#core", more: "Core API", commits: ["96db988", "ab3b1a0", "be22f0e", "55d4f6a", "c29f479"] },
    { kind: "fixed", title: "Events can no longer be disturbed mid-flight", desc: "A listener removed while an emit is running never fires, and a pending `once()` listener can be cancelled before it trips — subscriber churn can no longer change what the other listeners observe.", href: "#events", more: "Events", commits: ["c5864bd", "a894135"] },
    { kind: "fixed", title: "Axios adapter correctness", desc: "Stream response bodies are never stored; `URLSearchParams`, `FormData` and `Map` params key correctly; the HIT/MISS marker is stripped from stored headers; replayed 4xx errors surface as `ERR_BAD_REQUEST`; and malformed `Cache-Control` directives are ignored rather than thrown.", href: "#axios", more: "Axios Adapter", commits: ["c14f541", "10ee46c", "9534676", "3eb20c4", "00d025b", "376158e"] },
    { kind: "fixed", title: "Fetch adapter aborts and parsing", desc: "Status `101` never lands in the null-body set, in-flight joiners honour their own abort, caller aborts stay out of the background revalidate, and malformed `Cache-Control` directives are ignored.", href: "#fetch", more: "Fetch Adapter", commits: ["3d1da0d", "68c228e", "391cd7c", "9143685", "b459222"] },
    { kind: "new", title: "New package: `@blaze-cache/ky`", desc: "The ky adapter joins the family — cache-backed requests for ky v1 and v2 with the same marker header, TTL and tag semantics, hardened in this cycle against `101` null-body responses and malformed `Cache-Control`.", href: "#ky", more: "Ky Adapter", commits: ["1fde5e7", "c1245bd", "075b095"] },
    { kind: "fixed", title: "React Query mirror stays isolated", desc: "Removal and purge touch only mirror records, helper tags and `ttl` survive a refetch, and non-infinite data is never seeded into the mirror.", href: "#rq", more: "React Query", commits: ["9163acb", "9680723", "3e2b830", "3a72825", "8b86546"] },
    { kind: "fixed", title: "SWR per-call stamps win", desc: "A per-call `ttlMs` / `tags` now beats the provider config instead of losing to it — the options you pass at the call site are the ones that stick.", href: "#swr", more: "SWR", commits: ["4a80fd2", "757cbb4"] },
    { kind: "testing", title: "Twenty-five regression tests", desc: "Every fix above ships with a test: the offline matrix now runs 286 TypeScript tests across the workspace packages plus 64 Rust tests (43 engine, 4 doctests, 17 wasm bindings) — all green, none touching the network.", href: "#repo", more: "Repo & Development", commits: ["c29f479", "376158e", "b459222", "075b095", "8b86546", "757cbb4"] },
  ],
  nav: NAV_CURRENT,
  coreMethods: [...CORE_METHODS, ...INTROSPECTION.map((m) => ({ ...m, isNew: false }))],
  commands: COMMANDS_CURRENT, examples: EXAMPLES_CURRENT, layout: LAYOUT,
};


export const RELEASES: Record<ReleaseId, Release> = {
  beta: BETA_RELEASE,
  stable: CURRENT_RELEASE,
  previous: PREVIOUS_RELEASE,
  legacy: {
    id: "legacy", version: "0.2.5", badge: "v0.2.5", legacy: true, prerelease: false, isNew: false, installTag: "",
    metaDescription: "Documentation for Blaze Cache 0.2.5, an archived release: TTLs, tags, SIEVE eviction, IndexedDB persistence, and the axios, fetch, TanStack Query and SWR integrations.",
    tests: { total: 175, detail: "119 JS · 41 Rust engine · 3 doctests · 12 wasm" },
    packages: [
      { pkg: "@blaze-cache/core", note: "Cache engine (Wasm + TS bindings)", peers: "None" },
      { pkg: "@blaze-cache/axios", note: "Axios HTTP adapter", peers: "axios >= 1.7.0" },
      { pkg: "@blaze-cache/fetch", note: "Drop-in fetch() with HTTP caching", peers: "None" },
      { pkg: "@blaze-cache/react-query", note: "TanStack Query v5 integration", peers: "@tanstack/react-query >= 5.0.0" },
      { pkg: "@blaze-cache/swr", note: "SWR persist + hook", peers: "swr >= 2" },
    ],
    quickStart: [
      "# core is the only package you must install", "npm install @blaze-cache/core", "",
      "# then only the integrations you use", "npm install @blaze-cache/axios", "npm install @blaze-cache/react-query", "npm install @blaze-cache/swr", "",
      "# peers — only for the adapters above", "npm install axios", "npm install @tanstack/react-query", "",
      "# optional: SWR config", "npm install swr",
    ],
    whatsNew: [
      { kind: "new", title: "New package: `@blaze-cache/swr`", desc: "SWR middleware + `useSWR` hook that paints instantly from the Blaze Cache and persists fetches with TTL, tags, and stale-while-revalidate semantics.", href: "#swr", more: "SWR Integration", commits: ["e38925f9ffb7c7a6e9b5cdd3be8f9c7b5a9e1d8f"] },
      { kind: "fixed", title: "Cross-integration conflict fixes", desc: "Six conflicts found during cross-integration testing were fixed: unfiltered purge helpers now scope to mirror records via shape (dataUpdatedAt), tag purges enumerate + filter by shape, axios never serves/deletes foreign values under a shared key, axios tags use the resolved URL, SWR seeds only its envelope, and react-query seeds only its own mirror records.", href: "#sharing", more: "Architecture", commits: ["aaec387c1a2b3d4e5f6g7h8i9j0k1l2m3n4o5p6q"] },
      { kind: "new", title: "New introspection reads on the core", desc: "`size()`, `capacity()`, `peek()`, `touch()`, `ttl()`, `getMany()`, `setMany()`, `hasMany()`, `deleteMany()`, `once()`, `off()` answer what the cache holds without disturbing it. These methods enable non-invasive reads and batch operations that cross the wasm boundary in a single call.", href: "#core", more: "Core API", commits: ["359967b456ad0993d1c870b4b949569e058d7ba8"] },
      { kind: "fixed", title: "A typed event system for everything the cache does", desc: "`cache.on('evict', ({ key, value }) => ...)` subscribes to one event with a payload typed to exactly that event; `cache.on(listener)` is a wildcard over all ten — `hit`, `miss`, `set`, `delete`, `clear`, `invalidate`, `prune`, `touch`, `evict`, `expire`. `once`, `off` and an unsubscribe handle from every call complete the API, and the legacy `CacheListener` form still works.", href: "#events", more: "Events", commits: ["4a97df6afb808d3e7a65fb21c9e98768673edf0e"] },
      { kind: "new", title: "New adapter: `@blaze-cache/fetch`", desc: "A drop-in replacement for the global `fetch()` backed by the same cache: TTLs, `Cache-Control`, stale-while-revalidate, request coalescing (one connection for concurrent identical requests), and an `x-blaze-cache: HIT | MISS | STALE` marker on every response.", href: "#fetch", more: "Fetch Adapter", commits: ["8d525b6bcc00611a0c5e036850da1cb564229d3c"] },
      { kind: "fixed", title: "Durable writes and flush recovery", desc: "A failed flush no longer loses writes: records claimed by a failing flush go straight back on the queue; malformed storage rows are skipped individually; and `dispose()` tears down even when the final flush rejects.", href: "#core", more: "Core API", commits: ["0bb0c2f41eac73e6e0ce328c039c229a3b59aa04"] },
      { kind: "fixed", title: "Vary validation and request coalescing", desc: "`Vary: *` is never stored; varying on a header outside `varyHeaders` is left uncached rather than replayed to the wrong caller. Concurrent identical `GET`s coalesce: one caller leads and the rest replay the record it stored.", href: "#fetch", more: "Fetch Adapter", commits: ["2d0476440740cdd81d7d7bfb06a45d45baa76193"] },
      { kind: "fixed", title: "Axios keys by the URL axios really requests", desc: "The axios adapter keys on `buildFullPath`: an absolute `url` ignores `baseURL`, slashes collapse, and one endpoint occupies one entry. Response headers (`content-encoding`, `transfer-encoding`) are normalised so a cached response never contradicts its own `data.byteLength`.", href: "#axios", more: "Axios Adapter", commits: ["ac87ec2f68918c859c7bc53531b8b552518006a2"] },
      { kind: "fixed", title: "React Query mirror survives garbage collection", desc: "Only an explicit `removeQueries` or `clear` deletes the persisted copy — a query left unobserved past `gcTime` keeps its copy, so the next session still paints instantly. Custom `queryKeyHashFn` resolves on both sides, a caller-supplied `initialData` is never overwritten, and render-time reads use `peek()`.", href: "#rq", more: "React Query", commits: ["9a9f00030974d44e0001b1873a2ac53245e9d2d0"] },
      { kind: "testing", title: "Fifty regression tests", desc: "Every fix above ships with a test: 41 Rust unit tests plus 3 doctests, 12 wasm-binding tests and 119 offline TypeScript tests across the four packages — all green without touching the network.", href: "#repo", more: "Repo & Development", commits: ["63edca3c0ccd2d363139ef9659e8b0e73e8e6730"] },
    ],
    nav: NAV_LEGACY,
    coreMethods: [...CORE_METHODS, ...INTROSPECTION],
    commands: COMMANDS_LEGACY, examples: EXAMPLES_LEGACY, layout: LAYOUT_LEGACY,
  },
};
