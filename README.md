# Blaze Cache — Documentation Site

Modern documentation site for Blaze Cache, a full-featured client-side cache powered by Rust and WebAssembly.

Built with:
- React + TypeScript + Vite
- Tailwind CSS v4
- shadcn/ui-style components (Card, Badge, Button, Separator)
- vite.dev-style surfaces (flat, border-driven) with a light/dark theme toggle: light base is white text on `#3c3c43`, dark is `#16171d` with `#14121a` cards — Blaze crimson (`#8a1e2e` / `#e8a0aa`) stays the accent
- System font stacks (no web fonts): system-ui for prose, ui-monospace for code and section headings
- Theme resolves from a saved choice, then OS preference; the toggle persists to localStorage
- Tailwind CSS v4 with `cn()` routed through `tailwind-merge` so call-site overrides win

## Features

- Four routes: `/beta` documents the 0.5.0-beta prerelease (installed through npm's `beta` tag), `/` the current stable release (0.4.0, marked **new**), `/0.3.0` the previous stable line and `/0.2.5` the archived 0.2 line — `/beta` was retired when 0.4.0 went stable and restored for the 0.5 series. Package lists, install commands, nav and API tables all come from `src/lib/releases.ts`
- Responsive documentation layout with sticky sidebar timeline navigation
- Interactive scroll-tracking indicator (dots highlight active section)
- Mobile drawer navigation
- Copy-to-clipboard buttons on all code snippets
- Sections: Overview, What's New, Installation, Core API, Events (plus subscriptions on 0.4), Typed Query API (beta only), Devtools (beta only), Persistence, Wasm Loading, Storage & Memory, Multi-Tab Sync, Benchmarks, Axios Adapter, Fetch Adapter, Ky Adapter, Ofetch Adapter, React Query, SWR, Usage, Architecture (animated SVG), Problems Solved, Philosophy, Repo & Development

## Updating a release

`src/lib/releases.ts` is the single source of truth: bump `version`, `badge` and `installTag`,
refresh `whatsNew` and `coreMethods`, and every label on the page follows — the header badge, the
version switcher, the install cards and the What's New grid.


`RELEASES.beta` (0.5.0-beta) is served at `/beta` behind an amber prerelease banner, with every
install command carrying `@beta`. `RELEASES.stable` is the current release served at `/`; its
`isNew: true` flag adds the "new" chip to the header and switcher. `RELEASES.previous` (0.3.0) and
`RELEASES.legacy` (0.2.5) are archived lines served at `/0.3.0` and `/0.2.5` behind an `archive`
banner. In `DocsPage.tsx`, `has040` gates the sections 0.4 introduced — persistence, wasm loading,
storage modes, multi-tab sync, benchmarks and ofetch — for stable *and* beta (the beta is 0.4 plus
devtools/query work), so older lines keep rendering exactly what they shipped, while `newIn` keeps
"New in …" labels naming the 0.4 line instead of the beta's own version string. The beta also
gets a beta-only `Typed Query API` section (`#query`, listed in `NAV_BETA`) with a runnable
`query()` / `queryKeys()` / `count()` example and the `QueryOptions` table, and `Devtools`
(`#devtools`) with an `attach` → `snapshot` / `events` → `detach` example and the full API/options
reference.

## Development

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Link

Repo: https://github.com/blaze-cache/blaze-cache
