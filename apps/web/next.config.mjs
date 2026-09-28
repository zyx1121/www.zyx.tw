import { readFileSync } from "node:fs"

// The canonical origin and every page with its Markdown twin, shared with the
// app (lib/site.ts reads the same file).
const site = JSON.parse(
  readFileSync(new URL("./lib/site.json", import.meta.url), "utf8")
)

// Asking for Markdown: `Accept: text/markdown`, alone or among other types.
const wantsMarkdown = {
  type: "header",
  key: "accept",
  value: ".*text/markdown.*",
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/3d", "@workspace/otel", "@workspace/ui"],
  serverExternalPackages: ["exifr"],
  // Contact was its own page until 2026-09-28; the email is on About now.
  async redirects() {
    return [
      { source: "/contact", destination: "/about", permanent: true },
      { source: "/contact.md", destination: "/about.md", permanent: true },
    ]
  },
  // Content negotiation in the router, so no function runs for it: a page
  // asked for as Markdown is served its twin, and a Markdown request for a
  // path that does not exist gets the Markdown 404.
  async rewrites() {
    return {
      beforeFiles: site.pages.map(({ path, markdown }) => ({
        source: path,
        has: [wantsMarkdown],
        destination: markdown,
      })),
      afterFiles: [],
      fallback: [
        { source: "/:path*", has: [wantsMarkdown], destination: "/404.md" },
      ],
    }
  },
  // Pages vary on Accept and point to llms.txt and their twin; each twin
  // points back to its page as the canonical URL.
  async headers() {
    return site.pages.flatMap(({ path, markdown }) => [
      {
        source: path,
        headers: [
          { key: "Vary", value: "Accept" },
          {
            key: "Link",
            value: `<${site.url}/llms.txt>; rel="describedby", <${site.url}${markdown}>; rel="alternate"; type="text/markdown"`,
          },
        ],
      },
      {
        // A literal dot: `source` reads "." as a pattern character.
        source: markdown.replaceAll(".", "\\."),
        headers: [
          {
            key: "Link",
            value: `<${new URL(path, site.url)}>; rel="canonical"`,
          },
        ],
      },
    ])
  },
}

export default nextConfig
