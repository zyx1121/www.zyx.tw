"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"

import { useInView } from "@workspace/ui/hooks/use-in-view"

const spring = { type: "spring" as const, stiffness: 200, damping: 20 }

export function Intro() {
  const { ref, inView } = useInView()

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      aria-label="About"
      className="flex h-dvh w-dvw flex-col items-center justify-center gap-6 px-6 text-center"
    >
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={spring}
        className="text-2xl font-medium sm:text-3xl"
      >
        I&apos;m Loki — 詹詠翔.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ ...spring, delay: 0.1 }}
        className="text-sm text-muted-foreground"
      >
        MS in CS at{" "}
        <Link
          href="https://www.cs.nycu.edu.tw"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 transition-colors hover:text-foreground"
        >
          NYCU
        </Link>
        , with{" "}
        <Link
          href="https://www.winlab.tw"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 transition-colors hover:text-foreground"
        >
          WinLab
        </Link>
        .
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ ...spring, delay: 0.2 }}
        className="overflow-hidden rounded-3xl border border-border"
      >
        <Image
          src="/me.gif"
          alt="Ralph Wiggum waving"
          width={240}
          height={240}
          className="w-full max-w-[200px] sm:max-w-[240px]"
          unoptimized
        />
      </motion.div>
    </section>
  )
}
