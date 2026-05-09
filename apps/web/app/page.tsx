import { Background } from "@workspace/ui/components/background"
import { Contact } from "@workspace/ui/components/contact"
import { Intro } from "@workspace/ui/components/intro"
import { MapBlock } from "@workspace/ui/components/map-block"
import { Projects } from "@workspace/ui/components/projects"
import { Status } from "@workspace/ui/components/status"

export default function Home() {
  return (
    <main className="flex flex-col items-center">
      <Background />
      <section className="h-dvh w-dvw" aria-label="Hero" />
      <Intro />
      <Status />
      <Projects />
      <MapBlock
        accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ""}
      />
      <Contact />
    </main>
  )
}
