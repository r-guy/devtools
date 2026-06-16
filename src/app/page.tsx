import Link from "next/link"
import { tools } from "@/lib/tools"

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
      </div>
    </main>
  )
}
