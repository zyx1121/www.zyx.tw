"use client"

import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useEffect, useRef } from "react"

import { createMarkerWithPopup, type MapImage } from "@workspace/ui/lib/map"

const MAPBOX_STYLE = "mapbox://styles/mapbox/standard"
const STANDARD_MONOCHROME_NIGHT = {
  basemap: {
    theme: "monochrome",
    lightPreset: "night",
  },
} as const

const MAP_CENTER: [number, number] = [121, 23.7]

type MapboxMapProps = {
  accessToken: string
  imagesEndpoint?: string
}

export function MapboxMap({
  accessToken,
  imagesEndpoint = "/api/map-images",
}: MapboxMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  useEffect(() => {
    if (!accessToken || !containerRef.current) return

    const map = new mapboxgl.Map({
      accessToken,
      container: containerRef.current,
      style: MAPBOX_STYLE,
      config: STANDARD_MONOCHROME_NIGHT,
      center: MAP_CENTER,
      zoom: 4,
      attributionControl: false,
    })

    mapRef.current = map

    map.on("load", async () => {
      let images: MapImage[] = []
      try {
        const res = await fetch(imagesEndpoint)
        if (!res.ok) throw new Error(`map-images API ${res.status}`)
        const data = (await res.json()) as { images?: MapImage[] }
        images = data.images ?? []
      } catch {
        images = []
      }

      images.forEach((img) => {
        const marker = createMarkerWithPopup(map, img.src, [img.lng, img.lat])
        markersRef.current.push(marker)
      })
    })

    return () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
    }
  }, [accessToken, imagesEndpoint])

  return <div ref={containerRef} className="h-full min-h-0 w-full" />
}
