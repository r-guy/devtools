"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Search, Plus, Trash2 } from "lucide-react"

interface ColorStop {
  id: number
  color: string
  position: number
}

function buildCss(type: string, angle: number, stops: ColorStop[]): { value: string; declaration: string } {
  const sorted = [...stops].sort((a, b) => a.position - b.position)
  const parts = sorted.map((s) => `${s.color} ${s.position}%`).join(", ")
  const value = type === "radial" ? `radial-gradient(circle, ${parts})` : `linear-gradient(${angle}deg, ${parts})`
  return { value, declaration: `background: ${value};` }
}
export default function GradientViewer() {
  const nextId = useRef(1)
  const previewRef = useRef<HTMLDivElement>(null)

  const [type, setType] = useState<"linear" | "radial">("linear")
  const [angle, setAngle] = useState(180)
  const [stops, setStops] = useState<ColorStop[]>(() => [
    { id: nextId.current++, color: "#ff6b6b", position: 0 },
    { id: nextId.current++, color: "#48dbfb", position: 100 },
  ])
  const [copied, setCopied] = useState(false)
  const [previewSize, setPreviewSize] = useState({ w: 0, h: 176 })


  useEffect(() => {
    if (type === "radial") {
      setPreviewSize((prev) => prev.w === 0 && prev.h === 176 ? { w: 256, h: 256 } : prev)
    } else {
      setPreviewSize((prev) => prev.w === 256 && prev.h === 256 ? { w: 0, h: 176 } : prev)
    }
  }, [type])

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    const el = previewRef.current
    const startW = previewSize.w > 0 ? previewSize.w : (el ? el.getBoundingClientRect().width : 300)
    const startH = previewSize.h

    const handleMouseMove = (me: MouseEvent) => {
      setPreviewSize({
        w: Math.max(100, startW + me.clientX - startX),
        h: Math.max(60, startH + me.clientY - startY),
      })
    }

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    document.body.style.cursor = "nwse-resize"
    document.body.style.userSelect = "none"
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }, [previewSize])

  const css = buildCss(type, angle, stops)

  const updateStop = useCallback((id: number, updates: Partial<ColorStop>) => {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }, [])

  const removeStop = useCallback((id: number) => {
    setStops((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const addStop = useCallback(() => {
    setStops((prev) => {
      const mid = prev.length > 1 ? Math.round((prev[prev.length - 1].position + prev[0].position) / 2) : 50
      return [...prev, { id: nextId.current++, color: "#a8e6cf", position: Math.min(100, Math.max(0, mid)) }]
    })
  }, [])

  const handleEyeDropper = useCallback(async (stopId: number) => {
    try {
      const eyeDropper = new (window as unknown as { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper()
      const result = await eyeDropper.open()
      updateStop(stopId, { color: result.sRGBHex })
    } catch {
      // dismissed
    }
  }, [updateStop])

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(css.declaration)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [css])

  return (
    <div className="flex flex-col gap-6">
      <div ref={previewRef} className="relative rounded-xl border border-zinc-300 dark:border-zinc-700 overflow-hidden group"
        style={{
          background: css.value,
          width: previewSize.w > 0 ? previewSize.w : undefined,
          height: previewSize.h,
        }}
      >
        <div
          className="absolute bottom-0 right-0 w-6 h-6 flex items-center justify-center cursor-nwse-resize bg-white/40 rounded-tl-lg dark:bg-black/40"
          onMouseDown={handleResizeStart}
        >
          <svg viewBox="0 0 16 16" className="w-5 h-5" style={{ color: "#f0f0f0" }}>
            <rect x="3" y="3" width="10" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1.5" />
          </svg>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">Type</label>
          <div className="flex overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700">
            <button onClick={() => setType("linear")}
              className={`px-3 py-1.5 text-sm font-medium cursor-pointer ${type === "linear" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300"}`}>
              Linear
            </button>
            <button onClick={() => setType("radial")}
              className={`px-3 py-1.5 text-sm font-medium cursor-pointer ${type === "radial" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300"}`}>
              Radial
            </button>
          </div>
        </div>

        {type === "linear" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">Angle: {angle}°</label>
            <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(parseInt(e.target.value))}
              className="w-28 cursor-pointer accent-zinc-900 dark:accent-zinc-100" />
          </div>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Color Stops</label>
          <button onClick={addStop}
            className="cursor-pointer flex items-center gap-1 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <Plus className="w-3 h-3" /> Add stop
          </button>
        </div>

        <div className="relative h-6 rounded-lg overflow-hidden mb-4"
          style={{ background: `linear-gradient(to right, ${stops.sort((a, b) => a.position - b.position).map(s => `${s.color} ${s.position}%`).join(", ")})` }}>
        </div>

        <div className="flex flex-col gap-2">
          {[...stops].sort((a, b) => a.position - b.position).map((stop) => (
            <div key={stop.id} className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <input type="color" value={stop.color} onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                  className="w-8 h-8 cursor-pointer rounded border border-zinc-300 bg-white p-0.5 dark:border-zinc-700" />
                <button onClick={() => handleEyeDropper(stop.id)}
                  className="cursor-pointer rounded border border-zinc-300 bg-white p-1 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                  title="Pick from screen">
                  <Search className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                </button>
              </div>
              <input type="text" value={stop.color} onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                className="w-24 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 font-mono text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                spellCheck={false} />
              <input type="range" min={0} max={100} value={stop.position}
                onChange={(e) => updateStop(stop.id, { position: parseInt(e.target.value) })}
                className="flex-1 cursor-pointer accent-zinc-900 dark:accent-zinc-100" />
              <span className="w-8 text-right text-xs text-zinc-500 tabular-nums">{stop.position}%</span>
              <button onClick={() => removeStop(stop.id)}
                className="cursor-pointer rounded border border-zinc-300 bg-white p-1 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700">
                <Trash2 className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">CSS Output</label>
          <button onClick={handleCopy}
            className="cursor-pointer flex items-center gap-1 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <pre className="overflow-x-auto rounded-lg border border-zinc-300 bg-zinc-50 p-4 font-mono text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
          {css.declaration}
        </pre>
      </div>
    </div>
  )
}
