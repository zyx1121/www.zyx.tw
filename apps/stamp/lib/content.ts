/**
 * Every string stamp.zyx.tw shows, kept apart from the markup so the
 * Markdown pages served to agents are built from the same copy.
 */

export const SITE_URL = "https://stamp.zyx.tw"
export const SITE_NAME = "Stamp"
export const SITE_TITLE = "Stamp | AI does the work. People sign off."
export const SITE_DESC =
  "Stamp turns one sentence into a running workflow for school offices. An agent builds and runs every step, and a named person stamps the ones that matter."

export const EMAIL = "mail@zyx.tw"
export const CONTACT_URL = `mailto:${EMAIL}?subject=${encodeURIComponent("Stamp demo")}`

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString()
}

export const HERO = {
  tagline: "AI does the work. People sign off.",
  lede: "Stamp turns one sentence into a running workflow for school offices. An agent builds and runs every step. A named person stamps the ones that matter.",
  primary: "Book a demo",
  secondary: "Watch it run",
}

export const FILM = {
  caption:
    "A registrar's office checks every admission brochure, then emails each department its own mistakes. Recorded in the product, 30 seconds.",
}

export const STEPS = {
  title: "From a sentence to a stamped result",
  items: [
    {
      title: "Describe it",
      body: "Type the job the way you would tell a colleague: check every brochure for wrong dates and typos, then send each department its list.",
    },
    {
      title: "The agent builds it",
      body: "It asks what it needs, lays out the steps on a canvas and runs them on real files. Fixed rules become code. Only judgment goes to a model.",
    },
    {
      title: "A person stamps it",
      body: "The run stops at the stamp. The named clerk reviews the result and approves or returns it. Nothing leaves the office before that.",
    },
  ],
}

export const PRODUCT = {
  title: "One canvas, one conversation",
  body: "The workflow and the agent that builds it sit on the same screen. Ask for a change and the canvas updates. Every edit is a version you can restore.",
  alt: "Stamp showing an accounting office's website audit: three checks run in parallel, while the agent explains why fixed rules belong in code.",
}

export const GUARANTEE = {
  title: "The stamp is the guarantee",
  body: "A stamp step names a person or a role. Only that person, signed in, can approve it. Agents, schedules and outside tools can prepare the work, never stamp it.",
  points: [
    {
      title: "Agents cannot stamp",
      body: "Approval goes through the signed-in session only. The chat agent and MCP clients share every other tool, but not this one.",
    },
    {
      title: "Mail waits for approval",
      body: "When recipients come from data, the email step runs only after an approved stamp in the same run.",
    },
    {
      title: "Returned means stopped",
      body: "A returned stamp ends the run. Every decision keeps its name, office and time.",
    },
  ],
  alt: "A student affairs leave request in Stamp: requests of three days or more go to review, shorter ones to a quick confirmation, and the clerk has returned one.",
}

export const OFFICES = {
  title: "Built with school offices",
  items: [
    {
      office: "Registrar",
      job: "Checks every admission brochure for impossible dates, wrong weekdays and typos, then mails each department its own list.",
    },
    {
      office: "Student affairs",
      job: "Takes leave requests from a public form, routes them by length and records the approved ones.",
    },
    {
      office: "General affairs",
      job: "Reads receipts and invoices from photos or PDFs and registers them in a table.",
    },
    {
      office: "Library",
      job: "Suggests subject headings for new books from their ISBN.",
    },
    {
      office: "Accounting",
      job: "Audits the office website for dead links, outdated documents and mistyped addresses.",
    },
  ],
}

export const CAPABILITIES = {
  title: "Everything an office workflow needs",
  items: [
    {
      title: "Branches and loops",
      body: "Route by rules, run every item in a list, gather the results.",
    },
    {
      title: "Schedules and waits",
      body: "Start every morning at eight, or pause until a date.",
    },
    {
      title: "Public forms",
      body: "Anyone can submit, then follow their request on its own status page.",
    },
    {
      title: "Files and photos",
      body: "PDFs, spreadsheets and phone photos go straight to the step that reads them.",
    },
    {
      title: "Google Drive",
      body: "Read, fill and write the Docs and Sheets the office already uses.",
    },
    {
      title: "Tables",
      body: "Keep records between runs and update them by key.",
    },
    {
      title: "Retry and restore",
      body: "Rerun from the step that failed. Roll the workflow back to any version.",
    },
    {
      title: "MCP",
      body: "Every tool the chat agent has is open to Claude and other MCP clients.",
    },
  ],
}

export const TRUST = {
  title: "One school, one server",
  body: "Each school runs its own Stamp with its own database. Nothing is shared between schools.",
  items: [
    {
      title: "Sealed credentials",
      body: "Passwords go into a form, never the chat. They are encrypted with AES-256-GCM, and the agent sees only their names.",
    },
    {
      title: "Sandboxed code",
      body: "Generated code runs in an isolated sandbox with no access to the private network.",
    },
    {
      title: "Every call on record",
      body: "Each model call is logged with its tokens and cost, and every run is traced.",
    },
  ],
}

export const CLOSING = {
  title: "Bring one workflow. Leave with it running.",
  body: "We set it up with your office, on your own server.",
}
