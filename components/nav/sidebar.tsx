'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, Trophy, User, Star } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Inicio',      icon: LayoutDashboard },
  { href: '/partidos',  label: 'Partidos',    icon: Calendar },
  { href: '/picks',     label: 'Pronósticos', icon: Star },
  { href: '/ranking',   label: 'Ranking',     icon: Trophy },
  { href: '/perfil',    label: 'Mi Perfil',   icon: User },
]

type Profile = { full_name: string | null; avatar_url: string | null; company: string | null } | null

export default function Sidebar({ profile }: { profile: Profile }) {
  const path = usePathname()

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-60 bg-white border-r border-slate-100 z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white text-lg font-black shadow-sm">
            ⚽
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 leading-none">Quiniela</p>
            <p className="text-xs text-slate-400 mt-0.5">FIFA 2026</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-red-50 text-red-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Profile */}
      {profile && (
        <div className="px-4 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                {profile.full_name?.[0] ?? '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{profile.full_name ?? 'Usuario'}</p>
              <p className="text-xs text-slate-400 truncate">{profile.company}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
