"use client"

import dynamic from "next/dynamic"
import { Component, type ReactNode } from "react"

// three.js needs the DOM, so the scene renders in the browser only. Until it
// does, the page shows the scene's own background color.
const HomeScene = dynamic(
  () => import("@/components/home-scene").then((mod) => mod.HomeScene),
  { ssr: false }
)

/**
 * A browser without WebGL (hardware acceleration off, a blocklisted GPU,
 * a hardened mode) makes three throw when the canvas starts, and so does a
 * scene chunk that fails to load. Either way the stage stays empty instead
 * of taking the page, and its corners, down with it.
 */
class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

export function HomeStage() {
  return (
    <SceneBoundary>
      <HomeScene />
    </SceneBoundary>
  )
}
