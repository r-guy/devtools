"use client"

import { useState, useCallback, useMemo } from "react"
import JsonTree from "./JsonTree"

export default function JsonFormatter() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const parsedInput = useMemo(() => {
    if (!input.trim()) return null
    try {
      return JSON.parse(input)
    } catch {
      return null
    }
  }, [input])

  const parsedOutput = useMemo(() => {
    if (!output.trim() || output === "✓ Valid JSON") return null
    try {
      return JSON.parse(output)
    } catch {
      return null
    }
  }, [output])

  const handleFormat = useCallback(
    (space: number | string = 2) => {
      setError("")
      try {
        const parsed = JSON.parse(input)
        setOutput(JSON.stringify(parsed, null, space))
      } catch {
        setError("Invalid JSON: please check your syntax")
      }
    },
    [input],
  )

  const handleMinify = useCallback(() => {
    setError("")
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed))
    } catch {
      setError("Invalid JSON: please check your syntax")
    }
  }, [input])

  const handleValidate = useCallback(() => {
    setError("")
    try {
      JSON.parse(input)
      setOutput("✓ Valid JSON")
    } catch {
      setError("✗ Invalid JSON: please check your syntax")
      setOutput("")
    }
  }, [input])

  const handleCopy = useCallback(async () => {
    if (!output || output === "✓ Valid JSON") return
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
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Input JSON
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Paste or type your JSON here, e.g. {"name":"Hello"}'
          className="min-h-[200px] w-full rounded-lg border border-zinc-300 bg-white p-4 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-400"
          spellCheck={false}
        />
        <div className="mt-1 text-xs text-zinc-400">
          {input.length} characters, {input ? input.split("\n").length : 0} lines
        </div>
      </div>

      {parsedInput !== null && (
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Input Tree View
          </label>
          <div className="overflow-x-auto rounded-lg border border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
            <JsonTree data={parsedInput} defaultExpanded={true} />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleFormat(2)}
          className="flex-1 cursor-pointer rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Format
        </button>
        <button
          onClick={() => handleFormat(4)}
          className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Format (4 spaces)
        </button>
        <button
          onClick={handleMinify}
          className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Minify
        </button>
        <button
          onClick={handleValidate}
          className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Validate
        </button>
        <button
          onClick={handleClear}
          className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
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
              Output
            </label>
            {parsedOutput !== null && (
              <button
                onClick={handleCopy}
                className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
          {parsedOutput !== null ? (
            <div className="overflow-x-auto rounded-lg border border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
              <JsonTree data={parsedOutput} defaultExpanded={true} />
            </div>
          ) : (
            <pre className="overflow-x-auto rounded-lg border border-zinc-300 bg-zinc-50 p-4 font-mono text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
              {output}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
