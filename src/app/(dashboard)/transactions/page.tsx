'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Transaction, formatCurrency, CATEGORIES, CATEGORY_COLORS } from '@/lib/calculations'
import AddTransactionModal from '@/components/ui/AddTransactionModal'
import AdSenseSlot from '@/components/ui/AdSenseSlot'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [filterCategory, setFilterCategory] = useState('all')

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.from('transactions').select('*').order('date', { ascending: false })
    setTransactions((data as Transaction[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleDelete(id: string) {
    if (!confirm('Delete this transaction?')) return
    const supabase = createClient()
    await supabase.from('transactions').delete().eq('id', id)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const filtered = transactions.filter(t => {
    const matchSearch = search === '' || (t.description?.toLowerCase().includes(search.toLowerCase())) || t.category.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || t.type === filterType
    const matchCategory = filterCategory === 'all' || t.category === filterCategory
    return matchSearch && matchType && matchCategory
  })

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="text-text-muted text-sm">Loading...</div></div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-text-primary">Transactions</h1>
          <p className="text-xs text-text-muted mt-0.5">{transactions.length} total transactions</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-accent-blue hover:bg-blue-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors">
          <Plus size={14} /> Add transaction
        </button>
      </div>
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-bg-secondary border border-border-subtle rounded-lg pl-8 pr-4 py-2 text-xs text-text-primary outline-none focus:border-accent-blue transition-colors" />
        </div>
        <div className="flex bg-bg-secondary border border-border-subtle rounded-lg overflow-hidden">
          {(['all', 'income', 'expense'] as const).map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-3 py-2 text-xs transition-colors ${filterType === t ? 'bg-accent-blue text-white' : 'text-text-muted hover:text-text-secondary'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="bg-bg-secondary border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-secondary outline-none focus:border-accent-blue">
          <option value="all">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="bg-bg-secondary border border-border-subtle rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="text-left text-xs text-text-muted font-medium px-4 py-3">Description</th>
              <th className="text-left text-xs text-text-muted font-medium px-4 py-3">Category</th>
              <th className="text-left text-xs text-text-muted font-medium px-4 py-3">Date</th>
              <th className="text-left text-xs text-text-muted font-medium px-4 py-3">Type</th>
              <th className="text-right text-xs text-text-muted font-medium px-4 py-3">Amount</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-text-muted text-sm py-12">{transactions.length === 0 ? 'No transactions yet. Add your first one!' : 'No results found.'}</td></tr>
            ) : filtered.map(txn => (
              <tr key={txn.id} className="border-b border-border-card last:border-0 hover:bg-bg-card/30 transition-colors">
                <td className="px-4 py-3"><span className="text-xs text-text-primary">{txn.description || '—'}</span></td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-1 rounded-md" style={{ background: (CATEGORY_COLORS[txn.category] || '#4a4f6a') + '22', color: CATEGORY_COLORS[txn.category] || '#9aa0bc' }}>
                    {txn.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-text-muted">{txn.date}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-md ${txn.type === 'income' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'}`}>{txn.type}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-xs font-medium ${txn.type === 'income' ? 'text-accent-green' : 'text-accent-red'}`}>
                    {txn.type === 'income' ? '+' : '-'}{formatCurrency(Number(txn.amount))}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(txn.id)} className="text-text-muted hover:text-accent-red transition-colors"><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AdSenseSlot slot="transactions-bottom" />
      {showModal && <AddTransactionModal onClose={() => setShowModal(false)} onSuccess={load} />}
    </div>
  )
}
