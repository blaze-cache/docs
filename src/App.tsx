import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import DocsPage from "./components/DocsPage"

/**
 * Vite emits the site under `/docs/` (a GitHub Pages project site) and the dev server
 * honours the same base, so strip the trailing slash to get the router's basename.
 */
const basename = import.meta.env.BASE_URL.replace(/\/+$/, "") || "/"

/**
 * `/` documents the current stable release, `/beta` the 0.4.0-beta prerelease, and
 * `/0.2.5` the archived 0.2 line.
 *
 * `*` sends anything else back to the stable docs — including a deep link that GitHub
 * Pages resolved through `404.html`, which boots the SPA at an unknown path.
 *
 * Each DocsPage carries a key so switching releases remounts the page: the scroll spy,
 * the active nav item and the document title are all rebuilt from scratch.
 */
export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<DocsPage key="stable" release="stable" />} />
        <Route path="/beta" element={<DocsPage key="beta" release="beta" />} />
        <Route path="/0.2.5" element={<DocsPage key="legacy" release="legacy" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
