import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Trophy } from 'lucide-react'

const PRIZE_PCT = [0.5, 0.3, 0.2]
const MEDALS = ['🥇', '🥈', '🥉']

export default async function RankingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: leaderboard }, { count: totalUsers }] = await Promise.all([
    supabase.from('leaderboard').select('*').order('total_points', { ascending: false }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
  ])

  const total = totalUsers ?? 0
  const totalPot = total * 100 * 2
  const prizes = PRIZE_PCT.map(p => Math.round(totalPot * p))

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Ranking</h1>
        <p className="text-slate-400 text-sm mt-0.5">{total} participantes · Q.{totalPot.toLocaleString('es-GT')} en premios</p>
      </div>

      {/* Prize podium */}
      <div className="grid grid-cols-3 gap-2">
        {prizes.map((prize, i) => (
          <div key={i} className={`rounded-2xl p-3 text-center border ${i === 0 ? 'bg-amber-50 border-amber-200' : i === 1 ? 'bg-slate-50 border-slate-200' : 'bg-orange-50 border-orange-200'}`}>
            <p className="text-lg">{MEDALS[i]}</p>
            <p className="text-sm font-black text-slate-900 mt-1">Q.{prize.toLocaleString('es-GT')}</p>
            <p className="text-[10px] text-slate-400 font-bold">{i + 1}er lugar</p>
          </div>
        ))}
      </div>

      {/* Full table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-50 flex items-center gap-2">
          <Trophy size={14} className="text-amber-500" />
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Clasificación completa</span>
        </div>

        {leaderboard && leaderboard.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {leaderboard.map((r, i) => {
              const isMe = r.user_id === user.id
              const isPodium = i < 3
              return (
                <div
                  key={r.user_id}
                  className={`flex items-center gap-3 px-5 py-3.5 ${isMe ? 'bg-red-50/60' : ''}`}
                >
                  {/* Rank */}
                  <div className="w-7 flex-shrink-0 text-center">
                    {isPodium
                      ? <span className="text-base">{MEDALS[i]}</span>
                      : <span className="text-sm font-bold text-slate-400">{i + 1}</span>
                    }
                  </div>

                  {/* Avatar */}
                  {r.avatar_url
                    ? <img src={r.avatar_url} alt="" className="w-9 h-9 rounded-full flex-shrink-0 border-2 border-white shadow-sm" />
                    : <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 flex-shrink-0">
                        {r.full_name?.[0] ?? '?'}
                      </div>
                  }

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isMe ? 'text-red-700' : 'text-slate-900'}`}>
                      {r.full_name ?? r.email}{isMe ? ' (tú)' : ''}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{r.company}</p>
                  </div>

                  {/* Stats */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-slate-900">{r.total_points}</p>
                    <p className="text-[10px] text-slate-400 font-bold tracking-wide">PTS</p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="px-5 py-10 text-center">
            <p className="text-slate-400 text-sm">Aún no hay puntos registrados</p>
            <p className="text-slate-300 text-xs mt-1">El ranking se actualiza cuando terminen los partidos</p>
          </div>
        )}
      </div>

      {/* My position sticky if not in top view */}
      {leaderboard && leaderboard.length > 10 && (() => {
        const myIdx = leaderboard.findIndex(r => r.user_id === user.id)
        if (myIdx < 0 || myIdx < 10) return null
        const me = leaderboard[myIdx]
        return (
          <div className="sticky bottom-20 lg:bottom-4">
            <div className="bg-slate-900 text-white rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-xl">
              <span className="text-sm font-bold text-white/50">Tu posición</span>
              <span className="text-lg font-black">#{myIdx + 1}</span>
              <div className="flex-1" />
              <span className="text-sm font-black">{me.total_points} pts</span>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
