import { MapboxMap } from "@workspace/ui/components/mapbox-map"

export default function MapPage() {
  return (
    <main className="h-dvh w-dvw">
      <MapboxMap
        accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ""}
      />
    </main>
  )
}
