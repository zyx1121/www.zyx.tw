"use client"

import * as React from "react"

import { PixelIcon, type IconName } from "@/components/pixel-icon"
import { cn } from "@/lib/utils"
import { TASKBAR_HEIGHT, TITLE_BAR_HEIGHT } from "@/lib/constants"
import type { WindowControl } from "@/lib/types"

interface WindowProps {
  title: string
  icon: IconName
  active: boolean
  maximized: boolean
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  controls?: WindowControl[]
  onFocus: () => void
  onClose: () => void
  onMinimize?: () => void
  onToggleMaximize?: () => void
  onMove: (x: number, y: number) => void
  statusBar?: React.ReactNode
  bodyClassName?: string
  children: React.ReactNode
}

/** Win98 window chrome: gradient title bar (self-drawn pointer drag, clamped
 * to viewport), minimize/maximize/close, click-to-focus z-order. */
export function Window({
  title,
  icon,
  active,
  maximized,
  x,
  y,
  width,
  height,
  zIndex,
  controls = ["minimize", "maximize", "close"],
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onMove,
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
