import * as React from "react"

import { Button } from "./ui/button"
import { TableCell, TableRow } from "./ui/table"

type EmptyStateProps = {
  /** What the list holds, plural: "receipts", "projects". The sentence is
   * built from it, so every app says it the same way. */
  noun: string
  /** The search that found nothing. Without it the list is simply empty. */
  query?: string
  /** Shown with a query: a button that clears it. */
  onClearQuery?: () => void
  /** Shown without a query: the action that adds the first one. */
  action?: React.ReactNode
}

function emptyText(noun: string, query?: string) {
  return query ? `No ${noun} match “${query}”` : `No ${noun} yet`
}

// What a list shows when it has no rows: "No receipts yet" when there is
// nothing yet, "No receipts match “…”" when a search came up empty.
function EmptyState({ noun, query, onClearQuery, action }: EmptyStateProps) {
  const next = query
    ? onClearQuery && (
        <Button key="clear" variant="outline" onClick={onClearQuery}>
          Clear search
        </Button>
      )
    : action

  return (
    <div
      data-slot="empty-state"
      className="flex flex-col items-center gap-5 py-10 text-center"
    >
      <p className="text-muted-foreground">{emptyText(noun, query)}</p>
      {next}
    </div>
  )
}

type TableEmptyProps = Pick<EmptyStateProps, "noun" | "query"> & {
  /** The table's column count. */
  colSpan: number
}

// The same sentence as one row spanning a table, under its header.
function TableEmpty({ noun, query, colSpan }: TableEmptyProps) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell
        colSpan={colSpan}
        className="py-10 text-center text-muted-foreground"
      >
        {emptyText(noun, query)}
      </TableCell>
    </TableRow>
  )
}

export { EmptyState, TableEmpty }
