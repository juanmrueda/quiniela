/**
 * Importa los 104 partidos del Mundial FIFA 2026 desde API-Football
 * y los inserta en Supabase.
 *
 * Uso:
 *   npx tsx scripts/import-matches.ts
 *
 * Requiere en .env.local:
 *   RAPIDAPI_KEY=tu_key
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SECRET_KEY=...
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const FIFA_2026_LEAGUE_ID = 1 // Copa del Mundo FIFA en API-Football
const FIFA_2026_SEASON    = 2026

const PHASE_MAP: Record<string, string> = {
  'Group Stage'     : 'group',
  'Round of 32'     : 'round_of_32',
  'Round of 16'     : 'round_of_16',
  'Quarter-finals'  : 'quarterfinal',
  'Semi-finals'     : 'semifinal',
  '3rd Place Final' : 'third_place',
  'Final'           : 'final',
}

async function fetchMatches() {
  const res = await fetch(
    `https://v3.football.api-sports.io/fixtures?league=${FIFA_2026_LEAGUE_ID}&season=${FIFA_2026_SEASON}`,
    {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
        'x-rapidapi-host': 'v3.football.api-sports.io',
      },
    }
  )
  const data = await res.json()
  return data.response as any[]
}

async function fetchTeams() {
  const res = await fetch(
    `https://v3.football.api-sports.io/teams?league=${FIFA_2026_LEAGUE_ID}&season=${FIFA_2026_SEASON}`,
    {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
        'x-rapidapi-host': 'v3.football.api-sports.io',
      },
    }
  )
  const data = await res.json()
  return data.response as any[]
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )

  console.log('📡 Obteniendo equipos de API-Football...')
  const apiTeams = await fetchTeams()

  // Mapear código FIFA → id en nuestra DB
  const { data: dbTeams } = await supabase.from('teams').select('id, code, name')
  const teamCodeMap = new Map<string, number>()
  const teamNameMap = new Map<string, number>()
  dbTeams?.forEach(t => {
    teamCodeMap.set(t.code, t.id)
    teamNameMap.set(t.name.toLowerCase(), t.id)
  })

  // Actualizar flag_url en teams
  for (const { team } of apiTeams) {
    const dbId = teamNameMap.get(team.name.toLowerCase())
    if (dbId && team.logo) {
      await supabase.from('teams').update({ flag_url: team.logo }).eq('id', dbId)
    }
  }
  console.log('✅ Logos de equipos actualizados')

  console.log('📡 Obteniendo partidos de API-Football...')
  const fixtures = await fetchMatches()
  console.log(`   ${fixtures.length} partidos encontrados`)

  let inserted = 0
  let skipped  = 0

  for (const f of fixtures) {
    const round: string = f.league.round ?? ''
    const phaseKey = Object.keys(PHASE_MAP).find(k => round.includes(k))
    const phase = phaseKey ? PHASE_MAP[phaseKey] : 'group'

    // Extraer grupo (ej: "Group Stage - A" → "A")
    const groupMatch = round.match(/Group Stage - ([A-L])/i)
    const groupName  = groupMatch?.[1] ?? null

    const homeId = teamNameMap.get(f.teams.home.name.toLowerCase())
    const awayId = teamNameMap.get(f.teams.away.name.toLowerCase())

    if (!homeId || !awayId) {
      console.warn(`⚠️  Equipos no encontrados: ${f.teams.home.name} vs ${f.teams.away.name}`)
      skipped++
      continue
    }

    const { error } = await supabase.from('matches').upsert({
      api_match_id : f.fixture.id,
      phase,
      group_name   : groupName,
      home_team_id : homeId,
      away_team_id : awayId,
      kickoff_at   : new Date(f.fixture.timestamp * 1000).toISOString(),
      venue        : f.fixture.venue?.name,
      city         : f.fixture.venue?.city,
      status       : 'scheduled',
    }, { onConflict: 'api_match_id' })

    if (error) {
      console.error(`❌ Error insertando partido ${f.fixture.id}:`, error.message)
    } else {
      inserted++
    }
  }

  console.log(`\n✅ Importación completa: ${inserted} partidos insertados, ${skipped} omitidos`)
}

main().catch(console.error)
