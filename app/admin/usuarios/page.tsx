import { createClient } from '@/lib/supabase/server'
import UsersTable from './users-table'

export default async function UsuariosPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, email, company, role, created_at')
    .order('created_at')

  return <UsersTable users={users ?? []} />
}
