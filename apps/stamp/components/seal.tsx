import { cn } from "@workspace/ui/lib/utils"

/*
 * The product's mark: a square seal cut in relief, white 核准 ("approved")
 * on vermilion, the way an office stamp reads on paper. The ink is content,
 * not chrome, so it keeps its own color in both themes. Three noise layers
 * make it look pressed by hand: warped edges, fine specks where the paper
 * took no ink, and broad patches pressed lighter.
 */
export function Seal({
  id = "seal",
  className,
}: {
  /** Unique per page: the filter and mask ids derive from it. */
  id?: string
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label="核准 (approved)"
      className={cn("seal", className)}
    >
      <defs>
        <filter id={`${id}-ink`} x="-10%" y="-10%" width="120%" height="120%">
          {/* Edges: a slow warp so no line is perfectly straight. */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.06"
            numOctaves="3"
            seed="3"
            result="warp"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="warp"
            scale="3.5"
            xChannelSelector="R"
            yChannelSelector="G"
            result="rough"
          />
          {/* Grain: fine specks where the paper took no ink. */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.4"
            numOctaves="2"
            seed="11"
            result="grain"
          />
          <feColorMatrix
            in="grain"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  14 0 0 0 -3.7"
            result="specks"
          />
          {/* Pressure: broad patches pressed a little lighter. */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.03"
            numOctaves="2"
            seed="5"
            result="pressure"
          />
          <feColorMatrix
            in="pressure"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.2 0 0 0 0.75"
            result="patches"
          />
          <feComposite in="rough" in2="specks" operator="in" result="specked" />
          <feComposite in="specked" in2="patches" operator="in" />
        </filter>
        <mask id={`${id}-cut`}>
          <rect width="100" height="100" fill="#fff" />
          <text
            x="50"
            y="45"
            textAnchor="middle"
            className="seal-glyph"
            fontSize="40"
            fontWeight="700"
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
            fontWeight="700"
            fill="#000"
          >
            准
          </text>
        </mask>
      </defs>
      <g filter={`url(#${id}-ink)`}>
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="6"
          fill="#d93a2b"
          mask={`url(#${id}-cut)`}
        />
      </g>
    </svg>
  )
}
