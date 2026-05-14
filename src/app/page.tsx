import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { Navbar } from '@/components/navbar'
import { Avatar } from '@/components/avatar'
import { RichTextDisplay } from '@/components/rich-text-editor'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import {
  Megaphone, TrendingUp, Trophy,
  ExternalLink, MessageSquare, Eye, Pin, ChevronRight,
  ArrowRight, Flame, Star,
} from 'lucide-react'

const MONTH_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const WEEKDAY_SHORT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

export default async function HomePage() {
  const session = await getSession()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [announcements, events, trendingThreads, rankingUsers] = await Promise.all([
    db.announcement.findMany({ orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }], take: 5, include: { author: { select: { name: true } } } }),
    db.event.findMany({ where: { eventDate: { gte: now } }, orderBy: { eventDate: 'asc' }, take: 6 }),
    db.thread.findMany({
      where: { createdAt: { gte: sevenDaysAgo } }, orderBy: [{ views: 'desc' }], take: 5,
      include: { author: { select: { name: true } }, category: { select: { name: true, color: true } }, _count: { select: { comments: true, likes: true } } },
    }),
    db.user.findMany({
      where: { blocked: false, role: 'member' },
      include: { _count: { select: { threads: { where: { createdAt: { gte: startOfMonth } } }, comments: { where: { createdAt: { gte: startOfMonth } } } } } },
    }),
  ])

  const ranked = rankingUsers
    .map((u) => ({ ...u, score: u._count.threads * 3 + u._count.comments }))
    .filter((u) => u.score > 0).sort((a, b) => b.score - a.score).slice(0, 10)

  const medals = ['🥇', '🥈', '🥉']
  const monthName = now.toLocaleDateString('pt-BR', { month: 'long' })
  const firstName = session?.name.split(' ')[0]

  const inputCls = 'w-full border border-[#ede8e3] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-[#fdf9f7] focus:bg-white transition-colors'

  return (
    <div className="flex h-full">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 animate-fade-in">

          {/* Hero */}
          <div className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 rounded-3xl p-7 mb-8 text-white shadow-xl shadow-brand-300/30">
            <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-24 w-40 h-40 bg-gold-500/10 rounded-full blur-2xl pointer-events-none" />
            <p className="text-brand-200 text-sm font-medium mb-1">
              {session ? `Olá, ${firstName}! 👋` : 'Bem-vindo!'}
            </p>
            <h1 className="text-3xl font-black tracking-tight mb-1">Comunidade ZAR</h1>
            <p className="text-brand-200/80 text-sm max-w-md">Seu espaço de aprendizado, jurisprudências, fundamentos e conexões.</p>
            <div className="flex gap-3 mt-5">
              <Link href="/discussoes" className="flex items-center gap-1.5 bg-white text-brand-900 text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-brand-50 transition-colors shadow-md">
                Ver discussões <ArrowRight size={14} />
              </Link>
              <Link href="/discussoes/nova" className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors border border-white/15">
                <MessageSquare size={14} /> Nova discussão
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* ── Coluna esquerda ── */}
            <div className="col-span-2 space-y-6">

              {/* Avisos */}
              <section className="bg-white rounded-2xl border border-[#f0eae6] shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 pt-5 pb-4 border-b border-[#f7f2ef]">
                  <span className="w-7 h-7 bg-gold-100 rounded-lg flex items-center justify-center">
                    <Megaphone size={14} className="text-gold-600" />
                  </span>
                  <h2 className="text-sm font-bold text-gray-900">Avisos</h2>
                </div>
                {announcements.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <Megaphone size={24} className="text-[#e8ddd9] mx-auto mb-2" />
                    <p className="text-sm text-[#b5a9a4]">Nenhum aviso no momento.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#f7f2ef] stagger">
                    {announcements.map((ann) => (
                      <div key={ann.id} className={`px-5 py-4 ${ann.pinned ? 'bg-gold-50/50' : ''}`}>
                        <div className="flex items-start gap-2.5">
                          {ann.pinned && <Pin size={12} className="text-gold-500 fill-gold-400 mt-0.5 shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <h3 className="text-sm font-semibold text-gray-900">{ann.title}</h3>
                              <span className="text-[11px] text-[#b5a9a4] shrink-0">{formatDate(ann.createdAt)}</span>
                            </div>
                            <div className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                              <RichTextDisplay html={ann.content} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Próximas Aulas — estilo calendário */}
              <section className="bg-white rounded-2xl border border-[#f0eae6] shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#f7f2ef]">
                  <h2 className="text-sm font-bold text-gray-900">📅 Próximas Aulas & Eventos</h2>
                </div>
                {events.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <p className="text-4xl mb-2">📅</p>
                    <p className="text-sm text-[#b5a9a4]">Nenhum evento programado.</p>
                  </div>
                ) : (
                  <div className="p-4 grid grid-cols-1 gap-3 stagger">
                    {events.map((ev) => {
                      const d = new Date(ev.eventDate)
                      const dayNum = d.getDate()
                      const monthStr = MONTH_SHORT[d.getMonth()]
                      const weekday = WEEKDAY_SHORT[d.getDay()]
                      const hour = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                      return (
                        <div key={ev.id} className="flex items-center gap-4 p-3.5 rounded-xl border border-[#f0eae6] hover:border-brand-200 hover:bg-[#fdf9f7] transition-all group">
                          {/* Calendar leaf */}
                          <div className="shrink-0 w-14 rounded-xl overflow-hidden shadow-sm border border-[#ede8e3] text-center">
                            <div className="bg-brand-800 px-1 py-0.5">
                              <p className="text-[10px] font-bold text-white uppercase tracking-wide">{monthStr}</p>
                            </div>
                            <div className="bg-white px-1 py-1">
                              <p className="text-2xl font-black text-gray-900 leading-none">{dayNum}</p>
                              <p className="text-[10px] text-[#b5a9a4] mt-0.5">{weekday}</p>
                            </div>
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-brand-800 transition-colors">{ev.title}</p>
                            <p className="text-xs text-[#b5a9a4] mt-0.5">🕐 {hour}{ev.description ? ` · ${ev.description}` : ''}</p>
                          </div>
                          {ev.link && (
                            <a href={ev.link} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-brand-700 hover:text-brand-900 bg-brand-50 hover:bg-brand-100 px-2.5 py-1.5 rounded-lg transition-colors shrink-0 font-semibold">
                              Acessar <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>

              {/* Trending */}
              <section className="bg-white rounded-2xl border border-[#f0eae6] shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#f7f2ef]">
                  <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <span className="w-7 h-7 bg-rose-100 rounded-lg flex items-center justify-center">
                      <Flame size={14} className="text-rose-500" />
                    </span>
                    Trending esta semana
                  </h2>
                  <Link href="/discussoes?ordem=popular" className="flex items-center gap-1 text-xs text-brand-700 hover:text-brand-900 font-medium">
                    Ver mais <ChevronRight size={13} />
                  </Link>
                </div>
                {trendingThreads.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <TrendingUp size={24} className="text-[#e8ddd9] mx-auto mb-2" />
                    <p className="text-sm text-[#b5a9a4]">Nenhuma discussão recente.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#f7f2ef] stagger">
                    {trendingThreads.map((t, i) => (
                      <Link key={t.id} href={`/discussoes/${t.id}`}>
                        <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#fdf9f7] transition-colors group">
                          <span className={`text-lg font-black w-7 text-center shrink-0 ${i === 0 ? 'text-gold-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600/60' : 'text-gray-200'}`}>{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 group-hover:text-brand-800 transition-colors truncate">{t.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] px-2 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: t.category.color }}>{t.category.name}</span>
                              <span className="flex items-center gap-0.5 text-[11px] text-[#b5a9a4]"><MessageSquare size={10} />{t._count.comments}</span>
                              <span className="flex items-center gap-0.5 text-[11px] text-[#b5a9a4]"><Eye size={10} />{t.views}</span>
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
              <div className="bg-white rounded-2xl border border-[#f0eae6] shadow-sm overflow-hidden sticky top-6">
                <div className="px-5 pt-5 pb-4 border-b border-[#f7f2ef] bg-gradient-to-br from-gold-50 to-amber-50">
                  <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <Trophy size={15} className="text-gold-500" /> Ranking do Mês
                  </h2>
                  <p className="text-[11px] text-[#b5a9a4] mt-0.5 capitalize">{monthName} · Top alunos ZAR</p>
                </div>
                {ranked.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <Star size={24} className="text-[#e8ddd9] mx-auto mb-2" />
                    <p className="text-xs text-[#b5a9a4]">Nenhuma atividade ainda.</p>
                    <p className="text-xs text-[#b5a9a4] mt-1">Seja o primeiro! 🚀</p>
                  </div>
                ) : (
                  <div className="p-3 space-y-1 stagger">
                    {ranked.map((user, i) => (
                      <Link key={user.id} href={`/perfil/${user.id}`}>
                        <div className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-colors cursor-pointer ${i === 0 ? 'bg-gold-50 border border-gold-100' : i === 1 ? 'bg-gray-50 border border-gray-100' : i === 2 ? 'bg-amber-50/50 border border-amber-100/50' : 'hover:bg-[#fdf9f7]'}`}>
                          <span className="text-base w-5 text-center shrink-0">{medals[i] ?? <span className="text-xs font-bold text-gray-300">{i + 1}</span>}</span>
                          <Avatar name={user.name} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">{user.name.split(' ')[0]}</p>
                            <p className="text-[10px] text-[#b5a9a4]">{user._count.threads}t · {user._count.comments}r</p>
                          </div>
                          <span className={`text-xs font-black ${i === 0 ? 'text-gold-500' : 'text-brand-700'}`}>{user.score}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                <div className="px-5 py-3 border-t border-[#f7f2ef]">
                  <p className="text-[10px] text-[#d6c8c3] text-center">Tópico = 3pts · Resposta = 1pt</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
