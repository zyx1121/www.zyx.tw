"use client"

import { useEffect, useRef, type ReactNode } from "react"

import { cn } from "@workspace/ui/lib/utils"

/** Fades its screen up once, the first time it scrolls into view. */
export function Reveal({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (!window.IntersectionObserver) {
      element.dataset.visible = "true"
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        element.dataset.visible = "true"
        observer.disconnect()
      },
      { threshold: 0.15 }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} className={cn("stamp-reveal", className)}>
      {children}
    </div>
  )
}
