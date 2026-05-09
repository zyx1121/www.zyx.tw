import { ImageResponse } from "next/og"

export const alt = "ZYX — Loki's site"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OG() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        color: "#fafafa",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        padding: 96,
      }}
    >
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 48,
          left: 48,
          fontSize: 18,
          color: "#71717a",
          letterSpacing: "0.1em",
        }}
      >
        ZYX
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 132,
          fontWeight: 500,
          letterSpacing: "-0.04em",
        }}
      >
        ZYX
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 32,
          fontSize: 28,
          color: "#a1a1aa",
          textAlign: "center",
          maxWidth: 800,
          lineHeight: 1.4,
        }}
      >
        Loki — software, ML, and the occasional photo trail.
      </div>
    </div>,
    size
  )
}
