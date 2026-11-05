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

- Two routes: `/` documents the latest stable release, `/beta` the prerelease — package lists, install commands, nav and API tables all come from `src/lib/releases.ts`
- Responsive documentation layout with sticky sidebar timeline navigation
- Interactive scroll-tracking indicator (dots highlight active section)
- Mobile drawer navigation
- Copy-to-clipboard buttons on all code snippets
- Sections: Overview, What's New (beta), Installation, Core API, Axios Adapter, Fetch Adapter (beta), Ky Adapter (beta), React Query, Usage, Architecture (animated SVG), Problems Solved, Repo & Development

## Updating a release

`src/lib/releases.ts` is the single source of truth: bump `version`, `badge` and `installTag`,
refresh `whatsNew` and `coreMethods`, and every label on the page follows — the header badge, the
version switcher, the install cards, the document title and the What's New grid.

## Development

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Link

Repo: https://github.com/blaze-cache/blaze-cache
