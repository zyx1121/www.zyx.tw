"use client"

import {
  parseScene,
  Scene3D,
  type SceneV1,
  type SceneView,
} from "@workspace/3d"

import { useMemo, useState } from "react"

import sceneFile from "@/lib/home-scene.json"
import { useReducedMotion } from "@/lib/use-reduced-motion"

/**
 * The zyx mark, as saved from 3d.zyx.tw, in liquid glass with rounder
 * edges. It turns by itself and by hand, so it doesn't follow the pointer.
 */
const BASE = parseScene(sceneFile)

/** The material, and its tint, by `?look=` while the look is being picked. */
const LOOKS: Record<string, SceneV1["material"]> = {
  clear: { id: "liquid", params: {} },
  bubble: { id: "bubble", params: {} },
  prism: { id: "prism", params: {} },
  frosted: { id: "frosted", params: {} },
  candy: { id: "liquid", params: { color: "#ff6fb5", tintDepth: 0.6 } },
  sea: { id: "liquid", params: { color: "#38c7ff", tintDepth: 0.6 } },
  orange: { id: "liquid", params: { color: "#ff7a1a", tintDepth: 1.4 } },
  magenta: { id: "liquid", params: { color: "#ff2d8a", tintDepth: 1.4 } },
  coral: { id: "liquid", params: { color: "#ff5a4e", tintDepth: 1.4 } },
}

function sceneWith(look: string) {
  return {
    ...BASE,
    shape: { ...BASE.shape, bevel: 0.08 },
    material: LOOKS[look] ?? LOOKS.clear,
    motion: { hover: false },
  } as SceneV1
}

/** Straight on, so the mark starts square. */
const FRONT: SceneView = { azimuth: 0, elevation: 0 }

/**
 * The mark a little above the middle of the viewport, half behind the hills,
 * tumbling slowly; a drag turns it and throws it. Visitors who ask for
 * reduced motion get no tumble, only the drag.
 */
export function HomeScene() {
  const reduced = useReducedMotion()
  const [look] = useState(() =>
    typeof window === "undefined"
      ? "clear"
      : (new URLSearchParams(window.location.search).get("look") ?? "clear")
  )
  const scene = useMemo(() => sceneWith(look), [look])
  return (
    <Scene3D
      scene={scene}
      view={FRONT}
      controls={false}
      transparent
      drift={reduced ? 0 : 1.6}
      grab
      rise={!reduced}
      backgroundImage="/bliss.webp"
      lift={0.04}
      className="size-full"
    />
  )
}
