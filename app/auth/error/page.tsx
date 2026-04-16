'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

const MESSAGES: Record<string, string> = {
  domain: 'Tu correo no pertenece a una empresa autorizada para participar en la quiniela.',
  auth_failed: 'Hubo un problema al iniciar sesión. Intenta de nuevo.',
  no_code: 'El enlace de autenticación no es válido.',
}

function ErrorContent() {
  const params = useSearchParams()
  const reason = params.get('reason') ?? 'auth_failed'
  const message = MESSAGES[reason] ?? MESSAGES.auth_failed

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] via-[#003087] to-[#c8102e] p-6">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="text-4xl mb-4">⛔</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Acceso denegado</h1>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <Link
          href="/login"
          className="block w-full bg-[#1a1a2e] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#003087] transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}

export default function ErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  )
}
