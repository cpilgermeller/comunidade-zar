import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { Navbar } from '@/components/navbar'
import { Avatar } from '@/components/avatar'
import { Link2, Mail, MapPin, Briefcase, Search, Users } from 'lucide-react'
import Link from 'next/link'

const STATES = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

export default async function MembrosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string; insignia?: string }>
}) {
  const { q, estado, insignia: insigniaFilter } = await searchParams
  await getSession()

  const [users, insignias] = await Promise.all([
    db.user.findMany({
      where: {
        blocked: false,
        ...(estado ? { state: estado } : {}),
        ...(q ? { name: { contains: q } } : {}),
        ...(insigniaFilter ? { insignias: { some: { insigniaId: insigniaFilter } } } : {}),
      },
      include: {
        insignias: { include: { insignia: true } },
        _count: { select: { threads: true, comments: true } },
      },
      orderBy: { name: 'asc' },
    }),
    db.insignia.findMany({ orderBy: { name: 'asc' } }),
  ])

  return (
    <div className="flex h-full">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 animate-fade-in">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Users size={22} className="text-brand-700" /> Membros da Comunidade
            </h1>
            <p className="text-sm text-[#b5a9a4] mt-0.5">{users.length} membro{users.length !== 1 ? 's' : ''}</p>
          </div>

          {/* Filters */}
          <div className="bg-white border border-[#f0eae6] rounded-2xl p-4 mb-6 shadow-sm space-y-3">
            <form className="flex gap-3 flex-wrap" action="/membros" method="GET">
              {/* Search */}
              <div className="relative flex-1 min-w-48">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5a9a4]" />
                <input name="q" defaultValue={q} placeholder="Buscar por nome..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-[#ede8e3] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 bg-[#fdf9f7] focus:bg-white transition-colors" />
              </div>

              {/* State */}
              <select name="estado" defaultValue={estado ?? ''}
                className="border border-[#ede8e3] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-[#fdf9f7] focus:bg-white transition-colors">
                <option value="">Todos os estados</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              {/* Insignia */}
              {insignias.length > 0 && (
                <select name="insignia" defaultValue={insigniaFilter ?? ''}
                  className="border border-[#ede8e3] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-[#fdf9f7] focus:bg-white transition-colors">
                  <option value="">Todas as insígnias</option>
                  {insignias.map((i) => <option key={i.id} value={i.id}>{i.emoji} {i.name}</option>)}
                </select>
              )}

              <button type="submit" className="bg-brand-800 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-brand-900 transition-colors">
                Filtrar
              </button>
              {(q || estado || insigniaFilter) && (
                <Link href="/membros" className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2 transition-colors">
                  Limpar
                </Link>
              )}
            </form>
          </div>

          {/* Members grid */}
          {users.length === 0 ? (
            <div className="bg-white border border-[#f0eae6] rounded-2xl p-16 text-center shadow-sm">
              <Users size={32} className="text-[#e8ddd9] mx-auto mb-3" />
              <p className="font-semibold text-gray-600">Nenhum membro encontrado</p>
              <p className="text-sm text-[#b5a9a4] mt-1">Tente ajustar os filtros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 stagger">
              {users.map((user) => {
                const areas = user.areas?.split(',').map((a) => a.trim()).filter(Boolean) ?? []
                return (
                  <Link key={user.id} href={`/perfil/${user.id}`}>
                    <div className="bg-white border border-[#f0eae6] rounded-2xl p-4 hover:border-brand-200 hover:shadow-md transition-all group">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-xl object-cover border border-[#ede8e3]" />
                          ) : (
                            <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#ede8e3]">
                              <Avatar name={user.name} size="lg" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-gray-900 group-hover:text-brand-800 transition-colors">{user.name}</p>
                              {user.role === 'admin' && (
                                <span className="text-[10px] font-bold text-gold-600 bg-gold-50 border border-gold-200 px-1.5 py-0.5 rounded-full">Admin ZAR</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-[#b5a9a4] shrink-0">
                              {user.state && (
                                <span className="flex items-center gap-0.5"><MapPin size={10} /> {user.state}</span>
                              )}
                              <span className="text-[11px]">{user._count.threads}t · {user._count.comments}r</span>
                            </div>
                          </div>

                          {user.bio && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{user.bio}</p>
                          )}

                          {/* Areas */}
                          {areas.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {areas.slice(0, 3).map((area) => (
                                <span key={area} className="text-[11px] bg-brand-50 text-brand-800 border border-brand-100 px-2 py-0.5 rounded-full">
                                  {area}
                                </span>
                              ))}
                              {areas.length > 3 && (
                                <span className="text-[11px] text-[#b5a9a4]">+{areas.length - 3}</span>
                              )}
                            </div>
                          )}

                          {/* Insignias */}
                          {user.insignias.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {user.insignias.map(({ insignia }) => (
                                <span key={insignia.id} title={insignia.name}
                                  className="text-base cursor-default" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.15))' }}>
                                  {insignia.emoji}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Contact quick links */}
                        <div className="flex flex-col gap-1 shrink-0">
                          {user.instagram && (
                            <span className="flex items-center gap-1 text-[11px] text-brand-700">
                              <Link2 size={10} />
                            </span>
                          )}
                          {user.contactEmail && (
                            <span className="flex items-center gap-1 text-[11px] text-brand-700">
                              <Mail size={10} />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
