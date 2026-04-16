import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PartidosList from './partidos-list'

export default async function PartidosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: matches }, { data: predictions }] = await Promise.all([
    supabase
      .from('matches')
      .select('id, kickoff_at, phase, status, home_score, away_score, home:home_team_id(id, name_es, code, group_name, flag_url), away:away_team_id(id, name_es, code, group_name, flag_url)')
      .order('kickoff_at'),
    supabase
      .from('predictions')
      .select('match_id, home_score, away_score')
      .eq('user_id', user.id),
  ])

  const predMap = new Map((predictions ?? []).map(p => [p.match_id, p]))

  return <PartidosList matches={(matches ?? []) as any[]} predMap={predMap} />
}
