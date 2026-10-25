import { defineConfig, type Plugin } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

/**
 * GitHub Pages answers any path it doesn't have on disk with `404.html`. Without a copy of
 * the app there, loading https://blaze-cache.github.io/docs/beta directly (or refreshing
 * it) would return GitHub's own 404 page and the SPA would never boot — so the build ships
 * the entry document under both names.
 *
 * `transformIndexHtml` runs after `generateBundle`, and Vite gives it the live bundle, so
 * the copy is dropped straight in rather than read back off disk (the config is compiled
 * without Node types on purpose).
 */
const spaFallback = (): Plugin => ({
  name: "spa-404-fallback",
  apply: "build",
  transformIndexHtml: {
    // Post-order: Vite has already rewritten the asset URLs, so the copy is complete.
    order: "post",
    handler(source, ctx) {
      const bundle = ctx.bundle
      if (bundle && !bundle["404.html"]) {
        bundle["404.html"] = {
          type: "asset",
          fileName: "404.html",
          name: "404.html",
          names: ["404.html"],
          originalFileName: null,
          originalFileNames: [],
          needsCodeReference: false,
          source,
        }
      }
      return source
    },
  },
})

// https://vite.dev/config/
export default defineConfig({
  base: "/docs/",
  plugins: [react(), tailwindcss(), spaFallback()],
  resolve: {
    alias: {
      "@": "./src",
    },
  },
})
