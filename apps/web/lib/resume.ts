import { EMAIL, GITHUB_USER } from "@workspace/ui/lib/profile"

/**
 * The about page's resume, as data so /about and /about.md say the same
 * thing. Every entry is checked against a record: the degrees, the
 * internship, the award and the coaching against school and employer
 * documents, each paper against its DOI or its camera-ready copy, each
 * project against its repository or report. Client work stays off.
 */

/** A labelled fact; one with `href` renders as a link. */
export type Fact = { label: string; value: string; href?: string }

export const FACTS: Fact[] = [
  { label: "From", value: "Changhua" },
  { label: "Email", value: EMAIL, href: `mailto:${EMAIL}` },
  {
    label: "GitHub",
    value: `@${GITHUB_USER}`,
    href: `https://github.com/${GITHUB_USER}`,
  },
]

/** A row of a resume list: when, what, and where, linked when it has an address. */
export type Entry = {
  when: string
  what: string
  where: string
  href?: string
}

export type Section = { id: string; title: string; entries: Entry[] }

/** The resume's lists in page order, newest entry first in each. */
export const SECTIONS: Section[] = [
  {
    id: "timeline",
    title: "Timeline",
    entries: [
      {
        when: "2025–now",
        what: "M.S. Computer Science",
        where: "NYCU WinLab",
        href: "https://www.winlab.tw",
      },
      {
        when: "2024",
        what: "Intern in SONiC switch test automation",
        where: "Clounix",
      },
      {
        when: "2022–2024",
        what: "Coach for the national skills competition",
        where: "Shalu Vocational High School",
      },
      {
        when: "2021–2025",
        what: "B.S. Electronic Engineering",
        where: "NTUST",
        href: "https://www.ntust.edu.tw",
      },
      {
        when: "2020",
        what: "1st place in computer repair",
        where: "National Skills Competition",
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
        where: "APWCS 2026",
      },
      {
        when: "2024",
        what: "Exploring Automated Frequency Coordination System for 6 GHz Wi-Fi in Taiwan",
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
        what: "An operating system for AI agents",
        where: "kitbash",
        href: "https://github.com/zyx1121/kitbash",
      },
      {
        when: "2026",
        what: "A local model host for agents on Windows",
        where: "aias",
        href: "https://github.com/zyx1121/aias",
      },
      {
        when: "2024",
        what: "Find My item locations as an API",
        where: "findmy-api",
        href: "https://github.com/zyx1121/findmy-api",
      },
      {
        when: "2024",
        what: "A terminal client for Jenkins",
        where: "jenkins-terminal",
        href: "https://pypi.org/project/jenkins-terminal",
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
]
