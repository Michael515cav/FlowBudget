'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Transaction, getMonthlyTrend, getSpendingByCategory, getTotalIncome, getTotalExpenses, getNetSavings, getSavingsRate, filterByPeriod, formatCurrency, CATEGORY_COLORS } from '@/lib/calculations'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts'
import AdSenseSlot from '@/components/ui/AdSenseSlot'

type Period = 'weekly' | 'monthly' | 'yearly'

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('monthly')

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.from('transactions').select('*').order('date', { ascending: true })
    setTransactions((data as Transaction[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = filterByPeriod(transactions, period)
  const income = getTotalIncome(filtered)
  const expenses = getTotalExpenses(filtered)
  const savings = getNetSavings(filtered)
  const savingsRate = getSavingsRate(filtered)
  const trend = getMonthlyTrend(transactions, 6)
  const byCategory = getSpendingByCategory(filtered)
  const savingsTrend = trend.map(m => ({ ...m, savings: m.income - m.expenses }))

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="text-text-muted text-sm">Loading...</div></div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-text-primary">Reports</h1>
          <p className="text-xs text-text-muted mt-0.5">Visualize your spending trends</p>
        </div>
        <div className="flex bg-bg-secondary border border-border-subtle rounded-lg overflow-hidden">
          {(['weekly', 'monthly', 'yearly'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs transition-colors ${period === p ? 'bg-accent-blue text-white' : 'text-text-muted hover:text-text-secondary'}`}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Income', value: formatCurrency(income), color: 'text-accent-green' },
          { label: 'Expenses', value: formatCurrency(expenses), color: 'text-accent-red' },
          { label: 'Net savings', value: formatCurrency(savings), color: savings >= 0 ? 'text-accent-green' : 'text-accent-red' },
          { label: 'Savings rate', value: `${savingsRate}%`, color: savingsRate >= 20 ? 'text-accent-green' : savingsRate >= 10 ? 'text-accent-orange' : 'text-accent-red' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-bg-secondary border border-border-subtle rounded-xl p-4">
            <p className="text-xs text-text-muted mb-1">{label}</p>
            <p className={`text-xl font-medium ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-bg-secondary border border-border-subtle rounded-xl p-4 mb-4">
        <p className="text-sm font-medium text-text-secondary mb-1">Income vs Spending</p>
        <p className="text-xs text-text-muted mb-4">Last 6 months</p>
        <div className="flex gap-4 mb-3">
          <span className="flex items-center gap-1.5 text-xs text-text-muted"><span className="w-2 h-2 rounded-sm bg-[#3b6ef5] opacity-70 inline-block" />&nbsp;Income</span>
          <span className="flex items-center gap-1.5 text-xs text-text-muted"><span className="w-2 h-2 rounded-sm bg-[#f05a5a] opacity-70 inline-block" />&nbsp;Spending</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={trend} barSize={14} barGap={4}>
            <CartesianGrid stroke="#1e2136" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#4a4f6a', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#4a4f6a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: '#13161f', border: '1px solid #2a2d3a', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#9aa0bc' }} formatter={(v: number) => formatCurrency(v)} />
            <Bar dataKey="income" fill="#3b6ef5" opacity={0.7} radius={[3, 3, 0, 0]} name="Income" />
            <Bar dataKey="expenses" fill="#f05a5a" opacity={0.7} radius={[3, 3, 0, 0]} name="Spending" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-bg-secondary border border-border-subtle rounded-xl p-4">
          <p className="text-sm font-medium text-text-secondary mb-1">Savings trend</p>
          <p className="text-xs text-text-muted mb-4">Monthly net savings</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={savingsTrend}>
              <CartesianGrid stroke="#1e2136" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#4a4f6a', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4a4f6a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#13161f', border: '1px solid #2a2d3a', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#9aa0bc' }} formatter={(v: number) => formatCurrency(v)} />
              <Line type="monotone" dataKey="savings" stroke="#3fd48a" strokeWidth={2} dot={{ fill: '#3fd48a', r: 3 }} name="Savings" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-bg-secondary border border-border-subtle rounded-xl p-4">
          <p className="text-sm font-medium text-text-secondary mb-4">Category breakdown</p>
          {byCategory.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-text-muted text-sm">No spending data</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={byCategory} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="amount" paddingAngle={2}>
                    {byCategory.map((entry, i) => <Cell key={i} fill={CATEGORY_COLORS[entry.category] || '#4a4f6a'} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#13161f', border: '1px solid #2a2d3a', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5 overflow-hidden">
                {byCategory.map(({ category, amount }) => {
                  const pct = expenses > 0 ? Math.round((amount / expenses) * 100) : 0
                  return (
                    <div key={category} className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: CATEGORY_COLORS[category] || '#4a4f6a' }} />
                      <span className="text-text-muted truncate flex-1">{category}</span>
                      <span className="text-text-muted">{pct}%</span>
                      <span className="text-text-secondary flex-shrink-0">{formatCurrency(amount)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <AdSenseSlot slot="reports-bottom" />
    </div>
  )
}
