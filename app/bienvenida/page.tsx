import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AcceptButton from './accept-button'

export default async function BienvenidaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('terms_accepted_at, full_name')
    .eq('id', user.id)
    .single()

  // Si ya aceptó, ir al dashboard
  if (profile?.terms_accepted_at) redirect('/dashboard')

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Jugador'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-red-900 px-6 pt-8 pb-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl mx-auto mb-4">
            ⚽
          </div>
          <h1 className="text-2xl font-black text-white">¡Bienvenido, {firstName}!</h1>
          <p className="text-white/60 text-sm mt-1">Saatchinela 2026</p>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-sm font-bold text-amber-800 mb-1">💰 Cuota de participación</p>
            <p className="text-amber-700 text-sm leading-relaxed">
              Al continuar, aceptas el descuento de <strong>USD $15</strong> para participar en la Saatchinela 2026.
            </p>
          </div>

          <p className="text-slate-500 text-sm text-center leading-relaxed">
            Compite con tus colegas, predice los resultados del Mundial FIFA 2026 y gana premios.
          </p>

          <AcceptButton userId={user.id} />
        </div>
      </div>
    </div>
  )
}
