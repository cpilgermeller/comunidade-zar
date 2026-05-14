import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Avatar } from '@/components/avatar'
import { formatDate } from '@/lib/utils'
import { toggleBlockUser, deleteUser } from '@/app/actions/admin'
import { deleteAnnouncement, togglePinAnnouncement, deleteEvent } from '@/app/actions/home'
import { deleteJurisprudence } from '@/app/actions/jurisprudencias'
import { deleteFundamento } from '@/app/actions/fundamentos'
import { assignInsignia, deleteInsignia } from '@/app/actions/profile'
import { deleteUsefulLink } from '@/app/actions/useful-links'
import { CreateUserForm, CreateCategoryForm, EditUserButton } from '@/components/admin-forms'
import { CreateAnnouncementForm, CreateEventForm } from '@/components/admin-home-forms'
import { CreateInsigniaForm } from '@/components/admin-insignia-forms'
import { CreateUsefulLinkForm } from '@/components/admin-links-form'
import {
  Shield, Ban, Trash2, CheckCircle, Pin, Megaphone, CalendarDays,
  ExternalLink, Scale, BookOpen, Star, UserPlus, Clock, Link2, Infinity,
} from 'lucide-react'

export default async function AdminPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/')

  const [users, categories, threadCount, commentCount, announcements, events, jurisprudences, fundamentos, insignias, usefulLinks] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { threads: true, comments: true } },
        insignias: { include: { insignia: true } },
      },
    }),
    db.category.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { threads: true } } } }),
    db.thread.count(),
    db.comment.count(),
    db.announcement.findMany({ orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }] }),
    db.event.findMany({ orderBy: { eventDate: 'asc' } }),
    db.jurisprudence.findMany({ orderBy: { createdAt: 'desc' }, include: { author: { select: { name: true } } }, take: 20 }),
    db.fundamento.findMany({ orderBy: [{ isOfficial: 'desc' }, { createdAt: 'desc' }], include: { author: { select: { name: true } }, _count: { select: { likes: true } } }, take: 20 }),
    db.insignia.findMany({ orderBy: { name: 'asc' } }),
    db.usefulLink.findMany({ orderBy: { order: 'asc' } }),
  ])

  const members = users.filter((u) => !u.blocked)

  return (
    <div className="flex h-full">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
              <Shield size={18} className="text-amber-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-sm text-gray-500">Gerencie usuários, categorias e conteúdo</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Membros', value: users.length },
              { label: 'Discussões', value: threadCount },
              { label: 'Jurisprudências', value: jurisprudences.length },
              { label: 'Fundamentos', value: fundamentos.length },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-[#f0eae6] rounded-2xl p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* User + Category forms */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <CreateUserForm />
            <CreateCategoryForm />
          </div>

          {/* Announcements + Events forms */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <CreateAnnouncementForm />
            <CreateEventForm />
          </div>

          {/* Links úteis */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <CreateUsefulLinkForm />
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Link2 size={15} className="text-brand-700" /> Links Úteis ({usefulLinks.length})
              </h2>
              {usefulLinks.length === 0 ? (
                <p className="text-sm text-gray-400">Nenhum link cadastrado.</p>
              ) : (
                <div className="divide-y divide-[#f7f2ef]">
                  {usefulLinks.map((link) => (
                    <div key={link.id} className="flex items-center gap-3 py-2.5">
                      <span className="text-lg">{link.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{link.label}</p>
                        <p className="text-xs text-gray-400 truncate">{link.url}</p>
                      </div>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-800 shrink-0">
                        <ExternalLink size={13} />
                      </a>
                      <form action={deleteUsefulLink.bind(null, link.id)}>
                        <button type="submit" className="text-red-300 hover:text-red-500 transition-colors shrink-0"><Trash2 size={13} /></button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Insignia forms */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <CreateInsigniaForm />

            {/* Assign insignia — inline server form */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <UserPlus size={16} className="text-brand-700" /> Atribuir Insígnia
              </h2>
              {insignias.length === 0 ? (
                <p className="text-sm text-gray-400">Crie insígnias primeiro.</p>
              ) : (
                <form action={async (fd: FormData) => {
                  'use server'
                  const uid = fd.get('userId') as string
                  const iid = fd.get('insigniaId') as string
                  if (uid && iid) await assignInsignia(uid, iid)
                }} className="space-y-3">
                  <select name="userId" required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300">
                    <option value="">Selecione o membro...</option>
                    {members.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  <select name="insigniaId" required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300">
                    <option value="">Selecione a insígnia...</option>
                    {insignias.map((i) => (
                      <option key={i.id} value={i.id}>{i.emoji} {i.name}</option>
                    ))}
                  </select>
                  <button type="submit" className="w-full bg-brand-800 hover:bg-brand-900 text-white text-sm font-medium py-2 rounded-lg transition-colors">
                    Atribuir
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Insignias list */}
          {insignias.length > 0 && (
            <div className="bg-white border border-[#f0eae6] rounded-2xl p-5 mb-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Star size={15} className="text-gold-500" /> Insígnias ({insignias.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {insignias.map((ins) => (
                  <div key={ins.id} className="group flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-semibold"
                    style={{ backgroundColor: ins.color + '15', borderColor: ins.color + '40', color: ins.color }}>
                    <span>{ins.emoji}</span>
                    <span>{ins.name}</span>
                    <form action={deleteInsignia.bind(null, ins.id)} className="hidden group-hover:flex">
                      <button type="submit" className="text-red-400 hover:text-red-600 ml-1 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Announcements list */}
          <div className="bg-white border border-[#f0eae6] rounded-2xl p-5 mb-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Megaphone size={15} className="text-amber-500" /> Avisos ({announcements.length})
            </h2>
            {announcements.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhum aviso criado.</p>
            ) : (
              <div className="divide-y divide-[#f7f2ef]">
                {announcements.map((ann) => (
                  <div key={ann.id} className="flex items-center gap-3 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{ann.pinned ? '📌 ' : ''}{ann.title}</p>
                      <p className="text-xs text-gray-400">{formatDate(ann.createdAt)}</p>
                    </div>
                    <div className="flex gap-2">
                      <form action={togglePinAnnouncement.bind(null, ann.id)}>
                        <button type="submit" className={`text-xs px-2 py-1 rounded border transition-colors ${ann.pinned ? 'border-amber-200 text-amber-600' : 'border-gray-200 text-gray-400 hover:border-amber-200'}`}>
                          <Pin size={12} />
                        </button>
                      </form>
                      <form action={deleteAnnouncement.bind(null, ann.id)}>
                        <button type="submit" className="text-xs px-2 py-1 rounded border border-red-200 text-red-400 hover:bg-red-50 transition-colors"><Trash2 size={12} /></button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Events list */}
          <div className="bg-white border border-[#f0eae6] rounded-2xl p-5 mb-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <CalendarDays size={15} className="text-brand-700" /> Eventos ({events.length})
            </h2>
            {events.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhum evento criado.</p>
            ) : (
              <div className="divide-y divide-[#f7f2ef]">
                {events.map((ev) => (
                  <div key={ev.id} className="flex items-center gap-3 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{ev.title}</p>
                      <p className="text-xs text-gray-400">{new Date(ev.eventDate).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    {ev.link && <a href={ev.link} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-800"><ExternalLink size={14} /></a>}
                    <form action={deleteEvent.bind(null, ev.id)}>
                      <button type="submit" className="text-xs px-2 py-1 rounded border border-red-200 text-red-400 hover:bg-red-50 transition-colors"><Trash2 size={12} /></button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Jurisprudências */}
          <div className="bg-white border border-[#f0eae6] rounded-2xl p-5 mb-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4"><Scale size={15} className="text-emerald-600" /> Jurisprudências ({jurisprudences.length})</h2>
            {jurisprudences.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhuma jurisprudência cadastrada.</p>
            ) : (
              <div className="divide-y divide-[#f7f2ef]">
                {jurisprudences.map((j) => (
                  <div key={j.id} className="flex items-center gap-3 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{j.title}</p>
                      <p className="text-xs text-gray-400">{j.tribunal} · {j.subject} · {j.author.name}</p>
                    </div>
                    <form action={deleteJurisprudence.bind(null, j.id)}>
                      <button type="submit" className="text-xs px-2 py-1 rounded border border-red-200 text-red-400 hover:bg-red-50 transition-colors"><Trash2 size={12} /></button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fundamentos */}
          <div className="bg-white border border-[#f0eae6] rounded-2xl p-5 mb-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4"><BookOpen size={15} className="text-brand-700" /> Fundamentos ({fundamentos.length})</h2>
            {fundamentos.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhum fundamento cadastrado.</p>
            ) : (
              <div className="divide-y divide-[#f7f2ef]">
                {fundamentos.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{f.isOfficial ? '⭐ ' : ''}{f.title}</p>
                      <p className="text-xs text-gray-400">{f.allegationType} · {f.author.name} · {f._count.likes} curtida{f._count.likes !== 1 ? 's' : ''}</p>
                    </div>
                    <form action={deleteFundamento.bind(null, f.id)}>
                      <button type="submit" className="text-xs px-2 py-1 rounded border border-red-200 text-red-400 hover:bg-red-50 transition-colors"><Trash2 size={12} /></button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Categories list */}
          <div className="bg-white border border-[#f0eae6] rounded-2xl p-5 mb-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Categorias ({categories.length})</h2>
            {categories.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhuma categoria criada.</p>
            ) : (
              <div className="divide-y divide-[#f7f2ef]">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-3 py-3">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{cat.name}</p>
                      {cat.description && <p className="text-xs text-gray-400">{cat.description}</p>}
                    </div>
                    <span className="text-xs text-gray-400">{cat._count.threads} discussão{cat._count.threads !== 1 ? 'ões' : ''}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Users Table */}
          <div className="bg-white border border-[#f0eae6] rounded-2xl p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Membros ({users.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-[#f7f2ef]">
                    <th className="pb-3 font-medium">Usuário</th>
                    <th className="pb-3 font-medium">Papel</th>
                    <th className="pb-3 font-medium">Posts</th>
                    <th className="pb-3 font-medium">Insígnias</th>
                    <th className="pb-3 font-medium">Acesso</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f7f2ef]">
                  {users.map((user) => {
                    const isExpired = user.accessExpiresAt && new Date(user.accessExpiresAt) < new Date()
                    return (
                      <tr key={user.id} className={user.blocked ? 'opacity-50' : ''}>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <Avatar name={user.name} size="sm" />
                            <div>
                              <p className="font-medium text-gray-800">{user.name}</p>
                              <p className="text-xs text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                            {user.role === 'admin' ? 'Admin' : 'Membro'}
                          </span>
                        </td>
                        <td className="py-3 text-gray-600 text-xs">{user._count.threads}t · {user._count.comments}r</td>
                        <td className="py-3">
                          <div className="flex gap-0.5">
                            {user.insignias.length === 0 ? (
                              <span className="text-xs text-gray-300">—</span>
                            ) : (
                              user.insignias.map(({ insignia }) => (
                                <span key={insignia.id} title={insignia.name} className="text-base">{insignia.emoji}</span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          {user.isLifetime ? (
                            <span className="flex items-center gap-1 text-xs text-gold-700 font-semibold">
                              <Infinity size={10} /> Vitalício
                            </span>
                          ) : user.accessExpiresAt ? (
                            <span className={`flex items-center gap-1 text-xs ${isExpired ? 'text-red-500' : 'text-gray-500'}`}>
                              <Clock size={10} />
                              {new Date(user.accessExpiresAt).toLocaleDateString('pt-BR')}
                              {isExpired && ' ⚠️'}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                        <td className="py-3">
                          {user.blocked ? (
                            <span className="flex items-center gap-1 text-xs text-red-500"><Ban size={12} /> Bloqueado</span>
                          ) : isExpired ? (
                            <span className="flex items-center gap-1 text-xs text-orange-500"><Clock size={12} /> Expirado</span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle size={12} /> Ativo</span>
                          )}
                        </td>
                        <td className="py-3">
                          {user.id !== session.userId && (
                            <div className="flex gap-2">
                              <EditUserButton user={{
                                id: user.id,
                                name: user.name,
                                email: user.email,
                                role: user.role,
                                isLifetime: user.isLifetime,
                                accessExpiresAt: user.accessExpiresAt,
                                memberSince: user.memberSince,
                              }} />
                              <form action={toggleBlockUser.bind(null, user.id)}>
                                <button type="submit" className={`text-xs px-2 py-1 rounded-lg border transition-colors ${user.blocked ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50' : 'border-orange-200 text-orange-600 hover:bg-orange-50'}`}>
                                  {user.blocked ? 'Desbloquear' : 'Bloquear'}
                                </button>
                              </form>
                              <form action={deleteUser.bind(null, user.id)}>
                                <button type="submit" className="text-xs px-2 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                                  <Trash2 size={12} />
                                </button>
                              </form>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
