'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Budget, Transaction, getBudgetProgress, formatCurrency, CATEGORIES } from '@/lib/calculations'
import AdSenseSlot from '@/components/ui/AdSenseSlot'

type Period = 'weekly' | 'monthly' | 'yearly'

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [period, setPeriod] = useState<Period>('monthly')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [category, setCategory] = useState(CATEGORIES[0])
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const supabase = createClient()
    const [{ data: buds }, { data: txns }] = await Promise.all([
      supabase.from('budgets').select('*'),
      supabase.from('transactions').select('*'),
    ])
    setBudgets((buds as Budget[]) || [])
    setTransactions((txns as Transaction[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('budgets').upsert({ user_id: user.id, category, amount: parseFloat(amount), period }, { onConflict: 'user_id,category,period' })
    if (error) { setError(error.message); setSaving(false); return }
    setShowForm(false); setAmount(''); load(); setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this budget?')) return
    const supabase = createClient()
    await supabase.from('budgets').delete().eq('id', id)
    setBudgets(prev => prev.filter(b => b.id !== id))
  }

  const progress = getBudgetProgress(transactions, budgets, period)
  const periodBudgets = budgets.filter(b => b.period === period)
  const totalBudget = periodBudgets.reduce((s, b) => s + Number(b.amount), 0)
  const totalSpent = progress.reduce((s, b) => s + b.spent, 0)

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="text-text-muted text-sm">Loading...</div></div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-text-primary">Budgets</h1>
          <p className="text-xs text-text-muted mt-0.5">Set spending limits per category</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-bg-secondary border border-border-subtle rounded-lg overflow-hidden">
            {(['weekly', 'monthly', 'yearly'] as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs transition-colors ${period === p ? 'bg-accent-blue text-white' : 'text-text-muted hover:text-text-secondary'}`}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-accent-blue hover:bg-blue-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors">
            <Plus size={14} /> Add budget
          </button>
        </div>
      </div>

      {totalBudget > 0 && (
        <div className="bg-bg-secondary border border-border-subtle rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div><p className="text-xs text-text-muted">Total {period} budget</p><p className="text-xl font-medium text-text-primary mt-0.5">{formatCurrency(totalBudget)}</p></div>
            <div className="text-right"><p className="text-xs text-text-muted">Spent so far</p><p className="text-xl font-medium text-accent-red mt-0.5">{formatCurrency(totalSpent)}</p></div>
            <div className="text-right"><p className="text-xs text-text-muted">Remaining</p><p className="text-xl font-medium text-accent-green mt-0.5">{formatCurrency(Math.max(totalBudget - totalSpent, 0))}</p></div>
          </div>
          <div className="h-2 bg-bg-card rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(Math.round((totalSpent / totalBudget) * 100), 100)}%`, background: totalSpent > totalBudget ? '#f05a5a' : totalSpent / totalBudget > 0.8 ? '#f5a623' : '#3fd48a' }} />
          </div>
          <p className="text-xs text-text-muted mt-1.5">{Math.min(Math.round((totalSpent / totalBudget) * 100), 100)}% of budget used</p>
        </div>
      )}

      {periodBudgets.length === 0 ? (
        <div className="bg-bg-secondary border border-dashed border-border-subtle rounded-xl p-12 text-center">
          <p className="text-text-muted text-sm mb-2">No {period} budgets yet</p>
          <p className="text-text-muted text-xs mb-4">Set a spending limit for each category to start tracking</p>
          <button onClick={() => setShowForm(true)} className="text-accent-blue text-xs hover:underline">+ Add your first budget</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {progress.map(({ id, category: cat, amount: amt, spent, pct, remaining }) => (
            <div key={id} className="bg-bg-secondary border border-border-subtle rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-text-primary">{cat}</p>
                <button onClick={() => handleDelete(id)} className="text-text-muted hover:text-accent-red transition-colors"><Trash2 size={13} /></button>
              </div>
              <div className="flex items-end justify-between mb-2">
                <div><p className="text-xs text-text-muted">Spent</p><p className="text-base font-medium text-accent-red">{formatCurrency(spent)}</p></div>
                <div className="text-right"><p className="text-xs text-text-muted">Budget</p><p className="text-base font-medium text-text-secondary">{formatCurrency(amt)}</p></div>
              </div>
              <div className="h-1.5 bg-bg-card rounded-full overflow-hidden mb-1.5">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 100 ? '#f05a5a' : pct >= 80 ? '#f5a623' : '#3fd48a' }} />
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] text-text-muted">{pct}% used</span>
                <span className="text-[10px] text-accent-green">{formatCurrency(remaining)} left</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdSenseSlot slot="budgets-bottom" />

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-bg-secondary border border-border-subtle rounded-xl w-full max-w-sm p-6">
            <h2 className="text-base font-medium text-text-primary mb-5">Add {period} budget</h2>
            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm outline-none focus:border-accent-blue">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Budget amount ($)</label>
                <input type="number" required min="1" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
                  className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm outline-none focus:border-accent-blue" placeholder="0.00" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-lg border border-border-subtle text-text-muted text-sm hover:text-text-secondary transition-colors">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-lg bg-accent-blue text-white text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
