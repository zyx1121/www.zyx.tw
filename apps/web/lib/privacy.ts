import { EMAIL } from "@workspace/ui/lib/profile"

import type { LegalDoc } from "@/lib/legal"

/**
 * The privacy page, as data so /privacy and /privacy.md say the same thing.
 * It covers every site under zyx.tw. Every statement is checked against the
 * code and the live sites; change it when they change, and bump `updated`.
 */
export const PRIVACY: LegalDoc = {
  title: "Privacy",
  updated: "2026-10-02",
  sections: [
    {
      heading: "What this covers",
      paragraphs: [
        [
          {
            text: "This policy covers every site under zyx.tw, all run by Loki (詹詠翔): www.zyx.tw and the apps ui, plump (formerly 3d), link, time and good; 1909, a private tool for three flatmates; the previews test, ui.test and 3d.test; and the hosts kitbash, sensorium, derp and data.",
          },
        ],
      ],
    },
    {
      heading: "In your browser",
      paragraphs: [
        [
          {
            text: "No site runs analytics or tracking scripts. The language switch saves your Traditional Chinese or English preference in a zyx_locale cookie for one year, shared across zyx.tw subdomains. 1909 also sets cookies that keep its members signed in.",
          },
        ],
        [
          {
            text: "If you switch the theme (the D key, or the toggle on ui.zyx.tw), your choice is saved in your browser's localStorage under the key “theme”. Plump keeps your current scene there too. None of it leaves your device. Scenes saved on the old 3d.zyx.tw address remain there; export a scene and open it in Plump to move it to plump.zyx.tw.",
          },
        ],
        [
          {
            text: "Each site serves its own fonts or uses fonts already on your device.",
          },
        ],
        [
          {
            text: "The 3D mark and interactive Made models on www.zyx.tw load their lighting from plump.zyx.tw, another of these sites.",
          },
        ],
      ],
    },
    {
      heading: "On the servers",
      paragraphs: [
        [
          {
            text: "www, ui, plump, 3d, link, time, good and 1909 are hosted on Vercel, which handles every request and keeps its own logs under the ",
          },
          {
            text: "Vercel privacy policy",
            href: "https://vercel.com/legal/privacy-policy",
          },
          { text: "." },
        ],
        [
          {
            text: "When www, link, time, good or 1909 renders a request on the server, it records the request with OpenTelemetry and sends the record to Loki's own monitoring service, sensorium.zyx.tw. A record can hold the method, the path and query string, the status and timing, your user agent and referrer, your IP address, and the city, region and country Vercel derives from it. Server errors are recorded with the same details. Records are deleted after 30 days.",
          },
        ],
        [
          {
            text: "The previews and the other hosts run on Loki's own server behind a gateway, which logs each request (your IP address, the request and its headers without credentials, and the response status) and keeps the log for up to 30 days. data.zyx.tw serves files from Cloudflare R2 under the ",
          },
          {
            text: "Cloudflare privacy policy",
            href: "https://www.cloudflare.com/privacypolicy/",
          },
          { text: "." },
        ],
        [
          {
            text: "The GitHub activity on About is fetched by the server from the GitHub API. Your browser does not contact GitHub for it.",
          },
        ],
      ],
    },
    {
      heading: "What the sites keep",
      paragraphs: [
        [
          {
            text: "link.zyx.tw keeps each URL you shorten, with its short code and the time it was made. It does not keep who made it, and anyone with a short link can open it.",
          },
        ],
        [
          {
            text: "1909 signs its members in with Google and asks only for their name, email address and profile picture. Only an email on its member list can make an account. It keeps that profile and the tokens Google returns. Each sign-in lasts 90 days and records the IP address and browser it came from. It also keeps the members' names, emails and shared expenses, which only signed-in members can see.",
          },
        ],
        [
          {
            text: "1909 uses Google data only to sign its members in and to know whose expenses are whose. It does not sell it, share it or use it for ads, and it follows the ",
          },
          {
            text: "Google API Services User Data Policy",
            href: "https://developers.google.com/terms/api-services-user-data-policy",
          },
          { text: "." },
        ],
        [
          {
            text: "Both sites keep their data in one database hosted by Neon, under the ",
          },
          {
            text: "Neon privacy policy",
            href: "https://neon.com/privacy-policy",
          },
          { text: "." },
        ],
        [
          {
            text: "Apart from the logs above, no other site keeps anything about you. Hosts under kitbash.zyx.tw run Loki's own experiments and are not public services.",
          },
        ],
      ],
    },
    {
      heading: "Leaving the sites",
      paragraphs: [
        [
          {
            text: "Links to sites outside zyx.tw open in a new tab and send them no referrer. A short link sends you to whatever address its maker gave.",
          },
        ],
        [
          {
            text: "On ui.zyx.tw, the Ask AI demo opens ChatGPT, Claude or Google with the page's address and a prompt, only when you click one of them.",
          },
        ],
      ],
    },
    {
      heading: "Questions and removal",
      paragraphs: [
        [
          {
            text: "To ask what is kept about you, or to have a short link or your data removed, write to ",
          },
          { text: EMAIL, href: `mailto:${EMAIL}` },
          {
            text: ". This page changes when the sites do; the date at the top is the last change.",
          },
        ],
      ],
    },
  ],
}
