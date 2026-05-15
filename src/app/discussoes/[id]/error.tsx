'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ThreadError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('Thread page error:', error)
  }, [error])

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <p className="text-4xl mb-4">⚠️</p>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Erro ao carregar discussão</h2>
        <p className="text-sm text-gray-500 mb-1">{error.message}</p>
        <p className="text-xs text-gray-400 mb-6 font-mono break-all">{error.stack?.split('\n')[0]}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset}
            className="bg-brand-800 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-brand-900 transition-colors">
            Tentar novamente
          </button>
          <Link href="/discussoes"
            className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 transition-colors">
            Voltar
          </Link>
        </div>
      </div>
    </div>
  )
}
