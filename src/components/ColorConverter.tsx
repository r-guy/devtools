"use client"

import React, { useState, useCallback, useEffect, useRef } from "react"
import { Search } from "lucide-react"

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace(/^#/, "")
  if (!/^[0-9a-fA-F]{6}$/.test(clean) && !/^[0-9a-fA-F]{3}$/.test(clean)) return null
  const full = clean.length === 3 ? clean.replace(/./g, (c) => c + c) : clean
  const num = parseInt(full, 16)
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const nr = r / 255, ng = g / 255, nb = b / 255
  const max = Math.max(nr, ng, nb), min = Math.min(nr, ng, nb)
  let h = 0, s = 0, l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case nr: h = ((ng - nb) / d + (ng < nb ? 6 : 0)) / 6; break
      case ng: h = ((nb - nr) / d + 2) / 6; break
      case nb: h = ((nr - ng) / d + 4) / 6; break
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const hn = h / 360, sn = s / 100, ln = l / 100
  if (sn === 0) {
    const v = Math.round(ln * 255)
    return { r: v, g: v, b: v }
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn
  const p = 2 * ln - q
  return {
    r: Math.round(hue2rgb(p, q, hn + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hn) * 255),
    b: Math.round(hue2rgb(p, q, hn - 1 / 3) * 255),
  }
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const nr = r / 255, ng = g / 255, nb = b / 255
  const max = Math.max(nr, ng, nb), min = Math.min(nr, ng, nb)
  let h = 0, s = 0, v = max
  const d = max - min
  s = max === 0 ? 0 : d / max
  if (d !== 0) {
    switch (max) {
      case nr: h = ((ng - nb) / d + (ng < nb ? 6 : 0)) / 6; break
      case ng: h = ((nb - nr) / d + 2) / 6; break
      case nb: h = ((nr - ng) / d + 4) / 6; break
    }
  }
  return { h: h * 360, s: s * 100, v: v * 100 }
}

function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  const hn = h / 60, sn = s / 100, vn = v / 100
  const c = vn * sn
  const x = c * (1 - Math.abs((hn % 2) - 1))
  const m = vn - c
  let r = 0, g = 0, b = 0
  const i = Math.floor(hn) % 6
  switch (i) {
    case 0: r = c; g = x; break
    case 1: r = x; g = c; break
    case 2: g = c; b = x; break
    case 3: g = x; b = c; break
    case 4: r = x; b = c; break
    case 5: r = c; b = x; break
  }
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) }
}

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val))
}

function parseRgba(str: string): { r: number; g: number; b: number; a: number } | null {
  const m = str.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i)
  if (!m) return null
  return {
    r: clamp(parseInt(m[1]), 0, 255),
    g: clamp(parseInt(m[2]), 0, 255),
    b: clamp(parseInt(m[3]), 0, 255),
    a: m[4] !== undefined ? clamp(parseFloat(m[4]), 0, 1) : 1,
  }
}

function parseHsla(str: string): { h: number; s: number; l: number; a: number } | null {
  const m = str.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%(?:\s*,\s*([\d.]+))?\s*\)/i)
  if (!m) return null
  return {
    h: clamp(parseInt(m[1]), 0, 360),
    s: clamp(parseInt(m[2]), 0, 100),
    l: clamp(parseInt(m[3]), 0, 100),
    a: m[4] !== undefined ? clamp(parseFloat(m[4]), 0, 1) : 1,
  }
}

type ColorSource = "picker" | "alpha" | "hex" | "rgb" | "hsl"

export default function ColorConverter() {
  const svRef = useRef<HTMLDivElement>(null)
  const hueRef = useRef<HTMLDivElement>(null)

  const [hex, setHex] = useState("#3498db")
  const [rgb, setRgb] = useState("rgba(52, 152, 219, 1)")
  const [hsl, setHsl] = useState("hsla(204, 70%, 53%, 1)")
  const [alpha, setAlpha] = useState(1)
  const [source, setSource] = useState<ColorSource>("hex")
  const [copied, setCopied] = useState("")

  const [hue, setHue] = useState(204)
  const [sat, setSat] = useState(70)
  const [val, setVal] = useState(86)
  const [dragging, setDragging] = useState<"sv" | "hue" | null>(null)

  const syncFromRgb = useCallback((r: number, g: number, b: number, a: number) => {
    setHex(rgbToHex(r, g, b))
    setRgb(`rgba(${r}, ${g}, ${b}, ${a})`)
    const h = rgbToHsl(r, g, b)
    setHsl(`hsla(${h.h}, ${h.s}%, ${h.l}%, ${a})`)
    const hsv = rgbToHsv(r, g, b)
    setHue(Math.round(hsv.h))
    setSat(Math.round(hsv.s))
    setVal(Math.round(hsv.v))
    setAlpha(a)
  }, [])

  const updateFromRgbStr = useCallback((str: string) => {
    const parsed = parseRgba(str)
    if (parsed) {
      syncFromRgb(parsed.r, parsed.g, parsed.b, parsed.a)
    }
  }, [syncFromRgb])

  const updateFromHex = useCallback((h: string) => {
    setHex(h)
    const rgb = hexToRgb(h)
    if (rgb) {
      setRgb(`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`)
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
      setHue(Math.round(hsv.h))
      setSat(Math.round(hsv.s))
      setVal(Math.round(hsv.v))
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
      setHsl(`hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alpha})`)
    }
  }, [alpha])

  const updateFromHslStr = useCallback((str: string) => {
    const parsed = parseHsla(str)
    if (parsed) {
      const { r, g, b } = hslToRgb(parsed.h, parsed.s, parsed.l)
      syncFromRgb(r, g, b, parsed.a)
    }
  }, [syncFromRgb])

  const applyHsv = useCallback((h: number, s: number, v: number) => {
    const { r, g, b } = hsvToRgb(h, s, v)
    setHex(rgbToHex(r, g, b))
    setRgb(`rgba(${r}, ${g}, ${b}, ${alpha})`)
    const hsl = rgbToHsl(r, g, b)
    setHsl(`hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alpha})`)
    setHue(Math.round(h))
    setSat(Math.round(s))
    setVal(Math.round(v))
  }, [alpha])

  const handleEyeDropper = useCallback(async () => {
    try {
      const eyeDropper = new (window as unknown as { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper()
      const result = await eyeDropper.open()
      setSource("picker")
      const rgb = hexToRgb(result.sRGBHex)
      if (rgb) {
        setHex(result.sRGBHex)
        setRgb(`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`)
        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
        setHue(Math.round(hsv.h))
        setSat(Math.round(hsv.s))
        setVal(Math.round(hsv.v))
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
        setHsl(`hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alpha})`)
      }
    } catch {
      // EyeDropper not supported or dismissed
    }
  }, [alpha])

  const handleSvMouseDown = useCallback((e: React.MouseEvent) => {
    setDragging("sv")
    handleSvMove(e.clientX, e.clientY)
  }, [])

  const handleHueMouseDown = useCallback((e: React.MouseEvent) => {
    setDragging("hue")
    handleHueMove(e.clientX, e.clientY)
  }, [])

  const handleSvMove = useCallback((clientX: number, clientY: number) => {
    const el = svRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = clamp((clientX - rect.left) / rect.width, 0, 1)
    const y = clamp((clientY - rect.top) / rect.height, 0, 1)
    const s = Math.round(x * 100)
    const v = Math.round((1 - y) * 100)
    setSource("picker")
    applyHsv(hue, s, v)
  }, [hue, applyHsv])

  const handleHueMove = useCallback((clientX: number, clientY: number) => {
    const el = hueRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const y = clamp((clientY - rect.top) / rect.height, 0, 1)
    const h = Math.round(y * 360)
    setSource("picker")
    applyHsv(h, sat, val)
  }, [sat, val, applyHsv])

  useEffect(() => {
    if (!dragging) return
    const handleMouseMove = (e: MouseEvent) => {
      if (dragging === "sv") handleSvMove(e.clientX, e.clientY)
      else handleHueMove(e.clientX, e.clientY)
    }
    const handleMouseUp = () => setDragging(null)
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [dragging, handleSvMove, handleHueMove])

  const handleAlphaChange = useCallback((a: number) => {
    setSource("alpha")
    setAlpha(a)
    const rp = parseRgba(rgb)
    const hp = parseHsla(hsl)
    if (rp) setRgb(`rgba(${rp.r}, ${rp.g}, ${rp.b}, ${a})`)
    if (hp) setHsl(`hsla(${hp.h}, ${hp.s}%, ${hp.l}%, ${a})`)
  }, [rgb, hsl])

  const handleHexChange = useCallback((val: string) => {
    setSource("hex")
    updateFromHex(val)
  }, [updateFromHex])

  const handleRgbChange = useCallback((val: string) => {
    setSource("rgb")
    updateFromRgbStr(val)
  }, [updateFromRgbStr])

  const handleHslChange = useCallback((val: string) => {
    setSource("hsl")
    updateFromHslStr(val)
  }, [updateFromHslStr])

  const handleCopy = useCallback(async (label: string, value: string) => {
    await navigator.clipboard.writeText(value)
    setCopied(label)
    setTimeout(() => setCopied(""), 1500)
  }, [])

  useEffect(() => {
    if (source === "hex") updateFromHex(hex)
    else if (source === "rgb") updateFromRgbStr(rgb)
    else if (source === "hsl") updateFromHslStr(hsl)
  }, [])

  const valid = hexToRgb(hex) !== null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-4">
        <div className="relative aspect-square h-40 shrink-0 rounded-xl border border-zinc-300 overflow-hidden dark:border-zinc-700"
          style={{
            backgroundColor: `rgba(128,128,128,0.2)`,
            backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
            backgroundSize: `16px 16px`,
            backgroundPosition: `0 0, 0 8px, 8px -8px, -8px 0px`,
          }}
        >
          <div
            className="absolute inset-0 transition-colors"
            style={{ backgroundColor: `rgba(${parseRgba(rgb)?.r ?? 0}, ${parseRgba(rgb)?.g ?? 0}, ${parseRgba(rgb)?.b ?? 0}, ${alpha})` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={`rounded-md bg-white/80 px-3 py-1 font-mono text-sm font-medium backdrop-blur dark:bg-black/60 dark:text-zinc-100 ${valid ? "" : "text-red-500 dark:text-red-400"}`}
            >
              {hex}
            </span>
          </div>
        </div>

        <div className="flex gap-3 flex-1 min-w-0 h-40">
          <div
            ref={svRef}
            className="relative flex-1 min-w-0 rounded-lg cursor-crosshair overflow-hidden"
            style={{
              background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))`,
            }}
            onMouseDown={handleSvMouseDown}
          >
            <div
              className="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${sat}%`,
                top: `${100 - val}%`,
                boxShadow: "0 0 0 1px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.3)",
              }}
            />
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <div
              ref={hueRef}
              className="relative w-5 flex-1 rounded-lg cursor-crosshair"
              style={{
                background: "linear-gradient(to top, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
              }}
              onMouseDown={handleHueMouseDown}
            >
              <div
                className="absolute left-0 right-0 h-3 rounded-full border-2 border-white shadow-md -translate-y-1/2 pointer-events-none"
                style={{
                  top: `${(hue / 360) * 100}%`,
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.3)",
                }}
              />
            </div>
            <button
              onClick={handleEyeDropper}
              className="group relative cursor-pointer rounded-lg border border-zinc-300 bg-white p-1.5 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
              title="Pick color from screen"
            >
              <Search className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-zinc-100 dark:text-zinc-900">
                Pick color
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-100" />
              </div>
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Alpha: {alpha.toFixed(2)}
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={alpha}
          onChange={(e) => handleAlphaChange(parseFloat(e.target.value))}
          className="w-full cursor-pointer accent-zinc-900 dark:accent-zinc-100"
        />
        <div className="mt-0.5 flex justify-between text-xs text-zinc-400">
          <span>0</span>
          <span>1</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">HEX</label>
          <div className="flex">
            <input value={hex} onChange={(e) => handleHexChange(e.target.value)}
              className="flex-1 rounded-l-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              spellCheck={false} />
            <button onClick={() => handleCopy("hex", hex)}
              className="cursor-pointer rounded-r-lg border border-l-0 border-zinc-300 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-white hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-white dark:hover:text-zinc-900">
              {copied === "hex" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">RGBA</label>
          <div className="flex">
            <input value={rgb} onChange={(e) => handleRgbChange(e.target.value)}
              className="flex-1 rounded-l-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              spellCheck={false} />
            <button onClick={() => handleCopy("rgb", rgb)}
              className="cursor-pointer rounded-r-lg border border-l-0 border-zinc-300 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-white hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-white dark:hover:text-zinc-900">
              {copied === "rgb" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">HSLA</label>
          <div className="flex">
            <input value={hsl} onChange={(e) => handleHslChange(e.target.value)}
              className="flex-1 rounded-l-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              spellCheck={false} />
            <button onClick={() => handleCopy("hsl", hsl)}
              className="cursor-pointer rounded-r-lg border border-l-0 border-zinc-300 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-white hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-white dark:hover:text-zinc-900">
              {copied === "hsl" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      {!valid && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          Invalid color value
        </div>
      )}
    </div>
  )
}
