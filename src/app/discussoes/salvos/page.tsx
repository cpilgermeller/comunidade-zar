import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { ThreadCard } from '@/components/thread-card'
import { Bookmark, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function SalvosPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const bookmarks = await db.threadBookmark.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    include: {
      thread: {
        include: {
          author: { select: { name: true } },
          category: { select: { name: true, color: true } },
          _count: { select: { comments: true, likes: true } },
        },
      },
    },
  })

  const threads = bookmarks.map((b) => b.thread)

  return (
    <div className="flex h-full">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Bookmark size={22} className="text-brand-700" /> Discussões Salvas
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {threads.length} discussão{threads.length !== 1 ? 'ões' : ''} salva{threads.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Link
              href="/discussoes"
              className="text-sm text-gray-400 hover:text-brand-700 transition-colors"
            >
              Ver todas
            </Link>
          </div>

          {threads.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
              <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bookmark size={24} className="text-brand-300" />
              </div>
              <p className="font-semibold text-gray-700">Nenhuma discussão salva ainda</p>
              <p className="text-sm text-gray-400 mt-1">
                Clique em <strong>Salvar</strong> em qualquer discussão para encontrá-la aqui depois.
              </p>
              <Link
                href="/discussoes"
                className="inline-flex items-center gap-1.5 mt-5 bg-brand-800 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-brand-900 transition-colors"
              >
                <Plus size={14} /> Explorar discussões
              </Link>
            </div>
          ) : (
            <div className="space-y-3 stagger">
              {threads.map((thread) => (
                <ThreadCard
                  key={thread.id}
                  thread={{ ...thread, resolved: thread.resolved ?? false }}
                  isBookmarked
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
