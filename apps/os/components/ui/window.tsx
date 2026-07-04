"use client"

import * as React from "react"

import { PixelIcon, type IconName } from "@/components/pixel-icon"
import { cn } from "@/lib/utils"
import {
  RESIZE_HANDLE_SIZE,
  TASKBAR_HEIGHT,
  TITLE_BAR_HEIGHT,
} from "@/lib/constants"
import type { WindowControl } from "@/lib/os/types"

interface ResizeRect {
  x: number
  y: number
  width: number
  height: number
}

type ResizeDir = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw"

const RESIZE_HANDLES: {
  dir: ResizeDir
  cursorClassName: string
  style: React.CSSProperties
}[] = [
  {
    dir: "n",
    cursorClassName: "cursor-ns-resize",
    style: {
      top: 0,
      left: RESIZE_HANDLE_SIZE,
      right: RESIZE_HANDLE_SIZE,
      height: RESIZE_HANDLE_SIZE,
    },
  },
  {
    dir: "s",
    cursorClassName: "cursor-ns-resize",
    style: {
      bottom: 0,
      left: RESIZE_HANDLE_SIZE,
      right: RESIZE_HANDLE_SIZE,
      height: RESIZE_HANDLE_SIZE,
    },
  },
  {
    dir: "w",
    cursorClassName: "cursor-ew-resize",
    style: {
      left: 0,
      top: RESIZE_HANDLE_SIZE,
      bottom: RESIZE_HANDLE_SIZE,
      width: RESIZE_HANDLE_SIZE,
    },
  },
  {
    dir: "e",
    cursorClassName: "cursor-ew-resize",
    style: {
      right: 0,
      top: RESIZE_HANDLE_SIZE,
      bottom: RESIZE_HANDLE_SIZE,
      width: RESIZE_HANDLE_SIZE,
    },
  },
  {
    dir: "nw",
    cursorClassName: "cursor-nwse-resize",
    style: {
      top: 0,
      left: 0,
      width: RESIZE_HANDLE_SIZE,
      height: RESIZE_HANDLE_SIZE,
    },
  },
  {
    dir: "se",
    cursorClassName: "cursor-nwse-resize",
    style: {
      bottom: 0,
      right: 0,
      width: RESIZE_HANDLE_SIZE,
      height: RESIZE_HANDLE_SIZE,
    },
  },
  {
    dir: "ne",
    cursorClassName: "cursor-nesw-resize",
    style: {
      top: 0,
      right: 0,
      width: RESIZE_HANDLE_SIZE,
      height: RESIZE_HANDLE_SIZE,
    },
  },
  {
    dir: "sw",
    cursorClassName: "cursor-nesw-resize",
    style: {
      bottom: 0,
      left: 0,
      width: RESIZE_HANDLE_SIZE,
      height: RESIZE_HANDLE_SIZE,
    },
  },
]

interface WindowProps {
  title: string
  icon: IconName
  active: boolean
  maximized: boolean
  x: number
  y: number
  width: number
  height: number
  minWidth: number
  minHeight: number
  resizable: boolean
  zIndex: number
  controls?: WindowControl[]
  onFocus: () => void
  onClose: () => void
  onMinimize?: () => void
  onToggleMaximize?: () => void
  onMove: (x: number, y: number) => void
  onResize: (rect: ResizeRect) => void
  statusBar?: React.ReactNode
  bodyClassName?: string
  children: React.ReactNode
}

/** Win98 window chrome: gradient title bar (self-drawn pointer drag, clamped
 * to viewport), minimize/maximize/close, click-to-focus z-order, and
 * self-drawn edge/corner resize handles (clamped to minWidth/minHeight and
 * viewport). */
export function Window({
  title,
  icon,
  active,
  maximized,
  x,
  y,
  width,
  height,
  minWidth,
  minHeight,
  resizable,
  zIndex,
  controls = ["minimize", "maximize", "close"],
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onMove,
  onResize,
  statusBar,
  bodyClassName,
  children,
}: WindowProps) {
  const dragRef = React.useRef<{
    pointerId: number
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)

  const resizeRef = React.useRef<{
    pointerId: number
    dir: ResizeDir
    startX: number
    startY: number
    origin: ResizeRect
  } | null>(null)

  const handleTitleBarPointerDown = (event: React.PointerEvent) => {
    // Focusing happens via onPointerDownCapture on the window container
    // (covers title-bar, controls, and body clicks alike); this handler
    // only needs to arm the drag.
    if (maximized) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: x,
      originY: y,
    }
  }

  const handleTitleBarPointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const dx = event.clientX - drag.startX
    const dy = event.clientY - drag.startY
    const maxX = Math.max(window.innerWidth - width, 0)
    const maxY = Math.max(
      window.innerHeight - TASKBAR_HEIGHT - TITLE_BAR_HEIGHT,
      0
    )
    const nextX = Math.min(Math.max(drag.originX + dx, 0), maxX)
    const nextY = Math.min(Math.max(drag.originY + dy, 0), maxY)
    onMove(nextX, nextY)
  }

  const handleTitleBarPointerUp = () => {
    dragRef.current = null
  }

  const beginResize = (dir: ResizeDir) => (event: React.PointerEvent) => {
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    resizeRef.current = {
      pointerId: event.pointerId,
      dir,
      startX: event.clientX,
      startY: event.clientY,
      origin: { x, y, width, height },
    }
  }

  const handleResizePointerMove = (event: React.PointerEvent) => {
    const resize = resizeRef.current
    if (!resize || resize.pointerId !== event.pointerId) return
    const dx = event.clientX - resize.startX
    const dy = event.clientY - resize.startY
    const { x: ox, y: oy, width: ow, height: oh } = resize.origin

    let nextX = ox
    let nextY = oy
    let nextWidth = ow
    let nextHeight = oh

    if (resize.dir.includes("e")) {
      nextWidth = Math.max(ow + dx, minWidth)
    }
    if (resize.dir.includes("w")) {
      nextWidth = Math.max(ow - dx, minWidth)
      nextX = ox + (ow - nextWidth)
    }
    if (resize.dir.includes("s")) {
      nextHeight = Math.max(oh + dy, minHeight)
    }
    if (resize.dir.includes("n")) {
      nextHeight = Math.max(oh - dy, minHeight)
      nextY = oy + (oh - nextHeight)
    }

    const maxX = Math.max(window.innerWidth - nextWidth, 0)
    const maxY = Math.max(window.innerHeight - TASKBAR_HEIGHT - nextHeight, 0)
    nextX = Math.min(Math.max(nextX, 0), maxX)
    nextY = Math.min(Math.max(nextY, 0), maxY)

    onResize({ x: nextX, y: nextY, width: nextWidth, height: nextHeight })
  }

  const handleResizePointerUp = () => {
    resizeRef.current = null
  }

  return (
    <div
      className="bevel-window absolute flex flex-col bg-surface"
      style={
        maximized
          ? { left: 0, top: 0, right: 0, bottom: TASKBAR_HEIGHT, zIndex }
          : { left: x, top: y, width, height, zIndex }
      }
      onPointerDownCapture={onFocus}
    >
      <div
        className="flex h-5 shrink-0 touch-none items-center gap-1 py-[3px] pr-[2px] pl-[3px] select-none"
        style={{
          backgroundImage: active
            ? "var(--title-active)"
            : "var(--title-inactive)",
        }}
        onPointerDown={handleTitleBarPointerDown}
        onPointerMove={handleTitleBarPointerMove}
        onPointerUp={handleTitleBarPointerUp}
        onDoubleClick={onToggleMaximize}
      >
        <PixelIcon name={icon} size={16} />
        <span className="flex-1 truncate text-[11px] font-bold text-white">
          {title}
        </span>
        <div className="flex items-center gap-[2px]">
          {controls.includes("minimize") && (
            <TitleBarButton label="最小化" onClick={onMinimize}>
              <span className="mt-1.5 h-[2px] w-[7px] bg-black" />
            </TitleBarButton>
          )}
          {controls.includes("maximize") && (
            <TitleBarButton
              label={maximized ? "還原" : "最大化"}
              onClick={onToggleMaximize}
            >
              {maximized ? (
                <span className="relative size-[9px]">
                  <span className="absolute top-0 left-[2px] size-[7px] border border-black" />
                  <span className="absolute top-[2px] left-0 size-[7px] border border-black bg-surface" />
                </span>
              ) : (
                <span className="block size-[9px] border border-black">
                  <span className="block h-[2px] bg-black" />
                </span>
              )}
            </TitleBarButton>
          )}
          {controls.includes("close") && (
            <TitleBarButton label="關閉" onClick={onClose}>
              <svg viewBox="0 0 9 9" width={9} height={9} aria-hidden>
                <path
                  d="M0.5,0.5 L8.5,8.5 M8.5,0.5 L0.5,8.5"
                  stroke="#000"
                  strokeWidth={1.5}
                />
              </svg>
            </TitleBarButton>
          )}
        </div>
      </div>
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-auto bg-surface p-2",
          bodyClassName
        )}
      >
        {children}
      </div>
      {statusBar}
      {resizable &&
        !maximized &&
        RESIZE_HANDLES.map(({ dir, cursorClassName, style }) => (
          <div
            key={dir}
            aria-hidden
            data-resize-handle={dir}
            className={cn("absolute touch-none", cursorClassName)}
            style={style}
            onPointerDown={beginResize(dir)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
          />
        ))}
    </div>
  )
}

function TitleBarButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="bevel-raised win98-focusable active:bevel-pressed flex h-[14px] w-4 shrink-0 items-center justify-center"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
