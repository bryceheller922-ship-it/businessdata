'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Heart, Sparkles, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/components/ui/cn'
import { createClient } from '@/lib/supabase/browser'

const NAV = [
  { href: '/vote', label: 'Vote', icon: Sparkles },
  { href: '/inbox', label: 'Inbox', icon: Heart },
]

export function Navbar() {
  const pathname = usePathname()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-vouch-100 z-50">
      <div className="max-w-md mx-auto px-3 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex -space-x-1">
            {NAV.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                    active
                      ? 'bg-vouch-600 text-white shadow-lg'
                      : 'bg-vouch-50 text-vouch-600 hover:bg-vouch-100'
                  )}
                >
                  <Icon size={20} strokeWidth={2.2} />
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-vouch-600 rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={signOut} className="h-9 w-9 p-0">
              <LogOut size={16} strokeWidth={2} />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
