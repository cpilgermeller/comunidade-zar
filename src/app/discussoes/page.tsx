import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { ThreadCard } from '@/components/thread-card'
import { Navbar } from '@/components/navbar'
import Link from 'next/link'
import { Search, TrendingUp, Clock, Plus, Sparkles } from 'lucide-react'

export default async function DiscussoesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; ordem?: string }>
}) {
  const { q, categoria, ordem } = await searchParams
  const session = await getSession()

  const categories = await db.category.findMany({ orderBy: { name: 'asc' } })
  const selectedCategory = categories.find((c) => c.slug === categoria)

  const threads = await db.thread.findMany({
    where: {
      ...(selectedCategory ? { categoryId: selectedCategory.id } : {}),
      ...(q ? { OR: [{ title: { contains: q } }, { body: { contains: q } }] } : {}),
    },
    orderBy:
      ordem === 'popular'
        ? [{ pinned: 'desc' }, { views: 'desc' }, { createdAt: 'desc' }]
        : [{ pinned: 'desc' }, { createdAt: 'desc' }],
    include: {
      author: { select: { name: true } },
      category: { select: { name: true, color: true } },
      _count: { select: { comments: true, likes: true } },
    },
  })

  return (
    <div className="flex h-full">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 animate-fade-in">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                {selectedCategory ? selectedCategory.name : 'Discussões'}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {threads.length} discussão{threads.length !== 1 ? 'ões' : ''}
                {selectedCategory && ` em ${selectedCategory.name}`}
              </p>
            </div>
            {session && (
              <Link
                href="/discussoes/nova"
                className="flex items-center gap-2 bg-gradient-to-r from-brand-900 to-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:from-brand-950 hover:to-brand-800 transition-all shadow-md shadow-brand-200 hover:-translate-y-px active:translate-y-0"
              >
                <Plus size={15} /> Nova discussão
              </Link>
            )}
          </div>

          {/* Search + Sort */}
          <div className="flex gap-3 mb-5">
            <form className="flex-1 relative" action="/discussoes" method="GET">
              {categoria && <input type="hidden" name="categoria" value={categoria} />}
              {ordem && <input type="hidden" name="ordem" value={ordem} />}
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Buscar discussões..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#ede8e3] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 bg-[#fdf9f7] focus:bg-white shadow-sm transition-colors"
              />
            </form>
            <div className="flex gap-1.5 bg-white border border-[#ede8e3] rounded-xl p-1 shadow-sm">
              <SortBtn
                href={`/discussoes?${new URLSearchParams({ ...(q ? { q } : {}), ...(categoria ? { categoria } : {}), ordem: 'recente' }).toString()}`}
                active={!ordem || ordem === 'recente'}
                icon={<Clock size={13} />}
                label="Recentes"
              />
              <SortBtn
                href={`/discussoes?${new URLSearchParams({ ...(q ? { q } : {}), ...(categoria ? { categoria } : {}), ordem: 'popular' }).toString()}`}
                active={ordem === 'popular'}
                icon={<TrendingUp size={13} />}
                label="Popular"
              />
            </div>
          </div>

          {/* Category filters */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <Link
                href={q ? `/discussoes?q=${q}` : '/discussoes'}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${!categoria ? 'bg-brand-800 text-white shadow-sm shadow-brand-200' : 'bg-white border border-[#ede8e3] text-gray-500 hover:border-brand-300 hover:text-brand-800'}`}
              >
                Todas
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/discussoes?categoria=${cat.slug}${q ? `&q=${q}` : ''}${ordem ? `&ordem=${ordem}` : ''}`}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 ${categoria === cat.slug ? 'text-white shadow-sm' : 'bg-white border border-[#ede8e3] text-gray-500 hover:border-brand-200'}`}
                  style={categoria === cat.slug ? { backgroundColor: cat.color } : {}}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: categoria === cat.slug ? 'rgba(255,255,255,0.7)' : cat.color }} />
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {/* Thread list */}
          {threads.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
              <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles size={24} className="text-brand-300" />
              </div>
              <p className="font-semibold text-gray-700">Nenhuma discussão encontrada</p>
              <p className="text-sm text-gray-400 mt-1">
                {q ? 'Tente outros termos de busca.' : 'Seja o primeiro a criar uma!'}
              </p>
              {session && (
                <Link
                  href="/discussoes/nova"
                  className="inline-flex items-center gap-1.5 mt-5 bg-brand-800 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-brand-900 transition-colors"
                >
                  <Plus size={14} /> Criar discussão
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3 stagger">
              {threads.map((thread) => (
                <ThreadCard key={thread.id} thread={thread} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function SortBtn({ href, active, icon, label }: { href: string; active: boolean; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${active ? 'bg-brand-800 text-white shadow-sm' : 'text-gray-500 hover:text-brand-800'}`}
    >
      {icon} {label}
    </Link>
  )
}
