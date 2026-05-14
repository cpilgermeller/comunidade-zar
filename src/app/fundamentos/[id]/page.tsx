import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Avatar } from '@/components/avatar'
import { RichTextDisplay } from '@/components/rich-text-editor'
import { formatDate } from '@/lib/utils'
import { deleteFundamento, toggleFundamentoLike } from '@/app/actions/fundamentos'
import Link from 'next/link'
import { BookOpen, ArrowLeft, Trash2, Heart, Shield } from 'lucide-react'

export default async function FundamentoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  const { id } = await params

  const f = await db.fundamento.findUnique({
    where: { id },
    include: {
      author: { select: { name: true } },
      likes: { select: { userId: true } },
    },
  })

  if (!f) notFound()

  const liked = session ? f.likes.some((l) => l.userId === session.userId) : false

  return (
    <div className="flex h-full">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Link href="/fundamentos" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
            <ArrowLeft size={14} /> Banco de Fundamentos
          </Link>

          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-medium px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                    {f.allegationType}
                  </span>
                  {f.isOfficial && (
                    <span className="flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                      <Shield size={10} /> Oficial ZAR
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-gray-900">{f.title}</h1>
              </div>
              {session?.role === 'admin' && (
                <form action={deleteFundamento.bind(null, f.id)}>
                  <button type="submit" className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-300 px-2.5 py-1.5 rounded-lg transition-colors">
                    <Trash2 size={12} /> Excluir
                  </button>
                </form>
              )}
            </div>

            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
              <Avatar name={f.author.name} size="sm" />
              <div>
                <p className="text-sm font-medium text-gray-700">{f.author.name}</p>
                <p className="text-xs text-gray-400">Adicionado em {formatDate(f.createdAt)}</p>
              </div>
              <form action={toggleFundamentoLike.bind(null, f.id)} className="ml-auto">
                <button
                  type="submit"
                  disabled={!session}
                  className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ${liked ? 'bg-rose-50 border-rose-200 text-rose-600' : 'border-gray-200 text-gray-500 hover:border-rose-200 hover:text-rose-500'}`}
                >
                  <Heart size={14} className={liked ? 'fill-rose-500' : ''} />
                  {f.likes.length} curtida{f.likes.length !== 1 ? 's' : ''}
                </button>
              </form>
            </div>

            <div className="prose prose-sm max-w-none text-gray-700">
              <RichTextDisplay html={f.body} />
            </div>
          </div>

          <Link
            href={`/fundamentos?tipo=${encodeURIComponent(f.allegationType)}`}
            className="mt-4 flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700"
          >
            <BookOpen size={14} /> Ver outros fundamentos sobre "{f.allegationType}"
          </Link>
        </div>
      </main>
    </div>
  )
}
