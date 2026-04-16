import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import PredictionForm from './prediction-form'

export const dynamic = 'force-dynamic'

export default async function PartidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const matchId = parseInt(id, 10)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: match } = await supabase
    .from('matches')
    .select('id, kickoff_at, phase, status, home_score, away_score, lock_at, home:home_team_id(id, name_es, code, group_name, flag_url), away:away_team_id(id, name_es, code, group_name, flag_url)')
    .eq('id', matchId)
    .single()

  if (!match) notFound()

  return (
    <PredictionForm
      match={match as any}
      userId={user.id}
    />
  )
}
