import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Trophy, Zap, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import FlagImg from '@/components/flag-img'

function formatCountdown(kickoff: string) {
  const diff = new Date(kickoff).getTime() - Date.now()
  if (diff <= 0) return 'En curso'
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-GT', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Guatemala',
  })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: leaderboard }, { data: nextMatches }, { count: totalUsers }] =
    await Promise.all([
      supabase.from('profiles').select('full_name, avatar_url, company').eq('id', user.id).single(),
      supabase.from('leaderboard').select('*').order('total_points', { ascending: false }).order('full_name', { ascending: true }),
      supabase.from('matches')
        .select('id, kickoff_at, phase, home:home_team_id(name_es, code, flag_url), away:away_team_id(name_es, code, flag_url)')
        .eq('status', 'scheduled')
        .gte('kickoff_at', new Date().toISOString())
        .order('kickoff_at')
        .limit(4),
      supabase.from('leaderboard').select('*', { count: 'exact', head: true }),
    ])

  const myRank    = (leaderboard?.findIndex(r => r.user_id === user.id) ?? -1) + 1
  const myStats   = leaderboard?.find(r => r.user_id === user.id)
  const myPoints  = myStats?.total_points ?? 0
  const total     = totalUsers ?? 0
  const totalPot  = total * 15 * 2
  const prizes    = [Math.round(totalPot * 0.5), Math.round(totalPot * 0.3), Math.round(totalPot * 0.2)]
  const myPrize   = myRank >= 1 && myRank <= 3 ? prizes[myRank - 1] : 0
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Jugador'
  const nextMatch = nextMatches?.[0]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">Bienvenido de vuelta,</p>
          <h1 className="text-2xl font-black text-slate-900">{firstName} 👋</h1>
        </div>
        {profile?.avatar_url
          ? <img src={profile.avatar_url} alt="" className="w-12 h-12 rounded-full border-2 border-white shadow-md flex-shrink-0" />
          : <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-lg font-black text-slate-500 flex-shrink-0">{firstName[0]}</div>
        }
      </div>

      {/* Ranking hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest">Tu posición</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-5xl font-black leading-none">{myRank > 0 ? `#${myRank}` : '--'}</span>
              <span className="text-white/40 text-sm mb-1.5">de {total}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest">Puntos</p>
            <p className="text-4xl font-black mt-1">{myPoints}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
          <Trophy size={16} className="text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-white/60 text-xs">Premio si terminas en esta posición</p>
            <p className="font-bold text-sm mt-0.5">
              {myPrize > 0 ? `$${myPrize.toLocaleString('en-US')}` : 'Fuera del top 3 aún'}
            </p>
          </div>
          <Link href="/ranking" className="text-white/50 hover:text-white text-xs font-semibold transition-colors whitespace-nowrap">
            Ver ranking →
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
          <p className="text-xl font-black text-amber-500">${totalPot.toLocaleString('en-US')}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-semibold">Pozo total</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
          <p className="text-xl font-black text-slate-900">{myStats?.group_points ?? 0}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-semibold">Pts grupos</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
          <p className="text-xl font-black text-slate-900">{myStats?.pick_points ?? 0}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-semibold">Pts proyecc.</p>
        </div>
      </div>

      {/* Next match */}
      {nextMatch && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-red-500" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Próximo partido</span>
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
              {formatCountdown(nextMatch.kickoff_at)}
            </span>
          </div>
          <div className="px-5 py-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-2 overflow-hidden">
                  <FlagImg url={(nextMatch.home as any)?.flag_url} name={(nextMatch.home as any)?.name_es} size={56} />
                </div>
                <p className="text-sm font-bold text-slate-900">{(nextMatch.home as any)?.name_es ?? 'TBD'}</p>
                <p className="text-xs text-slate-400 font-mono">{(nextMatch.home as any)?.code}</p>
              </div>
              <div className="text-center flex-shrink-0">
                <div className="bg-slate-100 rounded-xl px-3 py-2 mb-2">
                  <span className="text-xs font-black text-slate-400">VS</span>
                </div>
                <p className="text-[11px] text-slate-400 font-semibold">
                  {new Date(nextMatch.kickoff_at).toLocaleTimeString('es-GT', {
                    hour: '2-digit', minute: '2-digit', timeZone: 'America/Guatemala',
                  })} GT
                </p>
              </div>
              <div className="flex-1 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-2 overflow-hidden">
                  <FlagImg url={(nextMatch.away as any)?.flag_url} name={(nextMatch.away as any)?.name_es} size={56} />
                </div>
                <p className="text-sm font-bold text-slate-900">{(nextMatch.away as any)?.name_es ?? 'TBD'}</p>
                <p className="text-xs text-slate-400 font-mono">{(nextMatch.away as any)?.code}</p>
              </div>
            </div>
            <Link
              href={`/partidos/${nextMatch.id}`}
              className="mt-5 block w-full bg-slate-900 hover:bg-red-600 text-white text-sm font-bold py-3 rounded-xl text-center transition-all duration-200"
            >
              Ingresar predicción →
            </Link>
          </div>
          <div className="px-5 pb-4 -mt-1">
            <p className="text-xs text-slate-400 text-center">{formatDate(nextMatch.kickoff_at)}</p>
          </div>
        </div>
      )}

      {/* Top 3 */}
      {leaderboard && leaderboard.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-amber-500" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Líderes ahora</span>
            </div>
            <Link href="/ranking" className="text-xs font-bold text-red-600">Ver todo →</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {leaderboard.slice(0, 3).map((r, i) => {
              const medals = ['🥇', '🥈', '🥉']
              const isMe = r.user_id === user.id
              return (
                <div key={r.user_id} className={`flex items-center gap-3 px-5 py-3.5 ${isMe ? 'bg-red-50/60' : ''}`}>
                  <span className="text-base w-5">{medals[i]}</span>
                  {r.avatar_url
                    ? <img src={r.avatar_url} alt="" className="w-9 h-9 rounded-full flex-shrink-0 border-2 border-white shadow-sm" />
                    : <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 flex-shrink-0">{r.full_name?.[0] ?? '?'}</div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isMe ? 'text-red-700' : 'text-slate-900'}`}>
                      {r.full_name ?? r.email}{isMe ? ' (tú)' : ''}
                    </p>
                    <p className="text-xs text-slate-400">{r.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">{r.total_points}</p>
                    <p className="text-[10px] text-slate-400 font-bold tracking-wide">PTS</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* More upcoming */}
      {nextMatches && nextMatches.length > 1 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-blue-500" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Próximos partidos</span>
            </div>
            <Link href="/partidos" className="text-xs font-bold text-red-600">Ver todos →</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {nextMatches.slice(1).map(m => (
              <Link key={m.id} href={`/partidos/${m.id}`}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {(m.home as any)?.name_es ?? 'TBD'} <span className="text-slate-300 font-normal">vs</span> {(m.away as any)?.name_es ?? 'TBD'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDate(m.kickoff_at)}</p>
                </div>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg flex-shrink-0">
                  {formatCountdown(m.kickoff_at)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
