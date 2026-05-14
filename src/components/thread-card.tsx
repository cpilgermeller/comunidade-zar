import Link from 'next/link'
import { Avatar } from './avatar'
import { formatDate } from '@/lib/utils'
import { MessageSquare, Heart, Eye, Pin, Lock } from 'lucide-react'

type ThreadCardProps = {
  thread: {
    id: string; title: string; body: string
    pinned: boolean; locked: boolean; views: number; createdAt: Date
    author: { name: string }
    category: { name: string; color: string }
    _count: { comments: number; likes: number }
  }
}

export function ThreadCard({ thread }: ThreadCardProps) {
  return (
    <Link href={`/discussoes/${thread.id}`}>
      <div className="group bg-white rounded-2xl border border-[#f0eae6] p-5 card-hover hover:border-brand-200 cursor-pointer">
        <div className="flex items-start gap-3.5">
          <div className="mt-0.5"><Avatar name={thread.author.name} /></div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full text-white shadow-sm"
                style={{ backgroundColor: thread.category.color }}>
                {thread.category.name}
              </span>
              {thread.pinned && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-gold-600 bg-gold-50 px-2 py-0.5 rounded-full border border-gold-200">
                  <Pin size={10} className="fill-gold-500" /> Fixado
                </span>
              )}
              {thread.locked && (
                <span className="flex items-center gap-1 text-[11px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                  <Lock size={10} /> Encerrado
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-brand-800 transition-colors line-clamp-2 leading-snug mb-1.5">
              {thread.title}
            </h3>
            <p className="text-sm text-[#b5a9a4] line-clamp-1 mb-3">
              {thread.body.replace(/<[^>]+>/g, '')}
            </p>
            <div className="flex items-center gap-1 text-xs text-[#b5a9a4]">
              <span className="font-medium text-gray-500">{thread.author.name.split(' ')[0]}</span>
              <span className="mx-1 text-gray-200">·</span>
              <span>{formatDate(thread.createdAt)}</span>
              <span className="flex-1" />
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[#fdf5f6]"><MessageSquare size={12} /> {thread._count.comments}</span>
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[#fdf5f6]"><Heart size={12} /> {thread._count.likes}</span>
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[#fdf5f6]"><Eye size={12} /> {thread.views}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
