'use client'

import { useState, useRef } from 'react'
import { RichTextEditor } from './rich-text-editor'
import { createThread } from '@/app/actions/threads'
import Link from 'next/link'

type Category = { id: string; name: string; color: string }

export function NewThreadForm({ categories }: { categories: Category[] }) {
  const [html, setHtml] = useState('')
  const [pending, setPending] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!html || html === '<p></p>') return
    setPending(true)
    const fd = new FormData(formRef.current!)
    fd.set('body', html)
    await createThread(fd)
    setPending(false)
  }

  const inputClass = 'w-full border border-[#ede8e3] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-[#fdf9f7] focus:bg-white transition-colors'

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 bg-white border border-[#f0eae6] rounded-2xl p-6">
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Categoria</label>
        {categories.length === 0 ? (
          <p className="text-sm text-amber-600">Nenhuma categoria disponível.</p>
        ) : (
          <select name="categoryId" required className={inputClass}>
            <option value="">Selecione uma categoria...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Título</label>
        <input type="text" name="title" required maxLength={200}
          placeholder="Descreva sua dúvida ou tema de forma clara..."
          className={inputClass} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Conteúdo</label>
        <RichTextEditor onChange={setHtml} placeholder="Detalhe sua dúvida, adicione imagens, formatação..." />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Link href="/discussoes" className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          Cancelar
        </Link>
        <button type="submit" disabled={pending || categories.length === 0}
          className="bg-gradient-to-r from-brand-900 to-brand-700 hover:from-brand-950 hover:to-brand-800 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm shadow-brand-200">
          {pending ? 'Publicando...' : 'Publicar Discussão'}
        </button>
      </div>
    </form>
  )
}
