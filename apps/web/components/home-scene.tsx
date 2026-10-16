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
  void: { id: "void", params: {} },
  obsidian: { id: "obsidian", params: {} },
  oil: { id: "oil", params: {} },
  chrome: { id: "chrome", params: {} },
  velvet: { id: "velvet", params: {} },
}

/** Looks that mirror their surroundings take the sky, not the violet studio. */
const SKY_LOOKS = new Set(["obsidian", "oil", "chrome", "velvet"])

function sceneWith(look: string, env: string | null) {
  return {
    ...BASE,
    shape: { ...BASE.shape, bevel: 0.08 },
    material: LOOKS[look] ?? LOOKS.clear,
    environment: {
      ...BASE.environment,
      id: env ?? (SKY_LOOKS.has(look) ? "sky" : BASE.environment.id),
    },
    // Glow and a vignette would tint the picture the frame now carries.
    effects: [],
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
  const [query] = useState(
    () =>
      new URLSearchParams(
        typeof window === "undefined" ? "" : window.location.search
      )
  )
  const scene = useMemo(
    () => sceneWith(query.get("look") ?? "void", query.get("env")),
    [query]
  )
  const look = query.get("look") ?? "void"
  const lens = Number(query.get("lens") ?? 1)
  return (
    <Scene3D
      scene={scene}
      view={FRONT}
      controls={false}
      transparent
      drift={reduced ? 0 : 1.6}
      grab
      rise={!reduced}
      // The sky alone: the hills are in front of the hole, not behind it.
      backgroundImage="/bliss-sky.webp"
      lift={0.04}
      lens={lens}
      lighting={look !== "void"}
      dpr={[1, 1]}
      className="size-full"
    />
  )
}
