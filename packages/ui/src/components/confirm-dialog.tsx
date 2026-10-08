"use client"

import * as React from "react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog"
import { Button } from "./ui/button"

/** "Delete" → "Deleting…", "Revoke access" → "Revoking access…". Pass
 * pendingLabel for a verb this gets wrong ("Run"). */
function gerund(verb: string) {
  const [first = verb, ...rest] = verb.split(" ")
  const base = /[^e]e$/i.test(first) ? first.slice(0, -1) : first
  return [`${base}ing`, ...rest].join(" ") + "…"
}

type ConfirmDialogProps = {
  /** The button that opens it. Leave it out and pass open / onOpenChange to
   * open it from elsewhere, such as a dropdown-menu item. */
  trigger?: React.ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** The question: "Delete this project?". There is no description. */
  title: string
  /** The verb on the confirm button: "Delete", "Revoke". Never "OK". */
  confirmLabel: string
  /** Shown while onConfirm runs; defaults to the verb + "ing…". */
  pendingLabel?: string
  /** destructive for what cannot be undone, default for the rest. */
  variant?: "destructive" | "default"
  /** Runs while both buttons are locked. Resolve to close; throw to stay
   * open so the person can retry (report the error yourself, in a toast). */
  onConfirm: () => void | Promise<void>
}

// Asks before an action runs, and holds the dialog open until it finishes so
// a second click can never fire it twice.
function ConfirmDialog({
  trigger,
  open: openProp,
  onOpenChange,
  title,
  confirmLabel,
  pendingLabel = gerund(confirmLabel),
  variant = "destructive",
  onConfirm,
}: ConfirmDialogProps) {
  const [openState, setOpenState] = React.useState(false)
  const [pending, startTransition] = React.useTransition()
  const open = openProp ?? openState

  function setOpen(next: boolean) {
    if (openProp === undefined) setOpenState(next)
    onOpenChange?.(next)
  }

  function confirm() {
    startTransition(async () => {
      try {
        await onConfirm()
        setOpen(false)
      } catch (error) {
        console.error(error)
      }
    })
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) setOpen(next)
      }}
    >
      {trigger && <AlertDialogTrigger render={trigger} />}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button variant={variant} disabled={pending} onClick={confirm}>
            {pending ? pendingLabel : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { ConfirmDialog }
