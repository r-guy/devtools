"use client"

import { useState, useCallback } from "react"

type Mode = "encode" | "decode"

export default function Base64Tool() {
  const [mode, setMode] = useState<Mode>("encode")
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const handleConvert = useCallback(() => {
    setError("")
    setOutput("")
    if (!input) return

    try {
      if (mode === "encode") {
        setOutput(btoa(input))
      } else {
        const decoded = atob(input)
        setOutput(decoded)
      }
    } catch {
      setError(
        mode === "encode"
          ? "Failed to encode: input contains characters outside Latin-1 range"
          : "Invalid Base64 input: check your string",
      )
    }
  }, [input, mode])

  const handleCopy = useCallback(async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [output])

  const handleClear = useCallback(() => {
    setInput("")
    setOutput("")
    setError("")
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex overflow-hidden rounded-lg border border-zinc-300 self-start dark:border-zinc-700">
        <button
          onClick={() => { setMode("encode"); setOutput(""); setError("") }}
          className={`cursor-pointer px-4 py-2 text-sm font-medium ${mode === "encode" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"}`}
        >
          Encode
        </button>
        <button
          onClick={() => { setMode("decode"); setOutput(""); setError("") }}
          className={`cursor-pointer px-4 py-2 text-sm font-medium ${mode === "decode" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"}`}
        >
          Decode
        </button>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {mode === "encode" ? "Text to encode" : "Base64 to decode"}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === "encode"
              ? "Enter text to encode to Base64..."
              : "Enter Base64 string to decode..."
          }
          className="min-h-[160px] w-full rounded-lg border border-zinc-300 bg-white p-4 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
          spellCheck={false}
        />
        <div className="mt-1 text-xs text-zinc-400">
          {input.length} {input.length === 1 ? "character" : "characters"}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleConvert}
          className="flex-1 cursor-pointer rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {mode === "encode" ? "Encode" : "Decode"}
        </button>
        <button
          onClick={handleClear}
          className="cursor-pointer flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Clear
        </button>
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
              {mode === "encode" ? "Base64 output" : "Decoded text"}
            </label>
            {output && (
              <button
                onClick={handleCopy}
                className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            className="min-h-[120px] w-full rounded-lg border border-zinc-300 bg-zinc-50 p-4 font-mono text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            spellCheck={false}
          />
        </div>
      )}
    </div>
  )
}
