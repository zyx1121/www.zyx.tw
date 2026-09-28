import { Fragment } from "react"
import Image from "next/image"
import Link from "next/link"

import { INTRO, PHOTO } from "@workspace/ui/lib/profile"
import { cn } from "@workspace/ui/lib/utils"

const LINK =
  "underline underline-offset-4 transition-colors hover:text-foreground"

/** The one-line intro; About shows it under the name. */
export function IntroLine() {
  return (
    <>
      {INTRO.map(({ text, href }, index) => (
        <Fragment key={index}>
          {href ? (
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={LINK}
            >
              {text}
            </Link>
          ) : (
            text
          )}
        </Fragment>
      ))}
    </>
  )
}

/** The photo, 240 px square at most, in a 10 px rounded frame. */
export function Intro({ className }: { className?: string }) {
  return (
    <Image
      src={PHOTO.src}
      alt={PHOTO.alt}
      width={240}
      height={240}
      className={cn(
        "aspect-square w-full max-w-[200px] rounded-lg sm:max-w-[240px]",
        className
      )}
      unoptimized
    />
  )
}
