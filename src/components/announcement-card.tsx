'use client'

import { useState } from 'react'
import { RichTextDisplay } from './rich-text-editor'
import { Megaphone, Pin, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDate } from '@/lib/utils'

type Announcement = {
  id: string
  title: string
  content: string
  pinned: boolean
  createdAt: Date
  author: { name: string }
}

export function AnnouncementCard({ ann }: { ann: Announcement }) {
  const [expanded, setExpanded] = useState(ann.pinned)

  return (
    <div className={`px-5 py-4 ${ann.pinned ? 'bg-amber-50/40' : ''}`}>
      <button type="button" onClick={() => setExpanded((v) => !v)} className="w-full text-left group">
        <div className="flex items-center gap-4">
          {/* Ícone */}
          <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: ann.pinned ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #e8f0fe, #c7d7fd)' }}>
            {ann.pinned
              ? <Pin size={16} className="text-white fill-white" />
              : <Megaphone size={16} className="text-brand-700" />}
          </div>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-bold text-gray-900 group-hover:text-brand-800 transition-colors leading-snug text-sm">
                {ann.title}
              </h3>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-gray-400">{formatDate(ann.createdAt)}</span>
                {expanded
                  ? <ChevronUp size={14} className="text-gray-300" />
                  : <ChevronDown size={14} className="text-gray-300" />}
              </div>
            </div>
            {!expanded && (
              <p className="text-xs text-gray-400 mt-0.5">Clique para ler o aviso completo e conferir todas as novidades.</p>
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="mt-4 ml-15 text-sm text-gray-600 leading-relaxed pt-3" style={{ borderTop: '1px solid #f0f0f0', marginLeft: 60 }}>
          <RichTextDisplay html={ann.content} />
          <p className="text-xs text-gray-300 mt-3">Por {ann.author.name}</p>
        </div>
      )}
    </div>
  )
}
