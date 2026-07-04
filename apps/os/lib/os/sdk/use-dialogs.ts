"use client"

import { useDialogManager } from "@/lib/os/kernel/dialog-manager"
import type { DialogManagerContextValue } from "@/lib/os/kernel/dialog-manager"

export type {
  MsgBoxButtons,
  MsgBoxIcon,
  MsgBoxOptions,
  MsgBoxResult,
  OpenFileOptions,
  SaveFileOptions,
} from "@/lib/os/kernel/dialog-manager"

export type UseDialogsResult = DialogManagerContextValue

/** System dialogs: msgBox / openFile / saveFile. All render as a Win98
 * modal that sits above every window — never a browser alert(). */
export function useDialogs(): UseDialogsResult {
  return useDialogManager()
}
