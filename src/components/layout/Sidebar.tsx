'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { SafetyBanner } from '@/components/shared/SafetyBanner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Home, MessageCircle, BookHeart, Wind, Settings, LogOut } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/chat', label: 'Chat', icon: MessageCircle },
  { href: '/dashboard/journal', label: 'Journal', icon: BookHeart },
  { href: '/dashboard/exercises', label: 'Exercises', icon: Wind },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] min-h-screen bg-slate-50/50 backdrop-blur-xl border-r border-slate-200/60 shadow-sm z-40">
        <div className="px-8 py-8 border-b border-slate-100/50 flex items-center gap-3">
          <span className="text-3xl">🌸</span>
          <span className="text-2xl font-extrabold text-slate-800 tracking-tight">Bloom</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 group',
                  active
                    ? 'bg-white text-emerald-700 shadow-sm border border-slate-100 shadow-emerald-900/5'
                    : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-800'
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-transform duration-200 group-hover:scale-110", active ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600")} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl px-4 py-5 font-medium"
          >
            <LogOut className="w-5 h-5 mr-3 opacity-70" />
            Sign out
          </Button>
        </div>

        <div className="p-4 pt-0">
          <SafetyBanner />
        </div>
      </aside>

      {/* Mobile top header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 h-16 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌸</span>
          <span className="text-lg font-bold text-slate-800">Bloom</span>
        </div>
        <button
          onClick={handleSignOut}
          className="text-sm font-medium text-slate-500 hover:text-rose-600 transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200 flex justify-around pb-2 pt-2">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-1 px-1 text-[10px] font-semibold transition-colors',
                active
                  ? 'text-emerald-700'
                  : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <div className={cn(
                "p-1.5 rounded-full transition-all",
                active ? "bg-emerald-100 text-emerald-700" : "bg-transparent text-slate-400"
              )}>
                <item.icon className="w-5 h-5" />
              </div>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
