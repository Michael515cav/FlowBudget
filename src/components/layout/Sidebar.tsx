'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, Target, BarChart2, User, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/budgets', label: 'Budgets', icon: Target },
  { href: '/reports', label: 'Reports', icon: BarChart2 },
  { href: '/account', label: 'Account', icon: User },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-52 bg-bg-secondary border-r border-border-subtle flex flex-col flex-shrink-0 min-h-screen">
      <div className="px-4 py-5 flex items-center gap-2">
        <div className="w-7 h-7 bg-accent-blue rounded-lg flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="white"><path d="M2 10 L8 4 L14 8 L14 14 L2 14 Z" /></svg>
        </div>
        <span className="text-base font-medium text-text-primary">FlowBudget</span>
      </div>
      <nav className="flex-1 pt-2">
        <p className="text-[10px] text-text-muted tracking-widest uppercase px-4 mb-2">Menu</p>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors border-l-2 ${active ? 'text-text-primary bg-bg-card border-accent-blue' : 'text-text-muted border-transparent hover:text-text-secondary hover:bg-bg-card/50'}`}>
              <Icon size={15} />{label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4">
        <button onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text-muted hover:text-accent-red transition-colors rounded-lg hover:bg-red-500/5">
          <LogOut size={14} />Sign out
        </button>
      </div>
    </aside>
  )
}
