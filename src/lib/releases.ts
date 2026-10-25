/**
 * One entry per published release of the library.
 *
 * The site serves the stable docs at `/` and the prerelease docs at `/beta`. Everything
 * that differs between the two routes lives here — packages, install commands, nav order,
 * the Core API table and the repo layout — so `DocsPage` stays a single component instead
 * of two copies that drift apart.
 */

export type ReleaseId = "stable" | "beta";

export interface NavItem {
  id: string;
  label: string;
}

export interface MethodInfo {
  name: string;
  sig: string;
  desc: string;
  /** Introduced in 0.2.0-beta — rendered with a "new" chip. */
  isNew?: boolean;
}

export interface PackageCard {
  pkg: string;
  note: string;
  peers: string;
}

/**
 * One highlight card in the "What's New" section. `title` and `desc` may mark inline code
 * with backticks — `DocsPage` renders those as <code>.
 */
export interface WhatsNewItem {
  /** Chip above the title: "new", "fixed", "testing" — colours live in DocsPage. */
  kind: string;
  title: string;
  desc: string;
  /** Anchor of the section that documents this change. */
  href: string;
  /** Label of the link at the bottom of the card. */
  more: string;
}

export interface Release {
  id: ReleaseId;
  /** npm version this route documents. */
  version: string;
  /** Rendered in the header badge. */
  badge: string;
  isBeta: boolean;
  /**
   * Suffix for every install command. npm's `latest` tag still points at stable, so the
   * beta docs pin the exact prerelease — a bare `npm install` would give 0.1.1, and an
   * exact version keeps working even if a dist-tag is moved or renamed.
   */
  installTag: string;
  /** Install cards, in the order they should render. */
  packages: PackageCard[];
  /** The combined install block, lines as they should print. */
  quickStart: string[];
  /** "What's New" highlights for this release; empty hides the section and its nav entry. */
  whatsNew: WhatsNewItem[];
  nav: NavItem[];
  coreMethods: MethodInfo[];
  /** Snippets in the "Development Commands" table. */
  commands: string[];
  /** Contents of the "Repository Layout" code block. */
  layout: string;
}

const NAV_BASE: NavItem[] = [
  { id: "overview", label: "Overview" },
  { id: "install", label: "Installation" },
  { id: "core", label: "Core API" },
  { id: "axios", label: "Axios Adapter" },
  { id: "rq", label: "React Query" },
  { id: "usage", label: "Usage Examples" },
  { id: "architecture", label: "Architecture" },
  { id: "problems", label: "Problems Solved" },
  { id: "repo", label: "Repo & Development" },
];

/** Same as the stable nav, with What's New under Overview and the Fetch adapter after Axios. */
const NAV_BETA: NavItem[] = [
  { id: "overview", label: "Overview" },
  { id: "whatsnew", label: "What's New" },
  { id: "install", label: "Installation" },
  { id: "core", label: "Core API" },
  { id: "axios", label: "Axios Adapter" },
  { id: "fetch", label: "Fetch Adapter" },
  { id: "rq", label: "React Query" },
  { id: "usage", label: "Usage Examples" },
  { id: "architecture", label: "Architecture" },
  { id: "problems", label: "Problems Solved" },
  { id: "repo", label: "Repo & Development" },
];

/** The Core API as 0.1.1 documents it. */
const CORE_METHODS: MethodInfo[] = [
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
];

/** The five introspection reads added in 0.2.0-beta. Signatures match packages/core/src/cache.ts. */
const CORE_METHODS_BETA: MethodInfo[] = [
  {
    name: "size",
    sig: "() => number",
    desc: "Stored entries that are present and unexpired, so it always agrees with keys(). stats().size is the raw slab count and may include expired slots until prune().",
    isNew: true,
  },
  {
    name: "capacity",
    sig: "() => number",
    desc: "The maximum number of entries — the capacity passed to createCache().",
    isNew: true,
  },
  {
    name: "peek",
    sig: "(key: string) => V | undefined",
    desc: "The same lookup as get() minus every side effect: no hit or miss recorded, no eviction mark, nothing reclaimed.",
    isNew: true,
  },
  {
    name: "touch",
    sig: "(key: string, options?: TouchOptions) => boolean",
    desc: "Marks the entry used and renews its TTL when ttlMs is passed — the value never changes. False when missing or expired; 0 drops the deadline.",
    isNew: true,
  },
  {
    name: "ttl",
    sig: "(key: string) => number | undefined",
    desc: "Milliseconds until it expires, or undefined both for 'no deadline' and for 'missing or expired'.",
    isNew: true,
  },
];

/**
 * What changed in 0.2.0-beta, newest first. Every claim here mirrors a shipped commit:
 * the fetch package, the five introspection reads, the axios header fix and the live CI suites.
 */
const WHATS_NEW_BETA: WhatsNewItem[] = [
  {
    kind: "new",
    title: "New package: `@blaze-cache/fetch`",
    desc: "A drop-in replacement for the global `fetch()` backed by the same cache: TTLs, `Cache-Control`, stale-while-revalidate, and an `x-blaze-cache: HIT | MISS | STALE` marker on every response it returns.",
    href: "#fetch",
    more: "Fetch Adapter",
  },
  {
    kind: "new",
    title: "Five introspection reads on the core",
    desc: "`size()`, `capacity()`, `peek()`, `touch()` and `ttl()` answer what the cache holds without disturbing it — `peek()` records no hit or miss, `size()` counts only unexpired entries, and `touch()` renews a deadline without ever changing the value.",
    href: "#core",
    more: "Core API",
  },
  {
    kind: "fixed",
    title: "Stored headers describe the stored bytes",
    desc: "An axios hit no longer replays wire headers: `content-encoding` is dropped, `transfer-encoding` stops lying, and `content-length` is rewritten to the decoded payload — a cached response can never contradict its own `data.byteLength`.",
    href: "#axios",
    more: "Axios Adapter",
  },
  {
    kind: "testing",
    title: "Live network suites, offline CI",
    desc: "`pnpm test:live` runs the network suites against real endpoints when `BLAZE_CACHE_LIVE=1`, and each package now ships its own `<name>/test/` suite. CI stays offline on pull requests and runs the live suites nightly.",
    href: "#repo",
    more: "Repo & Development",
  },
];

const LAYOUT_STABLE = `crates/
  blaze-cache-core/      Rust engine: slab store, SIEVE queue, tags, TTL, stats
  blaze-cache-wasm/      wasm-bindgen bindings
packages/
  core/                  @blaze-cache/core  (wasm loader, persistence, createCache)
  axios/                 @blaze-cache/axios (HTTP adapter)
  react-query/           @blaze-cache/react-query (v5 mirror + hook)
examples/
  browser/               Vite + React demo with mock API + latency counter
scripts/
  smoke.mjs              End-to-end tests against built artifacts`;

const LAYOUT_BETA = `crates/
  blaze-cache-core/      Rust engine: slab store, SIEVE queue, tags, TTL, stats
  blaze-cache-wasm/      wasm-bindgen bindings
packages/
  core/                  @blaze-cache/core  (wasm loader, persistence, createCache)
  axios/                 @blaze-cache/axios (HTTP adapter)
  fetch/                 @blaze-cache/fetch (drop-in fetch() replacement)
  react-query/           @blaze-cache/react-query (v5 mirror + hook)
  <name>/test/           that package's Node test suite
examples/
  browser/               Vite + React demo with mock API + latency counter
.github/
  workflows/             rust.yml (fmt, clippy, tests) + js.yml (offline on PR, live nightly)`;

/** Workspace commands shown in "Development Commands". */
const COMMANDS_STABLE = [
  "pnpm install",
  "pnpm build",
  "pnpm build:wasm",
  "pnpm test",
  "pnpm test:js",
  "pnpm lint",
  "pnpm dev",
  "pnpm clean",
];

/** As stable, plus the opt-in network suites added in 0.2.0-beta. */
const COMMANDS_BETA = [
  "pnpm install",
  "pnpm build",
  "pnpm build:wasm",
  "pnpm test",
  "pnpm test:js",
  "pnpm test:live",
  "pnpm lint",
  "pnpm dev",
  "pnpm clean",
];

export const RELEASES: Record<ReleaseId, Release> = {
  stable: {
    id: "stable",
    version: "0.1.1",
    badge: "v0.1.1",
    isBeta: false,
    installTag: "",
    packages: [
      { pkg: "@blaze-cache/core", note: "Cache engine (Wasm + TS bindings)", peers: "None" },
      { pkg: "@blaze-cache/axios", note: "Axios HTTP adapter", peers: "axios >= 1.7.0" },
      { pkg: "@blaze-cache/react-query", note: "TanStack Query v5 integration", peers: "@tanstack/react-query >= 5.0.0" },
    ],
    quickStart: [
      "# core is the only package you must install",
      "npm install @blaze-cache/core",
      "",
      "# then only the integrations you use",
      "npm install @blaze-cache/axios",
      "npm install @blaze-cache/react-query",
      "",
      "# peers — only for the adapters above",
      "npm install axios",
      "npm install @tanstack/react-query",
    ],
    whatsNew: [],
    nav: NAV_BASE,
    coreMethods: CORE_METHODS,
    commands: COMMANDS_STABLE,
    layout: LAYOUT_STABLE,
  },
  beta: {
    id: "beta",
    version: "0.2.0-beta",
    badge: "v0.2.0-beta",
    isBeta: true,
    installTag: "@0.2.0-beta",
    packages: [
      { pkg: "@blaze-cache/core", note: "Cache engine (Wasm + TS bindings)", peers: "None" },
      { pkg: "@blaze-cache/fetch", note: "Drop-in fetch() with HTTP caching", peers: "None" },
      { pkg: "@blaze-cache/axios", note: "Axios HTTP adapter", peers: "axios >= 1.7.0" },
      { pkg: "@blaze-cache/react-query", note: "TanStack Query v5 integration", peers: "@tanstack/react-query >= 5.0.0" },
    ],
    quickStart: [
      "# core is the only package you must install",
      "npm install @blaze-cache/core@0.2.0-beta",
      "",
      "# then only the integrations you use",
      "npm install @blaze-cache/fetch@0.2.0-beta",
      "npm install @blaze-cache/axios@0.2.0-beta",
      "npm install @blaze-cache/react-query@0.2.0-beta",
      "",
      "# peers — only for the adapters above",
      "npm install axios",
      "npm install @tanstack/react-query",
    ],
    whatsNew: WHATS_NEW_BETA,
    nav: NAV_BETA,
    coreMethods: [...CORE_METHODS, ...CORE_METHODS_BETA],
    commands: COMMANDS_BETA,
    layout: LAYOUT_BETA,
  },
};
