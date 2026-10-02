"use client"
import { T } from "@workspace/ui/components/locale-provider"

import { useEffect, useState } from "react"

import { parseScene, Scene3D, type SceneV1 } from "@workspace/3d"

import { asset, type ProductId } from "@/lib/made"

export default function MadeScene({ product }: { product: ProductId }) {
  const [scene, setScene] = useState<SceneV1 | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetch(asset(product, ".scene.json"), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Scene unavailable")
        return response.json()
      })
      .then((value: unknown) => {
        const parsed = parseScene(value)
        setScene({ ...parsed, motion: { hover: false } })
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true)
      })
    return () => controller.abort()
  }, [product])

  if (failed)
    return (
      <p role="status">
        <T>
          {"The model could not load. Download its scene to open it in Plump."}
        </T>
      </p>
    )
  if (!scene)
    return (
      <p role="status">
        <T>{"Loading model…"}</T>
      </p>
    )
  return <Scene3D scene={scene} controls className="size-full" />
}
