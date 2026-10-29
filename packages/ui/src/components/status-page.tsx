import * as React from "react"

import { Command, Cursor } from "./shell"

// A page that only says what happened and the way out: not found, an error,
// no access, signed out. It reads as a shell session: the command that failed
// (`cd <RequestedPath />` for a 404), the title as its output, the way out,
// then an idle prompt. Put it in a spotlight page. The title says it all
// ("Not found"); the action is a verb ("Go home", "Retry") or a few links.
function StatusPage({
  title,
  command,
  action,
}: {
  title: string
  command?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div data-slot="status-page" className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        {command && <Command>{command}</Command>}
        <h1 className="text-title font-medium">{title}</h1>
      </div>
      {action}
      <Command>
        <Cursor />
      </Command>
    </div>
  )
}

export { StatusPage }
