/**
 * Architecture diagram — a flat, border-driven SVG in the vite.dev style.
 * Motion is pure CSS (marching dashes along the data path, a comet sweep
 * across the Wasm bridge, a pulsing bridge node) and parks entirely under
 * `prefers-reduced-motion`. Every colour comes from the theme tokens, so
 * the diagram tracks the light/dark toggle.
 */

/** Adapter labels — the beta release adds ofetch to the family. */
const adapterLabels = (beta: boolean): string[] =>
  beta
    ? ["Axios", "Fetch", "Ky", "Ofetch", "React Query", "SWR"]
    : ["Axios", "Fetch", "Ky", "React Query", "SWR"];

/**
 * Centres for `n` adapter boxes (130 wide, 12 apart) laid out symmetrically around
 * x=430 — the bridge's axis — so any adapter count stays centred on the diagram.
 */
const adapterCenters = (n: number): number[] => {
  const width = 130
  const gap = 12
  const start = (860 - (n * width + (n - 1) * gap)) / 2
  return Array.from({ length: n }, (_, i) => start + i * (width + gap) + width / 2)
};

/** The engine's subsystems — persistence is deliberately not one: it never enters the core. */
const SUBSYSTEMS = [
  { title: "Slab", detail: "O(1) free list" },
  { title: "SIEVE", detail: "scan-resistant" },
  { title: "TTL", detail: "fast-path" },
  { title: "Tags", detail: "monotonic IDs" },
];

const ARCH_CSS = `
  .arch-flow { stroke-dasharray: 5 7; animation: arch-dash 0.8s linear infinite; }
  @keyframes arch-dash { to { stroke-dashoffset: -12; } }
  .arch-comet { stroke-dasharray: 6 94; animation: arch-sweep 2.4s linear infinite; }
  @keyframes arch-sweep { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -100; } }
  .arch-pulse { animation: arch-pulse 2.4s ease-in-out infinite; }
  @keyframes arch-pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) {
    .arch-flow, .arch-comet, .arch-pulse { animation: none; }
  }
`

export default function ArchitectureDiagram({ beta = false }: { beta?: boolean }) {
  const centers = adapterCenters(adapterLabels(beta).length)
  const adapters = adapterLabels(beta).map((label, i) => ({ label, cx: centers[i] }))
  const first = centers[0]
  const last = centers[centers.length - 1]
  // The bus runs from the first adapter to at least the persistence drop, so both the
  // API and the persistence sidecar hang off it for every adapter count.
  const busEnd = Math.max(last, 730)
  // Engine subsystem boxes (132 wide, 147 apart) centred inside the 760-wide engine rect.
  const engineStart = 50 + (760 - (SUBSYSTEMS.length * 132 + (SUBSYSTEMS.length - 1) * 15)) / 2

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-10 overflow-hidden">
      <svg
        viewBox="0 0 860 470"
        className="w-full h-auto font-sans"
        role="img"
        aria-labelledby="arch-title arch-desc"
      >
        <title id="arch-title">Blaze Cache architecture</title>
        <desc id="arch-desc">
          {`${adapters.length} adapters and createCache() feed the TypeScript API, which crosses into the
          Rust engine over wasm-bindgen. The engine holds the slab allocator, SIEVE queue, TTL fast-path
          and tag index; persistence is a debounced TypeScript layer over IndexedDB.`}
        </desc>
        <style>{ARCH_CSS}</style>

        <defs>
          <marker
            id="arch-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0 1 L9 5 L0 9 z" fill="var(--color-flame)" />
          </marker>
        </defs>

        {/* Adapters → bus */}
        <g
          fill="var(--color-secondary)"
          stroke="var(--color-border)"
          strokeWidth="1"
        >
          {adapters.map((a) => (
            <rect key={a.label} x={a.cx - 65} y={28} width={130} height={34} rx={6} />
          ))}
        </g>
        <g
          fill="var(--color-foreground)"
          fontSize="13"
          fontWeight="600"
          textAnchor="middle"
        >
          {adapters.map((a) => (
            <text key={a.label} x={a.cx} y={50}>
              {a.label}
            </text>
          ))}
        </g>

        <path
          className="arch-flow"
          d={`${adapters.map((a) => `M${a.cx} 62 V96`).join(" ")} M${first} 96 H${busEnd} M430 96 V120 M730 96 V120`}
          fill="none"
          stroke="var(--color-stroke)"
          strokeWidth="1.5"
        />

        {/* TypeScript API */}
        <rect
          x={250}
          y={120}
          width={360}
          height={64}
          rx={8}
          fill="var(--color-background)"
          stroke="var(--color-flame)"
          strokeWidth="1.5"
        />
        <text
          x={430}
          y={149}
          fill="var(--color-foreground)"
          fontSize="16"
          fontWeight="700"
          textAnchor="middle"
        >
          TypeScript API
        </text>
        <text
          x={430}
          y={171}
          fill="var(--color-muted-foreground)"
          fontSize="11.5"
          textAnchor="middle"
        >
          {beta
            ? "createCache() · synchronous get/set · typed events · subscribe()"
            : "createCache() · synchronous get/set · typed events"}
        </text>

        {/* Persistence sidecar — TypeScript only, never inside the engine */}
        <path
          d="M614 152 H626"
          fill="none"
          stroke="var(--color-stroke)"
          strokeWidth="1.5"
          markerEnd="url(#arch-arrow)"
        />
        <rect
          x={630}
          y={120}
          width={200}
          height={64}
          rx={8}
          fill="var(--color-background)"
          stroke="var(--color-border)"
          strokeWidth="1.5"
        />
        <text
          x={730}
          y={147}
          fill="var(--color-foreground)"
          fontSize="14"
          fontWeight="700"
          textAnchor="middle"
        >
          Persistence
        </text>
        <text
          x={730}
          y={167}
          fill="var(--color-muted-foreground)"
          fontSize="11"
          textAnchor="middle"
        >
          {beta ? "IndexedDB · debounce · rotate()" : "IndexedDB · debounced writes"}
        </text>

        {/* Wasm bridge */}
        <path
          d="M430 184 V244"
          fill="none"
          stroke="var(--color-stroke)"
          strokeWidth="1.5"
          markerEnd="url(#arch-arrow)"
        />
        <path
          className="arch-comet"
          pathLength={100}
          d="M430 184 V244"
          fill="none"
          stroke="var(--color-flame)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle className="arch-pulse" cx={446} cy={210} r={4} fill="var(--color-flame)" />
        <text x={460} y={207} fill="var(--color-foreground)" fontSize="11.5" fontWeight="700">
          wasm-bindgen
        </text>
        <text x={460} y={223} fill="var(--color-muted-foreground)" fontSize="10.5">
          one crossing · sync hot path
        </text>

        {/* Rust engine */}
        <rect
          x={50}
          y={250}
          width={760}
          height={140}
          rx={8}
          fill="var(--color-card)"
          stroke="var(--color-border)"
          strokeWidth="1"
        />
        <text x={74} y={280} fill="var(--color-foreground)" fontSize="14" fontWeight="700">
          Rust engine · blaze-cache-core
        </text>
        <text
          x={786}
          y={280}
          fill="var(--color-flame)"
          fontSize="11"
          fontWeight="600"
          textAnchor="end"
        >
          no threads · no async · no I/O
        </text>

        {SUBSYSTEMS.map((s, i) => {
          const x = engineStart + i * 147
          return (
            <g key={s.title}>
              <rect
                x={x}
                y={294}
                width={132}
                height={74}
                rx={6}
                fill="var(--color-background)"
                stroke="var(--color-border)"
                strokeWidth="1"
              />
              <text
                x={x + 66}
                y={326}
                fill="var(--color-foreground)"
                fontSize="12.5"
                fontWeight="700"
                textAnchor="middle"
              >
                {s.title}
              </text>
              <text
                x={x + 66}
                y={347}
                fill="var(--color-muted-foreground)"
                fontSize="10"
                textAnchor="middle"
              >
                {s.detail}
              </text>
            </g>
          )
        })}

        {/* System strip */}
        <rect
          x={210}
          y={416}
          width={440}
          height={36}
          rx={8}
          fill="var(--color-secondary)"
          stroke="var(--color-border)"
          strokeWidth="1"
        />
        <text
          x={430}
          y={439}
          fill="var(--color-muted-foreground)"
          fontSize="11.5"
          fontWeight="600"
          letterSpacing="0.06em"
          textAnchor="middle"
        >
          BROWSER ONLY · ESM · WASM HOT PATH · O(1) EVICTION
        </text>
      </svg>
    </div>
  )
}
