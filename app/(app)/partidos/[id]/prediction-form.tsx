'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, CheckCircle2, Lock, Trophy } from 'lucide-react'
import FlagImg from '@/components/flag-img'
import Link from 'next/link'

type Team = { id: string; name_es: string; code: string; group_letter: string; flag_url?: string | null }
type Match = {
  id: string
  kickoff_at: string
  lock_at: string
  phase: string
  status: string
  home_score: number | null
  away_score: number | null
  home: Team | null
  away: Team | null
}

const PHASE_LABELS: Record<string, string> = {
  group: 'Fase de grupos',
  round_of_32: 'Ronda de 32',
  round_of_16: 'Octavos de final',
  quarter_final: 'Cuartos de final',
  semi_final: 'Semifinal',
  third_place: 'Tercer lugar',
  final: 'Final',
}

const SCORING = [
  { pts: 5, label: 'Resultado exacto' },
  { pts: 3, label: 'Ganador / empate correcto' },
  { pts: 1, label: 'Goles de un equipo' },
]

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-GT', {
    weekday: 'long', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Guatemala',
  })
}

function ScoreInput({
  value,
  onChange,
  disabled,
}: {
  value: number
  onChange: (v: number) => void
  disabled: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={disabled || value <= 0}
        onClick={() => onChange(value - 1)}
        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 font-black text-lg transition-colors flex items-center justify-center"
      >
        −
      </button>
      <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center">
        <span className="text-3xl font-black text-white">{value}</span>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(value + 1)}
        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 font-black text-lg transition-colors flex items-center justify-center"
      >
        +
      </button>
    </div>
  )
}

export default function PredictionForm({
  match,
  userId,
}: {
  match: Match
  userId: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)
  const [saved, setSaved] = useState(false)
  const [hasPrediction, setHasPrediction] = useState(false)
  const [pointsEarned, setPointsEarned] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('predictions')
      .select('home_score, away_score, points_earned')
      .eq('match_id', match.id)
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setHomeScore(data.home_score ?? 0)
          setAwayScore(data.away_score ?? 0)
          setHasPrediction(true)
          setPointsEarned(data.points_earned)
        }
      })
  }, [match.id, userId])

  const locked = match.status !== 'scheduled'
  const isFinished = match.status === 'finished'
  const isLive = match.status === 'live'
  const now = Date.now()
  const lockTime = match.lock_at ? new Date(match.lock_at).getTime() : new Date(match.kickoff_at).getTime() - 5 * 60000
  const isLocked = locked || now >= lockTime

  async function handleSave() {
    if (isLocked) return
    setError(null)
    startTransition(async () => {
      const supabase = createClient()
      const { error: err } = await supabase.from('predictions').upsert(
        { user_id: userId, match_id: match.id, home_score: homeScore, away_score: awayScore },
        { onConflict: 'user_id,match_id' }
      )
      if (err) {
        setError('No se pudo guardar. Intenta de nuevo.')
      } else {
        setHasPrediction(true)
        setSaved(true)
        setTimeout(() => router.push('/partidos'), 1200)
      }
    })
  }

  const home = match.home
  const away = match.away

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Back */}
      <Link href="/partidos" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">
        <ArrowLeft size={15} />
        Todos los partidos
      </Link>

      {/* Phase + date */}
      <div>
        <p className="text-xs font-bold text-red-600 uppercase tracking-widest">
          {PHASE_LABELS[match.phase] ?? match.phase}
          {home?.group_letter ? ` — Grupo ${home.group_letter}` : ''}
        </p>
        <p className="text-slate-400 text-sm mt-0.5">{formatDate(match.kickoff_at)}</p>
      </div>

      {/* Teams + score input */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLive && (
          <div className="bg-green-500 px-4 py-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-white text-xs font-bold">Partido en curso</span>
          </div>
        )}
        <div className="px-5 py-6">
          <div className="flex items-center gap-4">
            {/* Home */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                <FlagImg url={home?.flag_url} name={home?.name_es} size={64} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-900 leading-tight">{home?.name_es ?? 'TBD'}</p>
                <p className="text-xs text-slate-400 font-mono">{home?.code ?? '---'}</p>
              </div>
              {isFinished && match.home_score !== null ? (
                <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center">
                  <span className="text-3xl font-black text-white">{match.home_score}</span>
                </div>
              ) : !isLocked ? (
                <ScoreInput value={homeScore} onChange={setHomeScore} disabled={isLocked} />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <span className="text-3xl font-black text-slate-300">{homeScore}</span>
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <span className="text-slate-200 font-black text-2xl">—</span>
            </div>

            {/* Away */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                <FlagImg url={away?.flag_url} name={away?.name_es} size={64} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-900 leading-tight">{away?.name_es ?? 'TBD'}</p>
                <p className="text-xs text-slate-400 font-mono">{away?.code ?? '---'}</p>
              </div>
              {isFinished && match.away_score !== null ? (
                <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center">
                  <span className="text-3xl font-black text-white">{match.away_score}</span>
                </div>
              ) : !isLocked ? (
                <ScoreInput value={awayScore} onChange={setAwayScore} disabled={isLocked} />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <span className="text-3xl font-black text-slate-300">{awayScore}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Points earned (finished) */}
        {isFinished && pointsEarned != null && (
          <div className="border-t border-slate-50 px-5 py-4 flex items-center gap-3">
            <Trophy size={16} className="text-amber-500" />
            <div>
              <p className="text-xs text-slate-400 font-semibold">Puntos ganados en este partido</p>
              <p className="text-lg font-black text-slate-900">{pointsEarned} pts</p>
            </div>
          </div>
        )}

        {/* Locked notice */}
        {isLocked && !isFinished && (
          <div className="border-t border-slate-50 px-5 py-3 flex items-center gap-2 bg-orange-50">
            <Lock size={14} className="text-orange-500" />
            <p className="text-xs text-orange-700 font-semibold">Las predicciones están cerradas para este partido</p>
          </div>
        )}
      </div>

      {/* Save button */}
      {!isLocked && (
        <div className="space-y-2">
          {error && (
            <p className="text-sm text-red-600 font-semibold text-center">{error}</p>
          )}
          <button
            onClick={handleSave}
            disabled={isPending || saved}
            className={`w-full py-4 rounded-2xl text-sm font-bold transition-all duration-200 ${
              saved
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-900 hover:bg-red-600 text-white'
            } disabled:opacity-70`}
          >
            {saved ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 size={16} /> ¡Predicción guardada!
              </span>
            ) : isPending ? (
              'Guardando...'
            ) : hasPrediction ? (
              'Actualizar predicción →'
            ) : (
              'Guardar predicción →'
            )}
          </button>
          <p className="text-center text-xs text-slate-400">
            Cierra {new Date(lockTime).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Guatemala' })} GT
          </p>
        </div>
      )}

      {/* Scoring guide */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Sistema de puntos</p>
        <div className="space-y-2.5">
          {SCORING.map(s => (
            <div key={s.pts} className="flex items-center justify-between">
              <p className="text-sm text-slate-600">{s.label}</p>
              <span className="text-sm font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg">+{s.pts}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
