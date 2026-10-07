"use client"

import * as React from "react"
import { cn } from "cn"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type DayPickerProps,
} from "react-day-picker"

import { buttonVariants } from "./button"

// A month grid for picking one day: 40px day buttons, the same box as an
// icon Button. Ranges and dropdown captions are left out until an app needs
// them.
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: Extract<DayPickerProps, { mode: "single" }>) {
  const defaults = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-fit text-body", className)}
      classNames={{
        months: cn("relative flex flex-col gap-4", defaults.months),
        month: cn("flex flex-col gap-2", defaults.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex items-center justify-between",
          defaults.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "aria-disabled:opacity-50",
          defaults.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "aria-disabled:opacity-50",
          defaults.button_next
        ),
        month_caption: cn(
          "flex h-10 items-center justify-center px-10",
          defaults.month_caption
        ),
        caption_label: cn("font-medium select-none", defaults.caption_label),
        month_grid: cn("border-collapse", defaults.month_grid),
        weekdays: cn("flex", defaults.weekdays),
        weekday: cn(
          "w-10 font-normal text-muted-foreground select-none",
          defaults.weekday
        ),
        week: cn("flex", defaults.week),
        day: cn("size-10 p-0 text-center select-none", defaults.day),
        today: cn("font-semibold", defaults.today),
        outside: cn("text-muted-foreground", defaults.outside),
        disabled: cn("opacity-50", defaults.disabled),
        hidden: cn("invisible", defaults.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => (
          <div
            data-slot="calendar"
            ref={rootRef}
            className={className}
            {...props}
          />
        ),
        Chevron: ({ className, orientation, ...props }) =>
          orientation === "left" ? (
            <ChevronLeftIcon className={cn("size-4", className)} {...props} />
          ) : (
            <ChevronRightIcon className={cn("size-4", className)} {...props} />
          ),
        DayButton: CalendarDayButton,
      }}
      {...props}
      mode="single"
    />
  )
}

// The day in local time: toISOString would shift it by the time zone, and
// the server and the browser can sit in different ones.
function localDay(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <button
      ref={ref}
      type="button"
      data-day={localDay(day.date)}
      data-selected={modifiers.selected || undefined}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "font-normal data-selected:bg-primary data-selected:text-primary-foreground data-selected:hover:bg-primary/90",
        className
      )}
      {...props}
    />
  )
}

export { Calendar }
