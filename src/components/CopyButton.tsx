import { useState } from "react"
import { Copy, Check } from "lucide-react"

export default function CopyButton({ text }: { text: string }) {
  const [ok, setOk] = useState(false)
  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setOk(true)
      setTimeout(() => setOk(false), 1200)
    } catch { /* ignore */ }
  }
  return (
    <button onClick={doCopy} className="absolute top-2 right-2 rounded-md bg-[#2a1818]/80 px-2 py-1 text-xs font-medium text-[#f2f0eb] hover:bg-[#8a1e2e] transition-colors shadow-sm" aria-label="Copy to clipboard">
      {ok ? <Check size={14} /> : <Copy size={14} />}
    </button>
  )
}
