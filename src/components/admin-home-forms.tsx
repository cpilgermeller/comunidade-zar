'use client'

import { useActionState, useRef, useState } from 'react'
import { createAnnouncement, createEvent } from '@/app/actions/home'
import { RichTextEditor } from './rich-text-editor'
import { Megaphone, CalendarDays } from 'lucide-react'

export function CreateAnnouncementForm() {
  const [state, action, pending] = useActionState(createAnnouncement, undefined)
  const [content, setContent] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData(formRef.current!)
    fd.set('content', content)
    await createAnnouncement(undefined, fd)
    formRef.current?.reset()
    setContent('')
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <Megaphone size={16} className="text-amber-500" /> Criar Aviso
      </h2>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
        <input name="title" required placeholder="Título do aviso" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
        <RichTextEditor onChange={setContent} placeholder="Conteúdo do aviso..." />
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" name="pinned" className="rounded" />
          Fixar aviso
        </label>
        {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
        {state?.success && <p className="text-xs text-emerald-600">Aviso criado!</p>}
        <button type="submit" disabled={pending} className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg transition-colors">
          {pending ? 'Criando...' : 'Publicar Aviso'}
        </button>
      </form>
    </div>
  )
}

export function CreateEventForm() {
  const [state, action, pending] = useActionState(createEvent, undefined)

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <CalendarDays size={16} className="text-blue-500" /> Criar Aula / Evento
      </h2>
      <form action={action} className="space-y-3">
        <input name="title" required placeholder="Nome da aula ou evento" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
        <input name="description" placeholder="Descrição (opcional)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
        <input name="link" type="url" placeholder="Link da aula (opcional)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
        <div>
          <label className="block text-xs text-gray-500 mb-1">Data e horário</label>
          <input name="eventDate" type="datetime-local" required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
        </div>
        {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
        {state?.success && <p className="text-xs text-emerald-600">Evento criado!</p>}
        <button type="submit" disabled={pending} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg transition-colors">
          {pending ? 'Criando...' : 'Criar Evento'}
        </button>
      </form>
    </div>
  )
}
