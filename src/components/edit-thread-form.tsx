'use client'

import { useState, useEffect, useActionState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { updateThread } from '@/app/actions/threads'
import { RichTextEditor } from './rich-text-editor'
import { Pencil, X, Check, Clock } from 'lucide-react'

const EDIT_WINDOW_MS = 30 * 60 * 1000

type Props = {
  threadId: string
  title: string
  body: string
  createdAt: string
}

function useRemainingTime(createdAt: string) {
  const [remaining, setRemaining] = useState(() => {
    const elapsed = Date.now() - new Date(createdAt).getTime()
    return Math.max(0, EDIT_WINDOW_MS - elapsed)
  })

  useEffect(() => {
    if (remaining === 0) return
    const interval = setInterval(() => {
      const elapsed = Date.now() - new Date(createdAt).getTime()
      setRemaining(Math.max(0, EDIT_WINDOW_MS - elapsed))
    }, 10000)
    return () => clearInterval(interval)
  }, [createdAt, remaining])

  return remaining
}

function formatRemaining(ms: number) {
  const minutes = Math.ceil(ms / 60000)
  return minutes === 1 ? '1 min' : `${minutes} min`
}

export function EditThreadForm({ threadId, title, body, createdAt }: Props) {
  const [editing, setEditing] = useState(false)
  const [html, setHtml] = useState(body)
  const [state, action, pending] = useActionState(updateThread, undefined)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const remaining = useRemainingTime(createdAt)

  useEffect(() => {
    if (state !== undefined && !state?.error) {
      setEditing(false)
      router.refresh()
    }
  }, [state, router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!html || html === '<p></p>') return
    const fd = new FormData(formRef.current!)
    fd.set('body', html)
    await action(fd)
  }

  if (remaining === 0) return null

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand-700 transition-colors"
        title={`Editar discussão — ${formatRemaining(remaining)} restantes`}
      >
        <Pencil size={13} />
        <span>Editar</span>
        <span className="flex items-center gap-0.5 text-gray-300">
          <Clock size={11} /> {formatRemaining(remaining)}
        </span>
      </button>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="mt-4 space-y-4 bg-brand-50 border border-brand-100 rounded-xl p-4">
      <p className="text-xs text-brand-700 font-medium flex items-center gap-1.5">
        <Pencil size={12} /> Editando discussão — {formatRemaining(remaining)} restantes
      </p>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Título</label>
        <input
          type="text"
          name="title"
          required
          maxLength={200}
          defaultValue={title}
          className="w-full border border-[#ede8e3] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Conteúdo</label>
        <RichTextEditor content={body} onChange={setHtml} placeholder="Conteúdo..." />
      </div>

      <input type="hidden" name="threadId" value={threadId} />

      {state?.error && (
        <p className="text-xs text-red-500">{state.error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-1.5 bg-brand-800 hover:bg-brand-900 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Check size={14} /> {pending ? 'Salvando...' : 'Salvar alterações'}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <X size={14} /> Cancelar
        </button>
      </div>
    </form>
  )
}
