"use client"

import { useState, useCallback } from "react"

const timezones = [
  { value: "Asia/Kolkata", label: "IST (+5:30)" },
  { value: "UTC", label: "UTC (+0:00)" },
  { value: "America/New_York", label: "EST (-5:00)" },
  { value: "America/Chicago", label: "CST (-6:00)" },
  { value: "America/Denver", label: "MST (-7:00)" },
  { value: "America/Los_Angeles", label: "PST (-8:00)" },
  { value: "Europe/London", label: "GMT (+0:00)" },
  { value: "Europe/Berlin", label: "CET (+1:00)" },
  { value: "Asia/Dubai", label: "GST (+4:00)" },
  { value: "Asia/Singapore", label: "SGT (+8:00)" },
  { value: "Asia/Tokyo", label: "JST (+9:00)" },
  { value: "Australia/Sydney", label: "AEST (+10:00)" },
]

function formatInTZ(date: Date, tz: string): string {
  const locale = tz === "UTC" ? "en-US" : undefined
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }
  const parts = new Intl.DateTimeFormat(locale, opts).formatToParts(date)
  const map: Record<string, string> = {}
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = p.value
  }
  return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second} ${map.timeZoneName || ""}`.trim()
}

export default function TimestampConverter() {
  const [timestamp, setTimestamp] = useState("")
  const [dateStr, setDateStr] = useState("")
  const [timezone, setTimezone] = useState("UTC")
  const [formatted, setFormatted] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const getTzLabel = useCallback((tz: string) => timezones.find((t) => t.value === tz)?.label || tz, [])

  const convertTimestamp = useCallback((val: string, tz: string) => {
    setError(null)
    setFormatted("")
    if (!val.trim()) return
    const n = parseInt(val, 10)
    if (isNaN(n)) {
      setError("Invalid timestamp")
      return
    }
    const ms = val.length <= 10 ? n * 1000 : n
    const d = new Date(ms)
    if (isNaN(d.getTime())) {
      setError("Invalid timestamp value")
      return
    }
    setDateStr(d.toISOString().replace("T", " ").slice(0, 19))
    const label = getTzLabel(tz)
    setFormatted(`${d.toString()}\nISO 8601: ${d.toISOString()}\nUTC: ${d.toUTCString()}\n${label}: ${formatInTZ(d, tz)}`)
  }, [getTzLabel])

  const convertDate = useCallback((val: string, tz: string) => {
    setError(null)
    setTimestamp("")
    setFormatted("")
    if (!val.trim()) return
    const d = new Date(val)
    if (isNaN(d.getTime())) {
      setError("Invalid date string")
      return
    }
    const sec = Math.floor(d.getTime() / 1000)
    const ms = d.getTime()
    setTimestamp(sec.toString())
    const label = getTzLabel(tz)
    setFormatted(`Seconds: ${sec}\nMilliseconds: ${ms}\n${label}: ${formatInTZ(d, tz)}`)
  }, [getTzLabel])

  const now = useCallback(() => {
    const ts = String(Math.floor(Date.now() / 1000))
    const tz = timezone
    setTimestamp(ts)
    convertTimestamp(ts, tz)
  }, [timezone, convertTimestamp])

  const handleCopy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [])

  const handleTzChange = useCallback((newTz: string) => {
    setTimezone(newTz)
    if (timestamp) convertTimestamp(timestamp, newTz)
    if (dateStr) convertDate(dateStr, newTz)
  }, [timestamp, dateStr, convertTimestamp, convertDate])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Timestamp → Date
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={timestamp}
            onChange={(e) => { setTimestamp(e.target.value); convertTimestamp(e.target.value, timezone) }}
            placeholder="Enter Unix timestamp (seconds or ms)..."
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
            spellCheck={false}
          />
          <button
            onClick={now}
            className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Now
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Date → Timestamp
          </label>
          <input
            type="text"
            value={dateStr}
            onChange={(e) => { setDateStr(e.target.value); convertDate(e.target.value, timezone) }}
            placeholder="Enter ISO date (e.g. 2024-01-15T14:30:00)..."
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
            spellCheck={false}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => handleTzChange(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {formatted && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Result
            </label>
            <button
              onClick={() => handleCopy(formatted)}
              className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="rounded-lg border border-zinc-300 bg-zinc-50 p-4 font-mono text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            {formatted}
          </pre>
        </div>
      )}
    </div>
  )
}
