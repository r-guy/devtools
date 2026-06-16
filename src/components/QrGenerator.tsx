"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import QRCode from "qrcode"

type ErrorLevel = "L" | "M" | "Q" | "H"

const errorLevelLabels: Record<ErrorLevel, string> = {
  L: "Low - recovers 7% damage",
  M: "Medium - recovers 15% damage",
  Q: "Quartile - recovers 25% damage",
  H: "High - recovers 30% damage",
}

export default function QrGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [text, setText] = useState("https://example.com")
  const [size, setSize] = useState(256)
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>("M")
  const [fgColor, setFgColor] = useState("#000000")
  const [bgColor, setBgColor] = useState("#ffffff")
  const [copied, setCopied] = useState(false)
  const [tooltip, setTooltip] = useState<string | null>(null)

  const generate = useCallback(async () => {
    if (!canvasRef.current || !text.trim()) return
    try {
      await QRCode.toCanvas(canvasRef.current, text, {
        width: size,
        margin: 2,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: errorLevel,
      })
    } catch {
      // invalid input
    }
  }, [text, size, errorLevel, fgColor, bgColor])

  useEffect(() => {
    generate()
  }, [generate])

  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return
    const link = document.createElement("a")
    link.download = "qrcode.png"
    link.href = canvasRef.current.toDataURL("image/png")
    link.click()
  }, [])

  const handleCopyImage = useCallback(async () => {
    if (!canvasRef.current) return
    const blob = await new Promise<Blob | null>((resolve) =>
      canvasRef.current!.toBlob(resolve, "image/png"),
    )
    if (blob) {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ])
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      } catch {
        // fallback: copy as text
      }
    }
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Text or URL
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text or URL to encode..."
          className="min-h-[80px] w-full rounded-lg border border-zinc-300 bg-white p-4 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
          spellCheck={false}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">Size: {size}px</label>
          <input type="range" min={128} max={512} step={8} value={size} onChange={(e) => setSize(parseInt(e.target.value))}
            className="w-28 cursor-pointer accent-zinc-900 dark:accent-zinc-100" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">Error correction</label>
          <div className="flex rounded-lg border border-zinc-300 dark:border-zinc-700">
            {(Object.keys(errorLevelLabels) as ErrorLevel[]).map((level, i, arr) => (
              <div key={level} className="relative">
                <div className={`overflow-hidden ${i === 0 ? "rounded-l-lg" : ""} ${i === arr.length - 1 ? "rounded-r-lg" : ""}`}>
                  <button
                    onClick={() => setErrorLevel(level)}
                    onMouseEnter={() => setTooltip(level)}
                    onMouseLeave={() => setTooltip(null)}
                    className={`cursor-pointer px-2.5 py-1.5 text-xs font-medium ${i < arr.length - 1 ? "border-r border-zinc-300 dark:border-zinc-700" : ""} ${
                      errorLevel === level
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    {level}
                  </button>
                </div>
                {tooltip === level && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] text-white z-10 dark:bg-zinc-200 dark:text-zinc-900">
                    {errorLevelLabels[level]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">Foreground</label>
          <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)}
            className="h-8 w-10 cursor-pointer rounded border border-zinc-300 bg-white p-0.5 dark:border-zinc-700" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">Background</label>
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
            className="h-8 w-10 cursor-pointer rounded border border-zinc-300 bg-white p-0.5 dark:border-zinc-700" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div
          className="inline-flex rounded-xl border border-zinc-300 p-4 dark:border-zinc-700"
          style={{ backgroundColor: bgColor }}
        >
          <canvas ref={canvasRef} width={size} height={size} className="block" />
        </div>

        <div className="flex gap-2">
          <button onClick={handleDownload}
            className="cursor-pointer rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">
            Download PNG
          </button>
          <button onClick={handleCopyImage}
            className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {copied ? "Copied!" : "Copy Image"}
          </button>
        </div>
      </div>
    </div>
  )
}
