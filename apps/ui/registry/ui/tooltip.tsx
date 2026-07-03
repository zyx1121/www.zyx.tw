"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";

import { cn } from "@/lib/utils";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  delay?: number;
  closeDelay?: number;
  className?: string;
}

export function Tooltip({
  content,
  children,
  side = "top",
  sideOffset = 6,
  delay = 100,
  closeDelay = 0,
  className,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delay={delay} closeDelay={closeDelay}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger render={children} />
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Positioner side={side} sideOffset={sideOffset}>
            <TooltipPrimitive.Popup
              className={cn(
                "rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-sm",
                "origin-[var(--transform-origin)]",
                "motion-safe:transition-[opacity,transform] motion-safe:duration-150 motion-safe:ease-out",
                "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
                "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
                "data-[instant]:transition-none",
                className
              )}
            >
              {content}
            </TooltipPrimitive.Popup>
          </TooltipPrimitive.Positioner>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
