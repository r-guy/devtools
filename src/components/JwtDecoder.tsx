"use client"

import { useState, useCallback, useRef } from "react"

interface JwtPayload {
  [key: string]: unknown
}

type Mode = "decode" | "encode"
type Algorithm = "HS256" | "HS384" | "HS512" | "RS256" | "RS384" | "RS512" | "ES256" | "ES384" | "ES512"

const algorithms: Algorithm[] = ["HS256", "HS384", "HS512", "RS256", "RS384", "RS512", "ES256", "ES384", "ES512"]

function base64UrlEncode(input: string): string {
  return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function base64UrlEncodeBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function decodeBase64Url(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/")
  try {
    return decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
  } catch {
    return atob(base64)
  }
}

async function jwtEncode(
  headerObj: Record<string, unknown>,
  payloadObj: Record<string, unknown>,
  secret: string,
  algorithm: Algorithm,
): Promise<string> {
  const header = { ...headerObj, alg: algorithm, typ: "JWT" }
  const headerB64 = base64UrlEncode(JSON.stringify(header))
  const payloadB64 = base64UrlEncode(JSON.stringify(payloadObj))
  const signingInput = `${headerB64}.${payloadB64}`

  const encoder = new TextEncoder()

  if (algorithm.startsWith("HS")) {
    const hash = algorithm === "HS256" ? "SHA-256" : algorithm === "HS384" ? "SHA-384" : "SHA-512"
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: { name: hash } },
      false,
      ["sign"],
    )
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(signingInput))
    return `${signingInput}.${base64UrlEncodeBuffer(signature)}`
  }

  throw new Error(`${algorithm} requires asymmetric keys — only HMAC (HS256/384/512) is supported in-browser`)
}

function HighlightedToken({ token }: { token: string }) {
  const parts = token.trim().split(".")
  if (parts.length !== 3) return <span>{token}</span>

  return (
    <span>
      <span className="text-blue-600 dark:text-blue-400">{parts[0]}</span>
      <span className="text-zinc-400 dark:text-zinc-500">.</span>
      <span className="text-green-600 dark:text-green-400">{parts[1]}</span>
      <span className="text-zinc-400 dark:text-zinc-500">.</span>
      <span className="text-red-500 dark:text-red-400">{parts[2]}</span>
    </span>
  )
}

const defaultHeader = JSON.stringify({ alg: "HS256", typ: "JWT" }, null, 2)
const defaultPayload = JSON.stringify({ sub: "1234567890", name: "John Doe", iat: Math.floor(Date.now() / 1000) }, null, 2)

export default function JwtDecoder() {
  const [mode, setMode] = useState<Mode>("decode")
  const [token, setToken] = useState("")
  const [header, setHeader] = useState<JwtPayload | null>(null)
  const [payload, setPayload] = useState<JwtPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expiryWarning, setExpiryWarning] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const [algorithm, setAlgorithm] = useState<Algorithm>("HS256")
  const [secret, setSecret] = useState("")
  const [headerInput, setHeaderInput] = useState(defaultHeader)
  const [payloadInput, setPayloadInput] = useState(defaultPayload)
  const [encodedToken, setEncodedToken] = useState("")
  const [encodeError, setEncodeError] = useState<string | null>(null)
  const [encoding, setEncoding] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const decode = useCallback((val: string) => {
    setError(null)
    setHeader(null)
    setPayload(null)
    setExpiryWarning(null)
    if (!val.trim()) return

    const parts = val.trim().split(".")
    if (parts.length !== 3) {
      setError("Invalid JWT: expected 3 parts (header.payload.signature)")
      return
    }
    try {
      const h = JSON.parse(decodeBase64Url(parts[0]))
      const p = JSON.parse(decodeBase64Url(parts[1]))
      setHeader(h)
      setPayload(p)

      if (p.exp) {
        const expMs = (typeof p.exp === "number" ? p.exp : parseInt(String(p.exp), 10)) * 1000
        if (expMs < Date.now()) {
          setExpiryWarning(`Token expired at ${new Date(expMs).toLocaleString()}`)
        } else {
          setExpiryWarning(`Valid until ${new Date(expMs).toLocaleString()}`)
        }
      }
    } catch {
      setError("Failed to decode JWT. Check if the token is valid.")
    }
  }, [])

  const handleEncode = useCallback(async () => {
    setEncodeError(null)
    setEncodedToken("")
    if (!secret.trim()) {
      setEncodeError("Secret key is required")
      return
    }
    if (algorithm.startsWith("RS") || algorithm.startsWith("ES")) {
      setEncodeError(`${algorithm} requires asymmetric keys — only HMAC (HS256/384/512) is supported in-browser`)
      return
    }
    try {
      const h = JSON.parse(headerInput)
      const p = JSON.parse(payloadInput)
      setEncoding(true)
      const result = await jwtEncode(h, p, secret, algorithm)
      setEncodedToken(result)
    } catch (e) {
      setEncodeError(e instanceof Error ? e.message : "Failed to encode JWT")
    } finally {
      setEncoding(false)
    }
  }, [headerInput, payloadInput, secret, algorithm])

  const handleCopy = useCallback(
    async (label: string, data: unknown) => {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      setCopied(label)
      setTimeout(() => setCopied(null), 1500)
    },
    [],
  )

  const handleCopyToken = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied("token")
    setTimeout(() => setCopied(null), 1500)
  }, [])

  const handleScroll = useCallback(() => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }, [])

  const timeClaim = (v: unknown) => {
    if (typeof v !== "number") return String(v)
    return `${v} (${new Date(v * 1000).toLocaleString()})`
  }

  const hasValidToken = token.trim() && token.trim().split(".").length === 3
  const isHmac = algorithm.startsWith("HS")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        <button
          onClick={() => setMode("decode")}
          className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === "decode" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"}`}
        >
          Decode
        </button>
        <button
          onClick={() => setMode("encode")}
          className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === "encode" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"}`}
        >
          Encode
        </button>
      </div>

      {mode === "decode" && (
        <>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                JWT Token
              </label>
              {hasValidToken && (
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
                    Header
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
                    Payload
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
                    Signature
                  </span>
                  <button
                    onClick={() => handleCopyToken(token)}
                    className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  >
                    {copied === "token" ? "Copied!" : "Copy"}
                  </button>
                </div>
              )}
            </div>
            <div className="relative min-h-[100px]">
              <div
                ref={overlayRef}
                className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-all rounded-lg border border-zinc-300 bg-white p-4 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-800"
              >
                {token ? (
                  <HighlightedToken token={token} />
                ) : (
                  <span className="text-zinc-400 dark:text-zinc-500">Paste your JWT token here...</span>
                )}
              </div>
              <textarea
                ref={textareaRef}
                value={token}
                onChange={(e) => { setToken(e.target.value); decode(e.target.value) }}
                onScroll={handleScroll}
                className="min-h-[100px] w-full resize-none rounded-lg border border-zinc-300 bg-transparent p-4 font-mono text-sm text-transparent caret-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:caret-zinc-100"
                spellCheck={false}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          {expiryWarning && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${expiryWarning.includes("expired")
                  ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  : "border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                }`}
            >
              {expiryWarning}
            </div>
          )}

          {header && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Header
                </label>
                <button
                  onClick={() => handleCopy("header", header)}
                  className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                >
                  {copied === "header" ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="whitespace-pre-wrap break-all rounded-lg border border-zinc-300 bg-zinc-50 p-4 font-mono text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                {JSON.stringify(header, null, 2)}
              </pre>
            </div>
          )}

          {payload && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Payload
                </label>
                <button
                  onClick={() => handleCopy("payload", payload)}
                  className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                >
                  {copied === "payload" ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="whitespace-pre-wrap break-all rounded-lg border border-zinc-300 bg-zinc-50 p-4 font-mono text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                {JSON.stringify(payload, null, 2)}
              </pre>
              {payload.exp != null || payload.iat != null || payload.nbf != null ? (
                <div className="mt-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-700 dark:bg-zinc-900">
                  <div className="font-medium text-zinc-500 dark:text-zinc-400">
                    Time Claims
                  </div>
                  {payload.iat != null && (
                    <div className="mt-1 text-zinc-600 dark:text-zinc-400">
                      Issued at (iat): {timeClaim(payload.iat)}
                    </div>
                  )}
                  {payload.exp != null && (
                    <div className="mt-0.5 text-zinc-600 dark:text-zinc-400">
                      Expires (exp): {timeClaim(payload.exp)}
                    </div>
                  )}
                  {payload.nbf != null && (
                    <div className="mt-0.5 text-zinc-600 dark:text-zinc-400">
                      Not before (nbf): {timeClaim(payload.nbf)}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </>
      )}

      {mode === "encode" && (
        <>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Algorithm
              </label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {algorithms.map((alg) => (
                  <option key={alg} value={alg}>{alg}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Secret Key
              </label>
              <input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder={isHmac ? "Enter HMAC secret..." : "Asymmetric keys not supported in-browser"}
                disabled={!isHmac}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Header (JSON)
              </label>
              <textarea
                value={headerInput}
                onChange={(e) => setHeaderInput(e.target.value)}
                className="min-h-[120px] w-full rounded-lg border border-zinc-300 bg-white p-4 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                spellCheck={false}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Payload (JSON)
              </label>
              <textarea
                value={payloadInput}
                onChange={(e) => setPayloadInput(e.target.value)}
                className="min-h-[120px] w-full rounded-lg border border-zinc-300 bg-white p-4 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                spellCheck={false}
              />
            </div>
          </div>

          <button
            onClick={handleEncode}
            disabled={encoding || !isHmac}
            className="cursor-pointer rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {encoding ? "Encoding..." : "Encode JWT"}
          </button>

          {!isHmac && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {algorithm} requires asymmetric keys — only HMAC algorithms (HS256/384/512) are supported in-browser.
            </div>
          )}

          {encodeError && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
              {encodeError}
            </div>
          )}

          {encodedToken && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
                    Header
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
                    Payload
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
                    Signature
                  </span>
                </div>
                <button
                  onClick={() => handleCopyToken(encodedToken)}
                  className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                >
                  {copied === "token" ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="rounded-lg border border-zinc-300 bg-zinc-50 p-4 font-mono text-sm break-all dark:border-zinc-700 dark:bg-zinc-900">
                <HighlightedToken token={encodedToken} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
