import React from 'react'
import Image from 'next/image'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { Navbar } from '@/components/navbar'
import { Avatar } from '@/components/avatar'
import { AnnouncementCard } from '@/components/announcement-card'
import Link from 'next/link'
import {
  Megaphone, TrendingUp, Trophy, ExternalLink,
  MessageSquare, Eye, ChevronRight, ArrowRight,
  Flame, Star, Users, BookOpen, Scale, Plus,
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
      where: { createdAt: { gte: sevenDaysAgo } }, orderBy: [{ views: 'desc' }], take: 6,
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
    .filter((u) => u.score > 0).sort((a, b) => b.score - a.score).slice(0, 8)

  const medals = ['🥇', '🥈', '🥉']
  const monthName = now.toLocaleDateString('pt-BR', { month: 'long' })
  const firstName = session?.name.split(' ')[0] ?? 'Visitante'

  return (
    <div className="flex h-full">
      <Navbar />
      <main className="flex-1 overflow-y-auto bg-[#f7f7f5]">

        {/* ── Hero ── */}
        <div className="relative overflow-hidden bg-[#f5f0e8]" style={{ minHeight: 300 }}>
          {/* Águia — direita, ocupa metade do hero */}
          <div className="absolute inset-y-0 right-0 w-3/5 pointer-events-none select-none overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1611095970735-5b44ed7e8ddd?w=1200&q=80&auto=format&fit=crop&crop=center"
              alt=""
              fill
              priority
              sizes="60vw"
              className="object-cover"
              style={{ objectPosition: '35% center' }}
            />
            {/* Fade da esquerda para o centro */}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to right, #f5f0e8 0%, rgba(245,240,232,0.85) 15%, rgba(245,240,232,0.4) 35%, rgba(245,240,232,0.05) 65%, transparent 100%)',
            }} />
          </div>

          {/* Quote no canto direito — sobre a foto */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-right z-10 hidden lg:block" style={{ maxWidth: 220 }}>
            <p className="font-display text-2xl leading-snug italic" style={{ color: 'rgba(120,80,20,0.85)' }}>
              Mais que teoria,<br />
              uma comunidade<br />
              que caminha<br />
              com você.
            </p>
          </div>

          {/* Conteúdo principal — esquerda clara */}
          <div className="relative z-10 max-w-5xl mx-auto px-8 py-12">
            <div className="max-w-lg">
              <p className="text-xs font-bold uppercase tracking-widest mb-3 text-amber-700">
                Comunidade ZAR
              </p>
              <h1 className="text-5xl font-black tracking-tight leading-[1.05] mb-4 text-gray-900">
                Olá, {firstName}!
              </h1>
              <p className="text-base leading-relaxed mb-7 text-gray-500">
                Aqui você aprende, compartilha casos, acessa jurisprudências e cresce com outros advogados ZAR.
              </p>

              <div className="flex items-center gap-3 mb-8">
                <Link href="/discussoes"
                  className="flex items-center gap-2 text-sm font-bold px-5 py-3 rounded-xl transition-all text-white"
                  style={{ background: 'linear-gradient(135deg, #0d1f6e, #102882)', boxShadow: '0 4px 16px rgba(16,40,130,.25)' }}>
                  <MessageSquare size={14} /> Ver discussões <ArrowRight size={13} />
                </Link>
                {session && (
                  <Link href="/discussoes/nova"
                    className="flex items-center gap-2 text-sm font-semibold px-5 py-3 rounded-xl transition-all text-gray-700 border border-gray-300 bg-white/60 hover:bg-white">
                    <Plus size={14} /> Nova discussão
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-5 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Users size={13} className="text-amber-500" />
                  <strong className="text-gray-800 font-black">{totalMembers}</strong> membros
                </span>
                <span className="text-gray-200">·</span>
                <span className="flex items-center gap-1.5">
                  <MessageSquare size={13} className="text-amber-500" />
                  <strong className="text-gray-800 font-black">{totalThreads}</strong> discussões
                </span>
                <span className="text-gray-200">·</span>
                <span className="flex items-center gap-1.5">
                  <Scale size={13} className="text-amber-500" />
                  <strong className="text-gray-800 font-black">{totalJuris}</strong> jurisprudências
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="max-w-5xl mx-auto px-8 py-8 animate-fade-in">
          <div className="grid grid-cols-3 gap-6">

            {/* ── Coluna principal ── */}
            <div className="col-span-2 space-y-7">

              {/* Avisos */}
              {announcements.length > 0 && (
                <section>
                  <SectionLabel icon={<Megaphone size={13} />} title="Avisos" />
                  <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #ebebeb', boxShadow: '0 1px 3px rgba(0,0,0,.04), 0 6px 20px rgba(0,0,0,.04)' }}>
                    {announcements.map((ann, i) => (
                      <div key={ann.id} style={{ borderBottom: i < announcements.length - 1 ? '1px solid #f2f2f2' : 'none' }}>
                        <AnnouncementCard ann={ann} />
                      </div>
                    ))}
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
                        <div key={ev.id} className="flex items-center gap-4 px-5 py-4 bg-white rounded-2xl transition-all hover:shadow-md"
                          style={{ border: '1px solid #ebebeb', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
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

              {/* Discussões em destaque */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <SectionLabel icon={<Flame size={13} className="text-rose-500" />} title="Discussões em destaque" />
                  <Link href="/discussoes?ordem=popular" className="flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900 transition-colors">
                    Ver todas <ChevronRight size={13} />
                  </Link>
                </div>
                {trendingThreads.length === 0 ? (
                  <div className="bg-white rounded-2xl px-5 py-12 text-center" style={{ border: '1px solid #ebebeb' }}>
                    <TrendingUp size={24} className="mx-auto mb-3 text-gray-200" />
                    <p className="font-semibold text-gray-400">Nenhuma discussão esta semana.</p>
                    <p className="text-sm text-gray-300 mt-1">Seja o primeiro a postar algo!</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #ebebeb', boxShadow: '0 1px 3px rgba(0,0,0,.04), 0 6px 20px rgba(0,0,0,.04)' }}>
                    {trendingThreads.map((t, i) => (
                      <Link key={t.id} href={`/discussoes/${t.id}`}>
                        <div className="hover-row flex items-center gap-4 px-5 py-4 group"
                          style={{ borderBottom: i < trendingThreads.length - 1 ? '1px solid #f2f2f2' : 'none' }}>
                          <Avatar name={t.author.name} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 group-hover:text-brand-800 transition-colors truncate">{t.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] px-2 py-0.5 rounded-full text-white font-bold" style={{ backgroundColor: t.category.color }}>{t.category.name}</span>
                              <span className="text-xs text-gray-400">{t.author.name.split(' ')[0]}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0">
                            <span className="flex items-center gap-1"><MessageSquare size={11} />{t._count.comments}</span>
                            <span className="flex items-center gap-1"><Eye size={11} />{t.views}</span>
                            <ChevronRight size={14} className="text-gray-300" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* ── Coluna direita ── */}
            <div className="col-span-1 space-y-5">

              {/* Ranking */}
              <div className="bg-white rounded-2xl overflow-hidden sticky top-6" style={{ border: '1px solid #ebebeb', boxShadow: '0 1px 3px rgba(0,0,0,.04), 0 6px 20px rgba(0,0,0,.04)' }}>
                <div className="px-5 py-4" style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7 80%, #fff)', borderBottom: '1px solid #f2f2f2' }}>
                  <h2 className="flex items-center gap-2 font-black text-gray-900">
                    <Trophy size={15} className="text-amber-500" /> Ranking do Mês
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5 capitalize">{monthName}</p>
                </div>
                {ranked.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <Star size={24} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-400">Nenhuma atividade ainda.</p>
                  </div>
                ) : (
                  <div className="p-3 space-y-0.5">
                    {ranked.map((user, i) => (
                      <Link key={user.id} href={`/perfil/${user.id}`}>
                        <div className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors cursor-pointer ${
                          i === 0 ? 'bg-amber-50' : i === 1 ? 'bg-gray-50' : i === 2 ? 'bg-orange-50/50' : 'hover-navy-sm'
                        }`}>
                          <span className="text-base w-5 text-center shrink-0 leading-none">
                            {medals[i] ?? <span className="text-xs font-black text-gray-300">{i + 1}</span>}
                          </span>
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
                <div className="px-5 py-3" style={{ borderTop: '1px solid #f2f2f2' }}>
                  <Link href="/membros" className="flex items-center justify-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900 transition-colors">
                    Ver ranking completo <ChevronRight size={12} />
                  </Link>
                </div>
              </div>

              {/* CTA card */}
              <div className="rounded-2xl overflow-hidden relative" style={{
                background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                boxShadow: '0 4px 24px rgba(0,0,0,.15)',
              }}>
                <div className="absolute inset-0 pointer-events-none" style={{
                  backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(245,158,11,0.12) 0%, transparent 50%)',
                }} />
                <div className="relative px-5 py-6">
                  <p className="font-display text-xl italic leading-snug text-white/90 mb-4">
                    Continue<br />evoluindo com<br />a comunidade.
                  </p>
                  <p className="text-xs text-white/50 leading-relaxed mb-5">
                    Compartilhe, aprenda e ajude outros advogados a crescerem também.
                  </p>
                  <Link href="/discussoes/nova"
                    className="flex items-center justify-between gap-2 text-sm font-bold px-4 py-3 rounded-xl transition-all"
                    style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fde68a' }}>
                    Fazer uma nova discussão
                    <ArrowRight size={14} />
                  </Link>
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
