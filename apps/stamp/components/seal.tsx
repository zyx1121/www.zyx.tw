import { cn } from "cn"

/*
 * The product's mark: a square seal cut in relief, white 核准 ("approved")
 * on vermilion, the way an office stamp reads on paper. The ink is content,
 * not chrome, so it keeps its own color in both themes. A turbulence filter
 * breaks up the edges like ink pressed into paper.
 */
export function Seal({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label="核准 (approved)"
      className={cn("seal", className)}
    >
      <defs>
        <filter id="seal-ink" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="2.2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <mask id="seal-cut">
          <rect width="100" height="100" fill="#fff" />
          <text
            x="50"
            y="45"
            textAnchor="middle"
            className="seal-glyph"
            fontSize="40"
            fill="#000"
          >
            核
          </text>
          <text
            x="50"
            y="88"
            textAnchor="middle"
            className="seal-glyph"
            fontSize="40"
            fill="#000"
          >
            准
          </text>
        </mask>
      </defs>
      <g filter="url(#seal-ink)">
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="6"
          fill="#d93a2b"
          mask="url(#seal-cut)"
        />
      </g>
    </svg>
  )
}
