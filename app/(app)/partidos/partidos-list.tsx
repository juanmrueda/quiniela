'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Clock, Lock, Trophy } from 'lucide-react'
import FlagImg from '@/components/flag-img'

type Team = { id: string; name_es: string; code: string; group_name: string } | null
type Match = {
  id: string
  kickoff_at: string
  phase: string
  status: string
  home_score: number | null
  away_score: number | null
  home: Team
  away: Team
}

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
const KNOCKOUT_PHASES = ['round_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'third_place', 'final']
const PHASE_LABELS: Record<string, string> = {
  round_of_32: 'Ronda de 32',
  round_of_16: 'Octavos',
  quarter_final: 'Cuartos',
  semi_final: 'Semifinal',
  third_place: '3er lugar',
  final: 'Final',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-GT', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Guatemala',
  })
}

function StatusBadge({ status, hasPred }: { status: string; hasPred: boolean }) {
  if (status === 'finished') {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
        <Trophy size={10} /> Finalizado
      </span>
    )
  }
  if (status === 'live') {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> En vivo
      </span>
    )
  }
  if (status === 'locked') {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
        <Lock size={10} /> Cerrado
      </span>
    )
  }
  if (hasPred) {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
        <CheckCircle2 size={10} /> Predicción lista
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
      <Clock size={10} /> Predecir
    </span>
  )
}

export default function PartidosList({
  matches,
  predMap,
}: {
  matches: Match[]
  predMap: Map<string, { home_score: number | null; away_score: number | null }>
}) {
  const [tab, setTab] = useState<string>('A')

  const groupMatches = (group: string) =>
    matches.filter(m => m.phase === 'group' && (m.home as any)?.group_name === group)

  const knockoutMatches = (phase: string) =>
    matches.filter(m => m.phase === phase)

  const isKnockout = !GROUPS.includes(tab) && tab !== 'A'

  const displayed = GROUPS.includes(tab)
    ? groupMatches(tab)
    : knockoutMatches(tab)

  const groupCount = (g: string) => groupMatches(g).length
  const pendingCount = (g: string) =>
    groupMatches(g).filter(m => m.status === 'scheduled' && !predMap.has(m.id)).length

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Partidos</h1>
        <p className="text-slate-400 text-sm mt-0.5">Selecciona un partido para ingresar tu predicción</p>
      </div>

      {/* Tab scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {GROUPS.map(g => {
          const pending = pendingCount(g)
          const active = tab === g
          return (
            <button
              key={g}
              onClick={() => setTab(g)}
              className={`flex-shrink-0 flex flex-col items-center px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                active
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-500 border border-slate-100'
              }`}
            >
              <span>Grupo {g}</span>
              {pending > 0 && (
                <span className={`mt-0.5 w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-black ${active ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600'}`}>
                  {pending}
                </span>
              )}
            </button>
          )
        })}
        <div className="flex-shrink-0 w-px bg-slate-100 mx-1" />
        {KNOCKOUT_PHASES.map(phase => {
          const count = knockoutMatches(phase).length
          if (count === 0) return null
          const active = tab === phase
          return (
            <button
              key={phase}
              onClick={() => setTab(phase)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 whitespace-nowrap ${
                active
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-500 border border-slate-100'
              }`}
            >
              {PHASE_LABELS[phase]}
            </button>
          )
        })}
      </div>

      {/* Match cards */}
      {displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
          <p className="text-slate-400 text-sm">No hay partidos disponibles</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(m => {
            const pred = predMap.get(m.id)
            const hasPred = !!pred
            const canPredict = m.status === 'scheduled'
            const isFinished = m.status === 'finished'
            const isLive = m.status === 'live'

            return (
              <Link
                key={m.id}
                href={`/partidos/${m.id}`}
                className={`block bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-150 hover:shadow-md ${
                  isLive ? 'border-green-200' : 'border-slate-100'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {m.phase === 'group'
                      ? `Grupo ${(m.home as any)?.group_name ?? ''}`
                      : PHASE_LABELS[m.phase] ?? m.phase}
                  </span>
                  <StatusBadge status={m.status} hasPred={hasPred} />
                </div>

                {/* Match body */}
                <div className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    {/* Home team */}
                    <div className="flex-1 flex items-start gap-2">
                      <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden mt-0.5">
                        <FlagImg url={(m.home as any)?.flag_url} name={(m.home as any)?.name_es} size={36} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 leading-tight line-clamp-2">{(m.home as any)?.name_es ?? 'TBD'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{(m.home as any)?.code ?? '---'}</p>
                      </div>
                    </div>

                    {/* Score / VS */}
                    <div className="flex-shrink-0 text-center w-14 pt-0.5">
                      {(isFinished || isLive) && m.home_score !== null ? (
                        <div className="flex items-center justify-center gap-1">
                          <span className={`text-xl font-black ${isLive ? 'text-green-600' : 'text-slate-900'}`}>{m.home_score}</span>
                          <span className="text-slate-300 font-light">-</span>
                          <span className={`text-xl font-black ${isLive ? 'text-green-600' : 'text-slate-900'}`}>{m.away_score}</span>
                        </div>
                      ) : (
                        <div className="bg-slate-100 rounded-lg px-2 py-1.5">
                          <span className="text-xs font-black text-slate-400">VS</span>
                        </div>
                      )}
                      {hasPred && pred && !isFinished && (
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">
                          {pred.home_score}-{pred.away_score}
                        </p>
                      )}
                    </div>

                    {/* Away team */}
                    <div className="flex-1 flex items-start gap-2 justify-end">
                      <div className="min-w-0 text-right">
                        <p className="text-sm font-bold text-slate-900 leading-tight line-clamp-2">{(m.away as any)?.name_es ?? 'TBD'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{(m.away as any)?.code ?? '---'}</p>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden mt-0.5">
                        <FlagImg url={(m.away as any)?.flag_url} name={(m.away as any)?.name_es} size={36} />
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  <p className="text-[11px] text-slate-400 text-center mt-3 font-medium">
                    {formatDate(m.kickoff_at)}
                  </p>
                </div>

                {/* CTA strip for unsubmitted scheduled matches */}
                {canPredict && !hasPred && (
                  <div className="bg-red-600 px-4 py-2.5 text-center">
                    <span className="text-white text-xs font-bold">Toca para predecir →</span>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
