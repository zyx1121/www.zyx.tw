import type { Member, Debt } from "./types"

export function calculateDebts(
  expenses: Pick<
    { member_id: number; amount: number },
    "member_id" | "amount"
  >[],
  members: Member[]
): Debt[] {
  if (expenses.length === 0) return []

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const share = total / members.length

  const nets = members
    .map((m) => {
      const paid = expenses
        .filter((e) => e.member_id === m.id)
        .reduce((sum, e) => sum + e.amount, 0)
      return { name: m.name, net: paid - share }
    })
    .filter((n) => Math.abs(n.net) >= 1)

  const debtors = nets.filter((n) => n.net < 0).sort((a, b) => a.net - b.net)
  const creditors = nets.filter((n) => n.net > 0).sort((a, b) => b.net - a.net)

  const debts: Debt[] = []
  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(-debtors[i].net, creditors[j].net)
    if (Math.round(amount) > 0) {
      debts.push({
        from: debtors[i].name,
        to: creditors[j].name,
        amount: Math.round(amount),
      })
    }
    debtors[i].net += amount
    creditors[j].net -= amount
    if (Math.abs(debtors[i].net) < 1) i++
    if (Math.abs(creditors[j].net) < 1) j++
  }

  return debts
}
