'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, Lock, Star, ChevronDown, X } from 'lucide-react'

type Team = { id: number; name_es: string; code: string; group_name: string | null }
type Picks = {
  champion_id: number | null
  runner_up_id: number | null
  third_place_id: number | null
  points_champion: number | null
  points_runner_up: number | null
  points_third: number | null
} | null

const SLOTS = [
  { key: 'champion_id',    label: 'Campeón',      emoji: '🥇', pts: 30, color: 'amber' },
  { key: 'runner_up_id',   label: 'Subcampeón',   emoji: '🥈', pts: 20, color: 'slate' },
  { key: 'third_place_id', label: 'Tercer lugar',  emoji: '🥉', pts: 10, color: 'orange' },
] as const

function TeamSelector({
  teams,
  selected,
  disabledIds,
  onChange,
  disabled,
  placeholder,
}: {
  teams: Team[]
  selected: number | null
  disabledIds: number[]
  onChange: (id: number | null) => void
  disabled: boolean
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selectedTeam = teams.find(t => t.id === selected)
  const filtered = teams.filter(t =>
    t.name_es.toLowerCase().includes(search.toLowerCase()) ||
    t.code.toLowerCase().includes(search.toLowerCase())
  )

  if (disabled && selectedTeam) {
    return (
      <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
        <span className="text-xl">🏳️</span>
        <div>
          <p className="text-sm font-bold text-slate-900">{selectedTeam.name_es}</p>
          <p className="text-xs text-slate-400 font-mono">{selectedTeam.code}</p>
        </div>
      </div>
    )
  }

  if (disabled) {
    return (
      <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
        <Lock size={16} className="text-slate-300" />
        <p className="text-sm text-slate-400">Sin selección</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch('') }}
        className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 border text-left transition-all ${
          selected
            ? 'bg-white border-slate-200 hover:border-slate-300'
            : 'bg-slate-50 border-dashed border-slate-300 hover:border-slate-400'
        }`}
      >
        <span className="text-xl flex-shrink-0">{selected ? '🏳️' : '❓'}</span>
        <div className="flex-1 min-w-0">
          {selectedTeam ? (
            <>
              <p className="text-sm font-bold text-slate-900">{selectedTeam.name_es}</p>
              <p className="text-xs text-slate-400 font-mono">{selectedTeam.code}</p>
            </>
          ) : (
            <p className="text-sm text-slate-400">{placeholder}</p>
          )}
        </div>
        {selected ? (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onChange(null) }}
            className="text-slate-300 hover:text-slate-500 flex-shrink-0"
          >
            <X size={16} />
          </button>
        ) : (
          <ChevronDown size={16} className={`text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 top-full mt-2 left-0 right-0 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-2 border-b border-slate-100">
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar selección..."
                className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl outline-none placeholder-slate-400"
              />
            </div>
            <div className="max-h-56 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Sin resultados</p>
              ) : (
                filtered.map(t => {
                  const isDisabled = disabledIds.includes(t.id)
                  return (
                    <button
                      key={t.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => { onChange(t.id); setOpen(false) }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        isDisabled
                          ? 'opacity-30 cursor-not-allowed'
                          : t.id === selected
                          ? 'bg-red-50'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-base">🏳️</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{t.name_es}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Grupo {t.group_name} · {t.code}</p>
                      </div>
                      {t.id === selected && <CheckCircle2 size={14} className="text-red-500 ml-auto" />}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function PicksForm({
  teams,
  existing,
  userId,
  locked,
}: {
  teams: Team[]
  existing: Picks
  userId: string
  locked: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [picks, setPicks] = useState({
    champion_id:    existing?.champion_id    ?? null,
    runner_up_id:   existing?.runner_up_id   ?? null,
    third_place_id: existing?.third_place_id ?? null,
  })

  const setSlot = (key: keyof typeof picks, val: number | null) =>
    setPicks(p => ({ ...p, [key]: val }))

  const disabledFor = (key: keyof typeof picks) =>
    Object.entries(picks)
      .filter(([k, v]) => k !== key && v !== null)
      .map(([, v]) => v as number)

  const totalPotential =
    (picks.champion_id ? 30 : 0) +
    (picks.runner_up_id ? 20 : 0) +
    (picks.third_place_id ? 10 : 0)

  const pointsEarned =
    (existing?.points_champion ?? 0) +
    (existing?.points_runner_up ?? 0) +
    (existing?.points_third ?? 0)

  async function handleSave() {
    if (locked) return
    if (!picks.champion_id || !picks.runner_up_id || !picks.third_place_id) {
      setError('Debes seleccionar los 3 equipos para guardar.')
      return
    }
    setError(null)
    startTransition(async () => {
      const supabase = createClient()
      const { error: err } = await supabase.from('tournament_picks').upsert(
        { user_id: userId, ...picks },
        { onConflict: 'user_id' }
      )
      if (err) {
        setError('No se pudo guardar. Intenta de nuevo.')
      } else {
        setSaved(true)
        setTimeout(() => router.push('/dashboard'), 1500)
      }
    })
  }

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Star size={18} className="text-amber-500" />
          <h1 className="text-2xl font-black text-slate-900">Pronósticos del torneo</h1>
        </div>
        <p className="text-slate-400 text-sm">Predice los 3 primeros del Mundial. Se cierran el 11 jun a medianoche GT.</p>
      </div>

      {/* Points earned banner (if tournament started) */}
      {locked && pointsEarned > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center gap-3">
          <Star size={18} className="text-amber-500" />
          <div>
            <p className="text-sm font-bold text-amber-800">Puntos ganados por pronósticos</p>
            <p className="text-2xl font-black text-amber-600">{pointsEarned} pts</p>
          </div>
        </div>
      )}

      {/* Slots */}
      <div className="space-y-4">
        {SLOTS.map(slot => {
          const earnedKey = slot.key.replace('_id', '') as 'champion' | 'runner_up' | 'third_place'
          const earned = (existing?.[`points_${earnedKey}` as keyof Picks] ?? null) as number | null

          return (
            <div key={slot.key} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{slot.emoji}</span>
                  <span className="text-sm font-bold text-slate-900">{slot.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {earned != null && (
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      +{earned} pts
                    </span>
                  )}
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {slot.pts} pts
                  </span>
                </div>
              </div>
              <div className="p-4">
                <TeamSelector
                  teams={teams}
                  selected={picks[slot.key]}
                  disabledIds={disabledFor(slot.key)}
                  onChange={val => setSlot(slot.key, val)}
                  disabled={locked}
                  placeholder={`Elige al ${slot.label.toLowerCase()}...`}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Potential points */}
      {!locked && (
        <div className="bg-slate-50 rounded-2xl px-5 py-4 flex items-center justify-between border border-slate-100">
          <p className="text-sm text-slate-500 font-medium">Puntos potenciales</p>
          <p className="text-xl font-black text-slate-900">{totalPotential} / 60</p>
        </div>
      )}

      {/* CTA */}
      {!locked && (
        <div className="space-y-2">
          {error && <p className="text-sm text-red-600 font-semibold text-center">{error}</p>}
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
                <CheckCircle2 size={16} /> ¡Pronósticos guardados!
              </span>
            ) : isPending ? 'Guardando...'
              : existing ? 'Actualizar pronósticos →'
              : 'Guardar pronósticos →'}
          </button>
        </div>
      )}

      {locked && (
        <div className="flex items-center gap-2 justify-center text-slate-400 text-sm">
          <Lock size={14} />
          <span>Los pronósticos están cerrados</span>
        </div>
      )}
    </div>
  )
}
