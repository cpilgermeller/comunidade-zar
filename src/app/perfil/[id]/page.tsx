import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Avatar } from '@/components/avatar'
import { formatDate } from '@/lib/utils'
import { removeInsignia } from '@/app/actions/profile'
import {
  Link2, Mail, Phone, MapPin, Briefcase, MessageSquare,
  ChevronLeft, Shield, Star, X, Infinity, Calendar,
} from 'lucide-react'
import Link from 'next/link'

function tenureBadge(since: Date): { label: string; emoji: string } {
  const months = Math.floor((Date.now() - since.getTime()) / (1000 * 60 * 60 * 24 * 30))
  if (months < 3)  return { label: 'Novata(o)', emoji: '🌱' }
  if (months < 12) return { label: 'Membro ZAR', emoji: '⭐' }
  if (months < 24) return { label: 'Veterana(o)', emoji: '🏆' }
  return { label: 'Fundadora(or)', emoji: '👑' }
}

export default async function PerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  const isAdmin = session?.role === 'admin'
  const isOwner = session?.userId === id

  const user = await db.user.findUnique({
    where: { id },
    include: {
      insignias: { include: { insignia: true }, orderBy: { assignedAt: 'asc' } },
      _count: { select: { threads: true, comments: true } },
    },
  })

  if (!user || user.blocked) notFound()

  const areas = user.areas?.split(',').map((a) => a.trim()).filter(Boolean) ?? []
  const states = user.state === 'BR'
    ? ['🇧🇷 Brasil inteiro']
    : (user.state?.split(',').map((s) => s.trim()).filter(Boolean) ?? [])

  const tenure = user.memberSince ? tenureBadge(user.memberSince) : null

  return (
    <div className="flex h-full">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 animate-fade-in">
          <Link href="/membros" className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-800 mb-6 transition-colors">
            <ChevronLeft size={16} /> Membros
          </Link>

          {/* Profile card */}
          <div className="bg-white border border-[#dce8ff] rounded-2xl overflow-hidden shadow-sm mb-6">
            {/* Cover */}
            <div className="h-24 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700" />

            <div className="px-6 pb-6">
              <div className="flex items-end justify-between -mt-10 mb-4">
                <div className="relative">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md" />
                  ) : (
                    <div className="w-20 h-20 border-4 border-white shadow-md rounded-2xl overflow-hidden">
                      <Avatar name={user.name} size="xl" />
                    </div>
                  )}
                  {user.role === 'admin' && (
                    <span className="absolute -bottom-1 -right-1 bg-gold-500 rounded-full p-1">
                      <Shield size={10} className="text-white" />
                    </span>
                  )}
                </div>
                <div className="flex gap-2 pb-1">
                  {isOwner && (
                    <Link href="/perfil/editar" className="flex items-center gap-1.5 text-xs font-semibold bg-brand-800 text-white px-3 py-1.5 rounded-lg hover:bg-brand-900 transition-colors">
                      Editar perfil
                    </Link>
                  )}
                </div>
              </div>

              <h1 className="text-xl font-black text-gray-900">{user.name}</h1>

              {/* Badges row */}
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {user.role === 'admin' && (
                  <span className="text-xs font-bold text-gold-700 bg-gold-50 border border-gold-300 px-2 py-0.5 rounded-full">👑 Admin ZAR</span>
                )}
                {user.isLifetime && (
                  <span className="flex items-center gap-1 text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full">
                    <Infinity size={10} /> Vitalício
                  </span>
                )}
                {tenure && (
                  <span className="text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                    {tenure.emoji} {tenure.label}
                  </span>
                )}
              </div>

              {user.bio && <p className="text-sm text-gray-600 mt-3 leading-relaxed">{user.bio}</p>}

              {/* Meta info */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4">
                {states.length > 0 && (
                  <span className="flex items-center gap-1 text-xs text-[#64748b]">
                    <MapPin size={11} /> {states.join(' · ')}
                  </span>
                )}
                {user.instagram && (
                  <a href={`https://instagram.com/${user.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-brand-700 hover:text-brand-900 transition-colors">
                    <Link2 size={11} /> @{user.instagram.replace('@', '')}
                  </a>
                )}
                {user.contactEmail && (
                  <a href={`mailto:${user.contactEmail}`} className="flex items-center gap-1 text-xs text-brand-700 hover:text-brand-900 transition-colors">
                    <Mail size={11} /> {user.contactEmail}
                  </a>
                )}
                {user.phone && (
                  <a
                    href={`https://wa.me/55${user.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 transition-colors font-medium"
                  >
                    <Phone size={11} /> {user.phone}
                  </a>
                )}
                {user.memberSince && (
                  <span className="flex items-center gap-1 text-xs text-[#64748b]">
                    <Calendar size={11} /> Membro desde {new Date(user.memberSince).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </span>
                )}
              </div>

              {/* Áreas */}
              {areas.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Briefcase size={11} /> Áreas de atuação
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {areas.map((area) => (
                      <span key={area} className="text-xs bg-brand-50 text-brand-800 border border-brand-100 px-2.5 py-1 rounded-full font-medium">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-[#dce8ff] rounded-2xl p-4 text-center shadow-sm">
              <p className="text-2xl font-black text-brand-800">{user._count.threads}</p>
              <p className="text-xs text-[#64748b] mt-0.5 flex items-center justify-center gap-1"><MessageSquare size={10} /> Discussões</p>
            </div>
            <div className="bg-white border border-[#dce8ff] rounded-2xl p-4 text-center shadow-sm">
              <p className="text-2xl font-black text-brand-800">{user._count.comments}</p>
              <p className="text-xs text-[#64748b] mt-0.5">Respostas</p>
            </div>
            <div className="bg-white border border-[#dce8ff] rounded-2xl p-4 text-center shadow-sm">
              <p className="text-2xl font-black text-brand-800">{user.insignias.length}</p>
              <p className="text-xs text-[#64748b] mt-0.5 flex items-center justify-center gap-1"><Star size={10} /> Insígnias</p>
            </div>
          </div>

          {/* Insígnias */}
          {user.insignias.length > 0 && (
            <div className="bg-white border border-[#dce8ff] rounded-2xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 mb-3">Insígnias conquistadas</h2>
              <div className="flex flex-wrap gap-2">
                {user.insignias.map(({ insignia }) => (
                  <div key={insignia.id} className="group relative flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-semibold"
                    style={{ backgroundColor: insignia.color + '15', borderColor: insignia.color + '40', color: insignia.color }}>
                    <span>{insignia.emoji}</span>
                    <span>{insignia.name}</span>
                    {isAdmin && (
                      <form action={removeInsignia.bind(null, user.id, insignia.id)} className="hidden group-hover:flex">
                        <button type="submit" className="ml-1 hover:opacity-70 transition-opacity"><X size={12} /></button>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
