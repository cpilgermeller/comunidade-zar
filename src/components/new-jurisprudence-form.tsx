'use client'

import { useActionState, useRef, useState } from 'react'
import { createJurisprudence } from '@/app/actions/jurisprudencias'
import { RichTextEditor } from './rich-text-editor'

export function NewJurisprudenceForm({ existingSubjects }: { existingSubjects: string[] }) {
  const [state, , pending] = useActionState(createJurisprudence, undefined)
  const [body, setBody] = useState('')
  const [subjectInput, setSubjectInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const suggestions = existingSubjects.filter((s) =>
    s.toLowerCase().includes(subjectInput.toLowerCase()) && subjectInput.length > 0
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData(formRef.current!)
    fd.set('body', body)
    await createJurisprudence(undefined, fd)
  }

  const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400'

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Título / Ementa *</label>
        <input name="title" required placeholder="Ex: Banco réu deve restituir em dobro cobrança indevida" className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tribunal *</label>
          <input name="tribunal" required placeholder="Ex: TJSP, STJ, TJRJ" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Data da decisão</label>
          <input name="decisionDate" type="date" className={inputClass} />
        </div>
      </div>

      <div className="relative">
        <label className="block text-xs font-medium text-gray-600 mb-1">Assunto / Tema *</label>
        <input
          name="subject"
          required
          value={subjectInput}
          onChange={(e) => { setSubjectInput(e.target.value); setShowSuggestions(true) }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Ex: Restituição em dobro, Venda casada de seguro"
          className={inputClass}
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                onMouseDown={() => { setSubjectInput(s); setShowSuggestions(false) }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Link da fonte (opcional)</label>
        <input name="sourceLink" type="url" placeholder="https://..." className={inputClass} />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Decisão / Ementa completa *</label>
        <RichTextEditor onChange={setBody} placeholder="Cole ou escreva o texto da decisão aqui..." />
      </div>

      {state?.error && <p className="text-xs text-red-500">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
      >
        {pending ? 'Salvando...' : 'Salvar Jurisprudência'}
      </button>
    </form>
  )
}
