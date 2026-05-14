import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Avatar } from '@/components/avatar'
import { RichTextDisplay } from '@/components/rich-text-editor'
import { formatDate } from '@/lib/utils'
import { deleteJurisprudence } from '@/app/actions/jurisprudencias'
import Link from 'next/link'
import { Scale, Building2, CalendarDays, ExternalLink, ArrowLeft, Trash2 } from 'lucide-react'

export default async function JurisprudenciaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  const { id } = await params

  const j = await db.jurisprudence.findUnique({
    where: { id },
    include: { author: { select: { name: true } } },
  })

  if (!j) notFound()

  return (
    <div className="flex h-full">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Link href="/jurisprudencias" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
            <ArrowLeft size={14} /> Banco de Jurisprudências
          </Link>

          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs font-medium px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                    {j.subject}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Building2 size={11} /> {j.tribunal}
                  </span>
                  {j.decisionDate && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <CalendarDays size={11} />
                      {new Date(j.decisionDate).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-gray-900">{j.title}</h1>
              </div>
              {session?.role === 'admin' && (
                <form action={deleteJurisprudence.bind(null, j.id)}>
                  <button type="submit" className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-300 px-2.5 py-1.5 rounded-lg transition-colors">
                    <Trash2 size={12} /> Excluir
                  </button>
                </form>
              )}
            </div>

            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
              <Avatar name={j.author.name} size="sm" />
              <div>
                <p className="text-sm font-medium text-gray-700">{j.author.name}</p>
                <p className="text-xs text-gray-400">Adicionado em {formatDate(j.createdAt)}</p>
              </div>
              {j.sourceLink && (
                <a
                  href={j.sourceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 border border-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <ExternalLink size={12} /> Ver fonte
                </a>
              )}
            </div>

            <div className="prose prose-sm max-w-none text-gray-700">
              <RichTextDisplay html={j.body} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
