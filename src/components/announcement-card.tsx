'use client'

import { useState } from 'react'
import { RichTextDisplay } from './rich-text-editor'
import { Pin, ChevronDown, ChevronUp } from 'lucide-react'
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
    <div className={`px-5 py-4 ${ann.pinned ? 'bg-gold-50/50' : ''}`}>
      <div className="flex items-start gap-2.5">
        {ann.pinned && <Pin size={12} className="text-gold-500 fill-gold-400 mt-1 shrink-0" />}
        <div className="flex-1 min-w-0">

          {/* Cabeçalho clicável */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="w-full text-left group"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-sm font-bold text-gray-900 group-hover:text-brand-800 transition-colors leading-snug">
                {ann.title}
              </h3>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-[#b5a9a4]">{formatDate(ann.createdAt)}</span>
                {expanded
                  ? <ChevronUp size={14} className="text-[#b5a9a4]" />
                  : <ChevronDown size={14} className="text-[#b5a9a4]" />}
              </div>
            </div>

            {/* Preview quando fechado */}
            {!expanded && (
              <p className="text-xs text-[#b5a9a4] mt-0.5">Clique para ler o aviso completo</p>
            )}
          </button>

          {/* Conteúdo expandido */}
          {expanded && (
            <div className="mt-3 text-sm text-gray-600 leading-relaxed border-t border-[#f0eae6] pt-3">
              <RichTextDisplay html={ann.content} />
              <p className="text-[11px] text-[#c8bbb6] mt-3">
                Por {ann.author.name}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
