"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { CONTEXT_MENU_Z } from "@/lib/constants"
import { cn } from "@/lib/utils"

export interface ContextMenuItem {
  label: string
  onSelect: () => void
  disabled?: boolean
}

export type ContextMenuEntry = ContextMenuItem | { separator: true }

export interface ContextMenuState {
  x: number
  y: number
  entries: ContextMenuEntry[]
}

function isSeparator(entry: ContextMenuEntry): entry is { separator: true } {
  return "separator" in entry
}

/** Rough box used to keep a menu from opening past the viewport edge —
 * callers clamp with this *before* building ContextMenuState (the menu
 * itself doesn't know its own size ahead of the first paint). */
export function clampContextMenuPosition(
  x: number,
  y: number,
  approxWidth = 180,
  approxHeight = 160
): { x: number; y: number } {
  if (typeof window === "undefined") return { x, y }
  return {
    x: Math.max(4, Math.min(x, window.innerWidth - approxWidth - 4)),
    y: Math.max(4, Math.min(y, window.innerHeight - approxHeight - 4)),
  }
}

/** Self-drawn Win98 right-click menu: silver raised-bevel panel, navy
 * hover/keyboard-focus highlight, one at a time. Not a radix primitive —
 * mounted ad hoc by whoever owns the right-click (desktop, folder rows,
 * taskbar window buttons) and driven purely by `state`/`onClose`. */
export function ContextMenu({
  state,
  onClose,
}: {
  state: ContextMenuState | null
  onClose: () => void
}) {
  const menuRef = React.useRef<HTMLDivElement>(null)
  const [focusedIndex, setFocusedIndex] = React.useState(-1)

  const selectableIndexes = React.useMemo(() => {
    if (!state) return []
    return state.entries
      .map((entry, index) =>
        !isSeparator(entry) && !entry.disabled ? index : -1
      )
      .filter((index) => index >= 0)
  }, [state])

  // Reset keyboard focus to the first selectable item whenever a *new*
  // menu opens (state identity changes) — adjusted during render per the
  // React docs rather than in an effect, since it's deriving from a prop.
  const [syncedState, setSyncedState] = React.useState(state)
  if (state !== syncedState) {
    setSyncedState(state)
    setFocusedIndex(selectableIndexes[0] ?? -1)
  }

  React.useEffect(() => {
    if (!state) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) onClose()
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault()
        if (selectableIndexes.length === 0) return
        const currentPos = selectableIndexes.indexOf(focusedIndex)
        const delta = event.key === "ArrowDown" ? 1 : -1
        const nextPos =
          (currentPos + delta + selectableIndexes.length) %
          selectableIndexes.length
        setFocusedIndex(selectableIndexes[nextPos] ?? -1)
        return
      }
      if (event.key === "Enter") {
        event.preventDefault()
        const entry = state.entries[focusedIndex]
        if (entry && !isSeparator(entry) && !entry.disabled) {
          entry.onSelect()
          onClose()
        }
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [state, focusedIndex, selectableIndexes, onClose])

  if (!state) return null

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      className="bevel-raised fixed min-w-36 bg-surface p-0.5"
      style={{ left: state.x, top: state.y, zIndex: CONTEXT_MENU_Z }}
    >
      {state.entries.map((entry, index) =>
        isSeparator(entry) ? (
          <div
            key={`separator-${index}`}
            role="separator"
            className="my-1 border-t border-b border-button-shadow border-b-button-highlight"
          />
        ) : (
          <button
            key={entry.label}
            type="button"
            role="menuitem"
            disabled={entry.disabled}
            className={cn(
              "block w-full px-4 py-1 text-left text-win98-text select-none",
              entry.disabled &&
                "pointer-events-none text-button-shadow [text-shadow:1px_1px_0_var(--color-button-highlight)]",
              !entry.disabled &&
                focusedIndex === index &&
                "bg-selection text-selection-foreground"
            )}
            onMouseEnter={() => setFocusedIndex(index)}
            onClick={() => {
              entry.onSelect()
              onClose()
            }}
          >
            {entry.label}
          </button>
        )
      )}
    </div>,
    document.body
  )
}
