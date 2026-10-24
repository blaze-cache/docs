import { Layers, Database, Clock, Tag, ArrowDown, Globe, Cpu, HardDrive, Link2, Box } from "lucide-react"

export default function ArchitectureDiagram() {
  return (
    <div className="rounded-3xl border border-[#2a1818] bg-gradient-to-b from-[#121012] via-[#0f0a0a] to-[#121012] p-8 md:p-10 shadow-2xl shadow-[#8a1e2e]/10 overflow-hidden">
      {/* Layer label */}
      <div className="mb-10 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#d97706] to-[#f472b6] shadow-lg shadow-[#d97706]/20 flex items-center justify-center">
          <Layers size={20} className="text-white" />
        </div>
        <div>
          <h4 className="text-xl font-extrabold tracking-tight text-[#fff5f0]">Architecture</h4>
          <p className="text-xs text-muted-foreground">Rust → Wasm → Browser</p>
        </div>
      </div>

      <div className="relative space-y-8">
        {/* Top: Browser / TypeScript */}
        <section className="relative rounded-2xl border border-[#2a1818] bg-[#121012]/80 p-6 shadow-lg shadow-black/30 backdrop-blur">
          <div className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-[#d97706] to-[#f472b6] px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-md">Layer 1</div>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8a1e2e]/40 to-[#d97706]/30 shadow-inner shadow-[#d97706]/10">
              <Globe size={28} className="text-[#f472b6]" />
            </div>
            <div>
              <h5 className="text-lg font-bold text-[#fff5f0]">Browser / TypeScript</h5>
              <div className="mt-2 flex flex-wrap gap-2">
                {["TypeScript Bindings", "createCache()", "Axios Adapter", "TanStack Query v5"].map((tag) => (
                  <span key={tag} className="rounded-md bg-[#1a1212] border border-[#2a1818] px-2.5 py-1 text-xs font-medium text-[#e8cfc8]">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Connector */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-1 text-[#d97706]/60">
            <ArrowDown size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Wasm Bridge</span>
          </div>
        </div>

        {/* Middle: Wasm Bridge */}
        <section className="relative rounded-2xl border border-[#2a1818] bg-[#121012]/80 p-6 shadow-lg shadow-black/30 backdrop-blur">
          <div className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-[#f472b6] to-[#8a1e2e] px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-md">Layer 2</div>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f472b6]/30 to-[#8a1e2e]/40 shadow-inner shadow-[#f472b6]/10">
              <Link2 size={28} className="text-[#d97706]" />
            </div>
            <div>
              <h5 className="text-lg font-bold text-[#fff5f0]">WebAssembly Bridge</h5>
              <p className="text-sm text-muted-foreground">wasm-bindgen • One-time module init • Synchronous hot path</p>
            </div>
          </div>
        </section>

        {/* Connector */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-1 text-[#f472b6]/60">
            <ArrowDown size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Rust Core</span>
          </div>
        </div>

        {/* Bottom: Rust Engine */}
        <section className="relative rounded-3xl border border-[#2a1818] bg-gradient-to-b from-[#121012] to-[#0f0a0a] p-6 md:p-8 shadow-2xl shadow-[#8a1e2e]/10">
          <div className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-[#8a1e2e] to-[#d97706] px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-md">Layer 3 — Core</div>
          <h5 className="mb-6 text-xl font-extrabold text-[#fff5f0] tracking-tight">Rust Engine (blaze-cache-core)</h5>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Box, title: "Slab Allocator", detail: "Vec<Option<Node>> + free list • O(1) eviction • nodes never move" },
              { icon: ArrowDown, title: "SIEVE Queue", detail: "Doubly linked list • scan-resistant • persistent hand cursor" },
              { icon: Clock, title: "TTL Fast-path", detail: "ttl_count • skips Instant::now() entirely when zero" },
              { icon: Tag, title: "Tags", detail: "Monotonic tag IDs • set-difference invalidation • never reused" },
              { icon: Database, title: "Persistence", detail: "IndexedDB adapter • debounced writes • pagehide / visibilitychange flush" },
            ].map(({ icon: Icon, title, detail }) => (
              <div key={title} className="rounded-2xl border border-[#2a1818] bg-[#121012]/60 p-5 shadow-md hover:shadow-xl hover:border-[#8a1e2e]/40 transition-all group">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#d97706]/20 to-[#f472b6]/20 shadow-inner shadow-[#d97706]/10 group-hover:scale-105 transition-transform">
                  <Icon size={20} className="text-[#f472b6]" />
                </div>
                <h6 className="font-bold text-[#fff5f0] mb-1">{title}</h6>
                <p className="text-xs leading-relaxed text-muted-foreground">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom note */}
        <div className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-[#2a1818] bg-[#121012]/40 px-6 py-4 text-sm text-muted-foreground shadow-inner">
          <span className="rounded-md bg-gradient-to-r from-[#d97706] to-[#f472b6] px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm">System</span>
          <span>No threads • No async runtime • No I/O in the Rust core • ESM only (Browser only)</span>
        </div>
      </div>
    </div>
  )
}
