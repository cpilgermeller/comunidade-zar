import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { Navbar } from '@/components/navbar'
import { Avatar } from '@/components/avatar'
import { Link2, Mail, MapPin, Search, Users } from 'lucide-react'
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
      orderBy: [{ isLifetime: 'desc' }, { name: 'asc' }],
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
                const isLifetime = user.isLifetime

                return (
                  <Link key={user.id} href={`/perfil/${user.id}`}>
                    <div className={`relative bg-white rounded-2xl px-5 py-4 hover:shadow-md transition-all group
                      ${isLifetime
                        ? 'border border-amber-200 shadow-sm shadow-amber-50 hover:shadow-amber-100'
                        : 'border border-[#f0eae6] hover:border-brand-100'}`}>

                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="shrink-0">
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#ede8e3]">
                            {user.avatar
                              ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                              : <Avatar name={user.name} size="md" />}
                          </div>
                        </div>

                        {/* Info principal */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-900 group-hover:text-brand-800 transition-colors truncate">
                              {user.name}
                            </p>
                            {isLifetime && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 tracking-wide shrink-0">
                                ✦ Vitalício
                              </span>
                            )}
                            {user.role === 'admin' && (
                              <span className="text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-100 px-1.5 py-0.5 rounded-full shrink-0">Admin</span>
                            )}
                          </div>

                          {/* Bio ou áreas */}
                          {user.bio ? (
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{user.bio}</p>
                          ) : areas.length > 0 ? (
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{areas.slice(0, 2).join(' · ')}</p>
                          ) : null}

                          {/* Insígnias */}
                          {user.insignias.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {user.insignias.map(({ insignia }) => (
                                <span key={insignia.id}
                                  className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border"
                                  style={{ backgroundColor: insignia.color + '12', borderColor: insignia.color + '40', color: insignia.color }}>
                                  {insignia.emoji} {insignia.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Metadados à direita */}
                        <div className="flex items-center gap-3 text-[11px] text-[#c8bbb6] shrink-0">
                          {user.state && (
                            <span className="flex items-center gap-0.5"><MapPin size={10} /> {user.state}</span>
                          )}
                          {(user._count.threads > 0 || user._count.comments > 0) && (
                            <span>{user._count.threads}t · {user._count.comments}r</span>
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
