import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ClipboardList, Users, LayoutDashboard } from 'lucide-react'

const NAV = [
  { href: '/admin',          label: 'Resumen',    icon: LayoutDashboard },
  { href: '/admin/resultados', label: 'Resultados', icon: ClipboardList },
  { href: '/admin/usuarios', label: 'Usuarios',   icon: Users },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin topbar */}
      <header className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-black">⚽ Admin</span>
          <span className="text-slate-500 text-sm">Quiniela Mundial 2026</span>
        </div>
        <Link href="/dashboard" className="text-xs text-slate-400 hover:text-white transition-colors">
          ← Volver a la app
        </Link>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-52 min-h-[calc(100vh-48px)] bg-white border-r border-slate-100 p-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 p-6 max-w-4xl">
          {children}
        </main>
      </div>
    </div>
  )
}
