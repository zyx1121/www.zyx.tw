import { PixelIcon } from "@/components/pixel-icon"
import { Button } from "@/components/ui/button"
import type { AppContentProps } from "@/components/apps/registry"

export function AboutApp({ onClose }: AppContentProps) {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-1 gap-4">
        <PixelIcon name="computer" size={48} className="shrink-0" />
        <div className="flex flex-col gap-2 text-win98-text">
          <p className="font-bold">os.zyx.tw — Win98 風格桌面 POC</p>
          <p>
            這是一個活在瀏覽器裡的迷你 Win98 桌面，用來重現視窗鉻件、表單控件、
            像素圖示與工作列互動的真實比例與行為。
          </p>
          <p>
            版面、bevel 公式與字體皆取自 98.css 的真值，圖示則是原版 Windows 98
            icon（© Microsoft，取自 win98icons.alexmeub.com），僅供個人
            非商業懷舊用途。
          </p>
        </div>
      </div>
      <div className="flex justify-end">
        <Button tone="default" onClick={onClose} autoFocus>
          確定
        </Button>
      </div>
    </div>
  )
}
