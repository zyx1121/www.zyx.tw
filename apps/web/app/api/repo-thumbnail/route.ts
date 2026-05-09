const TOKEN = process.env.GITHUB_TOKEN

const REPO_RE = /^[\w-]+\/[\w.-]+$/

type ReadmeResponse = {
  content: string
  encoding: string
  html_url: string
}

export async function GET(req: Request) {
  const repo = new URL(req.url).searchParams.get("repo")
  if (!repo || !REPO_RE.test(repo)) {
    return Response.json({ error: "invalid_repo" }, { status: 400 })
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(TOKEN ? { Authorization: `bearer ${TOKEN}` } : {}),
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/readme`, {
      headers,
      next: { revalidate: 3600 },
    })
    if (!res.ok) return Response.json({ url: null })

    const data = (await res.json()) as ReadmeResponse
    const content = Buffer.from(data.content, "base64").toString("utf-8")

    const mdMatch = content.match(/!\[[^\]]*\]\(\s*([^)\s]+)/)
    const htmlMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i)
    let imgUrl = mdMatch?.[1] ?? htmlMatch?.[1]
    if (!imgUrl) return Response.json({ url: null })

    if (!/^https?:\/\//.test(imgUrl)) {
      const m = data.html_url.match(/\/blob\/([^/]+)\//)
      const branch = m?.[1] ?? "main"
      const cleaned = imgUrl.replace(/^\.?\//, "")
      imgUrl = `https://raw.githubusercontent.com/${repo}/${branch}/${cleaned}`
    }

    return Response.json({ url: imgUrl })
  } catch (err) {
    console.error("[repo-thumbnail] failed:", err)
    return Response.json({ url: null }, { status: 500 })
  }
}
