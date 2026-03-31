'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { CATEGORIES } from '@/lib/calculations'

type Props = { onClose: () => void; onSuccess: () => void }

export default function AddTransactionModal({ onClose, onSuccess }: Props) {
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setLoading(false); return }
    const { error } = await supabase.from('transactions').insert({
      user_id: user.id, type, amount: parseFloat(amount), category, description: description || null, date,
    })
    if (error) { setError(error.message); setLoading(false) } else { onSuccess(); onClose() }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-bg-secondary border border-border-subtle rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-medium text-text-primary">Add transaction</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-secondary"><X size={18} /></button>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            {(['expense', 'income'] as const).map(t => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === t ? t === 'expense' ? 'bg-accent-red/20 text-accent-red border border-accent-red/30' : 'bg-accent-green/20 text-accent-green border border-accent-green/30' : 'bg-bg-primary border border-border-subtle text-text-muted hover:text-text-secondary'}`}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Amount ($)</label>
            <input type="number" required min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm outline-none focus:border-accent-blue transition-colors" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm outline-none focus:border-accent-blue transition-colors">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Description <span className="text-text-muted">(optional)</span></label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)}
              className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm outline-none focus:border-accent-blue transition-colors" placeholder="e.g. Walmart grocery run" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Date</label>
            <input type="date" required value={date} onChange={e => setDate(e.target.value)}
              className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm outline-none focus:border-accent-blue transition-colors" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-border-subtle text-text-muted text-sm hover:text-text-secondary transition-colors">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-accent-blue text-white text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : 'Add transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
