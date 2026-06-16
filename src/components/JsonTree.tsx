"use client"

import { useState, useCallback, useMemo } from "react"

interface JsonTreeProps {
  data: unknown
  defaultExpanded?: boolean
}

export default function JsonTree({ data, defaultExpanded = true }: JsonTreeProps) {
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(
    () => (defaultExpanded ? new Set() : new Set([""])),
  )

  const toggle = useCallback((path: string) => {
    setCollapsedPaths((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }, [])

  return (
    <div className="font-mono text-sm">
      <JsonNode
        value={data}
        name={null}
        isLast={true}
        level={0}
        path=""
        collapsedPaths={collapsedPaths}
        onToggle={toggle}
      />
    </div>
  )
}

interface JsonNodeProps {
  value: unknown
  name: string | null
  isLast: boolean
  level: number
  path: string
  collapsedPaths: Set<string>
  onToggle: (path: string) => void
}

function JsonNode({ value, name, isLast, level, path, collapsedPaths, onToggle }: JsonNodeProps) {
  const isObject = typeof value === "object" && value !== null && !Array.isArray(value)
  const isArray = Array.isArray(value)
  const isExpandable = isObject || isArray
  const isExpanded = !collapsedPaths.has(path)

  const indent = level * 20

  if (isExpandable) {
    const entries = isArray ? value : Object.entries(value)
    const count = isArray ? value.length : Object.keys(value).length
    const openBracket = isArray ? "[" : "{"
    const closeBracket = isArray ? "]" : "}"

    return (
      <div>
        <div
          className="flex cursor-pointer items-center gap-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          style={{ paddingLeft: `${indent}px` }}
          onClick={() => onToggle(path)}
        >
          <span className="w-4 text-zinc-400 select-none">{isExpanded ? "▾" : "▸"}</span>
          {name && (
            <>
              <span className="text-blue-600 dark:text-blue-400">{name}</span>
              <span className="text-zinc-500">:</span>
            </>
          )}
          <span className="text-zinc-700 dark:text-zinc-300">{openBracket}</span>
          {!isExpanded && (
            <>
              <span className="text-zinc-400 text-xs">
                {count} {count === 1 ? "item" : "items"}
              </span>
              <span className="text-zinc-700 dark:text-zinc-300">{closeBracket}</span>
              {!isLast && <span className="text-zinc-500">,</span>}
            </>
          )}
        </div>
        {isExpanded && (
          <>
            {isArray
              ? (value as unknown[]).map((item, index) => (
                  <JsonNode
                    key={index}
                    value={item}
                    name={null}
                    isLast={index === count - 1}
                    level={level + 1}
                    path={`${path}[${index}]`}
                    collapsedPaths={collapsedPaths}
                    onToggle={onToggle}
                  />
                ))
              : (entries as [string, unknown][]).map(([key, val], index) => (
                  <JsonNode
                    key={key}
                    value={val}
                    name={key}
                    isLast={index === count - 1}
                    level={level + 1}
                    path={`${path}.${key}`}
                    collapsedPaths={collapsedPaths}
                    onToggle={onToggle}
                  />
                ))}
            <div
              className="flex items-center"
              style={{ paddingLeft: `${indent}px` }}
            >
              <span className="w-4"></span>
              <span className="text-zinc-700 dark:text-zinc-300">{closeBracket}</span>
              {!isLast && <span className="text-zinc-500">,</span>}
            </div>
          </>
        )}
      </div>
    )
  }

  const typeClass = getTypeClass(value)
  const displayValue = formatValue(value)

  return (
    <div
      className="flex items-center gap-1"
      style={{ paddingLeft: `${indent + 16}px` }}
    >
      {name && (
        <>
          <span className="text-blue-600 dark:text-blue-400">{name}</span>
          <span className="text-zinc-500">:</span>
        </>
      )}
      <span className={typeClass}>{displayValue}</span>
      {!isLast && <span className="text-zinc-500">,</span>}
    </div>
  )
}

function getTypeClass(value: unknown): string {
  if (value === null) return "text-zinc-400"
  if (typeof value === "string") return "text-green-700 dark:text-green-400"
  if (typeof value === "number") return "text-purple-600 dark:text-purple-400"
  if (typeof value === "boolean") return "text-orange-600 dark:text-orange-400"
  return "text-zinc-700 dark:text-zinc-300"
}

function formatValue(value: unknown): string {
  if (value === null) return "null"
  if (typeof value === "string") return `"${value}"`
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  return String(value)
}
