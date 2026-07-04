export const TASKBAR_HEIGHT = 32
export const TITLE_BAR_HEIGHT = 20

/** Manifest window.minWidth / minHeight fallback when omitted. */
export const DEFAULT_MIN_WIDTH = 160
export const DEFAULT_MIN_HEIGHT = 120

/** Resize hit-zone thickness along window edges/corners (Win98-style). */
export const RESIZE_HANDLE_SIZE = 3

/** Above every window/taskbar/start-menu (z 1-1000), below system dialogs
 * (z 3000) — a right-click menu must cover the window it was opened on but
 * never fight a msgBox/file dialog for the top slot. */
export const CONTEXT_MENU_Z = 2000
