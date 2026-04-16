'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, Trophy, User, Star } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Inicio',    icon: LayoutDashboard },
  { href: '/partidos',  label: 'Partidos',  icon: Calendar },
  { href: '/picks',     label: 'Picks',     icon: Star },
  { href: '/ranking',   label: 'Ranking',   icon: Trophy },
  { href: '/perfil',    label: 'Perfil',    icon: User },
]

export default function BottomNav() {
  const path = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 z-40 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${
                active ? 'text-red-600' : 'text-slate-400'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[10px] font-semibold ${active ? 'text-red-600' : 'text-slate-400'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
