'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, TrendingUp, TrendingDown, DollarSign, PiggyBank } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Transaction, Budget, getTotalIncome, getTotalExpenses, getNetSavings, getSavingsRate, getSpendingByCategory, getBudgetProgress, getMonthlyTrend, getTotalBudget, filterByPeriod, formatCurrency, CATEGORY_COLORS } from '@/lib/calculations'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import AddTransactionModal from '@/components/ui/AddTransactionModal'
import AdSenseSlot from '@/components/ui/AdSenseSlot'

type Period = 'weekly' | 'monthly' | 'yearly'

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [period, setPeriod] = useState<Period>('monthly')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const supabase = createClient()
    const [{ data: txns }, { data: buds }] = await Promise.all([
      supabase.from('transactions').select('*').order('date', { ascending: false }),
      supabase.from('budgets').select('*'),
    ])
    setTransactions((txns as Transaction[]) || [])
    setBudgets((buds as Budget[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = filterByPeriod(transactions, period)
  const income = getTotalIncome(filtered)
  const expenses = getTotalExpenses(filtered)
  const savings = getNetSavings(filtered)
  const savingsRate = getSavingsRate(filtered)
  const totalBudget = getTotalBudget(budgets, period)
  const remaining = Math.max(totalBudget - expenses, 0)
  const budgetPct = totalBudget > 0 ? Math.min(Math.round((expenses / totalBudget) * 100), 100) : 0
  const spendingByCategory = getSpendingByCategory(filtered)
  const budgetProgress = getBudgetProgress(transactions, budgets, period)
  const trend = getMonthlyTrend(transactions, 6)
  const recent = [...transactions].slice(0, 5)

  const stats = [
    { label: 'Total income', value: formatCurrency(income), sub: `${period} total`, icon: TrendingUp, color: 'text-accent-green' },
    { label: 'Total spending', value: formatCurrency(expenses), sub: `${period} total`, icon: TrendingDown, color: 'text-accent-red' },
    { label: 'Net savings', value: formatCurrency(savings), sub: `${savingsRate}% savings rate`, icon: PiggyBank, color: savings >= 0 ? 'text-accent-green' : 'text-accent-red' },
    { label: 'Budget remaining', value: totalBudget > 0 ? formatCurrency(remaining) : 'No budget set', sub: totalBudget > 0 ? `${budgetPct}% used` : 'Set one in Budgets', icon: DollarSign, color: 'text-accent-orange' },
  ]

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="text-text-muted text-sm">Loading...</div></div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-text-primary">Dashboard</h1>
          <p className="text-xs text-text-muted mt-0.5">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-bg-secondary border border-border-subtle rounded-lg overflow-hidden">
            {(['weekly', 'monthly', 'yearly'] as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs transition-colors ${period === p ? 'bg-accent-blue text-white' : 'text-text-muted hover:text-text-secondary'}`}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-accent-blue hover:bg-blue-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors">
            <Plus size={14} /> Add transaction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {stats.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-bg-secondary border border-border-subtle rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-text-muted">{label}</p>
              <Icon size={14} className={color} />
            </div>
            <p className={`text-xl font-medium ${color}`}>{value}</p>
            <p className="text-xs text-text-muted mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-bg-secondary border border-border-subtle rounded-xl p-4">
          <p className="text-sm font-medium text-text-secondary mb-1">Spending trend</p>
          <p className="text-xs text-text-muted mb-4">Last 6 months</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={trend} barSize={10} barGap={3}>
              <XAxis dataKey="label" tick={{ fill: '#4a4f6a', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4a4f6a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#13161f', border: '1px solid #2a2d3a', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#9aa0bc' }} formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="income" fill="#3b6ef5" opacity={0.7} radius={[3, 3, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="#3fd48a" opacity={0.7} radius={[3, 3, 0, 0]} name="Spending" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-bg-secondary border border-border-subtle rounded-xl p-4">
          <p className="text-sm font-medium text-text-secondary mb-4">Spending by category</p>
          {spendingByCategory.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-text-muted text-sm">No spending data yet</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={spendingByCategory} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="amount" paddingAngle={2}>
                    {spendingByCategory.map((entry, i) => <Cell key={i} fill={CATEGORY_COLORS[entry.category] || '#4a4f6a'} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#13161f', border: '1px solid #2a2d3a', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5 overflow-hidden">
                {spendingByCategory.slice(0, 5).map(({ category, amount }) => (
                  <div key={category} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: CATEGORY_COLORS[category] || '#4a4f6a' }} />
                    <span className="text-text-muted truncate flex-1">{category}</span>
                    <span className="text-text-secondary flex-shrink-0">{formatCurrency(amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-bg-secondary border border-border-subtle rounded-xl p-4">
          <p className="text-sm font-medium text-text-secondary mb-4">Budget progress</p>
          {budgetProgress.length === 0 ? (
            <div className="text-text-muted text-sm text-center py-6">No budgets set. <a href="/budgets" className="text-accent-blue hover:underline">Add one</a></div>
          ) : (
            <div className="space-y-3">
              {budgetProgress.map(({ category, spent, amount, pct }) => (
                <div key={category}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-text-secondary">{category}</span>
                    <span className="text-xs text-text-muted">{formatCurrency(spent)} / {formatCurrency(amount)}</span>
                  </div>
                  <div className="h-1.5 bg-bg-card rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 100 ? '#f05a5a' : pct >= 80 ? '#f5a623' : '#3fd48a' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-bg-secondary border border-border-subtle rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-text-secondary">Recent transactions</p>
            <a href="/transactions" className="text-xs text-accent-blue hover:underline">View all</a>
          </div>
          {recent.length === 0 ? (
            <div className="text-text-muted text-sm text-center py-6">No transactions yet</div>
          ) : (
            <div className="space-y-1">
              {recent.map(txn => (
                <div key={txn.id} className="flex items-center gap-3 py-2 border-b border-border-card last:border-0">
                  <div className="w-7 h-7 rounded-lg bg-bg-card flex items-center justify-center flex-shrink-0 text-xs">
                    {txn.type === 'income' ? '💰' : '💸'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-primary truncate">{txn.description || txn.category}</p>
                    <p className="text-[10px] text-text-muted">{txn.date} · {txn.category}</p>
                  </div>
                  <span className={`text-xs font-medium flex-shrink-0 ${txn.type === 'income' ? 'text-accent-green' : 'text-accent-red'}`}>
                    {txn.type === 'income' ? '+' : '-'}{formatCurrency(Number(txn.amount))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AdSenseSlot slot="dashboard-bottom" />
      {showModal && <AddTransactionModal onClose={() => setShowModal(false)} onSuccess={load} />}
    </div>
  )
}
