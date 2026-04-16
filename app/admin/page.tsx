import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ClipboardList, Users, CheckCircle2, Clock } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: finishedMatches },
    { count: pendingMatches },
    { count: totalPredictions },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
    supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'finished'),
    supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'scheduled'),
    supabase.from('predictions').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Participantes', value: totalUsers ?? 0, icon: Users, color: 'blue' },
    { label: 'Partidos jugados', value: finishedMatches ?? 0, icon: CheckCircle2, color: 'emerald' },
    { label: 'Partidos pendientes', value: pendingMatches ?? 0, icon: Clock, color: 'amber' },
    { label: 'Predicciones totales', value: totalPredictions ?? 0, icon: ClipboardList, color: 'purple' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900">Panel de administración</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-2xl font-black text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-400 font-semibold mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Link href="/admin/resultados" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
            <ClipboardList size={22} className="text-red-600" />
          </div>
          <div>
            <p className="font-bold text-slate-900">Ingresar resultados</p>
            <p className="text-sm text-slate-400 mt-0.5">Actualiza los marcadores y activa los puntos</p>
          </div>
        </Link>
        <Link href="/admin/usuarios" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
            <Users size={22} className="text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-slate-900">Gestionar usuarios</p>
            <p className="text-sm text-slate-400 mt-0.5">Ver participantes y cambiar roles</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
