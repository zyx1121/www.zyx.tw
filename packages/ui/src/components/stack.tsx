const TOOLS = [
  "C++",
  "Java",
  "Python",
  "TypeScript",
  "React",
  "Next.js",
  "Tailwind CSS",
  "Bun",
  "Docker",
  "Git",
  "Supabase",
  "Vercel",
  "Mapbox",
] as const

function MarqueeTrack() {
  return (
    <div className="flex shrink-0 items-center">
      {TOOLS.map((name) => (
        <span
          key={name}
          className="pr-6 font-mono text-base whitespace-nowrap text-muted-foreground md:pr-10 md:text-lg"
        >
          {name}
        </span>
      ))}
    </div>
  )
}

export function Stack() {
  return (
    <section className="flex min-h-dvh w-dvw flex-col items-center justify-center px-8 py-32">
      <div className="mx-auto w-full max-w-4xl space-y-8 font-mono">
        <h2 className="text-3xl font-bold md:text-4xl">
          My AI uses these. <br className="md:hidden" />I use my AI 🤖
        </h2>

        <div className="relative -mx-[calc((100dvw-100%)/2)] w-dvw overflow-hidden opacity-90">
          <div
            className="pointer-events-none absolute inset-0 z-10 w-full"
            style={{
              background:
                "linear-gradient(to right, var(--background) 0%, transparent 12%, transparent 88%, var(--background) 100%)",
            }}
          />
          <div className="flex w-fit animate-marquee flex-nowrap will-change-transform motion-reduce:animate-none">
            <MarqueeTrack />
            <MarqueeTrack />
          </div>
        </div>
      </div>
    </section>
  )
}
