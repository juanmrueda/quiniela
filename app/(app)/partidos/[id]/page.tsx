import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import PredictionForm from './prediction-form'

export default async function PartidoDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: match }, { data: prediction }, { data: myStats }] = await Promise.all([
    supabase
      .from('matches')
      .select('id, kickoff_at, phase, status, home_score, away_score, lock_at, home:home_team_id(id, name_es, code, group_letter), away:away_team_id(id, name_es, code, group_letter)')
      .eq('id', params.id)
      .single(),
    supabase
      .from('predictions')
      .select('home_score, away_score, points_earned')
      .eq('match_id', params.id)
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('leaderboard')
      .select('total_points')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (!match) notFound()

  return (
    <PredictionForm
      match={match as any}
      prediction={prediction}
      userId={user.id}
    />
  )
}
