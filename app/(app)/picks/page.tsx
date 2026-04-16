import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PicksForm from './picks-form'

export default async function PicksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: teams }, { data: picks }] = await Promise.all([
    supabase.from('teams').select('id, name_es, code, group_name').order('name_es'),
    supabase.from('tournament_picks').select('*').eq('user_id', user.id).maybeSingle(),
  ])

  // Torneo arranca el 11 jun 2026 — picks se cierran ese día
  const LOCK_DATE = new Date('2026-06-11T00:00:00-06:00') // medianoche GT
  const locked = Date.now() >= LOCK_DATE.getTime()

  return (
    <PicksForm
      teams={teams ?? []}
      existing={picks}
      userId={user.id}
      locked={locked}
    />
  )
}
