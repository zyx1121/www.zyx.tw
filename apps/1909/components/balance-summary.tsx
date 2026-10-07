import type { Debt } from "@/lib/types"

// Page layer: one row per debt, separated by hairlines, no card around them.
export function BalanceSummary({ debts }: { debts: Debt[] }) {
  if (debts.length === 0) {
    return <p className="text-muted-foreground">目前沒有未核銷的欠款</p>
  }

  return (
    <ul className="flex flex-col">
      {debts.map((debt, i) => (
        <li
          key={i}
          className="flex items-center justify-between border-b py-3 first:border-t"
        >
          <span>
            <span className="font-medium">{debt.from}</span>
            {" 欠 "}
            <span className="font-medium">{debt.to}</span>
          </span>
          <span className="font-medium tabular-nums">
            ${debt.amount.toLocaleString()}
          </span>
        </li>
      ))}
    </ul>
  )
}
