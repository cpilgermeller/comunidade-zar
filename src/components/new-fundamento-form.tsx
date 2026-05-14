'use client'

import { useActionState, useRef, useState } from 'react'
import { createFundamento } from '@/app/actions/fundamentos'
import { RichTextEditor } from './rich-text-editor'

export function NewFundamentoForm({ existingTypes }: { existingTypes: string[] }) {
  const [state, , pending] = useActionState(createFundamento, undefined)
  const [body, setBody] = useState('')
  const [typeInput, setTypeInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const suggestions = existingTypes.filter((t) =>
    t.toLowerCase().includes(typeInput.toLowerCase()) && typeInput.length > 0
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData(formRef.current!)
    fd.set('body', body)
    await createFundamento(undefined, fd)
  }

  const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400'

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Título do fundamento *</label>
        <input name="title" required placeholder="Ex: Argumento de restituição em dobro por cobrança indevida" className={inputClass} />
      </div>

      <div className="relative">
        <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de alegação *</label>
        <input
          name="allegationType"
          required
          value={typeInput}
          onChange={(e) => { setTypeInput(e.target.value); setShowSuggestions(true) }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Ex: Restituição em dobro, Venda casada de seguro"
          className={inputClass}
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
            {suggestions.map((t) => (
              <button
                key={t}
                type="button"
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                onMouseDown={() => { setTypeInput(t); setShowSuggestions(false) }}
              >
                {t}
              </button>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-1">Use um tipo já existente para agrupar, ou crie um novo.</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Fundamento / Abordagem *</label>
        <RichTextEditor onChange={setBody} placeholder="Descreva o fundamento jurídico, como você aborda esse tema, os argumentos que utiliza..." />
      </div>

      {state?.error && <p className="text-xs text-red-500">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
      >
        {pending ? 'Salvando...' : 'Publicar Fundamento'}
      </button>
    </form>
  )
}
