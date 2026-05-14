'use client'

import { useRef, useState } from 'react'
import { createComment } from '@/app/actions/comments'
import { Avatar } from './avatar'

type Props = {
  threadId: string; parentId?: string; authorName: string
  onCancel?: () => void; placeholder?: string
}

export function CommentForm({ threadId, parentId, authorName, onCancel, placeholder }: Props) {
  const [pending, setPending] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    await createComment(formData)
    formRef.current?.reset()
    setPending(false)
    onCancel?.()
  }

  return (
    <div className="flex gap-3">
      <Avatar name={authorName} size={parentId ? 'sm' : 'md'} />
      <form ref={formRef} action={handleSubmit} className="flex-1">
        <input type="hidden" name="threadId" value={threadId} />
        {parentId && <input type="hidden" name="parentId" value={parentId} />}
        <textarea name="body" required rows={3}
          placeholder={placeholder ?? 'Escreva sua resposta...'}
          className="w-full border border-[#ede8e3] rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent bg-[#fdf9f7] focus:bg-white transition-colors" />
        <div className="flex gap-2 mt-2 justify-end">
          {onCancel && (
            <button type="button" onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5">Cancelar</button>
          )}
          <button type="submit" disabled={pending}
            className="bg-brand-800 hover:bg-brand-900 disabled:opacity-50 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors">
            {pending ? 'Enviando...' : 'Responder'}
          </button>
        </div>
      </form>
    </div>
  )
}
