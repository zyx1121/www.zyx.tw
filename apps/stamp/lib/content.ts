/**
 * Every string stamp.zyx.tw shows, kept apart from the markup so the
 * Markdown pages served to agents are built from the same copy.
 */

export const SITE_URL = "https://stamp.zyx.tw"
export const SITE_NAME = "Stamp"
export const SITE_TITLE = "Stamp | Let AI do the paperwork. You keep the stamp."
export const SITE_DESC =
  "Stamp builds and runs the workflows a school office repeats every week, and stops for the one moment that needs a person: the approval."

export const EMAIL = "mail@zyx.tw"
export const ACCESS_URL = `mailto:${EMAIL}?subject=${encodeURIComponent("Stamp access request")}`

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString()
}

export const HERO = {
  tagline: "Let AI do the paperwork. You keep the stamp.",
  lede: "Tell Stamp what your office does every week. It builds the workflow, runs it on your files and stops at the one moment that needs you: the approval.",
  primary: "Request access",
  secondary: "Watch it run",
  note: "Invite only. We bring on one school at a time.",
}

export const FILM = {
  caption:
    "Every admission brochure, checked for wrong dates and typos. Each department gets its own list once the registrar signs off. 30 seconds, recorded in the product.",
}

export const STEPS = {
  title: "Say it once. It runs every time.",
  items: [
    {
      title: "Say what you need",
      body: "No flowcharts, nothing to configure. Write it the way you would ask a colleague: check every brochure and send each department its mistakes.",
    },
    {
      title: "Watch it take shape",
      body: "Stamp asks what it needs to know, lays out every step on a canvas and tries it on your real files. You see exactly what will happen.",
    },
    {
      title: "Sign off, and it's done",
      body: "The run waits for your stamp. Approve it and the emails go out. Return it and nothing leaves your office.",
    },
  ],
}

export const PRODUCT = {
  title: "Your workflow and your assistant, side by side",
  body: "Ask for a change in plain words and watch the canvas update. Changed your mind? Every version is saved, so you can always go back.",
  alt: "Stamp showing an accounting office's website audit: three checks run in parallel, while the assistant explains why fixed rules belong in code.",
}

export const GUARANTEE = {
  title: "AI prepares. People decide.",
  body: "Automation should not cost you control. In Stamp, the decisions that matter carry a real person's name, and no AI can make them for you.",
  points: [
    {
      title: "Only people can stamp",
      body: "Approvals come from a signed-in person. Not the assistant, not a schedule, not an outside tool.",
    },
    {
      title: "Nothing goes out unchecked",
      body: "When an email is written from data, it waits until someone has approved it.",
    },
    {
      title: "Every decision on record",
      body: "Who stamped it, for which office, and when. Returned work stops right there.",
    },
  ],
  alt: "A student affairs leave request in Stamp: requests of three days or more go to review, shorter ones to a quick confirmation, and the clerk has returned one.",
}

export const OFFICES = {
  title: "One tool for every office on campus",
  items: [
    {
      office: "Registrar",
      job: "Catches the impossible dates and typos in every admission brochure before applicants do.",
    },
    {
      office: "Student affairs",
      job: "Takes leave requests from a simple form and sends only the long ones to review.",
    },
    {
      office: "General affairs",
      job: "Turns photos of receipts into a clean, searchable record.",
    },
    {
      office: "Library",
      job: "Suggests subject headings for new books from nothing but an ISBN.",
    },
    {
      office: "Accounting",
      job: "Finds dead links and outdated documents on your website before anyone else does.",
    },
  ],
}

export const CAPABILITIES = {
  title: "Ready for real office work",
  items: [
    {
      title: "Rules and loops",
      body: "Route requests by rules. Handle a hundred files as easily as one.",
    },
    {
      title: "On schedule",
      body: "Run every morning at eight, or wait patiently for a deadline.",
    },
    {
      title: "Forms anyone can fill",
      body: "Share a link. People submit and follow their request as it moves.",
    },
    {
      title: "Files as they come",
      body: "PDFs, spreadsheets, even phone photos of receipts.",
    },
    {
      title: "Google Drive",
      body: "Works inside the Docs and Sheets your office already lives in.",
    },
    {
      title: "Memory between runs",
      body: "Keeps records in tables, so nothing is typed twice.",
    },
    {
      title: "Undo for everything",
      body: "Retry from the step that failed. Restore any earlier version.",
    },
    {
      title: "Open to your AI",
      body: "Claude and other MCP clients get every tool Stamp's assistant has.",
    },
  ],
}

export const TRUST = {
  title: "Your school's data stays your school's",
  body: "Every school gets its own Stamp, on its own server, with its own database. Nothing is shared between schools.",
  items: [
    {
      title: "Passwords stay sealed",
      body: "Credentials go into a secure form, never the chat. They are encrypted with AES-256-GCM, and the AI only ever sees their names.",
    },
    {
      title: "Code in a closed room",
      body: "Everything Stamp writes runs in an isolated sandbox, cut off from your private network.",
    },
    {
      title: "Nothing hidden",
      body: "Every AI call is logged with its cost, and every run can be traced step by step.",
    },
  ],
}

export const CLOSING = {
  title: "Give your office its afternoons back.",
  body: "Stamp is invite only while we set up each school by hand. Tell us about one workflow your office repeats, and we will have it running with you.",
}
