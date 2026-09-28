import { EMAIL } from "@workspace/ui/lib/profile"

import { SOCIAL } from "@/lib/site"

/**
 * The about page's CV, as data so /about and /about.md say the same thing.
 * Entries come from a record or from Loki himself: the degrees, the award
 * and the coaching from school documents, each paper from its DOI or its
 * PDF, each project from its repository or report, and the MediaTek
 * course, the TANET paper and the internship's end from Loki. Other
 * client work stays off.
 */

/** A labelled fact; one with `href` renders as a link. */
export type Fact = { label: string; value: string; href?: string }

export const FACTS: Fact[] = [
  { label: "From", value: "Changhua, Taiwan" },
  { label: "Email", value: EMAIL, href: `mailto:${EMAIL}` },
  ...SOCIAL.map(({ label, handle, href }) => ({ label, value: handle, href })),
]

/** A row of a resume list: when, what, and where, linked when it has an address. */
export type Entry = {
  when: string
  what: string
  where: string
  href?: string
  /** A muted line under `what`, such as the author position of a paper. */
  note?: string
}

export type Section = {
  id: string
  title: string
  entries: Entry[]
}

/**
 * The resume's lists in page order, by kind as a CV sorts them, newest
 * entry first in each.
 */
export const SECTIONS: Section[] = [
  {
    id: "education",
    title: "Education",
    entries: [
      {
        when: "2025–now",
        what: "M.S. Computer Science",
        where: "NYCU WinLab",
        href: "https://www.winlab.tw",
      },
      {
        when: "2021–2025",
        what: "B.S. Electronic Engineering",
        where: "NTUST",
        href: "https://www.ntust.edu.tw",
      },
    ],
  },
  {
    id: "experience",
    title: "Experience",
    entries: [
      {
        when: "2026",
        what: "Taught a Claude Code course",
        where: "MediaTek",
      },
      {
        when: "2024–2025",
        what: "Intern in SONiC switch test automation",
        where: "Clounix",
      },
      {
        when: "2022–2024",
        what: "Volunteer coach for the skills competition",
        where: "Shalu Vocational High School",
      },
    ],
  },
  {
    id: "publications",
    title: "Publications",
    entries: [
      {
        when: "2026",
        what: "An Automated and Optimized Framework for 6 GHz Wi-Fi AFC Compliance Verification",
        note: "First author",
        where: "APWCS 2026",
        href: "https://apwcs2026.org",
      },
      {
        when: "2025",
        what: "6 GHz Wi-Fi 自動頻率協調系統之 DUT 測試環境自動化改良",
        note: "First author",
        where: "TANET 2025",
        href: "https://tanet2025.niu.edu.tw",
      },
      {
        when: "2025",
        what: "CodedMyRoute: Design and Implementation of Software Defined Reliable Routing Scheme for Satellite IoTs",
        note: "Co-author",
        where: "APWCS 2025",
        href: "https://doi.org/10.1109/APWCS67981.2025.11151927",
      },
      {
        when: "2024",
        what: "Exploring Automated Frequency Coordination System for 6 GHz Wi-Fi in Taiwan",
        note: "Co-author",
        where: "ICS 2024",
        href: "https://doi.org/10.1109/ICS64339.2024.00032",
      },
    ],
  },
  {
    id: "projects",
    title: "Projects",
    entries: [
      {
        when: "2026",
        what: "A local model host for agents on Windows",
        where: "aias",
        href: "https://github.com/zyx1121/aias",
      },
      {
        when: "2026",
        what: "An operating system for AI agents",
        where: "kitbash",
        href: "https://github.com/zyx1121/kitbash",
      },
      {
        when: "2026",
        what: "Now playing inside Claude Code",
        where: "music-mod",
        href: "https://github.com/zyx1121/music-mod",
      },
      {
        when: "2026",
        what: "Today's schedule inside Claude Code",
        where: "today-mod",
        href: "https://github.com/zyx1121/today-mod",
      },
      {
        when: "2026",
        what: "Idea to paper with simulated peer review",
        where: "paper-generator",
        href: "https://github.com/zyx1121/paper-generator",
      },
      {
        when: "2026",
        what: "A Telegram to Claude Code agent template",
        where: "agent-template",
        href: "https://github.com/zyx1121/agent-template",
      },
      {
        when: "2026",
        what: "Hearing and sight for Claude Code on macOS",
        where: "sense",
        href: "https://github.com/zyx1121/sense",
      },
      {
        when: "2026",
        what: "A software KVM over QUIC",
        where: "quickvm",
        href: "https://github.com/zyx1121/quickvm",
      },
      {
        when: "2026",
        what: "Git-driven deploys for LXC on Proxmox",
        where: "keel",
        href: "https://github.com/zyx1121/keel",
      },
      {
        when: "2026",
        what: "A Pokémon trail behind the cursor",
        where: "cursormon",
        href: "https://github.com/zyx1121/cursormon",
      },
      {
        when: "2026",
        what: "Shake the cursor to act on the UI under it",
        where: "shake",
        href: "https://github.com/zyx1121/shake",
      },
      {
        when: "2026",
        what: "A pixel-art Ditto statusline for Claude Code",
        where: "ditto",
        href: "https://github.com/zyx1121/ditto",
      },
      {
        when: "2024",
        what: "Find My item locations as an API",
        where: "findmy-api",
        href: "https://github.com/zyx1121/findmy-api",
      },
      {
        when: "2024",
        what: "SDN dashboard for mmWave nodes",
        where: "mmwave-dashboard",
        href: "https://github.com/zyx1121/mmwave-dashboard",
      },
      {
        when: "2024",
        what: "Experimental AFC on OpenWiFi",
        where: "openwifi-afc",
        href: "https://github.com/zyx1121/openwifi-afc",
      },
      {
        when: "2024",
        what: "A terminal client for Jenkins",
        where: "jenkins-terminal",
        href: "https://pypi.org/project/jenkins-terminal",
      },
      {
        when: "2023–2024",
        what: "FPGA data system for a lunar magnetometer",
        where: "NTUST capstone",
      },
      {
        when: "2023",
        what: "WebRTC live streaming site",
        where: "ntust.live",
        href: "https://github.com/zyx1121/ntust.live",
      },
    ],
  },
  {
    id: "awards",
    title: "Awards",
    entries: [
      {
        when: "2020",
        what: "1st place in computer repair",
        where: "National Vocational High School Skills Competition",
      },
    ],
  },
]
