'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, Clock, Loader2 } from 'lucide-react'

type Match = {
  id: number
  kickoff_at: string
  phase: string
  status: string
  home_score: number | null
  away_score: number | null
  home: { name_es: string; code: string } | null
  away: { name_es: string; code: string } | null
}

const PHASE_LABELS: Record<string, string> = {
  group: 'Grupos', round_of_32: 'Ronda 32', round_of_16: 'Octavos',
  quarter_final: 'Cuartos', semi_final: 'Semi', third_place: '3er lugar', final: 'Final',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-GT', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Guatemala',
  })
}

function MatchRow({ match, onSaved }: { match: Match; onSaved: () => void }) {
  const [home, setHome] = useState(match.home_score ?? 0)
  const [away, setAway] = useState(match.away_score ?? 0)
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(match.status === 'finished')
  const [err, setErr] = useState<string | null>(null)

  async function handleSave() {
    setErr(null)
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.rpc('score_match', {
        p_match_id: match.id,
        p_home: home,
        p_away: away,
      })
      if (error) {
        setErr(error.message)
      } else {
        setDone(true)
        onSaved()
      }
    })
  }

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-4 transition-all ${done ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {PHASE_LABELS[match.phase] ?? match.phase}
          </span>
          {done && <CheckCircle2 size={13} className="text-emerald-500" />}
          {match.status === 'live' && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> En vivo
            </span>
          )}
        </div>
        <span className="text-[11px] text-slate-400">{formatDate(match.kickoff_at)}</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Home */}
        <div className="flex-1 text-right">
          <p className="text-sm font-bold text-slate-900">{match.home?.name_es ?? 'TBD'}</p>
          <p className="text-xs text-slate-400 font-mono">{match.home?.code}</p>
        </div>

        {/* Score inputs */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <input
            type="number" min={0} max={99} value={home}
            onChange={e => setHome(+e.target.value)}
            disabled={done}
            className="w-14 h-12 text-center text-xl font-black rounded-xl border border-slate-200 bg-white outline-none focus:border-red-400 disabled:bg-slate-50 disabled:text-slate-400"
          />
          <span className="text-slate-300 font-bold">-</span>
          <input
            type="number" min={0} max={99} value={away}
            onChange={e => setAway(+e.target.value)}
            disabled={done}
            className="w-14 h-12 text-center text-xl font-black rounded-xl border border-slate-200 bg-white outline-none focus:border-red-400 disabled:bg-slate-50 disabled:text-slate-400"
          />
        </div>

        {/* Away */}
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-900">{match.away?.name_es ?? 'TBD'}</p>
          <p className="text-xs text-slate-400 font-mono">{match.away?.code}</p>
        </div>
      </div>

      {err && <p className="text-xs text-red-600 mt-2 text-center">{err}</p>}

      {!done && (
        <button
          onClick={handleSave}
          disabled={isPending}
          className="mt-3 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-red-600 text-white text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isPending ? <><Loader2 size={14} className="animate-spin" /> Calculando puntos...</> : 'Guardar resultado y calcular puntos →'}
        </button>
      )}
    </div>
  )
}

export default function ResultadosList({ matches }: { matches: Match[] }) {
  const [filter, setFilter] = useState<'scheduled' | 'live' | 'finished'>('scheduled')
  const [refreshKey, setRefreshKey] = useState(0)

  const filtered = matches.filter(m => m.status === filter)

  const tabs: { key: typeof filter; label: string; icon: React.ReactNode }[] = [
    { key: 'scheduled', label: `Pendientes (${matches.filter(m => m.status === 'scheduled').length})`, icon: <Clock size={13} /> },
    { key: 'live',      label: `En vivo (${matches.filter(m => m.status === 'live').length})`,        icon: <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> },
    { key: 'finished',  label: `Finalizados (${matches.filter(m => m.status === 'finished').length})`, icon: <CheckCircle2 size={13} /> },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-slate-900">Ingresar resultados</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === t.key
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
          <p className="text-slate-400 text-sm">No hay partidos en esta categoría</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(m => (
            <MatchRow
              key={`${m.id}-${refreshKey}`}
              match={m}
              onSaved={() => setRefreshKey(k => k + 1)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
