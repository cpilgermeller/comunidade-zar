'use client'

import { useActionState } from 'react'
import { createUsefulLink } from '@/app/actions/useful-links'
import { Link2 } from 'lucide-react'

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300'

export function CreateUsefulLinkForm() {
  const [state, action, pending] = useActionState(createUsefulLink, undefined)

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <Link2 size={16} className="text-brand-700" /> Adicionar Link Útil
      </h2>
      <form action={action} className="space-y-3">
        <div className="flex gap-2">
          <div className="w-16">
            <label className="block text-xs text-gray-500 mb-1">Emoji</label>
            <input name="emoji" defaultValue="🔗" maxLength={4} className={inputCls + ' text-center text-lg'} />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Nome</label>
            <input name="label" required placeholder="Ex: Calculadora ZAR" className={inputCls} />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">URL</label>
          <input name="url" type="url" required placeholder="https://..." className={inputCls} />
        </div>
        {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
        {state?.success && <p className="text-xs text-emerald-600">Link adicionado!</p>}
        <button type="submit" disabled={pending}
          className="w-full bg-brand-800 hover:bg-brand-900 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg transition-colors">
          {pending ? 'Adicionando...' : 'Adicionar Link'}
        </button>
      </form>
    </div>
  )
}
