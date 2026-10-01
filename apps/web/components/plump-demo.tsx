"use client"

import Image from "next/image"
import dynamic from "next/dynamic"
import { Component, useDeferredValue, useState, type ReactNode } from "react"

import { Button } from "@workspace/ui/components/ui/button"
import { Slider } from "@workspace/ui/components/ui/slider"

import { PLUMP } from "@/lib/plump"

function Poster() {
  return (
    <Image
      src={PLUMP.image}
      alt={PLUMP.imageAlt}
      width={1440}
      height={900}
      sizes="(min-width: 1536px) 984px, (min-width: 1024px) 728px, (min-width: 576px) 536px, calc(100vw - 40px)"
      preload
      className="absolute inset-0 size-full object-cover"
    />
  )
}

const Scene = dynamic(
  () => import("@/components/plump-scene").then((mod) => mod.PlumpScene),
  { ssr: false, loading: () => <Poster /> }
)

class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? (
      <>
        <Poster />
        <p
          role="status"
          className="absolute inset-x-5 bottom-5 rounded-lg bg-background p-3 text-foreground"
        >
          Live preview is unavailable. You can still explore the product below.
        </p>
      </>
    ) : (
      this.props.children
    )
  }
}

const MATERIALS = [
  { id: "metal", label: "Metal" },
  { id: "plastic", label: "Plastic" },
  { id: "glass", label: "Glass" },
] as const

export function PlumpDemo() {
  const [active, setActive] = useState(false)
  const [material, setMaterial] =
    useState<(typeof MATERIALS)[number]["id"]>("metal")
  const [depth, setDepth] = useState(0.4)
  const deferredDepth = useDeferredValue(depth)

  return (
    <div>
      <div
        className="relative aspect-[8/5] overflow-hidden rounded-lg bg-[#eadbd0]"
        role="img"
        aria-label={
          active
            ? `Live ${material} shape with depth ${depth.toFixed(2)}`
            : PLUMP.imageAlt
        }
      >
        {active ? (
          <SceneBoundary>
            <Scene depth={deferredDepth} material={material} />
          </SceneBoundary>
        ) : (
          <Poster />
        )}
      </div>
      <div className="mt-5 flex min-h-8 flex-wrap items-center justify-between gap-5">
        {active ? (
          <>
            <div
              role="group"
              aria-label="Preview material"
              className="flex gap-1"
            >
              {MATERIALS.map(({ id, label }) => (
                <Button
                  key={id}
                  variant={material === id ? "secondary" : "ghost"}
                  aria-pressed={material === id}
                  onClick={() => setMaterial(id)}
                >
                  {label}
                </Button>
              ))}
            </div>
            <div className="flex w-48 items-center gap-4">
              <span id="plump-depth" className="text-muted-foreground">
                Depth
              </span>
              <Slider
                aria-labelledby="plump-depth"
                value={[depth]}
                min={0.02}
                max={0.65}
                step={0.01}
                onValueChange={(value) =>
                  setDepth(Array.isArray(value) ? value[0] : value)
                }
              />
            </div>
          </>
        ) : (
          <>
            <p className="text-muted-foreground">
              One SVG, a little more volume.
            </p>
            <Button variant="secondary" onClick={() => setActive(true)}>
              Try it live
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
