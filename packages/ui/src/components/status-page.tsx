import * as React from "react"

// A page that only says what happened and the way out: not found, an error,
// no access, signed out. Put it in a spotlight page. The title says it all
// ("Not found"); the action is a verb ("Go home", "Retry") or a few links.
function StatusPage({
  title,
  action,
}: {
  title: string
  action?: React.ReactNode
}) {
  return (
    <div
      data-slot="status-page"
      className="flex flex-col items-center gap-10 text-center"
    >
      <h1 className="text-title font-medium">{title}</h1>
      {action}
    </div>
  )
}

export { StatusPage }
