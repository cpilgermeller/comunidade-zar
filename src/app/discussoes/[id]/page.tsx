import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Avatar } from '@/components/avatar'
import { CommentNode } from '@/components/comment-tree'
import { CommentForm } from '@/components/comment-form'
import { RichTextDisplay } from '@/components/rich-text-editor'
import { formatDate } from '@/lib/utils'
import { toggleThreadLike, deleteThread } from '@/app/actions/threads'
import { togglePinThread, toggleLockThread } from '@/app/actions/admin'
import { Heart, Eye, MessageSquare, Pin, Lock, Trash2, ChevronLeft, Shield } from 'lucide-react'
import Link from 'next/link'

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  const isAdmin = session?.role === 'admin'

  const thread = await db.thread.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      category: { select: { name: true, color: true } },
      likes: { select: { userId: true } },
      _count: { select: { comments: true } },
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: { id: true, name: true } },
          likes: { select: { userId: true } },
          replies: {
            orderBy: { createdAt: 'asc' },
            include: {
              author: { select: { id: true, name: true } },
              likes: { select: { userId: true } },
              replies: {
                orderBy: { createdAt: 'asc' },
                include: {
                  author: { select: { id: true, name: true } },
                  likes: { select: { userId: true } },
                  replies: { include: { author: { select: { id: true, name: true } }, likes: { select: { userId: true } } } },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!thread) notFound()

  // Increment views (fire-and-forget)
  db.thread.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {})

  const liked = session ? thread.likes.some((l) => l.userId === session.userId) : false
  const canDelete = session && (thread.author.id === session.userId || isAdmin)

  return (
    <div className="flex h-full">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Link href="/discussoes" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
            <ChevronLeft size={16} /> Voltar
          </Link>

          {/* Thread Header */}
          <div className="bg-white border border-[#f0eae6] rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-2 flex-wrap mb-3">
              {thread.pinned && (
                <span className="flex items-center gap-1 text-xs font-medium text-gold-600 bg-gold-50 px-2 py-0.5 rounded-full border border-gold-200">
                  <Pin size={11} className="fill-gold-500" /> Fixado
                </span>
              )}
              <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: thread.category.color }}>
                {thread.category.name}
              </span>
              {thread.locked && (
                <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                  <Lock size={11} /> Encerrado
                </span>
              )}
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-4">{thread.title}</h1>

            <div className="flex items-center gap-3 mb-5">
              <Avatar name={thread.author.name} />
              <div>
                <p className="text-sm font-medium text-gray-800">{thread.author.name}</p>
                <p className="text-xs text-gray-400">{formatDate(thread.createdAt)}</p>
              </div>
            </div>

            <div className="mb-6">
              <RichTextDisplay html={thread.body} />
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-[#f7f2ef] flex-wrap">
              {session && (
                <form action={toggleThreadLike.bind(null, thread.id)}>
                  <button
                    type="submit"
                    className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-400'}`}
                  >
                    <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                    {thread.likes.length > 0 && <span>{thread.likes.length}</span>}
                    {liked ? 'Curtido' : 'Curtir'}
                  </button>
                </form>
              )}
              <span className="flex items-center gap-1 text-sm text-gray-400">
                <MessageSquare size={15} /> {thread._count.comments} resposta{thread._count.comments !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-400">
                <Eye size={15} /> {thread.views} visualização{thread.views !== 1 ? 'ões' : ''}
              </span>

              {/* Admin actions */}
              {isAdmin && (
                <div className="ml-auto flex gap-2">
                  <form action={togglePinThread.bind(null, thread.id)}>
                    <button type="submit" className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-colors ${thread.pinned ? 'text-gold-600 border-gold-200 bg-gold-50' : 'text-gray-400 border-gray-200 hover:border-gold-200'}`}>
                      <Pin size={12} /> {thread.pinned ? 'Desafixar' : 'Fixar'}
                    </button>
                  </form>
                  <form action={toggleLockThread.bind(null, thread.id)}>
                    <button type="submit" className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-colors ${thread.locked ? 'text-amber-600 border-amber-200 bg-amber-50' : 'text-gray-400 border-gray-200 hover:border-amber-200'}`}>
                      <Lock size={12} /> {thread.locked ? 'Abrir' : 'Encerrar'}
                    </button>
                  </form>
                </div>
              )}

              {canDelete && (
                <form action={deleteThread.bind(null, thread.id)} className={isAdmin ? '' : 'ml-auto'}>
                  <button type="submit" className="flex items-center gap-1 text-xs text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 size={14} /> Excluir
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white border border-[#f0eae6] rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              {thread._count.comments} Resposta{thread._count.comments !== 1 ? 's' : ''}
            </h2>

            {!thread.locked && session && (
              <div className="mb-6">
                <CommentForm threadId={thread.id} authorName={session.name} placeholder="Escreva sua resposta..." />
              </div>
            )}

            {thread.locked && (
              <div className="flex items-center gap-2 bg-amber-50 text-amber-700 text-sm px-4 py-3 rounded-lg mb-4">
                <Lock size={14} /> Esta discussão foi encerrada. Novos comentários não são permitidos.
              </div>
            )}

            {thread.comments.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Seja o primeiro a responder!</p>
            ) : (
              <div className="divide-y divide-[#f7f2ef]">
                {thread.comments.map((comment) => (
                  <CommentNode
                    key={comment.id}
                    comment={comment as any}
                    threadId={thread.id}
                    currentUserId={session?.userId ?? ''}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
