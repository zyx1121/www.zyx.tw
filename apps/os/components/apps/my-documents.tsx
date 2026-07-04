import { PixelIcon } from "@/components/pixel-icon"

export function MyDocumentsApp() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-win98-text">
      <PixelIcon name="folder" size={32} />
      <p>這個資料夾是空的。</p>
    </div>
  )
}
