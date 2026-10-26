# Blaze Cache — Documentation Site

Modern documentation site for the Blaze Cache project, a Rust / WebAssembly client-side caching library.

Built with:
- React + TypeScript + Vite
- Tailwind CSS v4
- shadcn/ui-style components (Card, Badge, Button, Separator)
- Dark crimson theme matching the Blaze Cache logo

## Features

- Two routes: `/` documents the latest stable release, `/beta` the prerelease — package lists, install commands, nav and API tables all come from `src/lib/releases.ts`
- Responsive documentation layout with sticky sidebar timeline navigation
- Interactive scroll-tracking indicator (dots highlight active section)
- Mobile drawer navigation
- Copy-to-clipboard buttons on all code snippets
- Sections: Overview, What's New (beta), Installation, Core API, Axios Adapter, Fetch Adapter (beta), React Query, Usage, Architecture, Problems Solved, Repo & Development

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
