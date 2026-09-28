import { GH_API, GITHUB_HEADERS, REVALIDATE_SECONDS } from "@/lib/github"
import { projects } from "@/lib/projects"
import { SITE_URL } from "@/lib/site"

const REPO = "zyx1121/www.zyx.tw"
const COUNT = 5
const PER_SITE = 2

type Site = { name: string; href: string }

/**
 * The commit scopes of the public apps and the site each one ships to. web is
 * this site; the others are projects in lib/projects.json under the same slug.
 * Every other scope (1909, a11y, theme, ...) stays out of the list.
 */
const SCOPES: Record<string, Site> = {
  web: { name: new URL(SITE_URL).host, href: SITE_URL },
  ...Object.fromEntries(
    ["ui", "3d", "link", "time", "good"].flatMap((slug) => {
      const project = projects.find((p) => p.slug === slug)
      return project ? [[slug, { name: project.name, href: project.href }]] : []
    })
  ),
}

// A Conventional Commits feat or fix with one scope; the squash merge's
// " (#40)" is left off the subject.
const SUBJECT = /^(?:feat|fix)\(([^)]+)\)!?: (.+?)(?: \(#\d+\))?$/

export type Change = {
  sha: string
  /** The commit subject without its type, scope and PR number. */
  subject: string
  site: Site
  /** When it landed on main (the committer date, ISO 8601). */
  date: string
}

type Commit = {
  sha: string
  commit: {
    message: string
    committer: { date: string } | null
    author: { date: string } | null
  }
}

/**
 * The newest COUNT feat and fix commits of the public apps, newest first, at
 * most PER_SITE per site so one busy app cannot fill the whole list.
 */
export function toChanges(commits: Commit[]): Change[] {
  const changes: Change[] = []
  const perSite = new Map<string, number>()
  for (const { sha, commit } of commits) {
    const match = SUBJECT.exec(commit.message.split("\n", 1)[0]?.trim() ?? "")
    const site = match?.[1] ? SCOPES[match[1]] : undefined
    const date = commit.committer?.date ?? commit.author?.date
    if (!match?.[2] || !site || !date) continue
    const seen = perSite.get(site.name) ?? 0
    if (seen === PER_SITE) continue
    perSite.set(site.name, seen + 1)
    changes.push({ sha, subject: match[2], site, date })
    if (changes.length === COUNT) break
  }
  return changes
}

/**
 * The home page's Latest list from the GitHub REST API: the last 100 commits
 * on main, refetched every 5 minutes with the page (ISR). GITHUB_TOKEN is
 * optional; without it the request is unauthenticated. Null when the request
 * fails, so the page leaves the list out.
 */
export async function getLatestChanges(): Promise<{
  changes: Change[]
  fetchedAt: number
} | null> {
  try {
    const response = await fetch(
      `${GH_API}/repos/${REPO}/commits?sha=main&per_page=100`,
      { headers: GITHUB_HEADERS, next: { revalidate: REVALIDATE_SECONDS } }
    )
    if (!response.ok) return null
    const commits = (await response.json()) as Commit[]
    return { changes: toChanges(commits), fetchedAt: Date.now() }
  } catch (error) {
    console.error("[latest] commits fetch failed:", error)
    return null
  }
}
