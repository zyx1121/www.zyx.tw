"use client"

import * as React from "react"

/** Classic black-screen-orange-text shutdown notice (M4) — rendered in
 * place of the whole desktop once the user confirms 開始 > 關機... .
 * There's no real power-off to perform in a browser tab, so both a click
 * and a keypress just reload the page, which re-runs the boot sequence. */
export function ShutdownScreen() {
  const reboot = React.useCallback(() => {
    window.location.reload()
  }, [])

  React.useEffect(() => {
    window.addEventListener("keydown", reboot)
    return () => window.removeEventListener("keydown", reboot)
  }, [reboot])

  return (
    <div
      className="flex h-dvh w-dvw cursor-default items-center justify-center bg-black"
      onClick={reboot}
    >
      <p className="text-2xl" style={{ color: "#ffa500" }}>
        現在可以放心關閉電腦。
      </p>
    </div>
  )
}
