// Hand-drawn pixel art, no Microsoft icon assets. Each icon is a 16x16 grid
// of palette characters ('.' = transparent), rendered as an SVG <rect> grid.

const PALETTE = {
  k: "#0a0a0a", // outline
  w: "#ffffff", // highlight
  s: "#c0c0c0", // silver body
  g: "#808080", // shadow
  n: "#000080", // navy
  y: "#ffff00", // folder yellow
  b: "#0000ff", // blue
  r: "#ff0000", // red accent
} as const

type PaletteKey = keyof typeof PALETTE

/** Builds one 16-wide pixel row from `[char, count]` segments — counts are
 * arithmetic, not hand-counted characters, so rows can't silently drift off
 * the 16-column grid. */
function row(...segments: Array<[string, number]>): string {
  return segments.map(([char, count]) => char.repeat(count)).join("")
}

const GRID_SIZE = 16

const ICONS = {
  folder: [
    row([".", 16]),
    row([".", 2], ["k", 5], [".", 9]),
    row([".", 1], ["k", 1], ["y", 5], ["k", 1], [".", 8]),
    row(["k", 15], [".", 1]),
    row(["k", 1], ["y", 13], ["k", 1], [".", 1]),
    row(["k", 1], ["y", 13], ["k", 1], [".", 1]),
    row(["k", 1], ["y", 13], ["k", 1], [".", 1]),
    row(["k", 1], ["y", 13], ["k", 1], [".", 1]),
    row(["k", 1], ["y", 13], ["k", 1], [".", 1]),
    row(["k", 1], ["y", 13], ["k", 1], [".", 1]),
    row(["k", 1], ["y", 13], ["k", 1], [".", 1]),
    row(["k", 1], ["y", 13], ["k", 1], [".", 1]),
    row(["k", 1], ["y", 13], ["k", 1], [".", 1]),
    row(["k", 15], [".", 1]),
    row([".", 16]),
    row([".", 16]),
  ],
  computer: [
    row([".", 16]),
    row([".", 16]),
    row([".", 1], ["k", 13], [".", 2]),
    row([".", 1], ["k", 1], ["s", 11], ["k", 1], [".", 2]),
    row([".", 1], ["k", 1], ["s", 1], ["n", 9], ["s", 1], ["k", 1], [".", 2]),
    row(
      [".", 1],
      ["k", 1],
      ["s", 1],
      ["n", 1],
      ["w", 7],
      ["n", 1],
      ["s", 1],
      ["k", 1],
      [".", 2]
    ),
    row([".", 1], ["k", 1], ["s", 1], ["n", 9], ["s", 1], ["k", 1], [".", 2]),
    row([".", 1], ["k", 1], ["s", 1], ["n", 9], ["s", 1], ["k", 1], [".", 2]),
    row([".", 1], ["k", 1], ["s", 1], ["n", 9], ["s", 1], ["k", 1], [".", 2]),
    row([".", 1], ["k", 1], ["s", 11], ["k", 1], [".", 2]),
    row([".", 1], ["k", 13], [".", 2]),
    row([".", 6], ["k", 1], ["s", 2], ["k", 1], [".", 6]),
    row([".", 3], ["k", 1], ["s", 8], ["k", 1], [".", 3]),
    row([".", 3], ["k", 10], [".", 3]),
    row([".", 16]),
    row([".", 16]),
  ],
  notepad: [
    row([".", 16]),
    row([".", 3], ["k", 9], [".", 4]),
    row([".", 3], ["k", 1], ["w", 7], ["k", 1], [".", 4]),
    row([".", 3], ["k", 1], ["w", 7], ["k", 1], [".", 4]),
    row([".", 3], ["k", 1], ["w", 1], ["g", 5], ["w", 1], ["k", 1], [".", 4]),
    row([".", 3], ["k", 1], ["w", 7], ["k", 1], [".", 4]),
    row([".", 3], ["k", 1], ["w", 1], ["g", 5], ["w", 1], ["k", 1], [".", 4]),
    row([".", 3], ["k", 1], ["w", 7], ["k", 1], [".", 4]),
    row([".", 3], ["k", 1], ["w", 1], ["g", 5], ["w", 1], ["k", 1], [".", 4]),
    row([".", 3], ["k", 1], ["w", 7], ["k", 1], [".", 4]),
    row([".", 3], ["k", 1], ["w", 1], ["g", 4], ["w", 2], ["k", 1], [".", 4]),
    row([".", 3], ["k", 1], ["w", 7], ["k", 1], [".", 4]),
    row([".", 3], ["k", 1], ["w", 7], ["k", 1], [".", 4]),
    row([".", 3], ["k", 9], [".", 4]),
    row([".", 16]),
    row([".", 16]),
  ],
  "control-panel": [
    row([".", 16]),
    row([".", 2], ["k", 12], [".", 2]),
    row([".", 2], ["k", 1], ["s", 10], ["k", 1], [".", 2]),
    row([".", 2], ["k", 1], ["s", 10], ["k", 1], [".", 2]),
    row(
      [".", 2],
      ["k", 1],
      ["s", 2],
      ["n", 2],
      ["s", 2],
      ["n", 2],
      ["s", 2],
      ["k", 1],
      [".", 2]
    ),
    row(
      [".", 2],
      ["k", 1],
      ["s", 2],
      ["n", 2],
      ["s", 2],
      ["n", 2],
      ["s", 2],
      ["k", 1],
      [".", 2]
    ),
    row([".", 2], ["k", 1], ["s", 10], ["k", 1], [".", 2]),
    row([".", 2], ["k", 1], ["s", 3], ["r", 4], ["s", 3], ["k", 1], [".", 2]),
    row([".", 2], ["k", 1], ["s", 10], ["k", 1], [".", 2]),
    row([".", 2], ["k", 1], ["s", 2], ["g", 6], ["s", 2], ["k", 1], [".", 2]),
    row([".", 2], ["k", 1], ["s", 10], ["k", 1], [".", 2]),
    row([".", 2], ["k", 1], ["s", 10], ["k", 1], [".", 2]),
    row([".", 2], ["k", 12], [".", 2]),
    row([".", 16]),
    row([".", 16]),
    row([".", 16]),
  ],
  help: [
    row([".", 16]),
    row([".", 3], ["k", 10], [".", 3]),
    row([".", 3], ["k", 1], ["b", 8], ["k", 1], [".", 3]),
    row([".", 3], ["k", 1], ["b", 1], ["w", 4], ["b", 3], ["k", 1], [".", 3]),
    row([".", 3], ["k", 1], ["b", 5], ["w", 2], ["b", 1], ["k", 1], [".", 3]),
    row([".", 3], ["k", 1], ["b", 4], ["w", 2], ["b", 2], ["k", 1], [".", 3]),
    row([".", 3], ["k", 1], ["b", 3], ["w", 2], ["b", 3], ["k", 1], [".", 3]),
    row([".", 3], ["k", 1], ["b", 8], ["k", 1], [".", 3]),
    row([".", 3], ["k", 1], ["b", 3], ["w", 2], ["b", 3], ["k", 1], [".", 3]),
    row([".", 3], ["k", 1], ["b", 8], ["k", 1], [".", 3]),
    row([".", 3], ["k", 1], ["b", 8], ["k", 1], [".", 3]),
    row([".", 3], ["k", 1], ["b", 8], ["k", 1], [".", 3]),
    row([".", 3], ["k", 10], [".", 3]),
    row([".", 16]),
    row([".", 16]),
    row([".", 16]),
  ],
  "recycle-bin": [
    row([".", 16]),
    row([".", 4], ["k", 2], [".", 10]),
    row([".", 2], ["k", 10], [".", 4]),
    row([".", 2], ["k", 1], ["s", 8], ["k", 1], [".", 4]),
    row([".", 3], ["k", 9], [".", 4]),
    row(
      [".", 3],
      ["k", 1],
      ["s", 2],
      ["g", 1],
      ["s", 1],
      ["g", 1],
      ["s", 2],
      ["k", 1],
      [".", 4]
    ),
    row(
      [".", 3],
      ["k", 1],
      ["s", 2],
      ["g", 1],
      ["s", 1],
      ["g", 1],
      ["s", 2],
      ["k", 1],
      [".", 4]
    ),
    row([".", 3], ["k", 1], ["s", 7], ["k", 1], [".", 4]),
    row(
      [".", 3],
      ["k", 1],
      ["s", 2],
      ["g", 1],
      ["s", 1],
      ["g", 1],
      ["s", 2],
      ["k", 1],
      [".", 4]
    ),
    row(
      [".", 3],
      ["k", 1],
      ["s", 2],
      ["g", 1],
      ["s", 1],
      ["g", 1],
      ["s", 2],
      ["k", 1],
      [".", 4]
    ),
    row([".", 3], ["k", 1], ["s", 7], ["k", 1], [".", 4]),
    row(
      [".", 3],
      ["k", 1],
      ["s", 2],
      ["g", 1],
      ["s", 1],
      ["g", 1],
      ["s", 2],
      ["k", 1],
      [".", 4]
    ),
    row([".", 3], ["k", 9], [".", 4]),
    row([".", 16]),
    row([".", 16]),
    row([".", 16]),
  ],
} satisfies Record<string, string[]>

export type IconName = keyof typeof ICONS

// Cheap (256 cells x 6 icons) and runs once at module load — a safety net
// against grids silently drifting off the 16x16 canvas.
for (const [name, grid] of Object.entries(ICONS)) {
  if (grid.length !== GRID_SIZE) {
    throw new Error(
      `pixel-icon "${name}": expected ${GRID_SIZE} rows, got ${grid.length}`
    )
  }
  for (const [rowIndex, line] of grid.entries()) {
    if (line.length !== GRID_SIZE) {
      throw new Error(
        `pixel-icon "${name}" row ${rowIndex}: expected ${GRID_SIZE} cols, got ${line.length}`
      )
    }
    for (const char of line) {
      if (char !== "." && !(char in PALETTE)) {
        throw new Error(
          `pixel-icon "${name}" row ${rowIndex}: unknown char "${char}"`
        )
      }
    }
  }
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
  const grid = ICONS[name]

  return (
    <svg
      viewBox={`0 0 ${GRID_SIZE} ${GRID_SIZE}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      role="img"
      aria-hidden
      className={className}
    >
      {grid.map((line, y) =>
        [...line].map((char, x) => {
          if (char === ".") return null
          return (
            <rect
              key={`${y}-${x}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={PALETTE[char as PaletteKey]}
            />
          )
        })
      )}
    </svg>
  )
}
