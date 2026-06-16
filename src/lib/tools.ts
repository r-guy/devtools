export interface Tool {
  slug: string
  name: string
  description: string
  emoji: string
  category: string
}

export const tools: Tool[] = [
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    description: "Format, validate, and minify JSON data",
    emoji: "📋",
    category: "Formatters",
  },
  {
    slug: "base64",
    name: "Base64 Encode/Decode",
    description: "Encode and decode Base64 strings",
    emoji: "🔐",
    category: "Encoders",
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    description: "Generate UUIDs (v4, v7) in various formats",
    emoji: "🆔",
    category: "Generators",
  },
  {
    slug: "diff-checker",
    name: "Diff Checker",
    description: "Compare two text snippets side by side",
    emoji: "⚡",
    category: "Testers",
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    description: "Test and debug regular expressions in real-time",
    emoji: "🔍",
    category: "Testers",
  },
  {
    slug: "json-to-types",
    name: "JSON to Types",
    description: "Convert JSON to type definitions in Python, TypeScript, Java and many other languages",
    emoji: "🔄",
    category: "Converters",
  },
  {
    slug: "timestamp-converter",
    name: "Timestamp Converter",
    description: "Convert Unix timestamps to human-readable dates and vice versa",
    emoji: "🕐",
    category: "Converters",
  },
  {
    slug: "url-encoder",
    name: "URL Encoder/Decoder",
    description: "Encode and decode URL components",
    emoji: "🔗",
    category: "Encoders",
  },
  {
    slug: "jwt-debugger",
    name: "JWT Encoder/Decoder",
    description: "Encode and decode and inspect JWT headers and payloads",
    emoji: "🔓",
    category: "Decoders",
  },
  {
    slug: "qr-generator",
    name: "QR Code Generator",
    description: "Generate QR codes from text or URLs",
    emoji: "📱",
    category: "Generators",
  },
  {
    slug: "color-converter",
    name: "Color Converter",
    description: "Convert between HEX, RGB, HSL, and more",
    emoji: "🎨",
    category: "Converters",
  },
  {
    slug: "gradient-viewer",
    name: "Gradient Viewer",
    description: "Create and preview CSS gradients with color stops",
    emoji: "🌈",
    category: "Converters",
  },
]
