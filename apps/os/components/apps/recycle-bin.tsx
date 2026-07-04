import { PixelIcon } from "@/components/pixel-icon"

export function RecycleBinApp() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-win98-text">
      <PixelIcon name="recycle-bin" size={32} />
      <p>資源回收筒是空的。</p>
    </div>
  )
}
