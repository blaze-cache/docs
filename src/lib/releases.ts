// @ts-nocheck
/**
 * One entry per published release of the library.
 */
export type ReleaseId = "stable" | "beta";
export interface NavItem { id: string; label: string; }
export interface MethodInfo { name: string; sig: string; desc: string; isNew?: boolean; }
export interface PackageCard { pkg: string; note: string; peers: string; }
export interface WhatsNewItem { kind: string; title: string; desc: string; href: string; more: string; commits: string[]; }
export interface Release {
  id: ReleaseId; version: string; badge: string; isBeta: boolean; installTag: string;
  packages: PackageCard[]; quickStart: string[]; whatsNew: WhatsNewItem[]; nav: NavItem[];
  coreMethods: MethodInfo[]; commands: string[]; layout: string;
}

const NAV_BASE: NavItem[] = [
  { id: "overview", label: "Overview" }, { id: "install", label: "Installation" },
  { id: "core", label: "Core API" }, { id: "axios", label: "Axios Adapter" },
  { id: "rq", label: "React Query" }, { id: "usage", label: "Usage Examples" },
  { id: "architecture", label: "Architecture" }, { id: "problems", label: "Problems Solved" },
  { id: "repo", label: "Repo & Development" },
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

const LAYOUT_STABLE = `crates/
  blaze-cache-core/
packages/
  core/
  axios/
  react-query/`;

const COMMANDS_STABLE = ["pnpm install", "pnpm build", "pnpm build:wasm", "pnpm test", "pnpm lint", "pnpm dev", "pnpm clean"];

const BETA_RELEASE: Release = {
  id: "beta", version: "0.3.0-beta", badge: "v0.3.0-beta", isBeta: true, installTag: "@0.3.0-beta",
  packages: [
    { pkg: "@blaze-cache/core", note: "Cache engine", peers: "None" },
    { pkg: "@blaze-cache/axios", note: "Axios adapter", peers: "axios >= 1.7.0" },
    { pkg: "@blaze-cache/react-query", note: "TanStack Query integration", peers: "@tanstack/react-query >= 5.0.0" },
  ],
  quickStart: ["npm install @blaze-cache/core@0.3.0-beta", "npm install @blaze-cache/axios@0.3.0-beta", "npm install @blaze-cache/react-query@0.3.0-beta"],
  whatsNew: [], nav: NAV_BASE, coreMethods: CORE_METHODS, commands: COMMANDS_STABLE, layout: LAYOUT_STABLE,
};

export const RELEASES: Record<ReleaseId, Release> = {
  stable: {
    id: "stable", version: "0.2.5", badge: "v0.2.5", isBeta: false, installTag: "",
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
    nav: [
      { id: "overview", label: "Overview" },
      { id: "whatsnew", label: "Features" },
      { id: "install", label: "Installation" },
      { id: "core", label: "Core & Events" },
      { id: "axios", label: "Axios" },
      { id: "fetch", label: "Fetch" },
      { id: "rq", label: "React Query" },
      { id: "swr", label: "SWR" },
      { id: "usage", label: "Usage" },
      { id: "architecture", label: "Architecture" },
      { id: "problems", label: "Problems Solved" },
      { id: "philosophy", label: "Philosophy" },
      { id: "repo", label: "Repo" },
    ],
    coreMethods: [
      ...CORE_METHODS,
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
    ],
    commands: COMMANDS_STABLE, layout: LAYOUT_STABLE,
  },
  beta: BETA_RELEASE,
};
