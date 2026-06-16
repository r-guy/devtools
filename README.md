# Mobile Dev Tools

A collection of 12 handy utilities for mobile and web developers, built with Next.js.

## Tools

### Formatters & Validators

- **JSON Formatter** — Format, validate, and minify JSON data with syntax highlighting.
- **JSON to Types** — Convert JSON objects to type definitions in 10 languages: Python (default), TypeScript, Go, Rust, Kotlin, Swift, Java, C#, Zod, GraphQL, and SQL. Supports nullable toggles (global and per-field).

### Encoders & Decoders

- **Base64 Encode/Decode** — Encode and decode Base64 strings.
- **URL Encoder/Decoder** — URL-encode and decode strings with swap support.
- **JWT Decoder** — Paste a JWT token to decode and inspect the header and payload. Highlights each part (header/payload/signature) inline in the input area. Includes expiry validation and time claim display. Supports **encoding** with algorithm selection (HS256/384/512, RS256/384/512, ES256/384/512) — HMAC algorithms sign in-browser via the Web Crypto API.

### Generators

- **UUID Generator** — Generate UUIDs (v4, v7) in various formats (standard, uppercase, no dashes).
- **QR Code Generator** — Generate QR codes from text or URLs with configurable size, error correction level (L/M/Q/H), and foreground/background colors. Download as PNG or copy to clipboard.
- **Password Generator** — (coming soon)

### Converters

- **Color Converter** — Convert between HEX, RGB, HSL, and CSS color names.
- **Gradient Viewer** — Create and preview CSS gradients with color stops.
- **Timestamp Converter** — Convert Unix timestamps (seconds or ms) to human-readable dates and vice versa. Supports 12 timezones (default UTC) with timezone-aware formatting.

### Testers

- **Regex Tester** — Test and debug regular expressions in real-time with flag toggles and highlighted matches. Includes a regex reference help panel.
- **Diff Checker** — Compare two text snippets side-by-side with character-level diff highlighting. Lighter shading marks changed lines, darker shading marks exact differing characters. Navigate between diff chunks using ▲/▼ buttons or ↑/↓ keyboard arrows.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Libraries:** qrcode, lucide-react

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Build

```bash
npm run build
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (tool grid)
│   └── tools/[slug]/
│       └── page.tsx        # Dynamic tool page
├── components/
│   ├── JsonFormatter.tsx
│   ├── UuidGenerator.tsx
│   ├── Base64Tool.tsx
│   ├── ColorConverter.tsx
│   ├── GradientViewer.tsx
│   ├── RegexTester.tsx
│   ├── QrGenerator.tsx
│   ├── TimestampConverter.tsx
│   ├── UrlEncoderDecoder.tsx
│   ├── JwtDecoder.tsx
│   ├── JsonToTypes.tsx
│   └── DiffChecker.tsx
└── lib/
    └── tools.ts            # Tool registry
```

## Adding a New Tool

1. Create a component in `src/components/`
2. Add the tool metadata in `src/lib/tools.ts`
3. Import and add routing in `src/app/tools/[slug]/page.tsx`
