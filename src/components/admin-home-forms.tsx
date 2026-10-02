'use client'

import { useActionState, useRef, useState, useEffect } from 'react'
import { createAnnouncement, createEvent, updateEvent } from '@/app/actions/home'
import { RichTextEditor } from './rich-text-editor'
import { Megaphone, CalendarDays, Pencil, X, Check, ExternalLink, Trash2 } from 'lucide-react'

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

type EventData = {
  id: string
  title: string
  description: string | null
  link: string | null
  eventDate: Date | string
}

function toDatetimeLocal(date: Date | string) {
  const d = new Date(date)
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offset).toISOString().slice(0, 16)
}

export function EditEventInline({
  event,
  deleteAction,
}: {
  event: EventData
  deleteAction: () => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [state, action, pending] = useActionState(updateEvent, undefined)

  useEffect(() => {
    if (state?.success) setEditing(false)
  }, [state?.success])

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{event.title}</p>
          <p className="text-xs text-gray-400">
            {new Date(event.eventDate).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        {event.link && (
          <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-800">
            <ExternalLink size={14} />
          </a>
        )}
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className={`p-1.5 rounded border transition-colors ${editing ? 'border-blue-300 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200'}`}
          title="Editar evento"
        >
          <Pencil size={12} />
        </button>
        <form action={deleteAction}>
          <button type="submit" className="text-xs px-2 py-1 rounded border border-red-200 text-red-400 hover:bg-red-50 transition-colors">
            <Trash2 size={12} />
          </button>
        </form>
      </div>

      {editing && (
        <form action={action} className="mt-2 space-y-2 bg-blue-50 border border-blue-100 rounded-xl p-3">
          <input type="hidden" name="id" value={event.id} />
          <input
            name="title"
            required
            defaultValue={event.title}
            placeholder="Nome do evento"
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white"
          />
          <input
            name="description"
            defaultValue={event.description ?? ''}
            placeholder="Descrição (opcional)"
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white"
          />
          <input
            name="link"
            type="url"
            defaultValue={event.link ?? ''}
            placeholder="Link (opcional)"
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white"
          />
          <div>
            <label className="block text-xs text-gray-500 mb-1">Data e horário</label>
            <input
              name="eventDate"
              type="datetime-local"
              required
              defaultValue={toDatetimeLocal(event.eventDate)}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white"
            />
          </div>
          {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <Check size={12} /> {pending ? 'Salvando...' : 'Salvar alterações'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <X size={12} /> Cancelar
            </button>
          </div>
        </form>
      )}
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
