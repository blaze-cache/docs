import { Globe, Link2, Box, Database, Clock, Tag, ArrowDown } from "lucide-react"

export default function ArchitectureDiagram() {
  return (
    <div className="rounded-3xl border border-[#2a1818] bg-[#0f0a0a] p-6 md:p-10 shadow-2xl shadow-[#8a1e2e]/10 overflow-hidden relative">
      {/* Subtle glowing gradient overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(217,119,6,0.25), transparent 70%)' }} />

      {/* Top Layer - Browser */}
      <section className="relative z-10 rounded-2xl border border-[#2a1818] bg-[#121012]/80 p-6 shadow-lg backdrop-blur mb-8">
        <div className="absolute -top-2 left-6 rounded-full bg-gradient-to-r from-[#d97706] to-[#f472b6] px-3 py-0.5 text-[10px] font-bold uppercase text-white shadow-md tracking-widest">Layer 1 — Browser</div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8a1e2e]/30 to-[#d97706]/20 shadow-inner shadow-[#d97706]/10">
            <Globe size={28} className="text-[#f472b6]" />
          </div>
          <div>
            <h5 className="text-xl font-extrabold text-[#fff5f0] tracking-tight">TypeScript Layer</h5>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Axios Adapter", "React Query v5", "createCache()"].map((b) => (
                <span key={b} className="rounded-md bg-[#1a1212] border border-[#2a1818] px-2.5 py-1 text-xs font-medium text-[#e8cfc8] shadow-sm">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Connector */}
      <div className="flex justify-center mb-8">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-b from-[#d97706]/40 to-[#f472b6]/40 shadow-[0_0_15px_rgba(217,119,6,0.4)] flex items-center justify-center animate-pulse">
            <ArrowDown size={18} className="text-[#fff5f0]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#f472b6]">Wasm Bridge</span>
        </div>
      </div>

      {/* Middle - Wasm */}
      <section className="relative rounded-2xl border border-[#2a1818] bg-gradient-to-br from-[#121012] to-[#0f0a0a] p-6 shadow-lg mb-8">
        <div className="absolute -top-2 left-6 rounded-full bg-gradient-to-r from-[#f472b6] to-[#8a1e2e] px-3 py-0.5 text-[10px] font-bold uppercase text-white tracking-widest shadow-md">Layer 2 — Wasm</div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f472b6]/20 to-[#8a1e2e]/30 shadow-inner shadow-[#f472b6]/10">
            <Link2 size={28} className="text-[#d97706]" />
          </div>
          <div>
            <h5 className="text-xl font-extrabold text-[#fff5f0] tracking-tight">Wasm Bindings</h5>
            <p className="text-xs text-muted-foreground mt-1">wasm-bindgen • synchronous hot path • one-time init</p>
          </div>
        </div>
      </section>

      {/* Connector */}
      <div className="flex justify-center mb-8">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-b from-[#f472b6]/40 to-[#8a1e2e]/40 shadow-[0_0_15px_rgba(244,114,182,0.4)] flex items-center justify-center animate-pulse">
            <ArrowDown size={18} className="text-[#fff5f0]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8a1e2e]">Rust Core</span>
        </div>
      </div>

      {/* Bottom - Rust Engine */}
      <section className="relative rounded-3xl border border-[#2a1818] bg-[#121012]/60 p-6 md:p-8 shadow-2xl shadow-[#8a1e2e]/10">
        <h5 className="text-lg font-extrabold text-[#fff5f0] tracking-tight mb-6">Rust Engine — blaze-cache-core</h5>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: Box, title: "Slab Allocator", detail: "Vec<Option<Node>> + free list • O(1)" },
            { icon: Link2, title: "SIEVE Queue", detail: "Doubly linked • scan-resistant" },
            { icon: Clock, title: "TTL Fast-path", detail: "ttl_count • skips now() when zero" },
            { icon: Tag, title: "Tags", detail: "Monotonic IDs • set diff" },
            { icon: Database, title: "Persistence", detail: "IndexedDB • debounced • pagehide" },
          ].map(({ icon: Icon, title, detail }) => (
            <div key={title} className="rounded-2xl border border-[#2a1818] bg-[#0a0a0b]/80 p-4 shadow-md hover:shadow-[0_0_20px_rgba(217,119,6,0.15)] transition-all hover:-translate-y-0.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8a1e2e]/20 to-[#d97706]/20 shadow-inner shadow-[#8a1e2e]/10 mb-3 group-hover:scale-110 transition-transform">
                <Icon size={20} className="text-[#f472b6]" />
              </div>
              <h6 className="text-sm font-bold text-[#fff5f0] leading-tight">{title}</h6>
              <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-[#121012]/60 px-6 py-3 text-xs font-medium text-muted-foreground border border-[#2a1818] shadow-inner">
        <span className="rounded-md bg-gradient-to-r from-[#d97706] to-[#f472b6] px-2 py-0.5 text-[10px] font-bold text-white">SYSTEM</span>
        <span>No threads • No async • No I/O • Browser only • ESM</span>
      </div>
    </div>
  )
}
