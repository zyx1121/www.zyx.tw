/**
 * The GitHub status data and the words for each event, shared by the Status
 * component and the Markdown version of the about page.
 */

export type GhEvent = {
  id: string
  type: string
  repo: { name: string; url: string }
  payload: Record<string, unknown>
  created_at: string
}

export type HeatmapDay = {
  date: string
  contributionCount: number
  contributionLevel:
    | "NONE"
    | "FIRST_QUARTILE"
    | "SECOND_QUARTILE"
    | "THIRD_QUARTILE"
    | "FOURTH_QUARTILE"
}

export type Heatmap = {
  totalContributions: number
  weeks: { contributionDays: HeatmapDay[] }[]
}

export type StatusData = {
  user: string
  events: GhEvent[]
  heatmap: Heatmap | null
}

/** Which icon an event gets. */
export type EventKind =
  "commit" | "pull-request" | "issue" | "star" | "fork" | "repo" | "tag"

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** What happened, such as "Pushed to main"; the repo name follows it. */
export function describeEvent(e: GhEvent): { kind: EventKind; text: string } {
  switch (e.type) {
    case "PushEvent": {
      const ref = (e.payload.ref as string) ?? ""
      const branch = ref.replace(/^refs\/heads\//, "") || "a branch"
      return { kind: "commit", text: `Pushed to ${branch}` }
    }
    case "PullRequestEvent": {
      const action = (e.payload.action as string) ?? "updated"
      return { kind: "pull-request", text: `${cap(action)} a PR` }
    }
    case "IssuesEvent": {
      const action = (e.payload.action as string) ?? "updated"
      return { kind: "issue", text: `${cap(action)} an issue` }
    }
    case "WatchEvent":
      return { kind: "star", text: "Starred" }
    case "ForkEvent":
      return { kind: "fork", text: "Forked" }
    case "CreateEvent": {
      const refType = (e.payload.ref_type as string) ?? "ref"
      return { kind: "repo", text: `Created ${refType}` }
    }
    case "ReleaseEvent": {
      const tag =
        ((e.payload.release as { tag_name?: string })?.tag_name as string) ?? ""
      return { kind: "tag", text: `Released ${tag}`.trim() }
    }
    case "PublicEvent":
      return { kind: "repo", text: "Made public" }
    default:
      return { kind: "repo", text: e.type }
  }
}
