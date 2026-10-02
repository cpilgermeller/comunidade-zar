'use client'

import { useTransition } from 'react'
import { Bookmark } from 'lucide-react'
import { toggleBookmark } from '@/app/actions/threads'

export function BookmarkButton({
  threadId,
  initialBookmarked,
}: {
  threadId: string
  initialBookmarked: boolean
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => toggleBookmark(threadId))}
      className={`flex items-center gap-1.5 text-sm transition-colors disabled:opacity-50 ${
        initialBookmarked
          ? 'text-brand-700'
          : 'text-gray-400 hover:text-brand-700'
      }`}
      title={initialBookmarked ? 'Remover dos salvos' : 'Salvar discussão'}
    >
      <Bookmark size={16} fill={initialBookmarked ? 'currentColor' : 'none'} />
      {initialBookmarked ? 'Salvo' : 'Salvar'}
    </button>
  )
}
