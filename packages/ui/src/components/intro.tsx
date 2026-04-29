export function Intro() {
  return (
    <section className="flex min-h-dvh w-dvw flex-col items-center justify-center px-8 py-32">
      <div className="mx-auto w-full max-w-4xl space-y-6 font-mono">
        <h1 className="text-3xl font-bold md:text-4xl">Hi, I&apos;m Loki 👋</h1>
        <p className="text-lg text-muted-foreground md:text-xl">
          I&apos;m <span className="text-foreground">Zhan Yong Xiang</span> from{" "}
          <span className="text-foreground">Taiwan</span>
        </p>
        <p className="text-lg text-muted-foreground md:text-xl">
          Currently pursuing an <span className="text-foreground">MS</span> in{" "}
          <span className="text-foreground">CS</span> at{" "}
          <span className="text-foreground">NYCU</span>
        </p>
      </div>
    </section>
  )
}
