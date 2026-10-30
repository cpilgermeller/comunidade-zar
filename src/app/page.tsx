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
  ArrowRight, Flame, Star, Users, BookOpen, Scale,
} from 'lucide-react'

const MONTH_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const WEEKDAY_SHORT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

export default async function HomePage() {
  const session = await getSession()
  const now = new Date()
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [announcements, events, trendingThreads, rankingUsers, totalMembers, totalThreads, totalJuris] = await Promise.all([
    db.announcement.findMany({ orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }], take: 5, include: { author: { select: { name: true } } } }),
    db.event.findMany({ where: { eventDate: { gte: startOfToday } }, orderBy: { eventDate: 'asc' }, take: 4 }),
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
    db.user.count({ where: { blocked: false } }),
    db.thread.count(),
    db.jurisprudence.count(),
  ])

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
  const firstName = session?.name.split(' ')[0] ?? 'Visitante'

  return (
    <div className="flex h-full">
      <Navbar />
      <main className="flex-1 overflow-y-auto bg-white">

        {/* ── Hero ── */}
        <div className="border-b border-gray-100 bg-white">
          <div className="max-w-5xl mx-auto px-8 pt-10 pb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-700 mb-3">
              Comunidade ZAR
            </p>
            <h1 className="text-4xl font-black text-gray-950 tracking-tight leading-tight mb-3">
              {session ? `Olá, ${firstName}.` : 'Bem-vindo.'}
            </h1>
            <p className="text-base text-gray-500 max-w-lg mb-7 leading-relaxed">
              Aqui você aprende, compartilha casos, acessa jurisprudências e cresce com outros advogados ZAR.
            </p>

            <div className="flex items-center gap-3 flex-wrap mb-8">
              <Link href="/discussoes"
                className="flex items-center gap-2 text-sm font-bold px-5 py-3 rounded-xl text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #102882, #1537ab)', boxShadow: '0 4px 16px rgba(16,40,130,.25)' }}>
                Ver discussões <ArrowRight size={14} />
              </Link>
              {session && (
                <Link href="/discussoes/nova"
                  className="flex items-center gap-2 text-sm font-semibold px-5 py-3 rounded-xl transition-all text-gray-700 border border-gray-200 hover:border-brand-300 hover:text-brand-800 bg-white">
                  <MessageSquare size={14} /> Nova discussão
                </Link>
              )}
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users size={14} className="text-brand-700" />
                <span className="font-black text-gray-900">{totalMembers}</span> membros
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MessageSquare size={14} className="text-brand-700" />
                <span className="font-black text-gray-900">{totalThreads}</span> discussões
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Scale size={14} className="text-brand-700" />
                <span className="font-black text-gray-900">{totalJuris}</span> jurisprudências
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-8 animate-fade-in">
          <div className="grid grid-cols-3 gap-7">

            {/* ── Coluna principal ── */}
            <div className="col-span-2 space-y-8">

              {/* Avisos */}
              {announcements.length > 0 && (
                <section>
                  <SectionLabel icon={<Megaphone size={13} />} title="Avisos" />
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
                  <SectionLabel icon={<BookOpen size={13} />} title="Próximas Aulas & Eventos" />
                  <div className="space-y-2">
                    {events.map((ev) => {
                      const d = new Date(ev.eventDate)
                      const dayNum = d.getDate()
                      const monthStr = MONTH_SHORT[d.getMonth()]
                      const weekday = WEEKDAY_SHORT[d.getDay()]
                      const hour = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                      return (
                        <div key={ev.id} className="flex items-center gap-4 px-5 py-4 bg-white rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-sm transition-all">
                          {/* Date block */}
                          <div className="shrink-0 w-12 rounded-xl overflow-hidden text-center border border-gray-100">
                            <div className="py-0.5 bg-brand-800">
                              <p className="text-[9px] font-black text-white uppercase tracking-wider">{monthStr}</p>
                            </div>
                            <div className="bg-white py-1.5">
                              <p className="text-2xl font-black text-gray-900 leading-none">{dayNum}</p>
                              <p className="text-[9px] text-gray-400 mt-0.5">{weekday}</p>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 truncate">{ev.title}</p>
                            <p className="text-sm text-gray-400 mt-0.5">{hour}{ev.description ? ` · ${ev.description}` : ''}</p>
                          </div>
                          {ev.link && (
                            <a href={ev.link} target="_blank" rel="noopener noreferrer"
                              className="btn-navy-pill flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl shrink-0">
                              Acessar <ExternalLink size={11} />
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
                <div className="flex items-center justify-between mb-4">
                  <SectionLabel icon={<Flame size={13} className="text-rose-500" />} title="Trending esta semana" />
                  <Link href="/discussoes?ordem=popular" className="flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900 transition-colors">
                    Ver todas <ChevronRight size={13} />
                  </Link>
                </div>
                {trendingThreads.length === 0 ? (
                  <div className="card-premium px-5 py-12 text-center">
                    <TrendingUp size={24} className="mx-auto mb-3 text-gray-200" />
                    <p className="font-semibold text-gray-400">Nenhuma discussão esta semana.</p>
                    <p className="text-sm text-gray-300 mt-1">Seja o primeiro a postar algo!</p>
                  </div>
                ) : (
                  <div className="card-premium overflow-hidden">
                    {trendingThreads.map((t, i) => (
                      <Link key={t.id} href={`/discussoes/${t.id}`}>
                        <div className="hover-row flex items-center gap-4 px-5 py-4 group"
                          style={{ borderBottom: i < trendingThreads.length - 1 ? '1px solid rgba(16,40,130,0.05)' : 'none' }}
                        >
                          <span className={`text-lg font-black w-7 text-center shrink-0 ${
                            i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-700/40' : 'text-gray-200'
                          }`}>{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 group-hover:text-brand-800 transition-colors truncate">{t.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] px-2 py-0.5 rounded-full text-white font-bold" style={{ backgroundColor: t.category.color }}>{t.category.name}</span>
                              <span className="flex items-center gap-1 text-xs text-gray-400"><MessageSquare size={10} />{t._count.comments}</span>
                              <span className="flex items-center gap-1 text-xs text-gray-400"><Eye size={10} />{t.views}</span>
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
                <div className="px-5 py-4 border-b border-gray-50" style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7 80%, #fff)' }}>
                  <h2 className="flex items-center gap-2 font-black text-gray-900">
                    <Trophy size={15} className="text-amber-500" /> Ranking do Mês
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5 capitalize">{monthName}</p>
                </div>
                {ranked.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <Star size={24} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-400">Nenhuma atividade ainda.</p>
                    <p className="text-sm text-gray-300 mt-1">Seja o primeiro! 🚀</p>
                  </div>
                ) : (
                  <div className="p-3 space-y-0.5">
                    {ranked.map((user, i) => (
                      <Link key={user.id} href={`/perfil/${user.id}`}>
                        <div className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors cursor-pointer ${
                          i === 0 ? 'bg-amber-50' : i === 1 ? 'bg-gray-50' : i === 2 ? 'bg-orange-50/50' : 'hover-navy-sm'
                        }`}>
                          <span className="text-base w-5 text-center shrink-0">{medals[i] ?? <span className="text-xs font-black text-gray-300">{i + 1}</span>}</span>
                          <Avatar name={user.name} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate">{user.name.split(' ')[0]}</p>
                            <p className="text-xs text-gray-400">{user._count.threads}t · {user._count.comments}r</p>
                          </div>
                          <span className={`text-sm font-black ${i === 0 ? 'text-amber-500' : 'text-brand-700'}`}>{user.score}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                <div className="px-5 py-3 border-t border-gray-50">
                  <p className="text-[10px] text-gray-300 text-center">Resposta · Discussão · Juris · Depoimento</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function SectionLabel({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-gray-400">{icon}</span>
      <h2 className="font-black text-gray-900 tracking-tight">{title}</h2>
    </div>
  )
}
