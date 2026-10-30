import React from 'react'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { Navbar } from '@/components/navbar'
import { Avatar } from '@/components/avatar'
import { AnnouncementCard } from '@/components/announcement-card'
import Link from 'next/link'
import {
  Megaphone, TrendingUp, Trophy,
  ExternalLink, MessageSquare, Eye, ChevronRight,
  ArrowRight, Flame, Star,
} from 'lucide-react'

const MONTH_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const WEEKDAY_SHORT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-6 h-6 flex items-center justify-center text-brand-700">{icon}</span>
      <h2 className="text-sm font-black text-gray-800 tracking-tight">{title}</h2>
    </div>
  )
}

export default async function HomePage() {
  const session = await getSession()
  const now = new Date()
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [announcements, events, trendingThreads, rankingUsers] = await Promise.all([
    db.announcement.findMany({ orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }], take: 5, include: { author: { select: { name: true } } } }),
    db.event.findMany({ where: { eventDate: { gte: startOfToday } }, orderBy: { eventDate: 'asc' }, take: 6 }),
    db.thread.findMany({
      where: { createdAt: { gte: sevenDaysAgo } }, orderBy: [{ views: 'desc' }], take: 5,
      include: { author: { select: { name: true } }, category: { select: { name: true, color: true } }, _count: { select: { comments: true, likes: true } } },
    }),
    db.user.findMany({
      where: { blocked: false, role: 'member' },
      include: {
        _count: {
          select: {
            threads:        { where: { createdAt: { gte: startOfMonth } } },
            comments:       { where: { createdAt: { gte: startOfMonth } } },
            jurisprudences: { where: { createdAt: { gte: startOfMonth } } },
            fundamentos:    { where: { createdAt: { gte: startOfMonth } } },
            testimonials:   { where: { createdAt: { gte: startOfMonth } } },
          },
        },
      },
    }),
  ])

  // Pontuação: resposta=3 | discussão=2 | juris/fundamento=4 | depoimento=10
  const ranked = rankingUsers
    .map((u) => ({
      ...u,
      score:
        u._count.comments       * 3  +
        u._count.threads        * 2  +
        u._count.jurisprudences * 4  +
        u._count.fundamentos    * 4  +
        u._count.testimonials   * 10,
    }))
    .filter((u) => u.score > 0).sort((a, b) => b.score - a.score).slice(0, 10)

  const medals = ['🥇', '🥈', '🥉']
  const monthName = now.toLocaleDateString('pt-BR', { month: 'long' })
  const firstName = session?.name.split(' ')[0]

  return (
    <div className="flex h-full">
      <Navbar />
      <main className="flex-1 overflow-y-auto bg-[#f4f6fb]">

        {/* ── Hero ── */}
        <div className="relative overflow-hidden" style={{
          background: 'radial-gradient(800px 360px at 85% -20%, rgba(245,158,11,.18), transparent 55%), radial-gradient(600px 400px at -5% 110%, rgba(16,40,130,.25), transparent 55%), linear-gradient(135deg, #060e38 0%, #102882 55%, #0c1e68 100%)',
        }}>
          <div className="absolute inset-0 pointer-events-none opacity-[0.035]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',
            backgroundSize: '44px 44px',
            maskImage: 'linear-gradient(180deg,#000 60%,transparent)',
          }} />
          <div className="relative max-w-5xl mx-auto px-8 py-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {session ? `Olá, ${firstName}` : 'Bem-vindo'}
            </p>
            <h1 className="text-3xl font-black text-white tracking-tight mb-1">Comunidade ZAR</h1>
            <p className="text-sm max-w-sm mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Aprendizado, jurisprudências, fundamentos e conexões.
            </p>
            <div className="flex gap-3">
              <Link href="/discussoes"
                className="flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl transition-all text-brand-900"
                style={{ background: 'linear-gradient(135deg, #fde68a, #f59e0b)', boxShadow: '0 4px 16px rgba(245,158,11,.3)' }}>
                Ver discussões <ArrowRight size={13} />
              </Link>
              <Link href="/discussoes/nova"
                className="btn-secondary-hero flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl text-white"
              >
                <MessageSquare size={13} /> Nova discussão
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-8 animate-fade-in">
          <div className="grid grid-cols-3 gap-6">

            {/* ── Coluna principal ── */}
            <div className="col-span-2 space-y-6">

              {/* Avisos */}
              {announcements.length > 0 && (
                <section>
                  <SectionTitle icon={<Megaphone size={14} />} title="Avisos" />
                  <div className="card-premium overflow-hidden">
                    <div className="divide-y" style={{ borderColor: 'rgba(16,40,130,0.06)' }}>
                      {announcements.map((ann) => (
                        <AnnouncementCard key={ann.id} ann={ann} />
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Próximas Aulas */}
              {events.length > 0 && (
                <section>
                  <SectionTitle icon={<span className="text-sm">📅</span>} title="Próximas Aulas & Eventos" />
                  <div className="space-y-2.5">
                    {events.map((ev) => {
                      const d = new Date(ev.eventDate)
                      const dayNum = d.getDate()
                      const monthStr = MONTH_SHORT[d.getMonth()]
                      const weekday = WEEKDAY_SHORT[d.getDay()]
                      const hour = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                      return (
                        <div key={ev.id} className="card-premium card-hover flex items-center gap-4 px-4 py-3.5 cursor-default">
                          <div className="shrink-0 w-12 rounded-xl overflow-hidden text-center" style={{ boxShadow: '0 2px 8px rgba(16,40,130,.12)' }}>
                            <div className="py-0.5" style={{ background: 'linear-gradient(135deg, #060e38, #102882)' }}>
                              <p className="text-[9px] font-black text-white uppercase tracking-wider">{monthStr}</p>
                            </div>
                            <div className="bg-white py-1">
                              <p className="text-xl font-black text-gray-900 leading-none">{dayNum}</p>
                              <p className="text-[9px] text-gray-400 mt-0.5">{weekday}</p>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{ev.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">🕐 {hour}{ev.description ? ` · ${ev.description}` : ''}</p>
                          </div>
                          {ev.link && (
                            <a href={ev.link} target="_blank" rel="noopener noreferrer"
                              className="btn-navy-pill flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg shrink-0"
                            >
                              Acessar <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* Trending */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <SectionTitle icon={<Flame size={14} className="text-rose-500" />} title="Trending esta semana" />
                  <Link href="/discussoes?ordem=popular" className="flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-900 transition-colors">
                    Ver mais <ChevronRight size={12} />
                  </Link>
                </div>
                {trendingThreads.length === 0 ? (
                  <div className="card-premium px-5 py-10 text-center">
                    <TrendingUp size={22} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-400">Nenhuma discussão recente.</p>
                  </div>
                ) : (
                  <div className="card-premium overflow-hidden">
                    {trendingThreads.map((t, i) => (
                      <Link key={t.id} href={`/discussoes/${t.id}`}>
                        <div className="hover-row flex items-center gap-3 px-5 py-3.5 transition-colors group"
                          style={{ borderBottom: i < trendingThreads.length - 1 ? '1px solid rgba(16,40,130,0.05)' : 'none' }}
                        >
                          <span className={`text-base font-black w-6 text-center shrink-0 ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-700/50' : 'text-gray-200'}`}>{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 group-hover:text-brand-800 transition-colors truncate">{t.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full text-white font-bold" style={{ backgroundColor: t.category.color }}>{t.category.name}</span>
                              <span className="flex items-center gap-0.5 text-[10px] text-gray-400"><MessageSquare size={9} />{t._count.comments}</span>
                              <span className="flex items-center gap-0.5 text-[10px] text-gray-400"><Eye size={9} />{t.views}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* ── Ranking ── */}
            <div className="col-span-1">
              <div className="card-premium overflow-hidden sticky top-6">
                <div className="px-4 py-4" style={{
                  background: 'linear-gradient(135deg, rgba(245,158,11,.08), rgba(251,191,36,.05))',
                  borderBottom: '1px solid rgba(16,40,130,0.06)',
                }}>
                  <h2 className="flex items-center gap-2 text-sm font-black text-gray-900">
                    <Trophy size={14} className="text-amber-500" /> Ranking do Mês
                  </h2>
                  <p className="text-[11px] text-gray-400 mt-0.5 capitalize">{monthName}</p>
                </div>
                {ranked.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Star size={22} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Nenhuma atividade ainda.</p>
                    <p className="text-xs text-gray-400 mt-1">Seja o primeiro! 🚀</p>
                  </div>
                ) : (
                  <div className="p-2.5 space-y-0.5 stagger">
                    {ranked.map((user, i) => (
                      <Link key={user.id} href={`/perfil/${user.id}`}>
                        <div className={`flex items-center gap-2 p-2 rounded-xl transition-colors cursor-pointer ${
                          i === 0 ? 'bg-amber-50' : i === 1 ? 'bg-gray-50' : i === 2 ? 'bg-orange-50/60' : 'hover-navy-sm'
                        }`}
                        >
                          <span className="text-sm w-5 text-center shrink-0 leading-none">{medals[i] ?? <span className="text-xs font-black text-gray-300">{i + 1}</span>}</span>
                          <Avatar name={user.name} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">{user.name.split(' ')[0]}</p>
                            <p className="text-[10px] text-gray-400">{user._count.threads}t · {user._count.comments}r</p>
                          </div>
                          <span className={`text-xs font-black ${i === 0 ? 'text-amber-500' : 'text-brand-700'}`}>{user.score}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                <div className="px-4 py-2.5" style={{ borderTop: '1px solid rgba(16,40,130,0.06)' }}>
                  <p className="text-[9px] text-gray-300 text-center">Resposta=3 · Discussão=2 · Juris/Fund=4 · Depoimento=10</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
