import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { ThreadCard } from '@/components/thread-card'
import { Navbar } from '@/components/navbar'
import { LastSeenUpdater } from '@/components/last-seen-updater'
import Link from 'next/link'
import { Search, TrendingUp, Clock, Plus, Sparkles, Star, Bell, Activity } from 'lucide-react'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function DiscussoesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; ordem?: string }>
}) {
  const { q, categoria, ordem } = await searchParams
  const session = await getSession()

  const cookieStore = await cookies()
  const lastSeenRaw = cookieStore.get('disc_last')?.value
  const lastSeen = lastSeenRaw ? new Date(lastSeenRaw) : null

  const categories = await db.category.findMany({ orderBy: { name: 'asc' } })
  const selectedCategory = categories.find((c) => c.slug === categoria)
  const filterUnanswered = ordem === 'sem_resposta'

  const [threads, featuredThreads, newCount] = await Promise.all([
    db.thread.findMany({
      where: {
        ...(selectedCategory ? { categoryId: selectedCategory.id } : {}),
        ...(q ? { OR: [{ title: { contains: q } }, { body: { contains: q } }] } : {}),
        ...(filterUnanswered ? { comments: { none: {} } } : {}),
      },
      orderBy:
        ordem === 'popular'
          ? [{ pinned: 'desc' }, { views: 'desc' }, { createdAt: 'desc' }]
          : ordem === 'atividade'
          ? [{ pinned: 'desc' }, { lastActivityAt: 'desc' }]
          : [{ pinned: 'desc' }, { createdAt: 'desc' }],
      include: {
        author: { select: { name: true } },
        category: { select: { name: true, color: true } },
        _count: { select: { comments: true, likes: true } },
        ...(session ? { bookmarks: { where: { userId: session.userId }, select: { id: true } } } : {}),
      },
    }),
    !q && !categoria
      ? db.thread.findMany({
          where: { featured: true },
          orderBy: { createdAt: 'desc' },
          take: 3,
          include: {
            author: { select: { name: true } },
            category: { select: { name: true, color: true } },
            _count: { select: { comments: true, likes: true } },
            ...(session ? { bookmarks: { where: { userId: session.userId }, select: { id: true } } } : {}),
          },
        })
      : Promise.resolve([]),
    session && lastSeen
      ? db.thread.count({ where: { createdAt: { gt: lastSeen } } })
      : Promise.resolve(0),
  ])

  return (
    <div className="flex h-full">
      <Navbar />
      <main className="flex-1 overflow-y-auto bg-[#f4f6fb]">
        {session && <LastSeenUpdater />}

        {/* ── Page header ── */}
        <div className="relative overflow-hidden" style={{
          background: 'radial-gradient(600px 280px at 90% -10%, rgba(245,158,11,.12), transparent 60%), linear-gradient(135deg, #060e38 0%, #102882 60%, #0c1e68 100%)',
        }}>
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',
            backgroundSize: '44px 44px',
            maskImage: 'linear-gradient(180deg,#000 50%,transparent)',
          }} />
          <div className="relative max-w-3xl mx-auto px-6 py-8 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Comunidade ZAR</p>
              <h1 className="text-2xl font-black text-white tracking-tight">
                {selectedCategory ? selectedCategory.name : 'Discussões'}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {threads.length} discussão{threads.length !== 1 ? 'ões' : ''}
                {selectedCategory && ` em ${selectedCategory.name}`}
              </p>
            </div>
            {session && (
              <Link href="/discussoes/nova"
                className="flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl transition-all shrink-0 text-brand-900"
                style={{ background: 'linear-gradient(135deg, #fde68a, #f59e0b)', boxShadow: '0 4px 14px rgba(245,158,11,.28)' }}>
                <Plus size={14} /> Nova discussão
              </Link>
            )}
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-6 animate-fade-in">

          {/* Novidades banner */}
          {session && newCount > 0 && (
            <div className="card-premium flex items-center gap-3 px-4 py-3 mb-5 text-sm" style={{ borderLeft: '3px solid #102882' }}>
              <Bell size={15} className="text-brand-700 shrink-0" />
              <p className="text-brand-800 font-semibold">
                {newCount} nova{newCount !== 1 ? 's discussões' : ' discussão'} desde sua última visita
              </p>
            </div>
          )}

          {/* Destaques da semana */}
          {featuredThreads.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Star size={14} className="text-amber-500 fill-amber-400" />
                <h2 className="text-xs font-black text-gray-700 uppercase tracking-widest">Destaques da semana</h2>
              </div>
              <div className="space-y-2">
                {featuredThreads.map((thread) => (
                  <ThreadCard
                    key={thread.id}
                    thread={{ ...thread, resolved: thread.resolved ?? false, featured: true }}
                    isBookmarked={'bookmarks' in thread ? (thread.bookmarks as { id: string }[]).length > 0 : false}
                  />
                ))}
              </div>
              <div className="mt-5 mb-1" style={{ borderBottom: '1px solid rgba(16,40,130,0.07)' }} />
            </div>
          )}

          {/* Search + Sort */}
          <div className="flex gap-2.5 mb-4">
            <form className="flex-1 relative" action="/discussoes" method="GET">
              {categoria && <input type="hidden" name="categoria" value={categoria} />}
              {ordem && <input type="hidden" name="ordem" value={ordem} />}
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Buscar discussões..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 transition-colors"
                style={{ background: '#fff', border: '1px solid rgba(16,40,130,0.1)', boxShadow: '0 1px 3px rgba(16,40,130,0.05)' }}
              />
            </form>
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#fff', border: '1px solid rgba(16,40,130,0.1)', boxShadow: '0 1px 3px rgba(16,40,130,0.05)' }}>
              <SortBtn
                href={`/discussoes?${new URLSearchParams({ ...(q ? { q } : {}), ...(categoria ? { categoria } : {}), ordem: 'recente' }).toString()}`}
                active={!ordem || ordem === 'recente'}
                icon={<Clock size={12} />}
                label="Recentes"
              />
              <SortBtn
                href={`/discussoes?${new URLSearchParams({ ...(q ? { q } : {}), ...(categoria ? { categoria } : {}), ordem: 'popular' }).toString()}`}
                active={ordem === 'popular'}
                icon={<TrendingUp size={12} />}
                label="Popular"
              />
              <SortBtn
                href={`/discussoes?${new URLSearchParams({ ...(q ? { q } : {}), ...(categoria ? { categoria } : {}), ordem: 'atividade' }).toString()}`}
                active={ordem === 'atividade'}
                icon={<Activity size={12} />}
                label="Atividade"
              />
              <SortBtn
                href={`/discussoes?${new URLSearchParams({ ...(q ? { q } : {}), ...(categoria ? { categoria } : {}), ordem: 'sem_resposta' }).toString()}`}
                active={ordem === 'sem_resposta'}
                icon={<Sparkles size={12} />}
                label="Sem resposta"
              />
            </div>
          </div>

          {/* Category filters */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              <Link
                href={q ? `/discussoes?q=${q}` : '/discussoes'}
                className="text-xs px-3 py-1.5 rounded-full font-bold transition-all"
                style={!categoria
                  ? { background: '#102882', color: '#fff', boxShadow: '0 2px 8px rgba(16,40,130,.2)' }
                  : { background: '#fff', color: '#6b7280', border: '1px solid rgba(16,40,130,0.12)' }}
              >
                Todas
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/discussoes?categoria=${cat.slug}${q ? `&q=${q}` : ''}${ordem ? `&ordem=${ordem}` : ''}`}
                  className="text-xs px-3 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5"
                  style={categoria === cat.slug
                    ? { backgroundColor: cat.color, color: '#fff', boxShadow: `0 2px 8px ${cat.color}44` }
                    : { background: '#fff', color: '#6b7280', border: '1px solid rgba(16,40,130,0.12)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: categoria === cat.slug ? 'rgba(255,255,255,0.7)' : cat.color }} />
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {/* Thread list */}
          {threads.length === 0 ? (
            <div className="card-premium p-16 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(16,40,130,0.06)' }}>
                <Sparkles size={20} className="text-brand-400" />
              </div>
              <p className="font-bold text-gray-700">Nenhuma discussão encontrada</p>
              <p className="text-sm text-gray-400 mt-1">
                {q ? 'Tente outros termos de busca.' : 'Seja o primeiro a criar uma!'}
              </p>
              {session && (
                <Link
                  href="/discussoes/nova"
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold px-4 py-2 rounded-xl text-white transition-colors"
                  style={{ background: '#102882' }}
                >
                  <Plus size={13} /> Criar discussão
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-2.5 stagger">
              {threads.map((thread) => (
                <ThreadCard
                  key={thread.id}
                  thread={{ ...thread, resolved: thread.resolved ?? false }}
                  isBookmarked={'bookmarks' in thread ? (thread.bookmarks as { id: string }[]).length > 0 : false}
                />
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
