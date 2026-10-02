import { T } from "@workspace/ui/components/locale-provider"
import { Card, CardContent } from "@/components/ui/card"
import type { Debt } from "@/lib/types"

export function BalanceSummary({ debts }: { debts: Debt[] }) {
  if (debts.length === 0) {
    return (
      <Card>
        <CardContent className="py-4 text-center text-sm text-muted-foreground">
          <T>{"目前沒有未核銷的欠款"}</T>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-2">
      {debts.map((debt, i) => (
        <Card key={i}>
          <CardContent className="flex items-center justify-between px-4 py-2">
            <span className="text-sm">
              <span className="font-medium">{debt.from}</span>
              <T>{" 欠 "}</T>
              <span className="font-medium">{debt.to}</span>
            </span>
            <span className="font-medium tabular-nums">
              ${debt.amount.toLocaleString()}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
