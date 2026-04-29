import Link from "next/link"

export function MapPreview() {
  return (
    <section className="flex min-h-dvh w-dvw flex-col items-center justify-center px-8 py-32">
      <div className="mx-auto w-full max-w-4xl font-mono">
        <Link href="/map" className="block">
          <h2 className="text-3xl font-bold underline transition-transform hover:scale-105 md:text-4xl">
            Places I&rsquo;ve Shot 📌
          </h2>
        </Link>
      </div>
    </section>
  )
}
