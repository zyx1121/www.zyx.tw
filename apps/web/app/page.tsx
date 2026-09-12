import { Background } from "@workspace/ui/components/background"
import { Contact } from "@workspace/ui/components/contact"
import { Intro } from "@workspace/ui/components/intro"
import { MapBlock } from "@workspace/ui/components/map-block"
import { Projects } from "@workspace/ui/components/projects"
import { Status } from "@workspace/ui/components/status"

import { getGithubStatus } from "@/lib/github"

// GitHub status is fetched on the server and the page regenerated in the
// background every 5 minutes (ISR), so the SSR HTML carries real events
// instead of "Loading…". force-static keeps the route prerendered even though
// the GitHub fetch carries an Authorization header, which Next would
// otherwise read as a dynamic signal.
export const revalidate = 300
export const dynamic = "force-static"

export default async function Home() {
  const status = await getGithubStatus()

  return (
    <main className="flex flex-col items-center">
      <Background />
      <section className="h-dvh w-dvw" aria-label="Hero" />
      <Intro />
      <Status data={status} />
      <Projects />
      <MapBlock
        accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ""}
      />
      <Contact />
    </main>
  )
}
