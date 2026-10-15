"use client"

import { useEffect } from "react"

const IMAGE = "/bliss.webp"

/** Where the corner text sits, in CSS pixels from the viewport's edges. */
const INSET = 20
const ROW = 24
const WIDTH = 200

/** sRGB channel, 0 to 255, to linear light. */
function linear(channel: number) {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

/** Black or white, whichever reads better on this relative luminance. */
function inkFor(luminance: number) {
  const onBlack = (luminance + 0.05) / 0.05
  const onWhite = 1.05 / (luminance + 0.05)
  return onBlack >= onWhite ? "var(--color-black)" : "var(--color-white)"
}

/**
 * Picks black or white for the home's top and bottom corners from the part
 * of Bliss under them, as the picture is cropped to the viewport, and hands
 * it to the corners as --home-ink-top and --home-ink-bottom.
 */
export function HomeInk() {
  useEffect(() => {
    const root = document.documentElement
    const image = new Image()
    let frame = 0

    const measure = () => {
      const { naturalWidth: iw, naturalHeight: ih } = image
      const vw = window.innerWidth
      const vh = window.innerHeight
      // The same crop as `center / cover`.
      const scale = Math.max(vw / iw, vh / ih)
      const left = (vw - iw * scale) / 2
      const top = (vh - ih * scale) / 2
      const canvas = document.createElement("canvas")
      canvas.width = vw
      canvas.height = vh
      const context = canvas.getContext("2d", { willReadFrequently: true })
      if (!context) return
      context.drawImage(image, left, top, iw * scale, ih * scale)

      const luminanceOf = (y: number) => {
        let sum = 0
        let count = 0
        for (const x of [INSET, vw - INSET - WIDTH]) {
          const { data } = context.getImageData(x, y, WIDTH, ROW)
          for (let i = 0; i < data.length; i += 4) {
            sum +=
              0.2126 * linear(data[i]) +
              0.7152 * linear(data[i + 1]) +
              0.0722 * linear(data[i + 2])
            count++
          }
        }
        return sum / count
      }

      root.style.setProperty("--home-ink-top", inkFor(luminanceOf(INSET)))
      root.style.setProperty(
        "--home-ink-bottom",
        inkFor(luminanceOf(vh - INSET - ROW))
      )
    }

    const onResize = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }

    image.onload = measure
    image.src = IMAGE
    window.addEventListener("resize", onResize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", onResize)
      root.style.removeProperty("--home-ink-top")
      root.style.removeProperty("--home-ink-bottom")
    }
  }, [])

  return null
}
