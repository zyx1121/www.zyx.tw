"use client"

import * as React from "react"

import { PixelIcon, type IconName } from "@/components/pixel-icon"
import { joinPath, useFsList, type FsPath } from "@/lib/os/sdk/use-fs"
import { cn } from "@/lib/utils"

interface DirTreeNodeProps {
  path: FsPath
  label: string
  icon: IconName
  depth: number
  defaultExpanded: boolean
  activePath: FsPath
  onSelect: (path: FsPath) => void
}

function DirTreeNode({
  path,
  label,
  icon,
  depth,
  defaultExpanded,
  activePath,
  onSelect,
}: DirTreeNodeProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded)
  const children = useFsList(path).filter(
    (entry) => entry.node.type === "dir" && !entry.name.startsWith(".")
  )
  const isActive = path === activePath

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 py-0.5 pr-1",
          isActive && "bg-selection text-selection-foreground"
        )}
        style={{ paddingLeft: depth * 14 + 2 }}
      >
        {children.length > 0 ? (
          <button
            type="button"
            aria-label={expanded ? "折疊" : "展開"}
            className="bevel-raised flex h-3 w-3 shrink-0 items-center justify-center text-[9px] leading-none"
            onClick={(event) => {
              event.stopPropagation()
              setExpanded((value) => !value)
            }}
          >
            {expanded ? "-" : "+"}
          </button>
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <button
          type="button"
          className="win98-focusable flex flex-1 items-center gap-1 truncate text-left"
          onClick={() => onSelect(path)}
        >
          <PixelIcon name={icon} size={16} />
          <span className="truncate">{label}</span>
        </button>
      </div>
      {expanded &&
        children.map((entry) => (
          <DirTreeNode
            key={entry.name}
            path={joinPath(path, entry.name)}
            label={entry.name}
            icon="folder"
            depth={depth + 1}
            defaultExpanded={false}
            activePath={activePath}
            onSelect={onSelect}
          />
        ))}
    </div>
  )
}

const ROOT: FsPath = "C:"
const ROOT_LABEL = "本機磁碟 (C:)"

/** Directory-only, collapsible tree rooted at C: — explorer's left pane.
 * Every node subscribes to its own listing (not lazily loaded) since the
 * VFS is small; the root starts expanded, everything else starts closed. */
export function DirTree({
  activePath,
  onSelect,
  className,
}: {
  activePath: FsPath
  onSelect: (path: FsPath) => void
  className?: string
}) {
  return (
    <div
      data-testid="explorer-tree"
      className={cn("bevel-sunken overflow-auto bg-white py-0.5", className)}
    >
      <DirTreeNode
        path={ROOT}
        label={ROOT_LABEL}
        icon="computer"
        depth={0}
        defaultExpanded
        activePath={activePath}
        onSelect={onSelect}
      />
    </div>
  )
}
