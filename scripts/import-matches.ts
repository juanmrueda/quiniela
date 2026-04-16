/**
 * Importa los partidos del Mundial FIFA 2026 desde football-data.org
 * y los inserta en Supabase.
 *
 * Uso:
 *   npx tsx scripts/import-matches.ts
 *
 * Requiere en .env.local:
 *   FOOTBALL_DATA_API_KEY=tu_token
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SECRET_KEY=...
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const FIFA_2026_CODE = 'WC'  // football-data.org usa "WC" para el Mundial
const BASE_URL       = 'https://api.football-data.org/v4'
const HEADERS        = { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY! }

const PHASE_MAP: Record<string, string> = {
  'GROUP_STAGE'          : 'group',
  'ROUND_OF_32'          : 'round_of_32',
  'LAST_32'              : 'round_of_32',
  'ROUND_OF_16'          : 'round_of_16',
  'LAST_16'              : 'round_of_16',
  'QUARTER_FINALS'       : 'quarterfinal',
  'SEMI_FINALS'          : 'semifinal',
  'THIRD_PLACE'          : 'third_place',
  'THIRD_PLACE_FINAL'    : 'third_place',
  'FINAL'                : 'final',
}

async function get(endpoint: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`, { headers: HEADERS })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  return res.json()
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )

  // Cargar equipos de nuestra DB para mapear nombres
  const { data: dbTeams } = await supabase.from('teams').select('id, name, name_es, code')
  const teamNameMap = new Map<string, number>()
  const norm = (s: string) => s.normalize('NFC').toLowerCase().trim()
  dbTeams?.forEach(t => {
    teamNameMap.set(norm(t.name), t.id)
    teamNameMap.set(norm(t.name_es), t.id)
    teamNameMap.set(norm(t.code), t.id)
  })

  // Sobrescrituras manuales para nombres que difieren entre fuentes
  const NAME_OVERRIDES: Record<string, string> = {
    'usa'                    : 'united states',
    'united states of america': 'united states',
    'south korea'            : 'south korea',
    'republic of korea'      : 'south korea',
    'ir iran'                : 'iran',
    'côte d\'ivoire'         : 'nigeria', // placeholder si aparece
    'saudi arabia'           : 'saudi arabia',
  }

  console.log('📡 Obteniendo partidos del Mundial 2026 desde football-data.org...')

  let matches: any[]
  try {
    const data = await get(`/competitions/${FIFA_2026_CODE}/matches?season=2026`)
    matches = data.matches
    console.log(`   ${matches.length} partidos encontrados`)
  } catch (e: any) {
    console.error('❌ Error al obtener partidos:', e.message)
    console.log('\n💡 El Mundial 2026 puede no estar disponible aún en football-data.org.')
    console.log('   Se usará el seed manual de partidos como alternativa.')
    process.exit(1)
  }

  let inserted = 0
  let skipped  = 0

  for (const match of matches) {
    const stageRaw: string = match.stage ?? 'GROUP_STAGE'
    const phase = PHASE_MAP[stageRaw] ?? 'group'
    const groupName = match.group?.replace('GROUP_', '') ?? null

    const rawHome = match.homeTeam?.name ?? null
    const rawAway = match.awayTeam?.name ?? null
    const homeName = rawHome ? (NAME_OVERRIDES[norm(rawHome)] ?? norm(rawHome)) : null
    const awayName = rawAway ? (NAME_OVERRIDES[norm(rawAway)] ?? norm(rawAway)) : null

    const homeId = homeName ? teamNameMap.get(homeName) : null
    const awayId = awayName ? teamNameMap.get(awayName) : null

    if (!homeId || !awayId) {
      // Fase eliminatoria: equipos aún TBD — insertar sin equipo
      if (phase !== 'group') {
        const { error } = await supabase.from('matches').upsert({
          api_match_id : match.id,
          phase,
          kickoff_at   : match.utcDate,
          venue        : match.venue,
          status       : 'scheduled',
        }, { onConflict: 'api_match_id' })
        if (!error) inserted++
        else console.error(`❌ ${match.id}:`, error.message)
        continue
      }
      console.warn(`⚠️  Equipo no encontrado: "${rawHome}" vs "${rawAway}"`)
      skipped++
      continue
    }

    const { error } = await supabase.from('matches').upsert({
      api_match_id : match.id,
      phase,
      group_name   : groupName,
      home_team_id : homeId,
      away_team_id : awayId,
      kickoff_at   : match.utcDate,
      venue        : match.venue,
      status       : 'scheduled',
    }, { onConflict: 'api_match_id' })

    if (error) {
      console.error(`❌ Error insertando partido ${match.id}:`, error.message)
    } else {
      inserted++
    }
  }

  console.log(`\n✅ Importación completa: ${inserted} partidos, ${skipped} omitidos`)
}

main().catch(console.error)
