'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else { router.push('/dashboard'); router.refresh() }
  }

  return (
    <div className="bg-bg-secondary border border-border-subtle rounded-xl p-8">
      <h1 className="text-lg font-medium text-text-primary mb-1">Welcome back</h1>
      <p className="text-text-muted text-sm mb-6">Sign in to your account</p>
      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm outline-none focus:border-accent-blue transition-colors"
            placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">Password</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
            className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm outline-none focus:border-accent-blue transition-colors"
            placeholder="••••••••" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-accent-blue hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="text-center text-text-muted text-sm mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-accent-blue hover:underline">Sign up free</Link>
      </p>
    </div>
  )
}
