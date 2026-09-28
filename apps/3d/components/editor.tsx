"use client"

import { useDeferredValue, useEffect, useRef, useState } from "react"

import {
  checkSvg,
  createScene,
  safeParseScene,
  Scene3D,
  type Scene3DHandle,
  type SceneV1,
} from "@workspace/3d"

import { Dock } from "@/components/dock"
import { useShapeSource } from "@/components/shape-source"
import { download } from "@/lib/download"
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
  const source = useShapeSource(scene, setScene)
  // Rebuilding the mesh can take a frame or two; this keeps the sliders
  // responsive while the preview catches up.
  const preview = useDeferredValue(scene)
  const view = useRef<Scene3DHandle>(null)
  const stage = useRef<HTMLElement>(null)

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
      source.reset(result.scene.shape.text)
    } else {
      const problem = checkSvg(text)
      if (problem) {
        setError(problem)
        return
      }
      setScene((current) => ({
        ...current,
        shape: { ...current.shape, svg: text, text: undefined },
      }))
      source.reset()
    }
    setError(null)
  }

  function exportScene() {
    const blob = new Blob([`${JSON.stringify(scene, null, 2)}\n`], {
      type: "application/json",
    })
    download(blob, "scene.json")
  }

  return (
    <main
      ref={stage}
      className="relative h-dvh w-dvw overflow-hidden"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        const file = event.dataTransfer.files[0]
        if (file) void openFile(file)
      }}
    >
      <Scene3D ref={view} scene={preview} envBaseUrl="/env/" />
      <Dock
        scene={scene}
        source={source.props}
        onChange={setScene}
        onOpenFile={(file) => void openFile(file)}
        onExportScene={exportScene}
        view={view}
        stage={stage}
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
