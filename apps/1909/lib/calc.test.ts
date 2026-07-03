import { describe, test, expect } from "bun:test"
import { calculateDebts } from "./calc"
import type { Member, Expense } from "./types"

const members: Member[] = [
  { id: 1, name: "A", email: "a@test.com" },
  { id: 2, name: "B", email: "b@test.com" },
  { id: 3, name: "C", email: "c@test.com" },
]

describe("calculateDebts", () => {
  test("no expenses = no debts", () => {
    expect(calculateDebts([], members)).toEqual([])
  })

  test("single expense split 3 ways", () => {
    const expenses: Pick<Expense, "member_id" | "amount">[] = [
      { member_id: 1, amount: 900 },
    ]
    const debts = calculateDebts(expenses, members)
    expect(debts).toEqual([
      { from: "B", to: "A", amount: 300 },
      { from: "C", to: "A", amount: 300 },
    ])
  })

  test("multiple expenses, net out", () => {
    const expenses: Pick<Expense, "member_id" | "amount">[] = [
      { member_id: 1, amount: 900 },
      { member_id: 2, amount: 900 },
      { member_id: 3, amount: 900 },
    ]
    const debts = calculateDebts(expenses, members)
    expect(debts).toEqual([])
  })

  test("two payers, one debtor", () => {
    const expenses: Pick<Expense, "member_id" | "amount">[] = [
      { member_id: 1, amount: 600 },
      { member_id: 2, amount: 300 },
    ]
    const debts = calculateDebts(expenses, members)
    expect(debts).toEqual([{ from: "C", to: "A", amount: 300 }])
  })

  test("handles non-divisible amounts with rounding", () => {
    const expenses: Pick<Expense, "member_id" | "amount">[] = [
      { member_id: 1, amount: 100 },
    ]
    const debts = calculateDebts(expenses, members)
    expect(debts[0].from).toBe("B")
    expect(debts[0].to).toBe("A")
    expect(debts[0].amount).toBe(33)
    expect(debts[1].from).toBe("C")
    expect(debts[1].to).toBe("A")
    expect(debts[1].amount).toBe(33)
  })
})
