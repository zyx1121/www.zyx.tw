export type Member = {
  id: number
  name: string
  email: string
}

export type Expense = {
  id: number
  member_id: number
  title: string
  amount: number
  settled: boolean
  created_at: string
  member?: Member
}

export type Debt = {
  from: string
  to: string
  amount: number
}
