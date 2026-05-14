import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { Navbar } from '@/components/navbar'
import { Avatar } from '@/components/avatar'
import { formatDate } from '@/lib/utils'
import { deleteFundamento, toggleFundamentoLike } from '@/app/actions/fundamentos'
import Link from 'next/link'
import { BookOpen, Plus, Search, Trash2, Heart, Shield, ChevronRight } from 'lucide-react'

export default async function FundamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tipo?: string }>
}) {
  const session = await getSession()
  const { q, tipo } = await searchParams

  const fundamentos = await db.fundamento.findMany({
    where: {
      AND: [
        q ? {
          OR: [
            { title: { contains: q } },
            { allegationType: { contains: q } },
            { body: { contains: q } },
          ],
        } : {},
        tipo ? { allegationType: { contains: tipo } } : {},
      ],
    },
    orderBy: [{ isOfficial: 'desc' }, { createdAt: 'desc' }],
    include: {
      author: { select: { name: true } },
      likes: { select: { userId: true } },
    },
  })

  const allTypes = await db.fundamento.findMany({
    select: { allegationType: true },
    distinct: ['allegationType'],
    orderBy: { allegationType: 'asc' },
  })

  // Agrupar por tipo de alegação
  const grouped = fundamentos.reduce<Record<string, typeof fundamentos>>((acc, f) => {
    if (!acc[f.allegationType]) acc[f.allegationType] = []
    acc[f.allegationType].push(f)
    return acc
  }, {})

  return (
    <div className="flex h-full">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
                <BookOpen size={18} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Banco de Fundamentos</h1>
                <p className="text-sm text-gray-500">{fundamentos.length} fundamento{fundamentos.length !== 1 ? 's' : ''} registrado{fundamentos.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            {session && (
              <Link
                href="/fundamentos/novo"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={15} /> Contribuir
              </Link>
            )}
          </div>

          {/* Filtros */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 mb-6 flex gap-3">
            <form className="flex-1 flex gap-2" method="GET">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Buscar fundamentos..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              {tipo && <input type="hidden" name="tipo" value={tipo} />}
              <button type="submit" className="bg-indigo-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                Buscar
              </button>
            </form>
          </div>

          {/* Tags de tipo */}
          {allTypes.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <Link
                href="/fundamentos"
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!tipo ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}
              >
                Todos
              </Link>
              {allTypes.map((t) => (
                <Link
                  key={t.allegationType}
                  href={`/fundamentos?tipo=${encodeURIComponent(t.allegationType)}${q ? `&q=${q}` : ''}`}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${tipo === t.allegationType ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}
                >
                  {t.allegationType}
                </Link>
              ))}
            </div>
          )}

          {/* Conteúdo */}
          {fundamentos.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
              <BookOpen size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Nenhum fundamento encontrado.</p>
              {session && (
                <Link href="/fundamentos/novo" className="mt-3 inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700">
                  <Plus size={14} /> Adicionar o primeiro
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(grouped).map(([tipo, items]) => (
                <div key={tipo}>
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full" />
                    {tipo}
                    <span className="text-gray-400 font-normal normal-case tracking-normal">({items.length})</span>
                  </h2>
                  <div className="space-y-3">
                    {items.map((f) => {
                      const liked = session ? f.likes.some((l) => l.userId === session.userId) : false
                      return (
                        <div key={f.id} className={`bg-white border rounded-xl p-5 hover:border-indigo-200 transition-colors ${f.isOfficial ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-100'}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {f.isOfficial && (
                                  <span className="flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                                    <Shield size={10} /> Oficial ZAR
                                  </span>
                                )}
                              </div>
                              <Link href={`/fundamentos/${f.id}`}>
                                <h3 className="text-sm font-semibold text-gray-900 hover:text-indigo-700 transition-colors">
                                  {f.title}
                                </h3>
                              </Link>
                              <div className="flex items-center gap-3 mt-2">
                                <Avatar name={f.author.name} size="sm" />
                                <span className="text-xs text-gray-400">{f.author.name} · {formatDate(f.createdAt)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <form action={toggleFundamentoLike.bind(null, f.id)}>
                                <button
                                  type="submit"
                                  disabled={!session}
                                  className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${liked ? 'bg-rose-50 border-rose-200 text-rose-600' : 'border-gray-200 text-gray-400 hover:border-rose-200 hover:text-rose-500'}`}
                                >
                                  <Heart size={12} className={liked ? 'fill-rose-500' : ''} />
                                  {f.likes.length}
                                </button>
                              </form>
                              <Link href={`/fundamentos/${f.id}`} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-0.5">
                                Ver <ChevronRight size={12} />
                              </Link>
                              {session?.role === 'admin' && (
                                <form action={deleteFundamento.bind(null, f.id)}>
                                  <button type="submit" className="text-gray-300 hover:text-red-500 transition-colors">
                                    <Trash2 size={14} />
                                  </button>
                                </form>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
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
