'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
    if (error) { setError(error.message); setLoading(false) } else { setSuccess(true) }
  }

  if (success) return (
    <div className="bg-bg-secondary border border-border-subtle rounded-xl p-8 text-center">
      <div className="w-12 h-12 bg-accent-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3fd48a" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
      </div>
      <h2 className="text-lg font-medium text-text-primary mb-2">Check your email</h2>
      <p className="text-text-muted text-sm">We sent a confirmation link to <strong className="text-text-secondary">{email}</strong></p>
      <Link href="/login" className="inline-block mt-6 text-accent-blue text-sm hover:underline">Back to login</Link>
    </div>
  )

  return (
    <div className="bg-bg-secondary border border-border-subtle rounded-xl p-8">
      <h1 className="text-lg font-medium text-text-primary mb-1">Create your account</h1>
      <p className="text-text-muted text-sm mb-6">Start tracking your finances for free</p>
      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">Full name</label>
          <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
            className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm outline-none focus:border-accent-blue transition-colors"
            placeholder="John Smith" />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm outline-none focus:border-accent-blue transition-colors"
            placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">Password</label>
          <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
            className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm outline-none focus:border-accent-blue transition-colors"
            placeholder="Min. 6 characters" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-accent-blue hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50">
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="text-center text-text-muted text-sm mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-accent-blue hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
