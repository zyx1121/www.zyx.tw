"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

import { LEAVE_EVENT } from "@workspace/ui/components/page-decode"

/** Session storage key: the set is already on in this tab. */
const ON_KEY = "tv-on"
/** How long the power-on plays, as the keyframes in globals.css. */
const BOOT_MS = 900
/** How long the static lingers once the next page is in. */
const SETTLE_MS = 160
/** The static stops by this time even if the page never changes. */
const LONGEST_MS = 1500
/** The static's resolution: coarse, so each grain reads as a block. */
const NOISE_W = 160
const NOISE_H = 90

/**
 * Runs before the first paint: on the first page of a tab, and unless the
 * visitor asks for less motion, marks the root so the power-on plays.
 */
const BOOT_SCRIPT = `try{if(!sessionStorage.getItem("${ON_KEY}")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.dataset.boot="";sessionStorage.setItem("${ON_KEY}","1")}}catch(e){}`

/**
 * The TV frame turning on, once per tab: the picture opens out from a bright
 * line across the middle of the screen. The script and the screen are in the
 * server's HTML, so the page never shows before the set is on.
 */
export function TvBoot() {
  useEffect(() => {
    const root = document.documentElement
    if (!("boot" in root.dataset)) return
    const timer = window.setTimeout(() => delete root.dataset.boot, BOOT_MS)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      <div aria-hidden="true" data-slot="tv-boot">
        <div data-part="top" />
        <div data-part="bottom" />
        <div data-part="line" />
      </div>
    </>
  )
}

/**
 * Static between pages, as when the set changes channel: it starts as the
 * page scrambles out and clears just after the next page is in. Reduced
 * motion skips it with the scramble.
 */
export function TvStatic() {
  const ref = useRef<HTMLCanvasElement>(null)
  const pathname = usePathname()
  const state = useRef({ on: false, raf: 0, stop: 0, off: () => {} })

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    const image = ctx.createImageData(NOISE_W, NOISE_H)
    const pixels = new Uint32Array(image.data.buffer)
    const s = state.current

    const draw = () => {
      for (let i = 0; i < pixels.length; i++) {
        const v = (Math.random() * 255) | 0
        pixels[i] = 0xff000000 | (v << 16) | (v << 8) | v
      }
      ctx.putImageData(image, 0, 0)
      s.raf = requestAnimationFrame(draw)
    }

    const on = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
      s.on = true
      canvas.dataset.on = ""
      cancelAnimationFrame(s.raf)
      draw()
      window.clearTimeout(s.stop)
      s.stop = window.setTimeout(off, LONGEST_MS)
    }

    const off = (s.off = () => {
      s.on = false
      delete canvas.dataset.on
      window.clearTimeout(s.stop)
      // Let the fade out finish before the noise stops moving.
      s.stop = window.setTimeout(() => cancelAnimationFrame(s.raf), 200)
    })

    document.addEventListener(LEAVE_EVENT, on)
    return () => {
      document.removeEventListener(LEAVE_EVENT, on)
      cancelAnimationFrame(s.raf)
      window.clearTimeout(s.stop)
    }
  }, [])

  useEffect(() => {
    const s = state.current
    if (!s.on) return
    const timer = window.setTimeout(() => s.off(), SETTLE_MS)
    return () => window.clearTimeout(timer)
  }, [pathname])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      data-slot="tv-static"
      width={NOISE_W}
      height={NOISE_H}
    />
  )
}
