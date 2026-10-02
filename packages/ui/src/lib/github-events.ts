import type { Locale } from "./i18n"

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
function englishEvent(e: GhEvent): { kind: EventKind; text: string } {
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

export function describeEvent(
  e: GhEvent,
  locale: Locale = "en"
): { kind: EventKind; text: string } {
  const event = englishEvent(e)
  if (locale === "en") return event
  const action = String(e.payload.action ?? "updated")
  const verbs: Record<string, string> = {
    opened: "建立",
    closed: "關閉",
    reopened: "重新開啟",
    updated: "更新",
    edited: "編輯",
    assigned: "指派",
    unassigned: "取消指派",
    labeled: "加上標籤",
    unlabeled: "移除標籤",
    synchronize: "更新",
  }
  const verb = verbs[action] ?? action
  const texts: Record<string, string> = {
    PushEvent: `推送至 ${String(e.payload.ref ?? "").replace(/^refs\/heads\//, "") || "分支"}`,
    PullRequestEvent: `${verb} PR`,
    IssuesEvent: `${verb} issue`,
    WatchEvent: "加入星號",
    ForkEvent: "建立分支副本",
    CreateEvent: `建立 ${{ repository: "儲存庫", branch: "分支", tag: "標籤" }[String(e.payload.ref_type) as "repository" | "branch" | "tag"] ?? String(e.payload.ref_type ?? "參照")}`,
    ReleaseEvent:
      `發布 ${String((e.payload.release as { tag_name?: string })?.tag_name ?? "")}`.trim(),
    PublicEvent: "設為公開",
  }
  return { ...event, text: texts[e.type] ?? event.text }
}
