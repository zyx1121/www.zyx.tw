"use client"

import { useMemo } from "react"

import { createScene, Scene3D } from "@workspace/3d"

import { PLUMP_SAMPLE } from "@/lib/plump"

const BASE = createScene(PLUMP_SAMPLE)

export function PlumpScene({
  depth,
  material,
}: {
  depth: number
  material: "metal" | "plastic" | "glass"
}) {
  const scene = useMemo(
    () => ({
      ...BASE,
      shape: { ...BASE.shape, depth, bevel: 0.09 },
      material: {
        id: material,
        params: {
          color: material === "plastic" ? "#d95e37" : "#ffffff",
        },
      },
      staging: { id: "oblique", background: "#eadbd0" },
      motion: { hover: false },
    }),
    [depth, material]
  )

  return (
    <Scene3D
      scene={scene}
      view={{ azimuth: -24, elevation: 18 }}
      controls={false}
      className="size-full"
    />
  )
}
