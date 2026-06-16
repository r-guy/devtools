export default function SEOSection({ slug }: { slug: string }) {
  const content = getContent(slug)
  if (!content) return null

  return (
    <div className="mt-16 border-t border-zinc-200 pt-12 dark:border-zinc-800">
      <h2 className="mb-8 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">About this tool</h2>
      {content.map((section, i) => (
        <div key={i} className="mb-8">
          <h3 className="mb-3 text-lg font-semibold text-zinc-800 dark:text-zinc-200">{section.heading}</h3>
          <div className="space-y-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {section.paragraphs.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

interface Section {
  heading: string
  paragraphs: string[]
}

function getContent(slug: string): Section[] | null {
  switch (slug) {
    case "json-formatter":
      return [
        {
          heading: "What is a JSON Formatter?",
          paragraphs: [
            "A JSON formatter is a tool that takes raw JSON data and formats it into a clean, indented, and readable structure. JSON (JavaScript Object Notation) is the most widely used data interchange format on the web, powering APIs, configuration files, and data storage across millions of applications.",
            "When you work with JSON, you often receive minified or compact JSON — a single line of text without spaces or line breaks. A JSON formatter beautifies this data by adding proper indentation and line breaks, making it easy to read, debug, and understand the structure.",
          ],
        },
        {
          heading: "Why format and validate JSON?",
          paragraphs: [
            "Readable JSON is essential for debugging API responses, inspecting configuration files, and understanding data structures. Minified JSON is efficient for transmission but nearly impossible for humans to read. Our formatter instantly transforms it into a clean, indented view.",
            "Validation catches common errors like missing commas, trailing commas, unclosed brackets, or invalid escape sequences. Instead of guessing why your JSON is broken, the validator shows you exactly where the error is and what went wrong.",
          ],
        },
        {
          heading: "How to use this JSON Formatter",
          paragraphs: [
            "Simply paste your JSON into the input area. The tool automatically formats it with proper indentation (2 or 4 spaces) and highlights syntax for better readability.",
            "If your JSON contains errors, the tool highlights the problematic line and displays an error message. You can also minify the formatted JSON by clicking the Minify button, which compresses the output to a single line.",
            "Use the Copy button to copy the formatted or minified output to your clipboard.",
          ],
        },
        {
          heading: "Common use cases",
          paragraphs: [
            "Formatting API responses before inspecting them. Validating configuration files (package.json, tsconfig.json, etc.) before committing. Minifying JSON for production deployments to reduce file size. Debugging malformed JSON from third-party services.",
          ],
        },
      ]
    case "base64":
      return [
        {
          heading: "What is Base64 Encoding?",
          paragraphs: [
            "Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format. It uses a set of 64 characters (A-Z, a-z, 0-9, +, /) to encode data. This makes it safe to transmit binary data through text-based protocols like HTTP, SMTP, or within JSON payloads.",
            "Every 3 bytes of binary data are encoded as 4 Base64 characters. The encoding is reversible — any Base64-encoded string can be decoded back to its original binary form.",
          ],
        },
        {
          heading: "When to use Base64 encoding",
          paragraphs: [
            "Embedding images directly in HTML or CSS using data URIs. Sending binary files through JSON APIs. Storing binary data in databases that only support text. Encoding credentials for HTTP Basic Authentication. Obfuscating data (not for security — Base64 is not encryption).",
          ],
        },
        {
          heading: "How to use this tool",
          paragraphs: [
            "Select Encode mode to convert text to Base64. Paste your text and the encoded output appears instantly. Select Decode mode to convert Base64 back to text. Use the Swap button to quickly toggle between modes.",
            "The tool handles URL-safe Base64 encoding automatically, converting + and / to - and _ as needed.",
          ],
        },
      ]
    case "uuid-generator":
      return [
        {
          heading: "What is a UUID?",
          paragraphs: [
            "A UUID (Universally Unique Identifier) is a 128-bit number used to uniquely identify information in computer systems. With 2^122 possible combinations, the probability of generating a duplicate is practically zero.",
            "UUID v4 uses random numbers to generate identifiers, while UUID v7 uses a timestamp-based approach that allows for better database indexing. Both are widely supported across programming languages and databases.",
          ],
        },
        {
          heading: "Why use UUIDs?",
          paragraphs: [
            "Distributed systems need unique IDs without a central coordinator. UUIDs solve this by using randomness (v4) or timestamps (v7) to guarantee uniqueness across machines, databases, and services.",
            "Unlike auto-incrementing integers, UUIDs don't reveal how many records exist in your database and can't be easily guessed. They're ideal for primary keys, request IDs, file names, and any scenario requiring globally unique identifiers.",
          ],
        },
        {
          heading: "How to use this generator",
          paragraphs: [
            "Select your preferred UUID version (v4 or v7) from the dropdown. The tool generates a new UUID instantly. You can generate multiple UUIDs at once and copy them individually or all together.",
            "Choose from different format options: standard (with dashes), uppercase, or without dashes. Use the Copy All button to copy multiple UUIDs at once.",
          ],
        },
      ]
    case "diff-checker":
      return [
        {
          heading: "What is a Diff Checker?",
          paragraphs: [
            "A diff checker compares two text snippets and highlights the differences between them. It shows what was added, removed, or unchanged, similar to how Git shows changes between commits. This is invaluable for code review, document revision, and content comparison.",
          ],
        },
        {
          heading: "Character-level diff highlighting",
          paragraphs: [
            "Unlike basic diff tools that only show line-level changes, our diff checker provides character-level precision. Changed lines are highlighted with a lighter background, while the exact differing characters within those lines are shown in a darker shade.",
            "This makes it easy to spot exactly what changed — a single character, a word, or a complete rewrite.",
          ],
        },
        {
          heading: "How to use this Diff Checker",
          paragraphs: [
            "Paste your original text in the left panel and your modified text in the right panel. The diff appears below, with red highlighting for removed content and green for added content.",
            "Navigate between diff chunks using the ▲ and ▼ buttons on the right side, or use the ↑ and ↓ arrow keys on your keyboard. Click the arrows next to each changed line to accept or reject individual changes.",
          ],
        },
      ]
    case "regex-tester":
      return [
        {
          heading: "What is Regular Expression Testing?",
          paragraphs: [
            "Regular expressions (regex) are patterns used to match character combinations in strings. A regex tester lets you write a pattern and test it against sample text in real-time, showing which parts match and why.",
            "Regex is supported by virtually every programming language and is essential for form validation, data extraction, search-and-replace operations, and text parsing.",
          ],
        },
        {
          heading: "Understanding regex flags",
          paragraphs: [
            "Flags modify how the regex engine processes your pattern: g (global) finds all matches instead of just the first one, i (case-insensitive) ignores letter case, m (multiline) treats ^ and $ as per-line anchors, s (dotall) makes . match newlines, and u (unicode) enables full Unicode support.",
          ],
        },
        {
          heading: "How to use this tool",
          paragraphs: [
            "Enter your regex pattern between the slashes and select the appropriate flags (g, i, m, s, u). Type your test string in the text area below. The tool highlights all matches in real-time and shows match details including positions and capture groups.",
            "Click the 'i' button to see a quick reference guide for regex syntax including anchors, character classes, quantifiers, and groups.",
          ],
        },
      ]
    case "json-to-types":
      return [
        {
          heading: "What is JSON to Type Conversion?",
          paragraphs: [
            "JSON to Types converts a JSON object into type definitions or schemas for various programming languages. Instead of manually writing interfaces or classes from an API response, you paste the JSON and instantly get the corresponding type definition.",
          ],
        },
        {
          heading: "Supported languages",
          paragraphs: [
            "Our tool supports 11 languages: Python (dataclasses with Optional typing), TypeScript (interfaces), Go (structs with JSON tags), Rust (structs with serde), Kotlin (data classes), Swift (Codable structs), Java (POJOs), C# (classes with JsonProperty), Zod (runtime validation schemas), GraphQL (SDL types), and SQL (CREATE TABLE statements).",
          ],
        },
        {
          heading: "Nullable field support",
          paragraphs: [
            "Use the All Nullable toggle to make every field optional across all levels. For finer control, expand the Nullable fields section to individually mark specific keys as nullable. The type output updates in real-time as you toggle fields.",
          ],
        },
      ]
    case "timestamp-converter":
      return [
        {
          heading: "What is a Unix Timestamp?",
          paragraphs: [
            "A Unix timestamp is the number of seconds (or milliseconds) that have elapsed since January 1, 1970 (the Unix epoch). It is a simple, unambiguous way to represent time that is independent of time zones and formats.",
            "Timestamps are widely used in databases, APIs, and programming because they can be stored as simple integers and compared easily.",
          ],
        },
        {
          heading: "Why convert timestamps?",
          paragraphs: [
            "API responses often return timestamps that need to be converted to human-readable dates for debugging. Similarly, you may need to generate a timestamp from a date to pass to an API. Our converter handles both directions instantly.",
          ],
        },
        {
          heading: "How to use this tool",
          paragraphs: [
            "Enter a timestamp (in seconds or milliseconds) in the Timestamp → Date field to see the corresponding date in your selected timezone and in UTC. Enter a date in the Date → Timestamp field to get the Unix timestamp.",
            "Choose from 12 timezones including UTC, IST, EST, PST, GMT, JST, and more. Click the Now button to instantly use the current timestamp.",
          ],
        },
      ]
    case "url-encoder":
      return [
        {
          heading: "What is URL Encoding?",
          paragraphs: [
            "URL encoding (also called percent-encoding) converts characters that are not allowed in URLs into a format that can be transmitted safely. Special characters like spaces, quotes, and non-ASCII characters are replaced with a percent sign followed by two hexadecimal digits.",
          ],
        },
        {
          heading: "When to use URL encoding",
          paragraphs: [
            "Building query parameters for API requests. Encoding user input before appending to URLs. Handling special characters in form data submissions. Debugging encoded URL parameters in browser dev tools.",
          ],
        },
        {
          heading: "How to use this tool",
          paragraphs: [
            "Select Encode mode and paste your text to get the URL-encoded version. Select Decode mode to convert an encoded URL back to readable text. Use the Swap button to quickly toggle between encode and decode modes.",
          ],
        },
      ]
    case "jwt-debugger":
      return [
        {
          heading: "What is a JWT?",
          paragraphs: [
            "JWT (JSON Web Token) is a compact, URL-safe token format used for securely transmitting information between parties. Each JWT consists of three parts: a header (containing the signing algorithm), a payload (containing claims like user ID and expiration), and a signature (verifying the token hasn't been tampered with).",
          ],
        },
        {
          heading: "How JWT encoding works",
          paragraphs: [
            "To encode a JWT, you provide a header (typically specifying the algorithm), a payload with your claims, and a secret key. The header and payload are Base64URL-encoded, then signed using the selected algorithm (HS256/384/512 with the Web Crypto API).",
          ],
        },
        {
          heading: "How to use this tool",
          paragraphs: [
            "Decode mode: Paste a JWT token to inspect the header and payload. The tool highlights each part (header/payload/signature) in different colors inline and validates expiration times.",
            "Encode mode: Choose an algorithm (HS256/384/512 for HMAC), enter your secret key, and edit the header and payload JSON. Click Encode JWT to generate a signed token.",
          ],
        },
      ]
    case "qr-generator":
      return [
        {
          heading: "What is a QR Code?",
          paragraphs: [
            "A QR code (Quick Response code) is a two-dimensional barcode that can store text, URLs, and other data. Unlike traditional barcodes that only store numbers horizontally, QR codes store data both horizontally and vertically, allowing much more information to be encoded.",
          ],
        },
        {
          heading: "QR code error correction",
          paragraphs: [
            "QR codes include error correction that allows them to be read even when partially damaged or obscured. Choose from four levels: L (7% recovery), M (15%), Q (25%), and H (30%). Higher levels create denser codes but allow more damage tolerance.",
          ],
        },
        {
          heading: "How to use this generator",
          paragraphs: [
            "Enter your text or URL in the input field. The QR code updates in real-time. Adjust the size, error correction level, and foreground/background colors. Download the QR code as a PNG image or copy it to your clipboard.",
          ],
        },
      ]
    case "color-converter":
      return [
        {
          heading: "What is Color Conversion?",
          paragraphs: [
            "Color conversion translates a color between different color models. Each model represents colors differently: HEX codes (#FF5733) are compact and commonly used in web design, RGB values (255, 87, 51) represent colors as red, green, and blue components and are used in graphics programming, HSL (hue, saturation, lightness) is preferred for creating harmonious color schemes because it separates the color itself from its intensity and brightness.",
            "CSS also supports named colors like 'tomato', 'dodgerblue', and 'mediumseagreen'. Our converter handles all these formats, including alpha transparency variants like RGBA and HSLA.",
          ],
        },
        {
          heading: "Supported color formats",
          paragraphs: [
            "HEX: Six-digit (#FF5733) and three-digit shorthand (#F53). RGB: Integer format rgb(255, 87, 51) and percentage format rgb(100%, 34%, 20%). HSL: hue (0-360), saturation (0-100%), lightness (0-100%). Alpha variants: RGBA and HSLA with transparency values between 0 and 1.",
            "CSS color names: All 148 named colors from the CSS specification (red, blue, aliceblue, rebeccapurple, etc.). The tool displays the live color preview so you can verify the output at a glance.",
          ],
        },
        {
          heading: "How to use this tool",
          paragraphs: [
            "Enter a color in any supported format (HEX, RGB, HSL, or CSS name). The tool instantly converts it to all other formats and displays a live color swatch. Copy any format you need by clicking the Copy button next to each value.",
            "The search input lets you find colors by name. As you type, matching CSS color names appear in a dropdown, making it easy to discover and explore the full palette of named colors.",
          ],
        },
        {
          heading: "Common use cases",
          paragraphs: [
            "Designers use color converters to translate palette colors between design tools (Figma, Sketch) and code. Frontend developers convert HEX colors from design specs into RGBa for CSS box-shadows or HSLa for dynamic theme generation. Backend developers need to parse and validate hex color codes from user input or configuration files.",
          ],
        },
      ]
    case "gradient-viewer":
      return [
        {
          heading: "What is a CSS Gradient?",
          paragraphs: [
            "CSS gradients are smooth transitions between two or more colors, used for backgrounds, buttons, banners, and decorative elements. Unlike static images, CSS gradients are rendered by the browser, which means they scale perfectly at any resolution and can be animated.",
            "There are two main types: linear gradients that create a straight-line transition in any direction (top to bottom, left to right, or any angle), and radial gradients that radiate outward from a center point in a circular or elliptical pattern.",
          ],
        },
        {
          heading: "Why use CSS gradients?",
          paragraphs: [
            "Gradients add visual depth and modern styling without loading external images. They're ideal for hero sections, call-to-action buttons, card backgrounds, and overlay effects. Since they're pure CSS, they don't impact page load performance and work across all modern browsers.",
            "CSS gradients can include multiple color stops, each with an optional position percentage. This allows for complex effects like hard color transitions (using adjacent stops), smooth multi-color blends, and even striped patterns.",
          ],
        },
        {
          heading: "How to use this viewer",
          paragraphs: [
            "Add color stops by clicking the plus button, then choose a color for each stop using the color picker. Drag the position slider to control where each color appears in the gradient. Switch between linear and radial gradient modes.",
            "The gradient preview updates in real-time as you make changes. The CSS code panel below shows the generated code, ready to copy and paste into your stylesheet. You can also adjust the gradient angle for linear gradients and the shape for radial gradients.",
          ],
        },
        {
          heading: "Tips for great gradients",
          paragraphs: [
            "Keep color stops within a similar hue range for smooth, natural transitions. Use contrasting colors for bold, eye-catching effects. The 60-30-10 design rule works well with gradients: use a dominant color for most of the gradient, a secondary color for the transition, and an accent color for highlights.",
            "When designing for dark mode, consider how your gradient will look against dark backgrounds. Test with both light and dark themes to ensure readability of any text overlaid on the gradient.",
          ],
        },
      ]
    default:
      return null
  }
}
