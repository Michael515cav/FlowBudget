export type Transaction = {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string | null
  date: string
}

export type Budget = {
  id: string
  category: string
  amount: number
  period: 'weekly' | 'monthly' | 'yearly'
}

export const CATEGORIES = [
  'Housing', 'Food & Dining', 'Transport', 'Subscriptions',
  'Entertainment', 'Healthcare', 'Clothing', 'Education',
  'Savings', 'Utilities', 'Other'
]

export const CATEGORY_COLORS: Record<string, string> = {
  'Housing': '#3b6ef5',
  'Food & Dining': '#3fd48a',
  'Transport': '#f5a623',
  'Subscriptions': '#8b5cf6',
  'Entertainment': '#f05a5a',
  'Healthcare': '#06b6d4',
  'Clothing': '#ec4899',
  'Education': '#14b8a6',
  'Savings': '#22c55e',
  'Utilities': '#f97316',
  'Other': '#4a4f6a',
}

export function getTotalIncome(transactions: Transaction[]) {
  return transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0)
}

export function getTotalExpenses(transactions: Transaction[]) {
  return transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0)
}

export function getNetSavings(transactions: Transaction[]) {
  return getTotalIncome(transactions) - getTotalExpenses(transactions)
}

export function getSavingsRate(transactions: Transaction[]) {
  const income = getTotalIncome(transactions)
  if (income === 0) return 0
  return Math.round((getNetSavings(transactions) / income) * 100)
}

export function getSpendingByCategory(transactions: Transaction[]) {
  const expenses = transactions.filter(t => t.type === 'expense')
  const map: Record<string, number> = {}
  expenses.forEach(t => { map[t.category] = (map[t.category] || 0) + Number(t.amount) })
  return Object.entries(map).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount)
}

export function getBudgetProgress(transactions: Transaction[], budgets: Budget[], period: 'weekly' | 'monthly' | 'yearly') {
  const filtered = filterByPeriod(transactions, period)
  const spending = getSpendingByCategory(filtered)
  return budgets.filter(b => b.period === period).map(budget => {
    const spent = spending.find(s => s.category === budget.category)?.amount || 0
    const pct = Math.min(Math.round((spent / budget.amount) * 100), 100)
    const remaining = Math.max(budget.amount - spent, 0)
    return { ...budget, spent, pct, remaining }
  })
}

export function getMonthlyTrend(transactions: Transaction[], months = 6) {
  const result = []
  const now = new Date()
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = d.toLocaleString('default', { month: 'short' })
    const monthTxns = transactions.filter(t => {
      const td = new Date(t.date)
      return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear()
    })
    result.push({ label, income: getTotalIncome(monthTxns), expenses: getTotalExpenses(monthTxns) })
  }
  return result
}

export function getTotalBudget(budgets: Budget[], period: 'weekly' | 'monthly' | 'yearly') {
  return budgets.filter(b => b.period === period).reduce((sum, b) => sum + Number(b.amount), 0)
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function filterByPeriod(transactions: Transaction[], period: 'weekly' | 'monthly' | 'yearly') {
  const now = new Date()
  return transactions.filter(t => {
    const d = new Date(t.date)
    if (period === 'weekly') {
      const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7); return d >= weekAgo
    }
    if (period === 'monthly') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    return d.getFullYear() === now.getFullYear()
  })
}
