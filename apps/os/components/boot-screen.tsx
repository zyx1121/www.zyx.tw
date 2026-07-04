/** Win98-style boot screen (M4) — shown from mount until the VFS finishes
 * hydrating and the MIN_BOOT_DURATION_MS floor clears (see
 * components/desktop.tsx). Replaces the plain teal placeholder M1-M3 used
 * for the same gap. No props: it's pure chrome, driven entirely by
 * Desktop's `ready` state. */
export function BootScreen() {
  return (
    <div className="flex h-dvh w-dvw flex-col items-center bg-black">
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <span className="text-4xl font-bold tracking-[0.35em] text-white">
          OS 98
        </span>
        <span className="text-[11px] tracking-widest text-gray-400">
          正在啟動...
        </span>
      </div>
      <div className="mb-20 h-4 w-64 overflow-hidden bg-[#1a1a1a]">
        <div className="animate-boot-bar h-full w-1/3 bg-gradient-to-r from-[#000080] via-[#1084d0] to-[#000080]" />
      </div>
    </div>
  )
}
