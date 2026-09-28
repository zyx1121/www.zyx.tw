import { EMAIL } from "@workspace/ui/lib/profile"

import type { LegalDoc } from "@/lib/legal"

/**
 * The terms of every site under zyx.tw, as data so /terms and /terms.md say
 * the same thing. Change them with the sites, and bump `updated`.
 */
export const TERMS: LegalDoc = {
  title: "Terms",
  updated: "2026-09-28",
  sections: [
    {
      heading: "What these cover",
      paragraphs: [
        [
          {
            text: "These terms cover every site under zyx.tw: www.zyx.tw and the apps on its subdomains, such as ui, 3d, link, time and good. Loki (詹詠翔) runs them as personal projects. Using a site means you accept these terms.",
          },
        ],
      ],
    },
    {
      heading: "As is",
      paragraphs: [
        [
          {
            text: "The sites are free and come as they are, with no warranty. Any of them can change, break or shut down at any time, with or without notice. Keep your own copy of anything you need.",
          },
        ],
      ],
    },
    {
      heading: "Fair use",
      paragraphs: [
        [
          {
            text: "Do not use the sites to break the law, to harm anyone, or to spread malware, phishing or spam. Short links on link.zyx.tw must not lead to such content.",
          },
        ],
        [
          {
            text: "Do not overload, scan or attack the sites, and do not try to reach tools that are not open to you, such as 1909.",
          },
        ],
      ],
    },
    {
      heading: "What you put in",
      paragraphs: [
        [
          {
            text: "What you submit, such as a URL you shorten, stays yours. You let the site store and serve it so the feature works. Loki may remove any link or content, or block access, when it breaks these terms or puts the sites at risk.",
          },
        ],
      ],
    },
    {
      heading: "Code and content",
      paragraphs: [
        [
          { text: "The source code is open under the MIT License at " },
          {
            text: "github.com/zyx1121/www.zyx.tw",
            href: "https://github.com/zyx1121/www.zyx.tw",
          },
          {
            text: ". The zyx mark, the writing and the images are Loki's unless a page says otherwise.",
          },
        ],
      ],
    },
    {
      heading: "Liability",
      paragraphs: [
        [
          {
            text: "As far as the law allows, Loki is not liable for any loss that comes from using the sites or from not being able to use them.",
          },
        ],
      ],
    },
    {
      heading: "Changes and law",
      paragraphs: [
        [
          {
            text: "These terms can change; the date at the top is the last change, and using a site after it means you accept the new terms. They follow the laws of Taiwan.",
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
