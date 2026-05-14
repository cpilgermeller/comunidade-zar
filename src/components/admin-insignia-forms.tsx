'use client'

import { useActionState } from 'react'
import { createInsignia } from '@/app/actions/profile'
import { Star } from 'lucide-react'

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300'

export function CreateInsigniaForm() {
  const [state, action, pending] = useActionState(createInsignia, undefined)

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <Star size={16} className="text-gold-500" /> Criar Insígnia
      </h2>
      <form action={action} className="space-y-3">
        <input name="name" required placeholder="Nome da insígnia" className={inputCls} />
        <input name="description" placeholder="Descrição (opcional)" className={inputCls} />
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Emoji</label>
            <input name="emoji" defaultValue="🏅" placeholder="🏅" className={inputCls} maxLength={4} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Cor</label>
            <input type="color" name="color" defaultValue="#9f1030" className="h-9 w-16 rounded border border-gray-200 cursor-pointer" />
          </div>
        </div>
        {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
        {state?.success && <p className="text-xs text-emerald-600">Insígnia criada!</p>}
        <button type="submit" disabled={pending}
          className="w-full bg-gold-500 hover:bg-gold-600 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg transition-colors">
          {pending ? 'Criando...' : 'Criar Insígnia'}
        </button>
      </form>
    </div>
  )
}
