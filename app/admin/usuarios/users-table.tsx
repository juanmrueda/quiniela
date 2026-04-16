'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Shield, User, Zap, Loader2 } from 'lucide-react'

type Profile = {
  id: string
  full_name: string | null
  email: string
  company: string | null
  role: 'user' | 'admin' | 'super_admin'
  created_at: string
}

const ROLE_CONFIG = {
  user:        { label: 'Usuario',     icon: User,   color: 'slate' },
  admin:       { label: 'Admin',       icon: Shield, color: 'blue'  },
  super_admin: { label: 'Super Admin', icon: Zap,    color: 'red'   },
}

function RoleSelect({ userId, current }: { userId: string; current: Profile['role'] }) {
  const [role, setRole] = useState(current)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  async function handleChange(newRole: Profile['role']) {
    setRole(newRole)
    setSaved(false)
    startTransition(async () => {
      const supabase = createClient()
      await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  const cfg = ROLE_CONFIG[role]

  return (
    <div className="flex items-center gap-2">
      <select
        value={role}
        onChange={e => handleChange(e.target.value as Profile['role'])}
        disabled={isPending}
        className="text-xs font-semibold rounded-lg border border-slate-200 bg-white px-2 py-1.5 outline-none focus:border-slate-400 disabled:opacity-60"
      >
        <option value="user">Usuario</option>
        <option value="admin">Admin</option>
        <option value="super_admin">Super Admin</option>
      </select>
      {isPending && <Loader2 size={12} className="animate-spin text-slate-400" />}
      {saved && <span className="text-xs text-emerald-600 font-semibold">✓</span>}
    </div>
  )
}

export default function UsersTable({ users }: { users: Profile[] }) {
  const [search, setSearch] = useState('')

  const filtered = users.filter(u =>
    (u.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.company ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const byRole = (r: string) => users.filter(u => u.role === r).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900">Usuarios</h1>
        <div className="flex gap-3 text-sm text-slate-500">
          <span><strong className="text-slate-900">{byRole('user')}</strong> usuarios</span>
          <span><strong className="text-slate-900">{byRole('admin')}</strong> admins</span>
        </div>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Buscar por nombre, email o empresa..."
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-slate-400 text-sm"
      />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Nombre</span>
          <span>Email</span>
          <span>Empresa</span>
          <span>Rol</span>
        </div>
        <div className="divide-y divide-slate-50">
          {filtered.map(u => (
            <div key={u.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 px-5 py-3.5 items-center">
              <p className="text-sm font-semibold text-slate-900 truncate">{u.full_name ?? '—'}</p>
              <p className="text-sm text-slate-500 truncate">{u.email}</p>
              <p className="text-sm text-slate-400 truncate">{u.company ?? '—'}</p>
              <RoleSelect userId={u.id} current={u.role} />
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-5 py-10 text-center">
              <p className="text-slate-400 text-sm">Sin resultados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
