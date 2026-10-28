"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"

import type { Project } from "@/lib/projects"
import { useReducedMotion } from "@/lib/use-reduced-motion"

/** How long each project stays in the window while the rotation runs. */
const ADVANCE_MS = 3200

/** How long rotation stays paused after the pointer or focus leaves a row. */
const RESUME_MS = 1500

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange)
  return () => document.removeEventListener("visibilitychange", onChange)
}

/** False while the tab is hidden, and while server rendering. */
function usePageVisible() {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === "visible",
    () => false
  )
}

type Showcase = {
  projects: Project[]
  /** The project in the window, marked in the list. */
  active: number
  /** A row is hovered or focused, or the window was tapped: show color. */
  decoded: boolean
  /** Bumped on every hover, focus or tap, so the window replays its decode. */
  engagement: number
  engage: (index: number) => void
  release: (index: number) => void
  /** Touch screens have no hover: a tap on the window decodes and pauses. */
  toggleHold: () => void
}

const ShowcaseContext = createContext<Showcase | null>(null)

export function useShowcase() {
  const value = useContext(ShowcaseContext)
  if (!value) throw new Error("useShowcase must be used inside <Showcase>")
  return value
}

/**
 * Shared state for the works page's project window and list. The window
 * advances to the next project every ADVANCE_MS; hovering or focusing a row
 * (or tapping the window on touch screens) takes over, pauses the rotation and
 * decodes the window to color. Leaving hands control back after RESUME_MS.
 * Hidden tabs pause, and reduced motion never advances on its own.
 */
export function Showcase({
  projects,
  children,
}: {
  projects: Project[]
  children: React.ReactNode
}) {
  const [active, setActive] = useState(0)
  const [engaged, setEngaged] = useState<number | null>(null)
  const [held, setHeld] = useState(false)
  const [resuming, setResuming] = useState(false)
  const [engagement, setEngagement] = useState(0)
  const engagedRef = useRef<number | null>(null)
  const heldRef = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  // One timeout per project in the window, so every project, including one a
  // visitor just left, gets the full ADVANCE_MS.
  const paused = engaged !== null || held || resuming
  const reducedMotion = useReducedMotion()
  const visible = usePageVisible()
  const count = projects.length
  useEffect(() => {
    if (paused || reducedMotion || !visible || count < 2) return
    const id = setTimeout(
      () => setActive((index) => (index + 1) % count),
      ADVANCE_MS
    )
    return () => clearTimeout(id)
  }, [active, paused, reducedMotion, visible, count])

  const hold = useCallback(() => {
    clearTimeout(timer.current)
    setResuming(false)
    setEngagement((value) => value + 1)
  }, [])

  const letGo = useCallback(() => {
    clearTimeout(timer.current)
    setResuming(true)
    timer.current = setTimeout(() => setResuming(false), RESUME_MS)
  }, [])

  const engage = useCallback(
    (index: number) => {
      engagedRef.current = index
      heldRef.current = false
      setActive(index)
      setEngaged(index)
      setHeld(false)
      hold()
    },
    [hold]
  )

  const release = useCallback(
    (index: number) => {
      if (engagedRef.current !== index) return
      engagedRef.current = null
      setEngaged(null)
      letGo()
    },
    [letGo]
  )

  const toggleHold = useCallback(() => {
    if (heldRef.current) {
      heldRef.current = false
      setHeld(false)
      letGo()
      return
    }
    heldRef.current = true
    setHeld(true)
    hold()
  }, [hold, letGo])

  const value = useMemo<Showcase>(
    () => ({
      projects,
      active,
      decoded: engaged !== null || held,
      engagement,
      engage,
      release,
      toggleHold,
    }),
    [projects, active, engaged, held, engagement, engage, release, toggleHold]
  )

  return <ShowcaseContext value={value}>{children}</ShowcaseContext>
}
