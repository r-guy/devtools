"use client"

import { useState, useCallback } from "react"

type UuidVersion = "v4" | "v7"
type UuidCase = "lower" | "upper"
type UuidFormat = "canonical" | "no-hyphens" | "curly" | "parentheses"

function generateUuidV4(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function generateUuidV7(): string {
  const ts = Date.now()
  const hex = (ts * 0x1000000).toString(16).slice(0, 12)
  const rest = Array.from(crypto.getRandomValues(new Uint8Array(10)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("")
  const raw = `${hex}${rest}`
  const bytes = raw.match(/.{1,2}/g)!.map((b) => parseInt(b, 16))
  bytes[6] = (bytes[6] & 0x0f) | 0x70
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex2 = bytes.map((b) => b.toString(16).padStart(2, "0")).join("")
  return `${hex2.slice(0, 8)}-${hex2.slice(8, 12)}-${hex2.slice(12, 16)}-${hex2.slice(16, 20)}-${hex2.slice(20)}`
}

function formatUuid(uuid: string, outputCase: UuidCase, format: UuidFormat): string {
  let result = outputCase === "upper" ? uuid.toUpperCase() : uuid.toLowerCase()
  switch (format) {
    case "canonical":
      break
    case "no-hyphens":
      result = result.replace(/-/g, "")
      break
    case "curly":
      result = `{${result}}`
      break
    case "parentheses":
      result = `(${result})`
      break
  }
  return result
}

export default function UuidGenerator() {
  const [version, setVersion] = useState<UuidVersion>("v4")
  const [count, setCount] = useState(1)
  const [outputCase, setOutputCase] = useState<UuidCase>("lower")
  const [format, setFormat] = useState<UuidFormat>("canonical")
  const [uuids, setUuids] = useState<string[]>(() =>
    Array.from({ length: 1 }, () => formatUuid(generateUuidV4(), "lower", "canonical")),
  )
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const generate = useCallback(() => {
    const gen = version === "v7" ? generateUuidV7 : generateUuidV4
    setUuids(Array.from({ length: count }, () => formatUuid(gen(), outputCase, format)))
  }, [version, count, outputCase, format])

  const handleCopy = useCallback(async (value: string, index: number) => {
    await navigator.clipboard.writeText(value)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 1500)
  }, [])

  const handleCopyAll = useCallback(async () => {
    await navigator.clipboard.writeText(uuids.join("\n"))
    setCopiedIndex(-1)
    setTimeout(() => setCopiedIndex(null), 1500)
  }, [uuids])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Version
          </label>
          <div className="flex overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700">
            <button
              onClick={() => setVersion("v4")}
              className={`cursor-pointer px-3 py-1.5 text-sm font-medium ${version === "v4" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"}`}
            >
              v4 (Random)
            </button>
            <button
              onClick={() => setVersion("v7")}
              className={`cursor-pointer px-3 py-1.5 text-sm font-medium ${version === "v7" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"}`}
            >
              v7 (Timestamp)
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Count
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-20 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Case
          </label>
          <div className="flex overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700">
            <button
              onClick={() => setOutputCase("lower")}
              className={`cursor-pointer px-3 py-1.5 text-sm font-medium ${outputCase === "lower" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"}`}
            >
              a-f
            </button>
            <button
              onClick={() => setOutputCase("upper")}
              className={`cursor-pointer px-3 py-1.5 text-sm font-medium ${outputCase === "upper" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"}`}
            >
              A-F
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Format
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as UuidFormat)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="canonical">xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx</option>
            <option value="no-hyphens">xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</option>
            <option value="curly">{`{xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}`}</option>
            <option value="parentheses">(xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)</option>
          </select>
        </div>

        <div className="self-end">
          <button
            onClick={generate}
            className="cursor-pointer rounded-lg bg-zinc-900 px-5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Generate
          </button>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {uuids.length === 1 ? "UUID" : `UUIDs (${uuids.length})`}
          </span>
          {uuids.length > 1 && (
            <button
              onClick={handleCopyAll}
              className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              {copiedIndex === -1 ? "Copied!" : "Copy All"}
            </button>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          {uuids.map((uuid, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-zinc-300 bg-white px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <code className="font-mono text-sm text-zinc-900 dark:text-zinc-100">
                {uuid}
              </code>
              <button
                onClick={() => handleCopy(uuid, i)}
                className="ml-3 flex shrink-0 cursor-pointer items-center gap-1 rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600 dark:hover:text-zinc-200"
              >
                {copiedIndex === i ? "Copied" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
