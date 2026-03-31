'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { User } from 'lucide-react'

export default function AccountPage() {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email || '')
      const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
      setFullName(data?.full_name || '')
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setMessage('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id)
    setMessage('Profile updated!')
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="text-text-muted text-sm">Loading...</div></div>

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-lg font-medium text-text-primary mb-1">Account</h1>
      <p className="text-xs text-text-muted mb-6">Manage your profile settings</p>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-accent-blue/20 flex items-center justify-center">
          <User size={24} className="text-accent-blue" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">{fullName || 'No name set'}</p>
          <p className="text-xs text-text-muted">{email}</p>
        </div>
      </div>
      <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5">
        {message && <div className="bg-accent-green/10 border border-accent-green/20 text-accent-green text-sm rounded-lg px-4 py-3 mb-4">{message}</div>}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Full name</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm outline-none focus:border-accent-blue transition-colors" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Email</label>
            <input type="email" value={email} disabled
              className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-muted text-sm outline-none cursor-not-allowed" />
            <p className="text-xs text-text-muted mt-1">Email cannot be changed</p>
          </div>
          <button type="submit" disabled={saving}
            className="bg-accent-blue hover:bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
