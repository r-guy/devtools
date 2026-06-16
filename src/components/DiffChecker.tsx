"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { Minimize2, Maximize2 } from "lucide-react"

interface DiffLine {
  type: "added" | "removed" | "same"
  leftNum?: number
  rightNum?: number
  text: string
}

interface CharSegment {
  text: string
  type: "same" | "diff"
}

function computeDiff(left: string, right: string): DiffLine[] {
  const leftLines = left.split("\n")
  const rightLines = right.split("\n")

  const lcs: number[][] = Array.from({ length: leftLines.length + 1 }, () =>
    Array(rightLines.length + 1).fill(0),
  )

  for (let i = 1; i <= leftLines.length; i++) {
    for (let j = 1; j <= rightLines.length; j++) {
      if (leftLines[i - 1] === rightLines[j - 1]) {
        lcs[i][j] = lcs[i - 1][j - 1] + 1
      } else {
        lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1])
      }
    }
  }

  const result: DiffLine[] = []
  let i = leftLines.length
  let j = rightLines.length

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && leftLines[i - 1] === rightLines[j - 1]) {
      result.unshift({ type: "same", leftNum: i, rightNum: j, text: leftLines[i - 1] })
      i--
      j--
    } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      result.unshift({ type: "added", rightNum: j, text: rightLines[j - 1] })
      j--
    } else if (i > 0) {
      result.unshift({ type: "removed", leftNum: i, text: leftLines[i - 1] })
      i--
    }
  }

  return result
}

function charDiff(a: string, b: string) {
  function mark(p: string, s: string) {
    const m = p.length, n = s.length
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
    for (let i = 1; i <= m; i++)
      for (let j = 1; j <= n; j++)
        dp[i][j] = p[i - 1] === s[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])

    const inLCS = new Array(m).fill(false)
    let pi = m, si = n
    while (pi > 0 && si > 0) {
      if (p[pi - 1] === s[si - 1]) { inLCS[pi - 1] = true; pi--; si-- }
      else if (dp[pi - 1][si] >= dp[pi][si - 1]) pi--
      else si--
    }

    const segs: CharSegment[] = []
    let buf = "", t: "same" | "diff" | null = null
    for (let i = 0; i < m; i++) {
      const nt = inLCS[i] ? "same" : "diff"
      if (nt !== t) { if (buf) segs.push({ text: buf, type: t! }); buf = p[i]; t = nt }
      else buf += p[i]
    }
    if (buf) segs.push({ text: buf, type: t! })
    return segs
  }

  return { left: mark(a, b), right: mark(b, a) }
}

function pairRemovedAdded(diff: DiffLine[]) {
  const pairs = new Map<number, number>()
  let gr: number[] = [], ga: number[] = []
  function flush() {
    const c = Math.min(gr.length, ga.length)
    for (let k = 0; k < c; k++) { pairs.set(gr[k], ga[k]); pairs.set(ga[k], gr[k]) }
    gr = []; ga = []
  }
  for (let idx = 0; idx < diff.length; idx++) {
    if (diff[idx].type === "removed") gr.push(idx)
    else if (diff[idx].type === "added") ga.push(idx)
    else flush()
  }
  flush()
  return pairs
}

function findChunks(diff: DiffLine[]) {
  const chunks: number[] = []
  let inC = false
  for (let i = 0; i < diff.length; i++) {
    if (diff[i].type !== "same") { if (!inC) { chunks.push(i); inC = true } }
    else inC = false
  }
  return chunks
}

export default function DiffChecker() {
  const [left, setLeft] = useState("")
  const [right, setRight] = useState("")
  const [copied, setCopied] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [arrowY, setArrowY] = useState<number | null>(null)
  const diffRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLTextAreaElement>(null)
  const rightRef = useRef<HTMLTextAreaElement>(null)
  const chunkRef = useRef(0)
  const undoStack = useRef<Array<{ left: string; right: string }>>([])
  const scrollPosRef = useRef(0)
  const [, forceUpdate] = useState(0)

  const diff = useMemo(() => computeDiff(left, right), [left, right])
  const chunks = useMemo(() => findChunks(diff), [diff])
  const pairs = useMemo(() => pairRemovedAdded(diff), [diff])

  const charDiffs = useMemo(() => {
    const map = new Map<number, { left: CharSegment[]; right: CharSegment[] }>()
    for (const [ri, ai] of pairs) {
      const rl = diff[ri], al = diff[ai]
      if (rl && al) {
        const { left, right } = charDiff(rl.text, al.text)
        map.set(ri, { left, right }); map.set(ai, { left, right })
      }
    }
    return map
  }, [diff, pairs])

  const stats = useMemo(() => {
    let a = 0, r = 0
    for (const line of diff) { if (line.type === "added") a++; if (line.type === "removed") r++ }
    return { added: a, removed: r }
  }, [diff])

  const goTo = useCallback((dir: "prev" | "next") => {
    const cur = chunkRef.current
    let target = dir === "next" ? cur + 1 : cur - 1
    if (chunks.length === 1) target = 0
    else if (target < 0 || target >= chunks.length) return
    chunkRef.current = target
    forceUpdate(n => n + 1)
    const el = diffRef.current?.children[chunks[target]] as HTMLElement | undefined
    el?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [chunks])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === "INPUT" || tag === "TEXTAREA") return
        e.preventDefault()
        goTo(e.key === "ArrowDown" ? "next" : "prev")
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [goTo])

  useEffect(() => {
    function calc() {
      if (!diffRef.current) return
      const rect = diffRef.current.getBoundingClientRect()
      const vh = window.innerHeight
      if (rect.bottom < 0 || rect.top > vh) { setArrowY(null); return }

      const center = vh / 2
      const topBoundary = rect.top + 48
      const bottomBoundary = rect.bottom - 48

      if (topBoundary > center) setArrowY(Math.max(topBoundary, 48))
      else if (bottomBoundary < center) setArrowY(Math.min(bottomBoundary, vh - 48))
      else setArrowY(center)
    }
    calc()
    window.addEventListener("scroll", calc, true)
    window.addEventListener("resize", calc)
    return () => {
      window.removeEventListener("scroll", calc, true)
      window.removeEventListener("resize", calc)
    }
  }, [diff])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        if (undoStack.current.length > 0) {
          const prev = undoStack.current.pop()!
          setLeft(prev.left)
          setRight(prev.right)
          e.preventDefault()
        }
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  useEffect(() => {
    if (!collapsed && scrollPosRef.current > 0 && diffRef.current) {
      const top = diffRef.current.getBoundingClientRect().top + window.scrollY
      window.scrollTo({ top: top + scrollPosRef.current, behavior: "smooth" })
    }
  }, [collapsed])

  const handleCopy = useCallback(async () => {
    const text = diff.map((l) => `${l.type === "added" ? "+ " : l.type === "removed" ? "- " : "  "}${l.text}`).join("\n")
    await navigator.clipboard.writeText(text)
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }, [diff])

  const updateTextarea = useCallback((el: HTMLTextAreaElement | null, newValue: string) => {
    if (!el) return
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set
    if (nativeSetter) {
      nativeSetter.call(el, newValue)
      el.dispatchEvent(new Event("input", { bubbles: true }))
    }
  }, [])

  const replacePaired = useCallback((lineIdx: number) => {
    const pairedIdx = pairs.get(lineIdx)
    if (pairedIdx == null) return
    const pairedLine = diff[pairedIdx]
    const currentLine = diff[lineIdx]
    if (!pairedLine || !currentLine) return

    undoStack.current.push({ left, right })

    if (currentLine.type === "removed" && currentLine.leftNum) {
      const lines = left.split("\n")
      if (currentLine.leftNum > 0 && currentLine.leftNum <= lines.length) {
        lines[currentLine.leftNum - 1] = pairedLine.text
        updateTextarea(leftRef.current, lines.join("\n"))
      }
    } else if (currentLine.type === "added" && currentLine.rightNum) {
      const lines = right.split("\n")
      if (currentLine.rightNum > 0 && currentLine.rightNum <= lines.length) {
        lines[currentLine.rightNum - 1] = pairedLine.text
        updateTextarea(rightRef.current, lines.join("\n"))
      }
    }
  }, [diff, pairs, left, right, updateTextarea])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Original</label>
          <textarea ref={leftRef} value={left} onChange={(e) => setLeft(e.target.value)} placeholder="Paste original text..."
            className="min-h-[200px] w-full rounded-lg border border-zinc-300 bg-white p-4 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500" spellCheck={false} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Modified</label>
          <textarea ref={rightRef} value={right} onChange={(e) => setRight(e.target.value)} placeholder="Paste modified text..."
            className="min-h-[200px] w-full rounded-lg border border-zinc-300 bg-white p-4 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500" spellCheck={false} />
        </div>
      </div>

      {diff.length > 0 && (left || right) && (
        <>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs">
              {stats.added > 0 && <span className="text-green-700 dark:text-green-400">+{stats.added} added</span>}
              {stats.removed > 0 && <span className="text-red-700 dark:text-red-400">-{stats.removed} removed</span>}
              {chunks.length > 0 && <span className="text-zinc-400 dark:text-zinc-500">Diff {chunkRef.current + 1} of {chunks.length}</span>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { if (collapsed && diffRef.current) scrollPosRef.current = diffRef.current.scrollTop; setCollapsed(!collapsed) }}
                className="relative cursor-pointer group rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700">
                {collapsed ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                <span className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 top-full mt-1 whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900">{collapsed ? "Expand" : "Collapse"}</span>
              </button>
              <button onClick={handleCopy} className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700">
                {copied ? "Copied!" : "Copy Diff"}
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <div ref={diffRef} className={"flex-1 rounded-lg border border-zinc-300 font-mono text-sm leading-relaxed overflow-hidden dark:border-zinc-700 " + (collapsed ? "max-h-[500px] overflow-y-auto" : "")}>
              {diff.map((line, i) => {
              const segs = charDiffs.get(i)
              return (
                <div key={i} className={"flex whitespace-pre-wrap " + (line.type === "added" ? "bg-green-50 dark:bg-green-950" : line.type === "removed" ? "bg-red-50 dark:bg-red-950" : "bg-white dark:bg-zinc-800")}>
                  <span className="inline-block w-10 shrink-0 select-none border-r border-zinc-200 px-2 text-right text-xs text-zinc-400 dark:border-zinc-700">{line.leftNum ?? " "}</span>
                  <span className="inline-block w-10 shrink-0 select-none border-r border-zinc-200 px-2 text-right text-xs text-zinc-400 dark:border-zinc-700">{line.rightNum ?? " "}</span>
                  {pairs.has(i) && (
                    <span className="inline-flex items-center w-5 shrink-0 border-r border-zinc-200">
                      <button onClick={() => replacePaired(i)}
                        className="cursor-pointer w-full leading-none text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200"
                        title={line.type === "removed" ? "Use this line in Modified" : "Use this line in Original"}>
                        {line.type === "removed" ? "▼" : "▲"}
                      </button>
                    </span>
                  )}
                  <span className={"inline-block w-4 shrink-0 select-none text-center text-xs " + (line.type === "added" ? "text-green-700 dark:text-green-400" : line.type === "removed" ? "text-red-700 dark:text-red-400" : "text-zinc-400")}>
                    {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                  </span>
                  {line.type === "added" && segs ? (
                    <span className="whitespace-pre-wrap break-all px-2">
                      {segs.right.map((s, j) => (
                        <span key={j} className={s.type === "diff" ? "bg-green-300 text-green-900 dark:bg-green-700 dark:text-green-50" : "text-green-800 dark:text-green-200"}>{s.text}</span>
                      ))}
                    </span>
                  ) : line.type === "removed" && segs ? (
                    <span className="whitespace-pre-wrap break-all px-2">
                      {segs.left.map((s, j) => (
                        <span key={j} className={s.type === "diff" ? "bg-red-300 text-red-900 dark:bg-red-700 dark:text-red-50" : "text-red-800 dark:text-red-200"}>{s.text}</span>
                      ))}
                    </span>
                  ) : (
                    <span className={"whitespace-pre-wrap break-all px-2 " + (line.type === "added" ? "text-green-800 dark:text-green-200" : line.type === "removed" ? "text-red-800 dark:text-red-200" : "text-zinc-700 dark:text-zinc-300")}>{line.text}</span>
                  )}
                </div>
              )
            })}
          </div>
          </div>
          {chunks.length > 0 && arrowY !== null && (
            <div className="fixed right-10 z-20 flex flex-col items-center gap-1 text-lg leading-none"
                 style={{ top: arrowY, transform: "translateY(-50%)" }}>
                <button onClick={() => goTo("prev")}
                  className="relative cursor-pointer group rounded-full w-8 h-8 flex items-center justify-center border-1 bg-zinc-200 text-zinc-600 hover:bg-zinc-300 border-white dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600 dark:border-zinc-500">
                  <span className="text-sm">▲</span><span className="invisible group-hover:visible absolute right-full top-1/2 -translate-y-1/2 mr-3 whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900">You can also use ↑ on keyboard</span>
                </button>
                <button onClick={() => goTo("next")}
                  className="relative cursor-pointer group rounded-full w-8 h-8 flex items-center justify-center border-1 bg-zinc-200 text-zinc-600 hover:bg-zinc-300 border-white dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600 dark:border-zinc-500">
                  <span className="text-sm">▼</span><span className="invisible group-hover:visible absolute right-full top-1/2 -translate-y-1/2 mr-3 whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900">You can also use ↓ on keyboard</span>
                </button>
              </div>
            )}
          </>
        )}
    </div>
  )
}
