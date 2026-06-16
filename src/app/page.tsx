import Link from "next/link"
import type { Metadata } from "next"
import { tools } from "@/lib/tools"

export const metadata: Metadata = {
  title: "Dev Tools Collection",
  description:
    "A collection of free online developer tools including JSON formatter, Base64 encoder, UUID generator, regex tester, diff checker, QR code generator, color converter, and many more.",
}

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Dev Tools Collection
          </h1>
          <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
            A collection of handy utilities for developers
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group relative flex flex-col items-center gap-3 rounded-xl border border-zinc-200 bg-white p-5 pt-5 text-center transition-colors hover:border-zinc-400 hover:bg-[#202020] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:bg-[#202020]"
            >
              <span className="text-3xl">{tool.emoji}</span>
              <div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {tool.name}
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {tool.description}
                </p>
                {/* <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {tool.category}
                </span> */}
              </div>
            
            </Link>
          ))}
        </div>

        <div className="mt-24 border-t border-zinc-200 pt-16 dark:border-zinc-800">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Free Online Developer Tools
            </h2>
            <div className="space-y-12 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              <div>
                <h3 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                  All tools run directly in your browser
                </h3>
                <p className="mb-3">
                  Every tool in this collection runs entirely in your browser using the Web Crypto API, Canvas API, and modern JavaScript. No data is sent to any server — your JSON, tokens, passwords, and diff comparisons stay private on your machine. This makes the tools fast, secure, and available offline after the first page load.
                </p>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                  Built for developers who need quick answers
                </h3>
                <p className="mb-3">
                  Whether you&apos;re debugging an API response, generating a UUID for a new database record, decoding a JWT token, or formatting a minified JSON file — these tools are designed to get you the answer in seconds. Paste, click, copy. No signup, no ads, no distractions.
                </p>
                <p className="mb-3">
                  The collection covers the most common developer workflows: formatting and validating data (JSON), encoding and decoding strings (Base64, URL), generating identifiers (UUID, QR codes), converting between formats (colors, timestamps, JSON-to-types), and comparing differences (text diff).
                </p>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                  Keyboard shortcuts and power-user features
                </h3>
                <p className="mb-3">
                  Many tools include keyboard shortcuts for faster workflows. The Diff Checker supports arrow key navigation between changes, and individual changes can be accepted or rejected with a single click. The Regex Tester includes flag toggles for case-insensitive, multiline, and global matching. The JSON Formatter supports both pretty-print and minification in one click.
                </p>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-zinc-700 dark:text-zinc-300">Is this tool free to use?</h4>
                    <p>Yes, all tools are completely free with no usage limits, no signups, and no ads.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-zinc-700 dark:text-zinc-300">Does my data stay private?</h4>
                    <p>Yes. All processing happens in your browser. Your data is never uploaded to any server.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-zinc-700 dark:text-zinc-300">Can I use these tools offline?</h4>
                    <p>Yes. After the first visit, the tools are cached by your browser and work offline.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-zinc-700 dark:text-zinc-300">What browsers are supported?</h4>
                    <p>All modern browsers including Chrome, Firefox, Safari, and Edge. Mobile browsers are fully supported.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
