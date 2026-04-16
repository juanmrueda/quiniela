import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Trophy, Target, Zap } from 'lucide-react'
import LogoutButton from './logout-button'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: stats }, { data: predictions }] = await Promise.all([
    supabase.from('profiles').select('full_name, avatar_url, company, role').eq('id', user.id).single(),
    supabase.from('leaderboard').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('predictions').select('points_earned').eq('user_id', user.id),
  ])

  const [{ data: leaderboard }, { count: totalUsers }] = await Promise.all([
    supabase.from('leaderboard').select('user_id').order('total_points', { ascending: false }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
  ])

  const rank = (leaderboard?.findIndex(r => r.user_id === user.id) ?? -1) + 1
  const total = totalUsers ?? 0
  const exactPreds = (predictions ?? []).filter(p => p.points_earned === 5).length
  const totalPreds = (predictions ?? []).filter(p => p.points_earned != null).length

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-slate-900">Mi perfil</h1>

      {/* Avatar + name card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-4">
          {profile?.avatar_url
            ? <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-full border-2 border-white shadow-sm flex-shrink-0" />
            : <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-black text-slate-400 flex-shrink-0">
                {profile?.full_name?.[0] ?? '?'}
              </div>
          }
          <div>
            <h2 className="text-lg font-black text-slate-900">{profile?.full_name ?? 'Jugador'}</h2>
            <p className="text-sm text-slate-400">{user.email}</p>
            <p className="text-xs text-slate-400 mt-0.5">{profile?.company}</p>
          </div>
        </div>

        {profile?.role === 'admin' || profile?.role === 'super_admin' ? (
          <div className="mt-4 bg-red-50 rounded-xl px-3 py-2 inline-flex items-center gap-1.5">
            <Zap size={12} className="text-red-500" />
            <span className="text-xs font-bold text-red-700">
              {profile.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </span>
          </div>
        ) : null}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
          <p className="text-xl font-black text-slate-900">{rank > 0 ? `#${rank}` : '--'}</p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-semibold leading-tight">Posición<br/>de {total}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
          <p className="text-xl font-black text-amber-500">{stats?.total_points ?? 0}</p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-semibold leading-tight">Puntos<br/>totales</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
          <p className="text-xl font-black text-emerald-500">{exactPreds}</p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-semibold leading-tight">Exactos<br/>(+5 pts)</p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Desglose de puntos</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">Fase de grupos</p>
            <span className="text-sm font-black text-slate-900">{stats?.group_points ?? 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">Proyecciones</p>
            <span className="text-sm font-black text-slate-900">{stats?.pick_points ?? 0}</span>
          </div>
          <div className="h-px bg-slate-100" />
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-900">Total</p>
            <span className="text-sm font-black text-slate-900">{stats?.total_points ?? 0}</span>
          </div>
        </div>
        {totalPreds > 0 && (
          <div className="bg-slate-50 rounded-xl px-3 py-2.5 flex items-center gap-2">
            <Target size={13} className="text-slate-400" />
            <p className="text-xs text-slate-500">
              Efectividad: <strong className="text-slate-700">{Math.round((exactPreds / totalPreds) * 100)}%</strong> resultados exactos ({exactPreds}/{totalPreds})
            </p>
          </div>
        )}
      </div>

      {/* Sign out */}
      <LogoutButton />
    </div>
  )
}
