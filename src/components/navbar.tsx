import Link from 'next/link'
import Image from 'next/image'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { logout } from '@/app/actions/auth'
import { Avatar } from './avatar'
import { NotificationBell } from './notification-bell'
import {
  Home, MessageSquare, Users, Heart, Plus, Shield,
  Scale, BookOpen, LogOut, Zap, ExternalLink,
  ChevronRight, Star, Sparkles, Briefcase, Bookmark, Gift,
} from 'lucide-react'

export async function Navbar() {
  const session = await getSession()

  const [categories, threadCount, jurisCount, fundamentoCount, usefulLinks, unreadCount] = await Promise.all([
    db.category.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { threads: true } } } }),
    db.thread.count(),
    db.jurisprudence.count(),
    db.fundamento.count(),
    db.usefulLink.findMany({ orderBy: { order: 'asc' } }),
    session
      ? db.notification.count({ where: { userId: session.userId, read: false } }).catch(() => 0)
      : Promise.resolve(0),
  ])

  return (
    <aside className="w-60 shrink-0 flex flex-col h-screen sticky top-0 overflow-y-auto" style={{
      background: '#03152F',
      borderRight: '1px solid rgba(255,255,255,0.05)',
    }}>

      {/* Logo */}
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" className="block">
          <Image
            src="/logo-zar.webp"
            alt="ZAR Comunidade"
            width={192}
            height={96}
            priority
            className="w-full h-auto"
            style={{ maxHeight: 90, objectFit: 'contain', objectPosition: 'left center' }}
          />
        </Link>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">

        {/* Início */}
        <DarkNavItem href="/" icon={<Home size={15} />} label="Início" />

        {/* Discussões */}
        <div>
          <DarkNavItem href="/discussoes" icon={<MessageSquare size={15} />} label="Discussões" count={threadCount} />
          {categories.length > 0 && (
            <div className="ml-3 mt-0.5 pl-3 space-y-0.5" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/discussoes?categoria=${cat.slug}`}
                  className="nav-cat flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="truncate flex-1">{cat.name}</span>
                  {cat._count.threads > 0 && (
                    <span className="text-[10px] font-medium tabular-nums" style={{ color: 'rgba(255,255,255,0.3)' }}>{cat._count.threads}</span>
                  )}
                </Link>
              ))}
              {session && (
                <>
                  <Link href="/discussoes/nova" className="nav-item-gold flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold">
                    <Plus size={11} /> Nova discussão
                  </Link>
                  <Link href="/discussoes/salvos" className="nav-cat flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs">
                    <Bookmark size={11} /> Salvos
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        <DarkNavItem href="/membros" icon={<Users size={15} />} label="Membros" />
        <DarkNavItem href="/mural" icon={<Briefcase size={15} />} label="Oportunidades" />
        <DarkNavItem href="/trilha" icon={<Sparkles size={15} />} label="Trilha de Evolução" />
        <DarkNavItem href="/materiais" icon={<Gift size={15} />} label="Materiais Bônus" gold />
        <DarkNavItem href="/depoimentos" icon={<Heart size={15} />} label="Depoimentos" />

        {/* Bancos */}
        <div className="pt-5">
          <p className="text-[9px] font-bold uppercase tracking-widest px-3 mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>Bancos</p>
          <DarkNavItem href="/jurisprudencias" icon={<Scale size={15} />} label="Jurisprudências" count={jurisCount} />
          <DarkNavItem href="/fundamentos" icon={<BookOpen size={15} />} label="Fundamentos" count={fundamentoCount} />
        </div>

        {/* Links Úteis */}
        {usefulLinks.length > 0 && (
          <div className="pt-5">
            <p className="text-[9px] font-bold uppercase tracking-widest px-3 mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>Links Úteis</p>
            {usefulLinks.map((link) => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                className="nav-item flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm group"
              >
                <span className="w-5 h-5 flex items-center justify-center text-sm leading-none shrink-0">{link.emoji}</span>
                <span className="flex-1 truncate text-xs">{link.label}</span>
                <ExternalLink size={11} className="opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
              </a>
            ))}
          </div>
        )}

        {/* Admin */}
        {session?.role === 'admin' && (
          <div className="pt-5">
            <p className="text-[9px] font-bold uppercase tracking-widest px-3 mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>Admin</p>
            <Link href="/admin" className="nav-item-gold flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold">
              <Shield size={15} /> Painel Admin
            </Link>
          </div>
        )}
      </nav>

      {/* User footer */}
      {session && (
        <div className="px-3 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-1 mb-1">
            <Link href={`/perfil/${session.userId}`}
              className="nav-item flex items-center gap-2.5 px-2 py-2 rounded-xl cursor-pointer flex-1 min-w-0"
            >
              <Avatar name={session.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate" style={{ color: 'rgba(255,255,255,0.9)' }}>{session.name}</p>
                <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{session.email}</p>
              </div>
            </Link>
            <form action={logout}>
              <button type="submit" title="Sair" className="nav-logout p-2">
                <LogOut size={14} />
              </button>
            </form>
          </div>
          <NotificationBell initialUnread={unreadCount} />
        </div>
      )}
    </aside>
  )
}

/* ── DarkNavItem ── */
function DarkNavItem({ href, icon, label, count, gold }: {
  href: string
  icon: React.ReactNode
  label: string
  count?: number
  gold?: boolean
}) {
  return (
    <Link href={href}
      className={`${gold ? 'nav-item-gold' : 'nav-item'} flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm`}
    >
      <span className="w-5 h-5 flex items-center justify-center shrink-0">{icon}</span>
      <span className="flex-1 font-medium">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums"
          style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
          {count}
        </span>
      )}
    </Link>
  )
}
