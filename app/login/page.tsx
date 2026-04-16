import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LoginButton from './login-button'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1a2e] via-[#003087] to-[#c8102e] p-6">
      <div className="w-full max-w-sm">
        {/* Logo placeholder */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mb-4 border border-white/20">
            <span className="text-4xl">⚽</span>
          </div>
          <h1 className="text-white text-2xl font-black tracking-tight">Quiniela</h1>
          <p className="text-white/60 text-sm mt-1">Mundial FIFA 2026</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-[#1a1a2e] text-xl font-bold mb-1">Bienvenido</h2>
          <p className="text-gray-500 text-sm mb-6">
            Inicia sesión con tu correo corporativo para participar.
          </p>
          <LoginButton />
          <p className="text-center text-xs text-gray-400 mt-4">
            Solo correos @by-media.com · @digitalfactory.com.gt<br />
            @auditsa.gt · @4amsaatchi.com
          </p>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          iPalmera · FIFA World Cup 2026
        </p>
      </div>
    </main>
  )
}
