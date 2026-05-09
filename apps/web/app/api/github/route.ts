const USER = "zyx1121"
const GH_API = "https://api.github.com"
const GRAPHQL_URL = `${GH_API}/graphql`
const TOKEN = process.env.GITHUB_TOKEN

const HEATMAP_QUERY = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`

const RELEVANT_TYPES = [
  "PushEvent",
  "PullRequestEvent",
  "IssuesEvent",
  "WatchEvent",
  "CreateEvent",
  "ForkEvent",
  "ReleaseEvent",
  "PublicEvent",
]

type GhEvent = {
  id: string
  type: string
  public?: boolean
  repo: { name: string; url: string }
  payload: Record<string, unknown>
  created_at: string
}

const headers: Record<string, string> = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(TOKEN ? { Authorization: `bearer ${TOKEN}` } : {}),
}

async function fetchEvents(): Promise<GhEvent[]> {
  // /events/public already covers public events across personal + org repos.
  // /events/orgs/{org} would catch private-org events but needs read:org scope.
  const res = await fetch(
    `${GH_API}/users/${USER}/events/public?per_page=100`,
    { headers, next: { revalidate: 300 } }
  )
  if (!res.ok) return []
  const events = (await res.json()) as GhEvent[]

  // PR merges fire two events: PullRequestEvent (merged) + PushEvent on main.
  // Drop the trailing push so we don't claim someone "pushed to main" when
  // they actually merged a PR on a protected branch.
  const mergedPRs = events.filter(
    (e) =>
      e.type === "PullRequestEvent" &&
      ["merged", "closed"].includes((e.payload.action as string) ?? "")
  )
  const skipPushIds = new Set<string>()
  for (const push of events.filter((e) => e.type === "PushEvent")) {
    const branch = ((push.payload.ref as string) ?? "").replace(
      /^refs\/heads\//,
      ""
    )
    if (branch !== "main" && branch !== "master") continue
    const pushTime = new Date(push.created_at).getTime()
    const matched = mergedPRs.some((pr) => {
      if (pr.repo.name !== push.repo.name) return false
      const diff = Math.abs(new Date(pr.created_at).getTime() - pushTime)
      return diff < 60_000
    })
    if (matched) skipPushIds.add(push.id)
  }

  const sorted = events
    .filter(
      (e) =>
        RELEVANT_TYPES.includes(e.type) &&
        e.public !== false &&
        !skipPushIds.has(e.id)
    )
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

  // One event per repo so a single hot repo doesn't crowd out the rest.
  const seenRepos = new Set<string>()
  return sorted
    .filter((e) => {
      if (seenRepos.has(e.repo.name)) return false
      seenRepos.add(e.repo.name)
      return true
    })
    .slice(0, 5)
    .map((e) => ({
      id: e.id,
      type: e.type,
      repo: e.repo,
      payload: e.payload,
      created_at: e.created_at,
    }))
}

type Heatmap = {
  totalContributions: number
  weeks: {
    contributionDays: {
      date: string
      contributionCount: number
      contributionLevel: string
    }[]
  }[]
}

async function fetchHeatmap(): Promise<Heatmap | null> {
  if (!TOKEN) return null
  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        Authorization: `bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: HEATMAP_QUERY,
        variables: { login: USER },
      }),
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    const data = (await res.json()) as {
      data?: {
        user?: { contributionsCollection?: { contributionCalendar?: Heatmap } }
      }
    }
    return (
      data?.data?.user?.contributionsCollection?.contributionCalendar ?? null
    )
  } catch (err) {
    console.error("[github] heatmap fetch failed:", err)
    return null
  }
}

export async function GET() {
  const [events, heatmap] = await Promise.all([fetchEvents(), fetchHeatmap()])
  return Response.json({ user: USER, events, heatmap })
}
