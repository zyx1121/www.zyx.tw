import { Background } from "@workspace/ui/components/background"
import { Contact } from "@workspace/ui/components/contact"
import { Intro } from "@workspace/ui/components/intro"
import { MapPreview } from "@workspace/ui/components/map-preview"
import { Projects } from "@workspace/ui/components/projects"

export default function Home() {
  return (
    <main className="flex flex-col items-center">
      <Background />
      <div className="h-dvh w-dvw" />
      <Intro />
      <Projects />
      <MapPreview />
      <Contact />
    </main>
  )
}
