export const CARREL = {
  eyebrow: "Infrastructure · MCP",
  introduction: {
    title: "A place for your next idea.",
    body: "A carrel is a quiet desk of your own. This one gives your project its own machines, connections and room to work. Describe the environment to your agent, then connect and start building.",
  },
  request:
    "Create an app and a database. Only the app should reach the database on port 5432. Publish the app over HTTPS.",
  chapters: [
    {
      id: "workspace",
      number: "01",
      title: "Describe the environment.",
      body: "Ask for a single machine or a connected group. Carrel checks the plan against available resources and your quota. Your agent can include packages, setup commands and application checks when creating a VM.",
      image: "-workspace.webp",
      alt: "A small cobalt ceramic arch shelters a notebook on an oak desk beside a laptop.",
      caption: "A workspace with room for your own tools.",
    },
    {
      id: "connections",
      number: "02",
      title: "Connect what belongs together.",
      body: "Keep a database private and give the app a public address. Declare which service can reach which port. Carrel sets up the connections and HTTPS routing; your agent verifies that the application responds.",
      image: "-connections.webp",
      alt: "Two cobalt ceramic arches on an oak desk are joined by a single ivory cable.",
      caption: "Separate spaces. Deliberate connections.",
    },
    {
      id: "snapshots",
      number: "03",
      title: "Keep working. Keep a way back.",
      body: "The environment stays with the project. Reconnect over SSH, adjust its resources, or save a disk snapshot before a change. When the work is finished, remove the environment and release its resources.",
      image: "-snapshots.webp",
      alt: "Three identical cobalt ceramic arches recede along an oak desk like saved versions.",
      caption: "A working environment, through each iteration.",
    },
  ],
  workflow: [
    {
      id: "plan",
      label: "Plan",
      title: "See what will be created.",
      body: "Review two machines, one database connection and one HTTPS publication. Planning checks quota and capacity without creating or reserving resources.",
      lines: [
        "app · Ubuntu VM",
        "db · Debian VM",
        "app → db · TCP 5432",
        "HTTPS → app",
      ],
    },
    {
      id: "create",
      label: "Create",
      title: "Prepare the machines.",
      body: "Carrel creates the environment and tracks the operation. VM readiness includes SSH, completed initialization and any requested application checks.",
      lines: [
        "Allocate machines",
        "Initialize the guests",
        "Apply connections",
        "Run requested checks",
      ],
    },
    {
      id: "connect",
      label: "Connect",
      title: "Get back to your project.",
      body: "The result includes SSH connection details and a public service address. Connect with your editor or terminal, then verify the application at its new URL.",
      lines: [
        "SSH connection details",
        "Service connection rules",
        "Public HTTPS address",
        "Application response verified by your agent",
      ],
    },
  ],
  network: [
    {
      id: "https",
      label: "Public HTTPS",
      detail:
        "A public address reaches the app. A configured route is followed by an application check.",
      note: "The public entry",
    },
    {
      id: "app",
      label: "App",
      detail:
        "The app accepts public traffic and can connect to the database on TCP port 5432.",
      note: "Your application",
    },
    {
      id: "db",
      label: "Database",
      detail:
        "Restricted ingress accepts the declared app connection. The database has no public publication in this example.",
      note: "Private to the app",
    },
  ],
  lifecycle: [
    {
      id: "connect",
      label: "Connect",
      title: "Pick up where you left off.",
      body: "Ask for the machine's SSH connection details and return to your existing files and tools.",
    },
    {
      id: "resize",
      label: "Resize",
      title: "Make room for the next step.",
      body: "Adjust CPU, memory or disk within your quota and available capacity. Changes can require stopping the machine.",
    },
    {
      id: "snapshot",
      label: "Snapshot",
      title: "Save the disk before a change.",
      body: "A snapshot gives you a disk rollback point. Rollback can briefly stop the machine; snapshots use a separate quota.",
    },
    {
      id: "delete",
      label: "Remove",
      title: "Finish with a clean desk.",
      body: "Delete an environment when you no longer need it. Resources are released after deletion completes.",
    },
  ],
  start: {
    title: "Bring your agent. Make some space.",
    body: "Carrel is currently available to eligible WinLab members. Connect an MCP client, sign in with your WinLab account, then start a new session.",
    endpoint: "https://carrel.winlab.tw/mcp",
    firstRequest: "Create a Debian development VM for my next project.",
    clients: [
      {
        name: "Claude Code",
        command:
          "claude mcp add --scope user --transport http carrel https://carrel.winlab.tw/mcp\nclaude mcp login carrel",
      },
      {
        name: "Codex",
        command:
          "codex mcp add carrel --url https://carrel.winlab.tw/mcp --oauth-client-registration dcr\ncodex mcp login carrel --oauth-client-registration dcr",
      },
    ],
  },
} as const
