"use client"

import Link from "next/link"
import * as m from "motion/react-m"

import { useInView } from "@workspace/ui/hooks/use-in-view"

const EMAIL = "mail@zyx.tw"

const spring = { type: "spring" as const, stiffness: 200, damping: 20 }

export function Contact() {
  const { ref, inView } = useInView()

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      aria-label="Contact"
      className="flex h-dvh w-dvw flex-col items-center justify-center gap-6 px-6 text-center"
    >
      <m.h2
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={spring}
        className="text-2xl font-medium sm:text-3xl"
      >
        <Link
          href={`mailto:${EMAIL}`}
          className="underline underline-offset-8 transition-colors hover:text-muted-foreground"
        >
          {EMAIL}
        </Link>
      </m.h2>
      <m.p
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ ...spring, delay: 0.1 }}
        className="max-w-md text-sm text-muted-foreground"
      >
        Can&apos;t promise a reply, but the door&apos;s open.
      </m.p>
    </section>
  )
}
