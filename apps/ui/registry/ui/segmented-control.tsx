"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface SegmentedControlOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  options: SegmentedControlOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export function SegmentedControl({
  options,
  value,
  defaultValue,
  onValueChange,
  className,
  ...props
}: SegmentedControlProps) {
  const enabled = options.filter((option) => !option.disabled);
  const firstEnabled = enabled[0]?.value;
  const [internalValue, setInternalValue] = React.useState(
    defaultValue ?? firstEnabled ?? ""
  );
  const selectedValue = value ?? internalValue;
  // roving tabindex — exactly one segment is tabbable, arrow keys do the rest
  const tabbableValue = enabled.some((option) => option.value === selectedValue)
    ? selectedValue
    : firstEnabled;

  const select = (nextValue: string) => {
    setInternalValue(nextValue);
    onValueChange?.(nextValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const offset =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (offset === 0 || enabled.length === 0) return;
    event.preventDefault();

    const currentIndex = enabled.findIndex(
      (option) => option.value === tabbableValue
    );
    const nextIndex = (currentIndex + offset + enabled.length) % enabled.length;
    const next = enabled[nextIndex];
    if (!next) return;

    select(next.value);
    event.currentTarget
      .querySelector<HTMLButtonElement>(
        `[data-value="${CSS.escape(next.value)}"]`
      )
      ?.focus();
  };

  return (
    <div
      role="radiogroup"
      data-slot="segmented-control"
      className={cn(
        "inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-block p-1 corner-token",
        className
      )}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {options.map((option) => {
        const selected = option.value === selectedValue;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={option.value === tabbableValue ? 0 : -1}
            data-value={option.value}
            disabled={option.disabled}
            className={cn(
              "h-8 rounded-full px-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
              selected
                ? "bg-background text-foreground"
                : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
            )}
            onClick={() => select(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
