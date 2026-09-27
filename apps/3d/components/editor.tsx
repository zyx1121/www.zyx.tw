"use client"

import { useDeferredValue, useEffect, useState } from "react"

import {
  checkSvg,
  createScene,
  safeParseScene,
  Scene3D,
  type SceneV1,
} from "@workspace/3d"

import { Dock } from "@/components/dock"
import { ZYX_SVG } from "@/lib/zyx-svg"

const STORAGE_KEY = "3d:scene:v1"

/** The last scene edited in this browser, or the zyx mark on a first visit. */
function loadScene(): SceneV1 {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const result = safeParseScene(JSON.parse(stored))
      if (result.ok) return result.scene
    }
  } catch {
    // Blocked or corrupt storage falls through to the default scene.
  }
  return createScene(ZYX_SVG)
}

export function Editor() {
  const [scene, setScene] = useState(loadScene)
  const [error, setError] = useState<string | null>(null)
  // Rebuilding the mesh can take a frame or two; this keeps the sliders
  // responsive while the preview catches up.
  const preview = useDeferredValue(scene)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scene))
    } catch {
      // Private browsing or a full quota: the scene just isn't remembered.
    }
  }, [scene])

  async function openFile(file: File) {
    const text = await file.text()
    if (isJson(file)) {
      let data: unknown
      try {
        data = JSON.parse(text)
      } catch {
        setError(`${file.name} is not valid JSON`)
        return
      }
      const result = safeParseScene(data)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setScene(result.scene)
    } else {
      const problem = checkSvg(text)
      if (problem) {
        setError(problem)
        return
      }
      setScene((current) => ({
        ...current,
        shape: { ...current.shape, svg: text },
      }))
    }
    setError(null)
  }

  function exportScene() {
    const blob = new Blob([`${JSON.stringify(scene, null, 2)}\n`], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "scene.json"
    link.click()
    // Safari cancels the download when the URL is revoked in the same task.
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <main
      className="relative h-dvh w-dvw overflow-hidden"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        const file = event.dataTransfer.files[0]
        if (file) void openFile(file)
      }}
    >
      <Scene3D scene={preview} envBaseUrl="/env/" />
      <Dock
        scene={scene}
        onChange={setScene}
        onOpenFile={(file) => void openFile(file)}
        onExport={exportScene}
        error={error}
      />
    </main>
  )
}

function isJson(file: File) {
  return (
    file.type === "application/json" ||
    file.name.toLowerCase().endsWith(".json")
  )
}
