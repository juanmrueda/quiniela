import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BottomNav from '@/components/nav/bottom-nav'
import Sidebar from '@/components/nav/sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, role, company, terms_accepted_at')
    .eq('id', user.id)
    .single()

  if (profile && !profile.terms_accepted_at) {
    redirect('/bienvenida')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Desktop sidebar */}
      <Sidebar profile={profile} />

      {/* Main content */}
      <main className="lg:ml-60 pb-20 lg:pb-0 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  )
}
