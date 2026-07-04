import * as React from "react"
import { Menubar as MenubarPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function MenuBar({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  return (
    <MenubarPrimitive.Root
      data-slot="menu-bar"
      className={cn(
        "flex items-center gap-0.5 bg-surface px-1 py-0.5",
        className
      )}
      {...props}
    />
  )
}

const MenuBarMenu: typeof MenubarPrimitive.Menu = MenubarPrimitive.Menu

function MenuBarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menu-bar-trigger"
      className={cn(
        "px-2 py-0.5 text-win98-text outline-none select-none data-[highlighted]:bg-selection data-[highlighted]:text-selection-foreground data-[state=open]:bg-selection data-[state=open]:text-selection-foreground",
        className
      )}
      {...props}
    />
  )
}

function MenuBarContent({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        data-slot="menu-bar-content"
        align="start"
        sideOffset={0}
        className={cn("bevel-raised z-50 min-w-40 bg-surface p-0.5", className)}
        {...props}
      />
    </MenubarPrimitive.Portal>
  )
}

function MenuBarItem({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Item>) {
  return (
    <MenubarPrimitive.Item
      data-slot="menu-bar-item"
      className={cn(
        "px-4 py-1 text-win98-text outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:text-button-shadow data-[disabled]:[text-shadow:1px_1px_0_var(--color-button-highlight)] data-[highlighted]:bg-selection data-[highlighted]:text-selection-foreground",
        className
      )}
      {...props}
    />
  )
}

function MenuBarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menu-bar-separator"
      className={cn(
        "my-1 border-t border-b border-button-shadow border-b-button-highlight",
        className
      )}
      {...props}
    />
  )
}

export {
  MenuBar,
  MenuBarMenu,
  MenuBarTrigger,
  MenuBarContent,
  MenuBarItem,
  MenuBarSeparator,
}
