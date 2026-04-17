'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AcceptButton({ userId }: { userId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleAccept() {
    startTransition(async () => {
      const supabase = createClient()
      await supabase
        .from('profiles')
        .update({ terms_accepted_at: new Date().toISOString() })
        .eq('id', userId)
      router.push('/dashboard')
    })
  }

  return (
    <button
      onClick={handleAccept}
      disabled={isPending}
      className="w-full bg-slate-900 hover:bg-red-600 text-white font-bold py-4 rounded-2xl text-sm transition-all duration-200 disabled:opacity-60"
    >
      {isPending ? 'Guardando...' : 'Acepto y quiero participar →'}
    </button>
  )
}
