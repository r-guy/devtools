import Link from "next/link"
import { tools } from "@/lib/tools"

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Mobile Dev Tools
          </h1>
          <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
            A collection of handy utilities for mobile developers
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group flex flex-col items-center gap-3 rounded-xl border border-zinc-200 bg-white p-5 text-center transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
            >
              <span className="text-3xl">{tool.emoji}</span>
              <div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {tool.name}
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {tool.description}
                </p>
              </div>
              <span className="self-start rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {tool.category}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
