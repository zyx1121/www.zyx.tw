import { readFile, readdir } from "node:fs/promises"
import path from "node:path"

import type { MapImage } from "@workspace/ui/lib/map"

const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
const DEFAULT_LNG = 121
const DEFAULT_LAT = 23.7

export async function GET() {
  const mapDir = path.join(process.cwd(), "public", "map")
  try {
    const files = await readdir(mapDir)
    const imageFiles = files.filter((f) =>
      IMAGE_EXT.includes(path.extname(f).toLowerCase())
    )

    const exifr = (await import("exifr")).default

    const images = await Promise.all(
      imageFiles.map(async (file): Promise<MapImage> => {
        const src = `/map/${file}`
        let lng = DEFAULT_LNG
        let lat = DEFAULT_LAT

        try {
          const buffer = await readFile(path.join(mapDir, file))
          const gps = await exifr.gps(buffer)
          if (gps?.latitude != null && gps?.longitude != null) {
            lat = gps.latitude
            lng = gps.longitude
          }
        } catch {
          // EXIF missing or unreadable — fall back to default coords
        }

        return { src, lng, lat }
      })
    )

    return Response.json(
      { images },
      { headers: { "Cache-Control": "public, max-age=3600" } }
    )
  } catch (err) {
    console.error("[map-images] failed to read map directory:", err)
    return Response.json({ images: [] }, { status: 500 })
  }
}
