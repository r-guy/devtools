"use client"

import { useState, useCallback, useMemo } from "react"

interface MatchResult {
  match: string
  index: number
  length: number
  groups: Record<string, string> | null
}

export default function RegexTester() {
  const [pattern, setPattern] = useState("")
  const [flags, setFlags] = useState("g")
  const [testString, setTestString] = useState("")
  const [copied, setCopied] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [tooltip, setTooltip] = useState<string | null>(null)

  const toggleFlag = useCallback((flag: string) => {
    setFlags((prev) => (prev.includes(flag) ? prev.replace(flag, "") : prev + flag))
  }, [])

  const { regex, error, matches } = useMemo(() => {
    if (!pattern) return { regex: null, error: null, matches: [] }
    try {
      const regex = new RegExp(pattern, flags)
      const matches: MatchResult[] = []

      if (flags.includes("g")) {
        let match
        while ((match = regex.exec(testString)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            length: match[0].length,
            groups: match.groups || null,
          })
          if (match[0].length === 0) regex.lastIndex++
        }
      } else {
        const match = regex.exec(testString)
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            length: match[0].length,
            groups: match.groups || null,
          })
        }
      }

      return { regex, error: null, matches }
    } catch (err) {
      return { regex: null, error: (err as Error).message, matches: [] }
    }
  }, [pattern, flags, testString])

  const highlightedString = useMemo(() => {
    if (!testString || matches.length === 0) return null

    const parts: { text: string; isMatch: boolean; index: number }[] = []
    let lastIndex = 0

    matches.forEach((m) => {
      if (m.index > lastIndex) {
        parts.push({ text: testString.slice(lastIndex, m.index), isMatch: false, index: lastIndex })
      }
      parts.push({ text: m.match, isMatch: true, index: m.index })
      lastIndex = m.index + m.length
    })

    if (lastIndex < testString.length) {
      parts.push({ text: testString.slice(lastIndex), isMatch: false, index: lastIndex })
    }

    return parts
  }, [testString, matches])

  const handleCopyPattern = useCallback(async () => {
    await navigator.clipboard.writeText(`/${pattern}/${flags}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [pattern, flags])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Regular Expression
          </label>
          <button
            onClick={() => setShowHelp((v) => !v)}
            className="inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-white text-[10px] font-bold text-black transition-colors hover:bg-zinc-200 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            i
          </button>
        </div>

        {showHelp && (
          <div className="mb-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs dark:border-zinc-700 dark:bg-zinc-900">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h4 className="mb-1.5 font-semibold text-zinc-700 dark:text-zinc-300">Anchors</h4>
                <table className="w-full">
                  <tbody>
                    <tr><td className="pr-4 font-mono text-blue-600 dark:text-blue-400">^</td><td className="text-zinc-500 dark:text-zinc-400">Start of string</td></tr>
                    <tr><td className="pr-4 font-mono text-blue-600 dark:text-blue-400">$</td><td className="text-zinc-500 dark:text-zinc-400">End of string</td></tr>
                    <tr><td className="pr-4 font-mono text-blue-600 dark:text-blue-400">\b</td><td className="text-zinc-500 dark:text-zinc-400">Word boundary</td></tr>
                  </tbody>
                </table>
              </div>
              <div>
                <h4 className="mb-1.5 font-semibold text-zinc-700 dark:text-zinc-300">Character Classes</h4>
                <table className="w-full">
                  <tbody>
                    <tr><td className="pr-4 font-mono text-blue-600 dark:text-blue-400">\d</td><td className="text-zinc-500 dark:text-zinc-400">Digit (0-9)</td></tr>
                    <tr><td className="pr-4 font-mono text-blue-600 dark:text-blue-400">\w</td><td className="text-zinc-500 dark:text-zinc-400">Word char (a-z, A-Z, 0-9, _)</td></tr>
                    <tr><td className="pr-4 font-mono text-blue-600 dark:text-blue-400">\s</td><td className="text-zinc-500 dark:text-zinc-400">Whitespace</td></tr>
                    <tr><td className="pr-4 font-mono text-blue-600 dark:text-blue-400">.</td><td className="text-zinc-500 dark:text-zinc-400">Any char (except newline)</td></tr>
                    <tr><td className="pr-4 font-mono text-blue-600 dark:text-blue-400">[abc]</td><td className="text-zinc-500 dark:text-zinc-400">Any of a, b, c</td></tr>
                    <tr><td className="pr-4 font-mono text-blue-600 dark:text-blue-400">[^abc]</td><td className="text-zinc-500 dark:text-zinc-400">Not a, b, or c</td></tr>
                  </tbody>
                </table>
              </div>
              <div>
                <h4 className="mb-1.5 font-semibold text-zinc-700 dark:text-zinc-300">Quantifiers</h4>
                <table className="w-full">
                  <tbody>
                    <tr><td className="pr-4 font-mono text-blue-600 dark:text-blue-400">*</td><td className="text-zinc-500 dark:text-zinc-400">0 or more</td></tr>
                    <tr><td className="pr-4 font-mono text-blue-600 dark:text-blue-400">+</td><td className="text-zinc-500 dark:text-zinc-400">1 or more</td></tr>
                    <tr><td className="pr-4 font-mono text-blue-600 dark:text-blue-400">?</td><td className="text-zinc-500 dark:text-zinc-400">0 or 1</td></tr>
                    <tr><td className="pr-4 font-mono text-blue-600 dark:text-blue-400">{`{3}`}</td><td className="text-zinc-500 dark:text-zinc-400">Exactly 3</td></tr>
                    <tr><td className="pr-4 font-mono text-blue-600 dark:text-blue-400">{`{2,4}`}</td><td className="text-zinc-500 dark:text-zinc-400">2 to 4</td></tr>
                    <tr><td className="pr-4 font-mono text-blue-600 dark:text-blue-400">{`{2,}`}</td><td className="text-zinc-500 dark:text-zinc-400">2 or more</td></tr>
                  </tbody>
                </table>
              </div>
              <div>
                <h4 className="mb-1.5 font-semibold text-zinc-700 dark:text-zinc-300">Groups &amp; Flags</h4>
                <table className="w-full">
                  <tbody>
                    <tr><td className="pr-4 font-mono text-blue-600 dark:text-blue-400">(abc)</td><td className="text-zinc-500 dark:text-zinc-400">Capture group</td></tr>
                    <tr><td className="pr-4 font-mono text-blue-600 dark:text-blue-400">(?:abc)</td><td className="text-zinc-500 dark:text-zinc-400">Non-capturing group</td></tr>
                    <tr><td className="pr-4 font-mono text-blue-600 dark:text-blue-400">a|b</td><td className="text-zinc-500 dark:text-zinc-400">Match a or b</td></tr>
                    <tr><td className="pr-4 font-mono text-blue-600 dark:text-blue-400">g</td><td className="text-zinc-500 dark:text-zinc-400">Global (all matches)</td></tr>
                    <tr><td className="pr-4 font-mono text-blue-600 dark:text-blue-400">i</td><td className="text-zinc-500 dark:text-zinc-400">Case insensitive</td></tr>
                    <tr><td className="pr-4 font-mono text-blue-600 dark:text-blue-400">m</td><td className="text-zinc-500 dark:text-zinc-400">Multiline (^/$ per line)</td></tr>
                    <tr><td className="pr-4 font-mono text-blue-600 dark:text-blue-400">s</td><td className="text-zinc-500 dark:text-zinc-400">Dotall (. matches newline)</td></tr>
                    <tr><td className="pr-4 font-mono text-blue-600 dark:text-blue-400">u</td><td className="text-zinc-500 dark:text-zinc-400">Unicode support</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        <div className="flex rounded-lg border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-800">
          <span className="flex items-center px-3 text-zinc-400">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern..."
            className="flex-1 bg-transparent py-2 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none dark:text-zinc-100 dark:placeholder-zinc-500"
            spellCheck={false}
          />
          <span className="flex items-center px-3 text-zinc-400">/</span>
          <div className="flex items-center gap-1 border-l border-zinc-300 px-3 dark:border-zinc-700">
            {[
              { key: "g", label: "Find all matches" },
              { key: "i", label: "Ignore letter case" },
              { key: "m", label: "Per line matching" },
              { key: "s", label: "Dot matches newlines" },
              { key: "u", label: "Unicode-aware matching" },
            ].map(({ key, label }) => (
              <div key={key} className="relative">
                <button
                  onClick={() => toggleFlag(key)}
                  onMouseEnter={() => setTooltip(key)}
                  onMouseLeave={() => setTooltip(null)}
                  className={`cursor-pointer rounded px-2 py-0.5 font-mono text-xs font-medium transition-colors ${flags.includes(key)
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    }`}
                >
                  {key}
                </button>
                {tooltip === key && (
                  <div className="absolute top-[calc(100%+0.7rem)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] text-white z-10 dark:bg-zinc-200 dark:text-zinc-900">
                    {label}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {error && (
          <div className="mt-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Test String
        </label>
        <textarea
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="Enter text to test against..."
          className="min-h-[120px] w-full rounded-lg border border-zinc-300 bg-white p-4 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
          spellCheck={false}
        />
      </div>

      {highlightedString && (
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Matches
          </label>
          <div className="rounded-lg border border-zinc-300 bg-zinc-50 p-4 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900">
            {highlightedString.map((part, i) => (
              <span
                key={i}
                className={
                  part.isMatch
                    ? "rounded bg-yellow-200 px-0.5 text-zinc-900 dark:bg-yellow-800 dark:text-zinc-100"
                    : "text-zinc-700 dark:text-zinc-300"
                }
              >
                {part.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {matches.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Match Details ({matches.length} {matches.length === 1 ? "match" : "matches"})
          </label>
          <div className="flex flex-col gap-2">
            {matches.map((m, i) => (
              <div
                key={i}
                className="rounded-lg border border-zinc-300 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Match {i + 1}
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    Index: {m.index}
                  </span>
                </div>
                <div className="mt-1 font-mono text-sm text-zinc-900 dark:text-zinc-100">
                  {m.match}
                </div>
                {m.groups && Object.keys(m.groups).length > 0 && (
                  <div className="mt-2 border-t border-zinc-200 pt-2 dark:border-zinc-700">
                    <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Groups:
                    </div>
                    {Object.entries(m.groups).map(([key, value]) => (
                      <div key={key} className="mt-1 flex gap-2 text-xs">
                        <span className="font-medium text-zinc-600 dark:text-zinc-400">
                          {key}:
                        </span>
                        <span className="font-mono text-zinc-900 dark:text-zinc-100">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {pattern && (
        <div className="flex items-center justify-between rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900">
          <code className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
            /{pattern}/{flags}
          </code>
          <button
            onClick={handleCopyPattern}
            className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}
    </div>
  )
}
