# Dev Tools Collection

A free collection of developer tools for mobile and web developers. Built with Next.js and TypeScript, all tools run directly in your browser with no server-side processing required.

Whether you're debugging APIs, decoding JWTs, testing regular expressions, converting timestamps, generating UUIDs, or working with JSON, Mobile Dev Tools provides a fast and privacy-friendly toolkit for everyday development tasks.

## Features

- 100% browser-based tools
- No data sent to servers
- Mobile-friendly and responsive UI
- Fast performance powered by Next.js
- Dark mode support
- Copy-to-clipboard support
- Open source
- TypeScript-powered
- Privacy-focused local processing

---

## Available Tools

### JSON Formatter

Format, beautify, validate, and minify JSON data with syntax highlighting. Useful for inspecting API responses, debugging payloads, and validating JSON structures.

**Features:**

- Format JSON
- Minify JSON
- Validate JSON syntax
- Syntax highlighting
- Error detection

### JSON to Types

Convert JSON objects into type definitions for multiple programming languages.

**Supported Languages:**

- Python (default)
- TypeScript
- Go
- Rust
- Kotlin
- Swift
- Java
- C#
- Zod
- GraphQL
- SQL

**Features:**

- Nullable field support
- Per-field nullable controls
- One-click code generation
- Copy generated types

### Base64 Encode / Decode

Encode plain text into Base64 format or decode Base64 strings back into readable text.

**Common Use Cases:**

- API testing
- Authentication debugging
- Data encoding
- Web development utilities

### URL Encoder / Decoder

Encode URLs safely for transmission and decode encoded URLs for inspection and debugging.

**Features:**

- URL encoding
- URL decoding
- Quick swap functionality
- Copy results instantly

### JWT Decoder

Decode and inspect JWT (JSON Web Token) payloads directly in your browser.

**Features:**

- Decode JWT headers
- Decode JWT payloads
- Signature inspection
- Expiration validation
- Time claim display
- JWT token generation

**Supported Algorithms:**

- HS256
- HS384
- HS512
- RS256
- RS384
- RS512
- ES256
- ES384
- ES512

### UUID Generator

Generate UUIDs for testing, database records, distributed systems, and application development.

**Supported Versions:**

- UUID v4
- UUID v7

**Output Formats:**

- Standard
- Uppercase
- No dashes

### QR Code Generator

Generate customizable QR codes from text, URLs, or other content.

**Features:**

- Custom size
- Error correction levels (L, M, Q, H)
- Foreground color selection
- Background color selection
- Download as PNG
- Copy to clipboard

### Password Generator

Coming soon.

### Color Converter

Convert colors between popular formats used in web development and design.

**Supported Formats:**

- HEX
- RGB
- HSL
- CSS Color Names

### Gradient Viewer

Create and preview CSS gradients visually.

**Features:**

- Multiple color stops
- Live preview
- CSS output generation
- Linear gradient support

### Timestamp Converter

Convert Unix timestamps into human-readable dates and vice versa.

**Features:**

- Seconds and milliseconds support
- Timezone conversion
- UTC support
- Human-readable formatting

**Supported Timezones:**

- UTC
- Multiple global timezones

### Regex Tester

Test, debug, and validate regular expressions with real-time feedback.

**Features:**

- Live regex matching
- Match highlighting
- Regex flags support
- Reference help panel
- Fast pattern testing

### Diff Checker

Compare two text blocks and identify differences instantly.

**Features:**

- Side-by-side comparison
- Character-level highlighting
- Line-level changes
- Keyboard navigation
- Diff chunk navigation

---

## Common Use Cases

Mobile Dev Tools can help with:

- Formatting and validating API responses
- Converting JSON into language-specific types
- Decoding JWT authentication tokens
- Generating UUIDs for testing and development
- Testing and debugging regular expressions
- Comparing text and code changes
- Generating QR codes
- Converting timestamps across timezones
- Encoding and decoding Base64 strings
- URL encoding and decoding
- Working with frontend and backend APIs

---

## Why Mobile Dev Tools?

Many online developer tools send data to remote servers for processing. Mobile Dev Tools is designed to perform operations directly within your browser whenever possible.

Benefits include:

- Faster processing
- Improved privacy
- Reduced latency
- Better mobile usability
- Open-source transparency

---

## Screenshots

### Home Page

![Home Page](docs/home-page.png)

### JSON Formatter

![JSON Formatter](docs/json-formatter.png)

### JWT Decoder

![JWT Decoder](docs/jwt-decoder.png)

### Regex Tester

![Regex Tester](docs/regex-tester.png)

---

## Tech Stack

### Framework

- Next.js 16
- App Router
- Turbopack

### Language

- TypeScript

### Styling

- Tailwind CSS v4

### Libraries

- qrcode
- lucide-react

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
npm install