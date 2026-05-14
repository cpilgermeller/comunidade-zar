import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { Navbar } from '@/components/navbar'
import { Avatar } from '@/components/avatar'
import { formatDate } from '@/lib/utils'
import { deleteJurisprudence } from '@/app/actions/jurisprudencias'
import Link from 'next/link'
import { Scale, Plus, Search, Trash2, ExternalLink, CalendarDays, Building2 } from 'lucide-react'

export default async function JurisprudenciasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; assunto?: string }>
}) {
  const session = await getSession()
  const { q, assunto } = await searchParams

  const jurisprudences = await db.jurisprudence.findMany({
    where: {
      AND: [
        q ? {
          OR: [
            { title: { contains: q } },
            { tribunal: { contains: q } },
            { subject: { contains: q } },
            { body: { contains: q } },
          ],
        } : {},
        assunto ? { subject: { contains: assunto } } : {},
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { name: true } } },
  })

  const allSubjects = await db.jurisprudence.findMany({
    select: { subject: true },
    distinct: ['subject'],
    orderBy: { subject: 'asc' },
  })

  return (
    <div className="flex h-full">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Scale size={18} className="text-emerald-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Banco de Jurisprudências</h1>
                <p className="text-sm text-gray-500">{jurisprudences.length} decisão{jurisprudences.length !== 1 ? 'ões' : ''} registrada{jurisprudences.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            {session && (
              <Link
                href="/jurisprudencias/nova"
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={15} /> Adicionar
              </Link>
            )}
          </div>

          {/* Filtros */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
            <form className="flex-1 flex gap-2" method="GET">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Buscar por título, tribunal, assunto..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              {assunto && <input type="hidden" name="assunto" value={assunto} />}
              <button type="submit" className="bg-emerald-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                Buscar
              </button>
            </form>
          </div>

          {/* Tags de assunto */}
          {allSubjects.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <Link
                href="/jurisprudencias"
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!assunto ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 text-gray-600 hover:border-emerald-300'}`}
              >
                Todos
              </Link>
              {allSubjects.map((s) => (
                <Link
                  key={s.subject}
                  href={`/jurisprudencias?assunto=${encodeURIComponent(s.subject)}${q ? `&q=${q}` : ''}`}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${assunto === s.subject ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 text-gray-600 hover:border-emerald-300'}`}
                >
                  {s.subject}
                </Link>
              ))}
            </div>
          )}

          {/* Lista */}
          {jurisprudences.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
              <Scale size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Nenhuma jurisprudência encontrada.</p>
              {session && (
                <Link href="/jurisprudencias/nova" className="mt-3 inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700">
                  <Plus size={14} /> Adicionar a primeira
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {jurisprudences.map((j) => (
                <div key={j.id} className="bg-white border border-gray-100 rounded-xl p-5 hover:border-emerald-200 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="text-xs font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
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
                      <Link href={`/jurisprudencias/${j.id}`}>
                        <h3 className="text-sm font-semibold text-gray-900 hover:text-emerald-700 transition-colors line-clamp-2">
                          {j.title}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-3 mt-2">
                        <Avatar name={j.author.name} size="sm" />
                        <span className="text-xs text-gray-400">{j.author.name} · {formatDate(j.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {j.sourceLink && (
                        <a href={j.sourceLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-600 transition-colors">
                          <ExternalLink size={15} />
                        </a>
                      )}
                      <Link href={`/jurisprudencias/${j.id}`} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                        Ver →
                      </Link>
                      {session?.role === 'admin' && (
                        <form action={deleteJurisprudence.bind(null, j.id)}>
                          <button type="submit" className="text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
