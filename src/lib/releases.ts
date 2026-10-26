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
  /** Introduced in the 0.2 line (absent from stable) — rendered with a "new" chip. */
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
  /**
   * Full SHAs of the commits behind this change, newest first. Rendered as short-SHA chips
   * linking to the main repo, so every claim on the page is traceable to the diff that made it.
   */
  commits: string[];
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
  { name: "set", sig: "(key: string, value: V, options?: SetOptions) => void", desc: "Stores or replaces key. Replacing refreshes TTL and replaces tags. The value is kept by reference — mutating what get() returns rewrites the cache." },
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
    desc: "The maximum number of entries — the capacity passed to createCache(), normalised into 1…1_000_000 by the binding (below 1 clamps up, above 1_000_000 clamps down, a non-finite value falls back to the default).",
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
 * Corrections to the shared table that only hold from 0.2.1-beta on — the stable route
 * documents 0.1.1, whose behaviour these entries deliberately no longer describe. Merged by
 * name at release construction, so the two tables cannot drift apart on method order.
 */
const CORE_METHODS_FIXES: MethodInfo[] = [
  {
    name: "flush",
    sig: "() => Promise<void>",
    desc: "Writes pending changes to storage immediately (persistence only). A failed flush rejects and re-queues every record it claimed, so the next attempt retries them instead of dropping them.",
  },
  {
    name: "dispose",
    sig: "() => Promise<void>",
    desc: "Flushes, unbinds page-lifecycle listeners and frees wasm memory. Teardown runs even when that flush fails — the storage error is rethrown afterwards.",
  },
  {
    name: "tagsOf",
    sig: "(key: string) => string[]",
    desc: "Tags attached to key — empty when the key is missing, unknown or already expired, so it agrees with get() about what is really there.",
  },
  {
    name: "hasTag",
    sig: "(key: string, tag: string) => boolean",
    desc: "True when key carries tag and the entry is still live: an expired entry reports false, exactly as get() sees it.",
  },
];

/** Replaces every entry of `base` whose `name` appears in `overrides`; order is preserved. */
const withFixes = (base: MethodInfo[], overrides: MethodInfo[]): MethodInfo[] =>
  base.map((m) => overrides.find((o) => o.name === m.name) ?? m);

/**
 * What's new on the beta route, newest first: everything 0.2.1-beta changed, followed by the
 * 0.2.0-beta highlights that are still absent from stable. Every claim here mirrors a shipped
 * commit, and every card carries the SHAs of the commits behind it — `git show <sha>` in the
 * main repo takes you straight to the diff that made the claim true.
 */
const WHATS_NEW_BETA: WhatsNewItem[] = [
  {
    kind: "fixed",
    title: "`Vary` is checked before anything is stored",
    desc: "A response carrying `Vary: *` is never stored, and one varying on a header outside `varyHeaders` is left uncached rather than replayed to the wrong caller — in both the fetch and the axios adapter. Add the server's headers to opt those responses in.",
    href: "#fetch",
    more: "Fetch Adapter",
    commits: [
      "2d0476440740cdd81d7d7bfb06a45d45baa76193",
      "ac87ec2f68918c859c7bc53531b8b552518006a2",
      "5b48f2c71858d467375b0806cc94a4b4103ad67d",
    ],
  },
  {
    kind: "fixed",
    title: "One request, one connection",
    desc: "Identical concurrent `GET`s now coalesce: one caller leads and the rest replay the record it stored, so a burst of the same URL opens a single connection instead of N. A cache that throws costs one console warning — never a failed response.",
    href: "#fetch",
    more: "Fetch Adapter",
    commits: ["2d0476440740cdd81d7d7bfb06a45d45baa76193"],
  },
  {
    kind: "fixed",
    title: "Axios keys by the URL axios really requests",
    desc: "The key mirrors axios' own `buildFullPath`: an absolute `url` ignores `baseURL`, slashes collapse, and one endpoint occupies one entry instead of several spellings of it. The response's `Age` shortens the freshness window, and that window is enforced by the adapter on every read.",
    href: "#axios",
    more: "Axios Adapter",
    commits: ["ac87ec2f68918c859c7bc53531b8b552518006a2"],
  },
  {
    kind: "fixed",
    title: "A failed flush no longer loses writes",
    desc: "Records claimed by a failing flush go straight back on the queue, storage rows the wasm core dropped on its own are reconciled away through `keys()`, malformed rows are skipped individually, and `dispose()` tears down even when the final flush rejects.",
    href: "#core",
    more: "Core API",
    commits: [
      "0bb0c2f41eac73e6e0ce328c039c229a3b59aa04",
      "5138d7c4b4d29899e66f3cd6aded6f4d91c8a31a",
    ],
  },
  {
    kind: "fixed",
    title: "The TanStack mirror survives garbage collection",
    desc: "Only an explicit `removeQueries` or `clear` deletes the persisted copy — a query left unobserved past `gcTime` keeps it, so the next session still paints instantly. Custom `queryKeyHashFn` resolves on both sides, a caller-supplied `initialData` is left alone, and renders read with `peek()`.",
    href: "#rq",
    more: "React Query",
    commits: ["9a9f00030974d44e0001b1873a2ac53245e9d2d0"],
  },
  {
    kind: "fixed",
    title: "Four repairs in the Rust core",
    desc: "An insert that evicts can no longer orphan a tag, an overflowing TTL reads as \"no deadline\" instead of panicking, `hasTag()`/`tagsOf()` agree with `get()` about expired entries, and an absurd `capacity` is reserved lazily instead of aborting the instance.",
    href: "#core",
    more: "Core API",
    commits: [
      "a3142892fc8e4879e9bb9bdb0b50c57a7ccf8cce",
      "348cc4338190ded16fc2089e5b0fab40213ba205",
      "b549b88d93f8360c2ec381d3a21900e60e3901a8",
      "5fbf9fb75efeb0a7c5e0e096d61e0904cc0928e4",
    ],
  },
  {
    kind: "fixed",
    title: "The Wasm bindings stop trusting their input",
    desc: "A hostile `capacity` is normalised before it reaches the core — clamped into `1…1_000_000`, with a non-finite value falling back to the default — and a positive TTL below a millisecond rounds up to 1 ms instead of truncating to 0, which the cache reads as \"never expires\".",
    href: "#core",
    more: "Core API",
    commits: [
      "0912e79e930c8fd95ecb2fbdb0e6ba53d9f8be87",
      "0c83d806d7623d42a751a5f76086eef121db1e91",
      "87e1fcb2e127a62ee0aac458b553b386d1d08858",
    ],
  },
  {
    kind: "testing",
    title: "Fifty regression tests",
    desc: "Every fix above ships with a test: 41 Rust unit tests plus 3 doctests, 12 wasm-binding tests and 119 offline TypeScript tests across the four packages — all green without touching the network.",
    href: "#repo",
    more: "Repo & Development",
    commits: ["63edca3c0ccd2d363139ef9659e8b0e73e8e6730"],
  },
  {
    kind: "new",
    title: "New package: `@blaze-cache/fetch`",
    desc: "A drop-in replacement for the global `fetch()` backed by the same cache: TTLs, `Cache-Control`, stale-while-revalidate, and an `x-blaze-cache: HIT | MISS | STALE` marker on every response it returns.",
    href: "#fetch",
    more: "Fetch Adapter",
    commits: ["8d525b6bcc00611a0c5e036850da1cb564229d3c"],
  },
  {
    kind: "new",
    title: "Five introspection reads on the core",
    desc: "`size()`, `capacity()`, `peek()`, `touch()` and `ttl()` answer what the cache holds without disturbing it — `peek()` records no hit or miss, `size()` counts only unexpired entries, and `touch()` renews a deadline without ever changing the value.",
    href: "#core",
    more: "Core API",
    commits: ["359967b456ad0993d1c870b4b949569e058d7ba8"],
  },
  {
    kind: "fixed",
    title: "Stored headers describe the stored bytes",
    desc: "An axios hit no longer replays wire headers: `content-encoding` is dropped, `transfer-encoding` stops lying, and `content-length` is rewritten to the decoded payload — a cached response can never contradict its own `data.byteLength`.",
    href: "#axios",
    more: "Axios Adapter",
    commits: ["4cb1457cadd07341a5d90a8741f94cbfa11a69b7"],
  },
  {
    kind: "testing",
    title: "Live network suites, offline CI",
    desc: "`pnpm test:live` runs the network suites against real endpoints when `BLAZE_CACHE_LIVE=1`, and each package now ships its own `<name>/test/` suite. CI stays offline on pull requests and runs the live suites nightly.",
    href: "#repo",
    more: "Repo & Development",
    commits: [
      "9a462f8981c44ac69939b2028d922536dbbf2eb3",
      "c7e2aea8687520c6b26e2982721f854fd90ac29e",
    ],
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
    version: "0.2.1-beta",
    badge: "v0.2.1-beta",
    isBeta: true,
    installTag: "@0.2.1-beta",
    packages: [
      { pkg: "@blaze-cache/core", note: "Cache engine (Wasm + TS bindings)", peers: "None" },
      { pkg: "@blaze-cache/fetch", note: "Drop-in fetch() with HTTP caching", peers: "None" },
      { pkg: "@blaze-cache/axios", note: "Axios HTTP adapter", peers: "axios >= 1.7.0" },
      { pkg: "@blaze-cache/react-query", note: "TanStack Query v5 integration", peers: "@tanstack/react-query >= 5.0.0" },
    ],
    quickStart: [
      "# core is the only package you must install",
      "npm install @blaze-cache/core@0.2.1-beta",
      "",
      "# then only the integrations you use",
      "npm install @blaze-cache/fetch@0.2.1-beta",
      "npm install @blaze-cache/axios@0.2.1-beta",
      "npm install @blaze-cache/react-query@0.2.1-beta",
      "",
      "# peers — only for the adapters above",
      "npm install axios",
      "npm install @tanstack/react-query",
    ],
    whatsNew: WHATS_NEW_BETA,
    nav: NAV_BETA,
    coreMethods: [...withFixes(CORE_METHODS, CORE_METHODS_FIXES), ...CORE_METHODS_BETA],
    commands: COMMANDS_BETA,
    layout: LAYOUT_BETA,
  },
};
