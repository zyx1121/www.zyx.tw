// Original Windows 98 icons (© Microsoft), sourced from win98icons.alexmeub.com
// for personal, non-commercial nostalgia use — see apps/os/README.md.

export type IconName =
  | "computer"
  | "folder"
  | "notepad"
  | "control-panel"
  | "help"
  | "recycle-bin"
  | "start"
  | "shutdown"

/** Sprite sheet only ships 16px and 32px source PNGs — any requested size
 * snaps to whichever is closer and gets scaled (pixelated) by the browser. */
function spriteSize(size: number): 16 | 32 {
  return size <= 24 ? 16 : 32
}

export function PixelIcon({
  name,
  size = 32,
  className,
}: {
  name: IconName
  size?: number
  className?: string
}) {
  return (
    // Fixed-size pixel art, not a responsive content image — next/image's
    // optimizer would resample the source PNG and destroy the crisp edges.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/icons/${name}-${spriteSize(size)}.png`}
      width={size}
      height={size}
      alt=""
      draggable={false}
      style={{ imageRendering: "pixelated" }}
      className={className}
    />
  )
}
