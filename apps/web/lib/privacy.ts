import { EMAIL } from "@workspace/ui/lib/profile"

/** A run of a paragraph; a run with `href` renders as a link. */
export type Run = { text: string; href?: string }

export type PrivacySection = { heading: string; paragraphs: Run[][] }

/**
 * The privacy page, as data so /privacy and /privacy.md say the same thing.
 * Every statement is checked against the code: the browser side against
 * apps/web and packages/ui, the server side against packages/otel and
 * lib/github.ts. Change it when they change, and bump `updated`.
 */
export const PRIVACY: {
  title: string
  /** ISO date of the last change, shown as "Last updated". */
  updated: string
  sections: PrivacySection[]
} = {
  title: "Privacy",
  updated: "2026-09-28",
  sections: [
    {
      heading: "In your browser",
      paragraphs: [
        [
          {
            text: "This site runs no analytics or tracking scripts and sets no cookies.",
          },
        ],
        [
          {
            text: "If you switch the theme with the D key, next-themes saves your choice in your browser's localStorage under the key “theme”. It stays on your device.",
          },
        ],
        [
          {
            text: "Fonts are served from this site, not from a font service.",
          },
        ],
        [
          {
            text: "The 3D mark on the home page loads its lighting, an environment map, from ",
          },
          { text: "3d.zyx.tw", href: "https://3d.zyx.tw" },
          {
            text: ", Loki's 3D editor, which serves it as a static file from Vercel.",
          },
        ],
      ],
    },
    {
      heading: "On the server",
      paragraphs: [
        [
          {
            text: "The site is hosted on Vercel, which handles every request and keeps its own logs under the ",
          },
          {
            text: "Vercel privacy policy",
            href: "https://vercel.com/legal/privacy-policy",
          },
          { text: "." },
        ],
        [
          {
            text: "When the server renders a request, it records it with OpenTelemetry and sends the record to Loki's own monitoring service. A record can hold the method, path and query string, status and timing, your user agent and referrer, your IP address, and the city, region and country Vercel derives from that address. Server errors are recorded with the same details.",
          },
        ],
        [
          {
            text: "The Latest list and the GitHub activity on About are fetched by the server from the GitHub API. Your browser does not contact GitHub for them.",
          },
        ],
      ],
    },
    {
      heading: "Leaving the site",
      paragraphs: [
        [
          {
            text: "Links to other sites open in a new tab and send them no referrer.",
          },
        ],
      ],
    },
    {
      heading: "Questions",
      paragraphs: [
        [
          { text: "Write to " },
          { text: EMAIL, href: `mailto:${EMAIL}` },
          { text: "." },
        ],
      ],
    },
  ],
}
