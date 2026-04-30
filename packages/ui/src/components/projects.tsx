import Link from "next/link"

type Project = {
  name: string
  description: string
  href: string
  external?: boolean
}

const PROJECTS: Project[] = [
  {
    name: "ai.winlab.tw",
    description: "NYCU Office of AI Affairs — institutional website",
    href: "https://ai.winlab.tw",
    external: true,
  },
  {
    name: "agent-gateway",
    description: "Telegram → Claude Code agent gateway",
    href: "https://github.com/zyx1121/agent-gateway",
    external: true,
  },
  {
    name: "apple-* MCP",
    description: "7 MCP servers for macOS automation via Claude Code",
    href: "https://github.com/zyx1121",
    external: true,
  },
  {
    name: "Impression",
    description: "macOS app — Claude Code token usage display",
    href: "https://github.com/Monet-Ltd/impression",
    external: true,
  },
  {
    name: "nycueats.winlab.tw",
    description: "Campus meal ordering platform for NYCU",
    href: "https://nycueats.winlab.tw",
    external: true,
  },
  {
    name: "temp.zyx.tw",
    description: "Ephemeral shared notepad — one URL, one pad",
    href: "https://temp.zyx.tw",
    external: true,
  },
  {
    name: "link.zyx.tw",
    description: "URL shortener",
    href: "https://link.zyx.tw",
    external: true,
  },
] as const

export function Projects() {
  return (
    <section className="flex min-h-dvh w-dvw flex-col items-center justify-center px-8 py-32">
      <div className="mx-auto w-full max-w-4xl space-y-8 font-mono">
        <h2 className="text-3xl font-bold md:text-4xl">
          Things I&apos;ve built 🔨
        </h2>
        <ul className="space-y-6">
          {PROJECTS.map(({ name, description, href, external }) => (
            <li key={name}>
              <Link
                href={href}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="group flex flex-col gap-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="text-base font-semibold text-foreground transition-colors group-hover:text-brand md:text-lg">
                  {name}
                </span>
                <span className="text-sm md:text-base">{description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
