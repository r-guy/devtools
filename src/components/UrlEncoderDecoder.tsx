"use client"

import { useState, useCallback } from "react"

export default function UrlEncoderDecoder() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [mode, setMode] = useState<"encode" | "decode">("encode")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const process = useCallback((text: string, m: "encode" | "decode") => {
    setError(null)
    if (!text.trim()) {
      setOutput("")
      return
    }
    try {
      if (m === "encode") {
        setOutput(encodeURIComponent(text))
      } else {
        setOutput(decodeURIComponent(text))
      }
    } catch {
      setError("Failed to decode — check for invalid percent sequences")
      setOutput("")
    }
  }, [])

  const handleCopy = useCallback(async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [output])

  const swapMode = useCallback(() => {
    const next = mode === "encode" ? "decode" : "encode"
    setMode(next)
    setInput(output)
    setOutput("")
    setError(null)
  }, [mode, output])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        <button
          onClick={() => { setMode("encode"); process(input, "encode") }}
          className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === "encode" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"}`}
        >
          Encode
        </button>
        <button
          onClick={() => { setMode("decode"); process(input, "decode") }}
          className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === "decode" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"}`}
        >
          Decode
        </button>
        <button
          onClick={swapMode}
          className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
        >
          Swap
        </button>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {mode === "encode" ? "Text to Encode" : "URL to Decode"}
        </label>
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); process(e.target.value, mode) }}
          placeholder={mode === "encode" ? "Enter text to URL-encode..." : "Enter URL-encoded string to decode..."}
          className="min-h-[120px] w-full rounded-lg border border-zinc-300 bg-white p-4 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
          spellCheck={false}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {output && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {mode === "encode" ? "Encoded" : "Decoded"}
            </label>
            <button
              onClick={handleCopy}
              className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="whitespace-pre-wrap break-all rounded-lg border border-zinc-300 bg-zinc-50 p-4 font-mono text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            {output}
          </pre>
        </div>
      )}
    </div>
  )
}
