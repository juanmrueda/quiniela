import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error?reason=no_code`)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/auth/error?reason=auth_failed`)
  }

  // Verificar dominio corporativo
  const email = data.user.email ?? ''
  const domain = email.split('@')[1]
  const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',') ?? []

  if (!allowedDomains.includes(domain)) {
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/auth/error?reason=domain`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
