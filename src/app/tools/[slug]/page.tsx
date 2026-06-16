import Link from "next/link"
import { notFound } from "next/navigation"
import { tools } from "@/lib/tools"
import JsonFormatter from "@/components/JsonFormatter"
import UuidGenerator from "@/components/UuidGenerator"
import Base64Tool from "@/components/Base64Tool"
import ColorConverter from "@/components/ColorConverter"
import GradientViewer from "@/components/GradientViewer"
import RegexTester from "@/components/RegexTester"
import QrGenerator from "@/components/QrGenerator"
import TimestampConverter from "@/components/TimestampConverter"
import UrlEncoderDecoder from "@/components/UrlEncoderDecoder"
import JwtDecoder from "@/components/JwtDecoder"
import JsonToTypes from "@/components/JsonToTypes"
import DiffChecker from "@/components/DiffChecker"

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params
  const tool = tools.find((t) => t.slug === slug)
  if (!tool) return { title: "Tool Not Found" }
  return { title: `${tool.name} - Mobile Dev Tools` }
}

export async function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }))
}

export default async function ToolPage({ params }: { params: Params }) {
  const { slug } = await params
  const tool = tools.find((t) => t.slug === slug)
  if (!tool) notFound()

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <span>&larr;</span> Back to all tools
        </Link>

        <div className="mb-8">
          <span className="text-4xl">{tool.emoji}</span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">{tool.name}</h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            {tool.description}
          </p>
        </div>

        {tool.slug === "json-formatter" ? (
          <JsonFormatter />
        ) : tool.slug === "uuid-generator" ? (
          <UuidGenerator />
        ) : tool.slug === "base64" ? (
          <Base64Tool />
        ) : tool.slug === "color-converter" ? (
          <ColorConverter />
        ) : tool.slug === "gradient-viewer" ? (
          <GradientViewer />
        ) : tool.slug === "regex-tester" ? (
          <RegexTester />
        ) : tool.slug === "qr-generator" ? (
          <QrGenerator />
        ) : tool.slug === "timestamp-converter" ? (
          <TimestampConverter />
        ) : tool.slug === "url-encoder" ? (
          <UrlEncoderDecoder />
        ) : tool.slug === "jwt-decoder" ? (
          <JwtDecoder />
        ) : tool.slug === "json-to-types" ? (
          <JsonToTypes />
        ) : tool.slug === "diff-checker" ? (
          <DiffChecker />
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-zinc-400 dark:text-zinc-500">
              Tool implementation coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
