import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { logout } from '@/app/actions/auth'
import { Avatar } from './avatar'
import { NotificationBell } from './notification-bell'
import {
  Home, MessageSquare, Users, Heart, Plus, Shield,
  Scale, BookOpen, LogOut, Zap, ExternalLink,
  ChevronRight, Star, Sparkles,
} from 'lucide-react'

export async function Navbar() {
  const session = await getSession()

  const [categories, threadCount, jurisCount, fundamentoCount, usefulLinks, unreadCount] = await Promise.all([
    db.category.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { threads: true } } } }),
    db.thread.count(),
    db.jurisprudence.count(),
    db.fundamento.count(),
    db.usefulLink.findMany({ orderBy: { order: 'asc' } }),
    session ? db.notification.count({ where: { userId: session.userId, read: false } }) : Promise.resolve(0),
  ])

  return (
    <aside className="w-64 shrink-0 flex flex-col h-screen sticky top-0 overflow-y-auto border-r border-[#dce8ff] bg-white">

      {/* Logo */}
      <div className="p-5 border-b border-[#dce8ff]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-900 to-brand-700 rounded-xl flex items-center justify-center shadow-md shadow-brand-200 group-hover:shadow-brand-300 transition-shadow">
            <Zap size={20} className="text-white fill-white" />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900 tracking-tight leading-none">Comunidade</p>
            <p className="text-sm font-black gradient-text leading-tight">ZAR</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">

        {/* Início */}
        <NavItem href="/" icon={<Home size={16} />} label="Início" />

        {/* Discussões + categorias aninhadas */}
        <div>
          <NavItem href="/discussoes" icon={<MessageSquare size={16} />} label="Discussões" count={threadCount} />

          {categories.length > 0 && (
            <div className="ml-3 mt-0.5 border-l-2 border-[#dce8ff] pl-3 space-y-0.5">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/discussoes?categoria=${cat.slug}`}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-brand-50 hover:text-brand-800 transition-colors group"
                >
                  <span className="w-2 h-2 rounded-full shrink-0 transition-transform group-hover:scale-125" style={{ backgroundColor: cat.color }} />
                  <span className="truncate flex-1">{cat.name}</span>
                  {cat._count.threads > 0 && (
                    <span className="text-[10px] text-[#94a3b8] font-medium tabular-nums">{cat._count.threads}</span>
                  )}
                </Link>
              ))}
              {session && (
                <Link href="/discussoes/nova"
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-brand-700 hover:bg-brand-50 transition-colors font-medium">
                  <Plus size={12} /> Nova discussão
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Membros */}
        <NavItem href="/membros" icon={<Users size={16} />} label="Membros" />

        {/* Trilha de Evolução */}
        <NavItem href="/trilha" icon={<Sparkles size={16} />} label="Trilha de Evolução" />

        {/* Depoimentos */}
        <NavItem href="/depoimentos" icon={<Heart size={16} />} label="Depoimentos" />

        {/* Bancos */}
        <div className="pt-4">
          <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest px-3 mb-1">Bancos</p>
          <NavItem href="/jurisprudencias" icon={<Scale size={16} />} label="Jurisprudências" count={jurisCount} accent="emerald" />
          <NavItem href="/fundamentos" icon={<BookOpen size={16} />} label="Fundamentos" count={fundamentoCount} accent="amber" />
        </div>

        {/* Links Úteis */}
        {usefulLinks.length > 0 && (
          <div className="pt-4">
            <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest px-3 mb-1">Links Úteis</p>
            {usefulLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-brand-50 hover:text-brand-800 transition-colors group"
              >
                <span className="w-6 h-6 flex items-center justify-center text-base leading-none shrink-0">{link.emoji}</span>
                <span className="flex-1 truncate">{link.label}</span>
                <ExternalLink size={12} className="text-[#94a3b8] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </a>
            ))}
          </div>
        )}

        {/* Admin */}
        {session?.role === 'admin' && (
          <div className="pt-4">
            <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest px-3 mb-1">Admin</p>
            <Link href="/admin" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors">
              <div className="w-6 h-6 flex items-center justify-center">
                <Shield size={16} />
              </div>
              Painel Admin
            </Link>
          </div>
        )}
      </nav>

      {/* User footer */}
      {session && (
        <div className="p-3 border-t border-[#dce8ff]">
          <div className="flex items-center gap-1 mb-1">
            <Link href={`/perfil/${session.userId}`}
              className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-brand-50 transition-colors group cursor-pointer flex-1 min-w-0">
              <Avatar name={session.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{session.name}</p>
                <p className="text-[10px] text-[#94a3b8] truncate">{session.email}</p>
              </div>
            </Link>
            <NotificationBell initialUnread={unreadCount} />
            <form action={logout}>
              <button type="submit" title="Sair"
                className="text-gray-300 hover:text-red-400 p-2 transition-colors">
                <LogOut size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </aside>
  )
}

/* ── NavItem ── */
function NavItem({ href, icon, label, count, accent }: {
  href: string
  icon: React.ReactNode
  label: string
  count?: number
  accent?: 'emerald' | 'amber'
}) {
  const hover =
    accent === 'emerald' ? 'hover:bg-emerald-50 hover:text-emerald-700' :
    accent === 'amber'   ? 'hover:bg-amber-50  hover:text-amber-700'   :
    'hover:bg-brand-50 hover:text-brand-800'

  const badge =
    accent === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
    accent === 'amber'   ? 'bg-amber-100   text-amber-700'   :
    'bg-brand-100 text-brand-700'

  return (
    <Link href={href}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-600 transition-colors ${hover}`}>
      {/* Icon wrapper — garante tamanho fixo e alinhamento */}
      <span className="w-6 h-6 flex items-center justify-center shrink-0 text-current">
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {count !== undefined && count > 0 && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums ${badge}`}>
          {count}
        </span>
      )}
    </Link>
  )
}
