"use client"

import { useState, useCallback, useMemo } from "react"

type Language = "python" | "typescript" | "go" | "rust" | "kotlin" | "swift" | "java" | "csharp" | "zod" | "graphql" | "sql"

const languages: { value: Language; label: string }[] = [
  { value: "python", label: "Python" },
  { value: "typescript", label: "TypeScript" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "kotlin", label: "Kotlin" },
  { value: "swift", label: "Swift" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "zod", label: "Zod" },
  { value: "graphql", label: "GraphQL" },
  { value: "sql", label: "SQL" },
]

function capitalize(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

interface Field {
  key: string
  type: string
  optional: boolean
  isObject: boolean
  children: Field[]
  isArray: boolean
  elementType: string
}

function analyzeFields(obj: Record<string, unknown>): Field[] {
  return Object.entries(obj).map(([key, value]) => {
    const optional = value === null || value === undefined
    if (Array.isArray(value)) {
      const elemType = value.length > 0 ? inferFieldType(value[0]) : "unknown"
      return { key, type: `${elemType}[]`, optional, isObject: false, children: [], isArray: true, elementType: elemType }
    }
    if (typeof value === "object" && value !== null) {
      const children = analyzeFields(value as Record<string, unknown>)
      return { key, type: key, optional, isObject: true, children, isArray: false, elementType: "" }
    }
    const t = inferFieldType(value)
    return { key, type: t, optional, isObject: false, children: [], isArray: false, elementType: "" }
  })
}

function collectFieldPaths(fields: Field[], prefix = ""): { path: string; key: string; optional: boolean }[] {
  const result: { path: string; key: string; optional: boolean }[] = []
  for (const f of fields) {
    const fullPath = prefix ? `${prefix}.${f.key}` : f.key
    result.push({ path: fullPath, key: f.key, optional: f.optional })
    if (f.isObject) {
      result.push(...collectFieldPaths(f.children, fullPath))
    }
  }
  return result
}

function isNullable(path: string, allNullable: boolean, nullableOverrides: Set<string>, fieldOptional: boolean): boolean {
  if (nullableOverrides.size > 0) {
    if (nullableOverrides.has("all")) return true
    if (nullableOverrides.has(path)) return true
  }
  if (allNullable) return true
  return fieldOptional
}

function inferFieldType(value: unknown): string {
  if (value === null) return "null"
  if (typeof value === "string") return "string"
  if (typeof value === "number") return Number.isInteger(value) ? "integer" : "float"
  if (typeof value === "boolean") return "boolean"
  return "unknown"
}

function makeNullable(f: Field, path: string, allNullable: boolean, nullableOverrides: Set<string>): Field {
  const nullable = isNullable(path, allNullable, nullableOverrides, f.optional)
  return {
    ...f,
    optional: nullable,
    children: f.isObject ? f.children.map((c, i) => makeNullable(c, `${path}.${c.key}`, allNullable, nullableOverrides)) : [],
  }
}

function applyNullable(fields: Field[], allNullable: boolean, nullableOverrides: Set<string>): Field[] {
  return fields.map((f) => makeNullable(f, f.key, allNullable, nullableOverrides))
}

function collectSubTypes(fields: Field[]): { name: string; children: Field[] }[] {
  const result: { name: string; children: Field[] }[] = []
  for (const f of fields) {
    if (f.isObject) {
      result.push({ name: capitalize(f.key), children: f.children })
      result.push(...collectSubTypes(f.children))
    }
  }
  return result
}

function toPython(obj: Record<string, unknown>, name: string, allNullable: boolean, nullableOverrides: Set<string>): string {
  const rawFields = analyzeFields(obj)
  const fields = applyNullable(rawFields, allNullable, nullableOverrides)
  const subTypes: string[] = []

  for (const f of fields) {
    if (f.isObject) {
      subTypes.push("", toPythonObj(f.children, capitalize(f.key), allNullable, nullableOverrides))
    }
  }

  const lines = ["from dataclasses import dataclass", "from typing import Optional, List", ""]
  lines.push(...subTypes)
  lines.push("@dataclass")
  lines.push(`class ${name}:`)
  if (fields.length === 0) {
    lines.push("    pass")
  } else {
    for (const f of fields) {
      const opt = f.optional ? "Optional[" : ""
      const close = f.optional ? "]" : ""
      const t = mapPythonType(f)
      const suffix = f.optional ? " = None" : ""
      lines.push(`    ${f.key}: ${opt}${t}${close}${suffix}`)
    }
  }
  return lines.join("\n")
}

function toPythonObj(fields: Field[], name: string, allNullable: boolean, nullableOverrides: Set<string>): string {
  let result = ""
  for (const f of fields) {
    if (f.isObject) {
      result += `${toPythonObj(f.children, capitalize(f.key), allNullable, nullableOverrides)}\n`
    }
  }
  result += "@dataclass\n"
  result += `class ${name}:\n`
  if (fields.length === 0) {
    result += "    pass\n"
  } else {
    for (const f of fields) {
      const t = mapPythonType(f)
      const opt = f.optional ? "Optional[" : ""
      const close = f.optional ? "]" : ""
      const suffix = f.optional ? " = None" : ""
      result += `    ${f.key}: ${opt}${t}${close}${suffix}\n`
    }
  }
  return result
}

function mapPythonType(f: Field): string {
  if (f.isObject) return capitalize(f.key)
  if (f.isArray) return `List[${f.elementType === "integer" ? "int" : f.elementType === "float" ? "float" : f.elementType === "string" ? "str" : f.elementType === "boolean" ? "bool" : "Any"}]`
  if (f.type === "integer") return "int"
  if (f.type === "float") return "float"
  if (f.type === "string") return "str"
  if (f.type === "boolean") return "bool"
  if (f.type === "null") return "None"
  return "Any"
}

function toTypeScript(obj: Record<string, unknown>, name: string, allNullable: boolean, nullableOverrides: Set<string>): string {
  const rawFields = analyzeFields(obj)
  const fields = applyNullable(rawFields, allNullable, nullableOverrides)
  const subTypes: string[] = []
  for (const { name, children } of collectSubTypes(fields)) {
    subTypes.push(`interface ${name} ${tsObj(children, allNullable, nullableOverrides, name, 0)}`)
  }
  const lines = [...subTypes]
  lines.push(`interface ${name} ${tsObj(fields, allNullable, nullableOverrides, name, 0)}`)
  return lines.join("\n\n")
}

function tsObj(fields: Field[], allNullable: boolean, nullableOverrides: Set<string>, _name: string, depth: number): string {
  if (fields.length === 0) return "{}"
  const items = fields.map((f) => {
    const opt = f.optional ? "?" : ""
    const t = mapTSType(f)
    return `${"  ".repeat(depth + 1)}${f.key}${opt}: ${t};`
  })
  return `{\n${items.join("\n")}\n${"  ".repeat(depth)}}`
}

function mapTSType(f: Field): string {
  if (f.isObject) return capitalize(f.key)
  if (f.isArray) {
    if (f.elementType === "integer" || f.elementType === "float") return "number[]"
    return `${f.elementType}[]`
  }
  if (f.type === "integer" || f.type === "float") return "number"
  if (f.type === "string") return "string"
  if (f.type === "boolean") return "boolean"
  if (f.type === "null") return "null"
  return "unknown"
}

function toGo(obj: Record<string, unknown>, name: string, allNullable: boolean, nullableOverrides: Set<string>): string {
  const rawFields = analyzeFields(obj)
  const fields = applyNullable(rawFields, allNullable, nullableOverrides)
  const subTypes: string[] = []
  for (const { name: n, children } of collectSubTypes(fields)) {
    subTypes.push("", toGoStruct(children, n))
  }
  const lines = [...subTypes]
  lines.push(toGoStruct(fields, name))
  return lines.join("\n")
}

function toGoStruct(fields: Field[], name: string): string {
  if (fields.length === 0) return `type ${name} struct {}`
  const items = fields.map((f) => {
    const t = mapGoType(f)
    const goName = capitalize(f.key)
    const tag = f.optional ? `${f.key},omitempty` : f.key
    return `  ${goName} ${t} \`json:"${tag}"\``
  })
  return `type ${name} struct {\n${items.join("\n")}\n}`
}

function mapGoType(f: Field): string {
  if (f.isObject) return `*${capitalize(f.key)}`
  if (f.isArray) {
    if (f.elementType === "integer" || f.elementType === "float") return "[]float64"
    if (f.elementType === "string") return "[]string"
    if (f.elementType === "boolean") return "[]bool"
    return "[]interface{}"
  }
  if (f.type === "integer") return "int"
  if (f.type === "float") return "float64"
  if (f.type === "string") return "string"
  if (f.type === "boolean") return "bool"
  return "interface{}"
}

function toRust(obj: Record<string, unknown>, name: string, allNullable: boolean, nullableOverrides: Set<string>): string {
  const rawFields = analyzeFields(obj)
  const fields = applyNullable(rawFields, allNullable, nullableOverrides)
  const subTypes: string[] = []
  for (const { name: n, children } of collectSubTypes(fields)) {
    subTypes.push("", toRustStruct(children, n))
  }
  const lines = [...subTypes]
  lines.push(toRustStruct(fields, name))
  return lines.join("\n")
}

function toRustStruct(fields: Field[], name: string): string {
  const lines = ["#[derive(Debug, Serialize, Deserialize)]", `pub struct ${name} {`]
  if (fields.length === 0) {
    lines.push("}")
    return lines.join("\n")
  }
  for (const f of fields) {
    const t = mapRustType(f)
    const serde = f.optional ? `#[serde(skip_serializing_if = "Option::is_none")]\n  ` : "  "
    lines.push(`  ${serde}pub ${f.key}: ${t},`)
  }
  lines.push("}")
  return lines.join("\n")
}

function mapRustType(f: Field): string {
  if (f.isObject) return f.optional ? `Option<${capitalize(f.key)}>` : capitalize(f.key)
  if (f.isArray) return `Vec<${mapRustPrimitive(f.elementType)}>`
  const opt = f.optional ? "Option<" : ""
  const close = f.optional ? ">" : ""
  return `${opt}${mapRustPrimitive(f.type)}${close}`
}

function mapRustPrimitive(t: string): string {
  if (t === "integer") return "i64"
  if (t === "float") return "f64"
  if (t === "string") return "String"
  if (t === "boolean") return "bool"
  if (t === "null") return "Option<serde_json::Value>"
  return "serde_json::Value"
}

function toKotlin(obj: Record<string, unknown>, name: string, allNullable: boolean, nullableOverrides: Set<string>): string {
  const rawFields = analyzeFields(obj)
  const fields = applyNullable(rawFields, allNullable, nullableOverrides)
  const subTypes: string[] = []
  for (const { name: n, children } of collectSubTypes(fields)) {
    subTypes.push("", toKotlinClass(children, n))
  }
  const lines = [...subTypes]
  lines.push(toKotlinClass(fields, name))
  return lines.join("\n")
}

function toKotlinClass(fields: Field[], name: string): string {
  const items = fields.map((f) => {
    const t = mapKotlinType(f)
    return `  @SerializedName("${f.key}")\n  val ${f.key}: ${t}`
  })
  if (items.length === 0) return `data class ${name}()`
  return `data class ${name}(\n${items.join(",\n")}\n)`
}

function mapKotlinType(f: Field): string {
  if (f.isObject) return `${capitalize(f.key)}${f.optional ? "?" : ""}`
  if (f.isArray) return `List<${mapKotlinPrimitive(f.elementType)}>`
  const opt = f.optional ? "?" : ""
  if (f.type === "integer") return `Int${opt}`
  if (f.type === "float") return `Double${opt}`
  if (f.type === "string") return `String${opt}`
  if (f.type === "boolean") return `Boolean${opt}`
  return "Any"
}

function mapKotlinPrimitive(t: string): string {
  if (t === "integer") return "Int"
  if (t === "float") return "Double"
  if (t === "string") return "String"
  if (t === "boolean") return "Boolean"
  return "Any"
}

function toSwift(obj: Record<string, unknown>, name: string, allNullable: boolean, nullableOverrides: Set<string>): string {
  const rawFields = analyzeFields(obj)
  const fields = applyNullable(rawFields, allNullable, nullableOverrides)
  const subTypes: string[] = []
  for (const { name: n, children } of collectSubTypes(fields)) {
    subTypes.push("", toSwiftStruct(children, n))
  }
  return [...subTypes, toSwiftStruct(fields, name)].join("\n")
}

function toSwiftStruct(fields: Field[], name: string): string {
  const lines = [`struct ${name}: Codable {`]
  if (fields.length > 0) {
    for (const f of fields) {
      const t = mapSwiftType(f)
      lines.push(`  let ${f.key}: ${t}`)
    }
    const customKeys = fields.filter((f) => f.key.includes("-"))
    if (customKeys.length > 0) {
      lines.push("", "  enum CodingKeys: String, CodingKey {")
      for (const f of customKeys) {
        lines.push(`    case ${f.key} = "${f.key}"`)
      }
      lines.push("  }")
    }
  }
  lines.push("}")
  return lines.join("\n")
}

function mapSwiftType(f: Field): string {
  if (f.isObject) return f.optional ? `${capitalize(f.key)}?` : capitalize(f.key)
  if (f.isArray) return `[${mapSwiftPrimitive(f.elementType)}]`
  if (f.optional) return `${mapSwiftPrimitive(f.type)}?`
  return mapSwiftPrimitive(f.type)
}

function mapSwiftPrimitive(t: string): string {
  if (t === "integer") return "Int"
  if (t === "float") return "Double"
  if (t === "string") return "String"
  if (t === "boolean") return "Bool"
  return "Codable"
}

function toJava(obj: Record<string, unknown>, name: string, allNullable: boolean, nullableOverrides: Set<string>): string {
  const rawFields = analyzeFields(obj)
  const fields = applyNullable(rawFields, allNullable, nullableOverrides)
  const subTypes: string[] = []
  for (const { name: n, children } of collectSubTypes(fields)) {
    subTypes.push("", toJavaClass(children, n))
  }
  const lines = [...subTypes]
  lines.push(toJavaClass(fields, name))
  return lines.join("\n")
}

function toJavaClass(fields: Field[], name: string): string {
  const lines: string[] = []
  lines.push(`public class ${name} {`)
  if (fields.length === 0) {
    lines.push("}")
    return lines.join("\n")
  }
  for (const f of fields) {
    lines.push(`  @SerializedName("${f.key}")`)
    const t = mapJavaType(f)
    lines.push(`  private ${t} ${f.key};`)
    lines.push("")
  }
  for (const f of fields) {
    const t = mapJavaType(f)
    const goName = capitalize(f.key)
    lines.push(`  public ${t} get${goName}() { return ${f.key}; }`)
    lines.push(`  public void set${goName}(${t} ${f.key}) { this.${f.key} = ${f.key}; }`)
    lines.push("")
  }
  lines.push("}")
  return lines.join("\n")
}

function mapJavaType(f: Field): string {
  if (f.isObject) return capitalize(f.key)
  if (f.isArray) return `List<${mapJavaPrimitive(f.elementType)}>`
  return mapJavaPrimitive(f.type)
}

function mapJavaPrimitive(t: string): string {
  if (t === "integer") return "int"
  if (t === "float") return "double"
  if (t === "string") return "String"
  if (t === "boolean") return "boolean"
  return "Object"
}

function toCsharp(obj: Record<string, unknown>, name: string, allNullable: boolean, nullableOverrides: Set<string>): string {
  const rawFields = analyzeFields(obj)
  const fields = applyNullable(rawFields, allNullable, nullableOverrides)
  const subTypes: string[] = []
  for (const { name: n, children } of collectSubTypes(fields)) {
    subTypes.push("", toCsharpClass(children, n))
  }
  const lines = ["using System.Text.Json.Serialization;", ""]
  lines.push(...subTypes)
  lines.push(toCsharpClass(fields, name))
  return lines.join("\n")
}

function toCsharpClass(fields: Field[], name: string): string {
  const lines: string[] = []
  lines.push(`public class ${name}`)
  lines.push(`{`)
  if (fields.length > 0) {
    for (const f of fields) {
      const t = mapCsharpType(f)
      lines.push(`  [JsonPropertyName("${f.key}")]`)
      lines.push(`  public ${t} ${capitalize(f.key)} { get; set; }`)
      lines.push("")
    }
  }
  lines.push("}")
  return lines.join("\n")
}

function mapCsharpType(f: Field): string {
  if (f.isObject) return f.optional ? `${capitalize(f.key)}?` : capitalize(f.key)
  if (f.isArray) return `List<${mapCsharpPrimitive(f.elementType)}>`
  const opt = f.optional ? "?" : ""
  return `${mapCsharpPrimitive(f.type)}${opt}`
}

function mapCsharpPrimitive(t: string): string {
  if (t === "integer") return "int"
  if (t === "float") return "double"
  if (t === "string") return "string"
  if (t === "boolean") return "bool"
  return "object"
}

function toZod(obj: Record<string, unknown>, name: string, allNullable: boolean, nullableOverrides: Set<string>): string {
  const rawFields = analyzeFields(obj)
  const fields = applyNullable(rawFields, allNullable, nullableOverrides)
  const subTypes: string[] = []
  for (const { name: n, children } of collectSubTypes(fields)) {
    subTypes.push("", toZodSchema(children, n))
  }
  const lines = ["import { z } from 'zod'", "", ...subTypes, toZodSchema(fields, name)]
  return lines.join("\n")
}

function toZodSchema(fields: Field[], name: string): string {
  if (fields.length === 0) return `export const ${name}Schema = z.object({})`
  const items = fields.map((f) => {
    const t = mapZodType(f)
    return `  ${f.key}: ${t},`
  })
  return `export const ${name}Schema = z.object({\n${items.join("\n")}\n})`
}

function mapZodType(f: Field): string {
  if (f.isObject) return f.optional ? `${capitalize(f.key)}Schema.nullable()` : `${capitalize(f.key)}Schema`
  if (f.isArray) return `z.array(${mapZodPrimitive(f.elementType)})`
  const base = mapZodPrimitive(f.type)
  return f.optional ? `${base}.nullable()` : base
}

function mapZodPrimitive(t: string): string {
  if (t === "integer") return "z.number().int()"
  if (t === "float") return "z.number()"
  if (t === "string") return "z.string()"
  if (t === "boolean") return "z.boolean()"
  if (t === "null") return "z.null()"
  return "z.any()"
}

function toGraphQL(obj: Record<string, unknown>, name: string, allNullable: boolean, nullableOverrides: Set<string>): string {
  const rawFields = analyzeFields(obj)
  const fields = applyNullable(rawFields, allNullable, nullableOverrides)
  const subTypes: string[] = []
  const seen = new Set<string>()
  for (const { name: n, children } of collectSubTypes(fields)) {
    if (!seen.has(n)) {
      seen.add(n)
      subTypes.push("", toGraphQLType(children, n))
    }
  }
  const lines = [...subTypes]
  lines.push(toGraphQLType(fields, name))
  return lines.join("\n")
}

function toGraphQLType(fields: Field[], name: string): string {
  if (fields.length === 0) return `type ${name} {}`
  const items = fields.map((f) => {
    const t = mapGraphQLType(f)
    const req = f.optional ? "" : "!"
    return `  ${f.key}: ${t}${req}`
  })
  return `type ${name} {\n${items.join("\n")}\n}`
}

function mapGraphQLType(f: Field): string {
  if (f.isObject) return capitalize(f.key)
  if (f.isArray) return `[${mapGraphQLPrimitive(f.elementType)}]`
  return mapGraphQLPrimitive(f.type)
}

function mapGraphQLPrimitive(t: string): string {
  if (t === "integer") return "Int"
  if (t === "float") return "Float"
  if (t === "string") return "String"
  if (t === "boolean") return "Boolean"
  return "String"
}

function mapSQLPrimitive(t: string): string {
  if (t === "integer") return "INTEGER"
  if (t === "float") return "FLOAT"
  if (t === "string") return "VARCHAR(255)"
  if (t === "boolean") return "BOOLEAN"
  return "TEXT"
}

function toSQL(obj: Record<string, unknown>, name: string, allNullable: boolean, nullableOverrides: Set<string>): string {
  const rawFields = analyzeFields(obj)
  const fields = applyNullable(rawFields, allNullable, nullableOverrides)
  const statements: string[] = []
  const done = new Set<string>()

  function genTable(children: Field[], tblName: string): void {
    if (done.has(tblName)) return
    done.add(tblName)

    for (const f of children) {
      if (f.isObject) genTable(f.children, f.key)
    }

    const cols: string[] = ["  id INTEGER PRIMARY KEY AUTOINCREMENT"]
    for (const f of children) {
      if (f.isObject) {
        cols.push(`  ${f.key}_id INTEGER${f.optional ? "" : " NOT NULL"}`)
      } else if (f.isArray) {
        cols.push(`  ${f.key} TEXT${f.optional ? "" : " NOT NULL"}`)
      } else {
        cols.push(`  ${f.key} ${mapSQLPrimitive(f.type)}${f.optional ? "" : " NOT NULL"}`)
      }
    }
    for (const f of children) {
      if (f.isObject) {
        cols.push(`  FOREIGN KEY (${f.key}_id) REFERENCES ${f.key}(id)`)
      }
    }
    statements.push(`CREATE TABLE ${tblName} (\n${cols.join(",\n")}\n)`)
  }

  genTable(fields, name.toLowerCase())
  return statements.join("\n\n")
}

type Generator = (obj: Record<string, unknown>, name: string, allNullable: boolean, nullableOverrides: Set<string>) => string

const generators: Record<Language, Generator> = {
  python: toPython,
  typescript: toTypeScript,
  go: toGo,
  rust: toRust,
  kotlin: toKotlin,
  swift: toSwift,
  java: toJava,
  csharp: toCsharp,
  zod: toZod,
  graphql: toGraphQL,
  sql: toSQL,
}

export default function JsonToTypes() {
  const [input, setInput] = useState("")
  const [language, setLanguage] = useState<Language>("python")
  const [allNullable, setAllNullable] = useState(false)
  const [overrides, setOverrides] = useState<Record<string, boolean>>({})
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showFields, setShowFields] = useState(false)

  const fieldPaths = useMemo(() => {
    if (!input.trim()) return []
    try {
      const parsed = JSON.parse(input)
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        return collectFieldPaths(analyzeFields(parsed as Record<string, unknown>))
      }
    } catch {}
    return []
  }, [input])

  const nullableOverrides = useMemo(() => {
    const set = new Set<string>()
    if (allNullable) {
      set.add("all")
    } else {
      for (const [path, checked] of Object.entries(overrides)) {
        if (checked) set.add(path)
      }
    }
    return set
  }, [allNullable, overrides])

  const convert = useCallback((val: string, lang: Language, allNull: boolean, ovrds: Record<string, boolean>) => {
    setError(null)
    setOutput("")
    if (!val.trim()) return

    try {
      const parsed = JSON.parse(val)
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        setError("Expected a JSON object (not array or primitive)")
        return
      }
      const set = new Set<string>()
      if (allNull) {
        set.add("all")
      } else {
        for (const [path, checked] of Object.entries(ovrds)) {
          if (checked) set.add(path)
        }
      }
      setOutput(generators[lang](parsed as Record<string, unknown>, "Root", allNull, set))
    } catch {
      setError("Invalid JSON")
    }
  }, [])

  const handleCopy = useCallback(async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [output])

  const handleLangChange = useCallback(
    (lang: Language) => {
      setLanguage(lang)
      if (input) convert(input, lang, allNullable, overrides)
    },
    [input, allNullable, overrides, convert],
  )

  const toggleAllNullable = useCallback(
    (v: boolean) => {
      setAllNullable(v)
      if (input) convert(input, language, v, overrides)
    },
    [input, language, overrides, convert],
  )

  const toggleField = useCallback(
    (path: string, checked: boolean) => {
      const next = { ...overrides, [path]: checked }
      setOverrides(next)
      if (input) convert(input, language, allNullable, next)
    },
    [input, language, allNullable, overrides, convert],
  )

  const selectAllNullable = useCallback(() => {
    const next: Record<string, boolean> = {}
    for (const fp of fieldPaths) {
      next[fp.path] = true
    }
    setOverrides(next)
    if (input) convert(input, language, allNullable, next)
  }, [input, language, allNullable, convert, fieldPaths])

  const deselectAllNullable = useCallback(() => {
    setOverrides({})
    if (input) convert(input, language, allNullable, {})
  }, [input, language, allNullable, convert])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            JSON Input
          </label>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); convert(e.target.value, language, allNullable, overrides) }}
            placeholder='Paste JSON here... (e.g. {"name": "John", "age": 30})'
            className="min-h-[160px] w-full rounded-lg border border-zinc-300 bg-white p-4 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
            spellCheck={false}
          />
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => handleLangChange(e.target.value as Language)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {languages.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={allNullable}
                onChange={(e) => toggleAllNullable(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-5 w-9 rounded-full bg-zinc-300 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-zinc-900 peer-checked:after:translate-x-full dark:bg-zinc-600 dark:peer-checked:bg-zinc-100 dark:peer-checked:after:bg-zinc-800" />
            </label>
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">All nullable</span>
          </div>
        </div>
      </div>

      {!allNullable && fieldPaths.length > 0 && (
        <div>
          <button
            onClick={() => setShowFields(!showFields)}
            className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            {showFields ? "▼" : "▶"} Nullable fields ({fieldPaths.filter((f) => overrides[f.path] || f.optional).length}/{fieldPaths.length})
          </button>
          {showFields && (
            <div className="mt-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                  Toggle fields as nullable:
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={selectAllNullable}
                    className="cursor-pointer rounded border border-zinc-300 bg-white px-2 py-0.5 text-[10px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  >
                    Select all
                  </button>
                  <button
                    onClick={deselectAllNullable}
                    className="cursor-pointer rounded border border-zinc-300 bg-white px-2 py-0.5 text-[10px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  >
                    Deselect all
                  </button>
                </div>
              </div>
              {fieldPaths.map((fp) => (
                <label key={fp.path} className="flex cursor-pointer items-center gap-2 py-0.5">
                  <input
                    type="checkbox"
                    checked={overrides[fp.path] ?? fp.optional}
                    onChange={(e) => toggleField(fp.path, e.target.checked)}
                    className="h-3 w-3 accent-zinc-900 dark:accent-zinc-100"
                  />
                  <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
                    {fp.path}
                  </span>
                  {fp.optional && (
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                      (null in JSON)
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {output && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {languages.find((l) => l.value === language)?.label}
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
