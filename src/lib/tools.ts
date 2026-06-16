export interface Tool {
  slug: string
  name: string
  description: string
  emoji: string
  category: string
  metaTitle?: string
  metaDescription?: string
}

export const tools: Tool[] = [
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    description: "Format, validate, and minify JSON data",
    emoji: "📋",
    category: "Formatters",
    metaTitle: "JSON Formatter & Validator",
    metaDescription: "Format, validate and minify JSON online. Free JSON formatter with syntax highlighting and error detection.",
  },
  {
    slug: "base64",
    name: "Base64 Encode/Decode",
    description: "Encode and decode Base64 strings",
    emoji: "🔐",
    category: "Encoders",
    metaTitle: "Base64 Encoder & Decoder",
    metaDescription: "Encode and decode Base64 strings online. Free Base64 converter with real-time encoding and decoding.",
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    description: "Generate UUIDs (v4, v7) in various formats",
    emoji: "🆔",
    category: "Generators",
    metaTitle: "UUID Generator",
    metaDescription: "Generate UUIDs v4 and v7 online. Free UUID generator with multiple format options including uppercase and no dashes.",
  },
  {
    slug: "diff-checker",
    name: "Diff Checker",
    description: "Compare two text snippets side by side",
    emoji: "⚡",
    category: "Testers",
    metaTitle: "Text Diff Checker",
    metaDescription: "Compare two text snippets side by side with character-level diff highlighting. Free online diff checker with keyboard navigation.",
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    description: "Test and debug regular expressions in real-time",
    emoji: "🔍",
    category: "Testers",
    metaTitle: "Regex Tester & Debugger",
    metaDescription: "Test and debug regular expressions in real-time with flag toggles and match highlighting. Free online regex tester.",
  },
  {
    slug: "json-to-types",
    name: "JSON to Types",
    description: "Convert JSON to type definitions in Python, TypeScript, Java and many other languages",
    emoji: "🔄",
    category: "Converters",
    metaTitle: "JSON to Type Converter (Python, TypeScript, Java & More)",
    metaDescription: "Convert JSON to type definitions in Python, TypeScript, Go, Rust, Kotlin, Swift, Java, C#, Zod, GraphQL, and SQL. Free online type generator with nullable toggles.",
  },
  {
    slug: "timestamp-converter",
    name: "Timestamp Converter",
    description: "Convert Unix timestamps to human-readable dates and vice versa",
    emoji: "🕐",
    category: "Converters",
    metaTitle: "Unix Timestamp Converter",
    metaDescription: "Convert Unix timestamps to human-readable dates and vice versa. Free online timestamp converter with timezone support.",
  },
  {
    slug: "url-encoder",
    name: "URL Encoder/Decoder",
    description: "Encode and decode URL components",
    emoji: "🔗",
    category: "Encoders",
    metaTitle: "URL Encoder & Decoder",
    metaDescription: "Encode and decode URL components online. Free URL converter with swap support.",
  },
  {
    slug: "jwt-debugger",
    name: "JWT Encoder/Decoder",
    description: "Encode, decode and inspect JWT headers and payloads",
    emoji: "🔓",
    category: "Decoders",
    metaTitle: "JWT Encoder & Decoder",
    metaDescription: "Encode, decode and inspect JWT tokens online. Free JWT debugger with algorithm selection and validation.",
  },
  {
    slug: "qr-generator",
    name: "QR Code Generator",
    description: "Generate QR codes from text or URLs",
    emoji: "📱",
    category: "Generators",
    metaTitle: "QR Code Generator",
    metaDescription: "Generate QR codes from text or URLs with customizable size, colors and error correction. Free online QR code generator.",
  },
  {
    slug: "color-converter",
    name: "Color Converter",
    description: "Convert between HEX, RGB, HSL, and more",
    emoji: "🎨",
    category: "Converters",
    metaTitle: "Color Converter (HEX, RGB, HSL)",
    metaDescription: "Convert colors between HEX, RGB, HSL and CSS color names online. Free color converter with real-time preview.",
  },
  {
    slug: "gradient-viewer",
    name: "Gradient Viewer",
    description: "Create and preview CSS gradients with color stops",
    emoji: "🌈",
    category: "Converters",
    metaTitle: "CSS Gradient Viewer & Generator",
    metaDescription: "Create and preview CSS gradients with multiple color stops online. Free gradient viewer with real-time preview.",
  },
]
