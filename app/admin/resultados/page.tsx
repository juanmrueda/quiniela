import { createClient } from '@/lib/supabase/server'
import ResultadosList from './resultados-list'

export default async function ResultadosPage() {
  const supabase = await createClient()

  const { data: matches } = await supabase
    .from('matches')
    .select('id, kickoff_at, phase, status, home_score, away_score, home:home_team_id(name_es, code), away:away_team_id(name_es, code)')
    .in('status', ['scheduled', 'live', 'finished'])
    .order('kickoff_at')

  return <ResultadosList matches={(matches ?? []) as any[]} />
}
