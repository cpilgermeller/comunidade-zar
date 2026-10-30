export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { Navbar } from '@/components/navbar'
import Link from 'next/link'
import {
  Download, FileText, FileSpreadsheet, Presentation,
  Video, Link2, Gift, Star, TrendingDown, Filter,
} from 'lucide-react'

const CATEGORIES = ['Todos', 'Estratégias', 'Prospecção', 'Atendimento', 'Contratos', 'Marketing', 'Petições', 'Gestão', 'Geral']

const FILE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  PDF:   { icon: <FileText size={18} />,         color: '#dc2626', bg: '#fef2f2' },
  DOCX:  { icon: <FileText size={18} />,         color: '#2563eb', bg: '#eff6ff' },
  XLSX:  { icon: <FileSpreadsheet size={18} />,  color: '#16a34a', bg: '#f0fdf4' },
  PPTX:  { icon: <Presentation size={18} />,     color: '#ea580c', bg: '#fff7ed' },
  VIDEO: { icon: <Video size={18} />,            color: '#7c3aed', bg: '#f5f3ff' },
  LINK:  { icon: <Link2 size={18} />,            color: '#0891b2', bg: '#ecfeff' },
}

function fileConfig(type: string) {
  return FILE_CONFIG[type.toUpperCase()] ?? FILE_CONFIG['PDF']
}

export default async function MateriaisPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const { categoria } = await searchParams
  const session = await getSession()

  const where = {
    published: true,
    ...(categoria && categoria !== 'Todos' ? { category: categoria } : {}),
  }

  const [materials, allMaterials] = await Promise.all([
    db.bonusMaterial.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    }),
    db.bonusMaterial.findMany({
      where: { published: true },
      select: { category: true },
    }),
  ])

  const categoryCounts = allMaterials.reduce<Record<string, number>>((acc, m) => {
    acc[m.category] = (acc[m.category] ?? 0) + 1
    return acc
  }, {})

  const activeCategories = CATEGORIES.filter(
    (c) => c === 'Todos' || (categoryCounts[c] ?? 0) > 0
  )

  return (
    <div className="flex h-full">
      <Navbar />
      <main className="flex-1 overflow-y-auto">

        {/* ── Hero ── */}
        <div className="relative overflow-hidden" style={{
          background: 'radial-gradient(900px 400px at 85% -30%, rgba(245,158,11,.22), transparent 60%), radial-gradient(600px 400px at -10% 120%, rgba(16,40,130,.3), transparent 60%), linear-gradient(135deg, #060e38 0%, #102882 55%, #0c1e68 100%)',
        }}>
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',
            backgroundSize: '44px 44px',
            maskImage: 'linear-gradient(180deg,#000,transparent 90%)',
          }} />
          <div className="relative max-w-3xl mx-auto px-6 py-14">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 6px 20px rgba(245,158,11,.35)' }}>
                <Gift size={22} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-300 uppercase tracking-widest">Comunidade ZAR</p>
                <h1 className="text-white font-black text-2xl tracking-tight leading-none">Materiais Bônus</h1>
              </div>
            </div>
            <p className="text-brand-200/80 text-sm max-w-lg leading-relaxed">
              Recursos exclusivos para te ajudar em estratégias, prospecção, atendimento e muito mais. Materiais práticos, prontos para usar.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <span><strong className="text-white">{allMaterials.length}</strong> materiais disponíveis</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                <TrendingDown size={12} className="text-emerald-400" />
                <span><strong className="text-white">{allMaterials.length > 0 ? 'Gratuito' : '—'}</strong> para membros</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-3xl mx-auto px-6 py-8 animate-fade-in">

          {/* Category filters */}
          {activeCategories.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {activeCategories.map((cat) => {
                const isActive = (!categoria && cat === 'Todos') || categoria === cat
                const count = cat === 'Todos' ? allMaterials.length : (categoryCounts[cat] ?? 0)
                return (
                  <Link
                    key={cat}
                    href={cat === 'Todos' ? '/materiais' : `/materiais?categoria=${cat}`}
                    className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-900 text-white shadow-md shadow-brand-200'
                        : 'bg-white border border-[#e2e8f4] text-gray-500 hover:border-brand-300 hover:text-brand-800'
                    }`}
                  >
                    {cat}
                    {count > 0 && (
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-700'}`}>
                        {count}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          )}

          {/* Materials grid */}
          {materials.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e8edf5] shadow-sm p-16 text-center">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Gift size={24} className="text-amber-400" />
              </div>
              <p className="font-bold text-gray-700">Nenhum material disponível ainda</p>
              <p className="text-sm text-gray-400 mt-1">Em breve novos recursos serão adicionados aqui.</p>
            </div>
          ) : (
            <div className="grid gap-4 stagger">
              {materials.map((mat) => {
                const fc = fileConfig(mat.fileType)
                return (
                  <div key={mat.id}
                    className="group bg-white rounded-2xl border border-[#e8edf5] shadow-sm hover:shadow-md hover:border-brand-200 hover:-translate-y-0.5 transition-all overflow-hidden"
                    style={{ boxShadow: '0 1px 3px rgba(16,40,130,.06), 0 4px 16px rgba(16,40,130,.04)' }}>
                    <div className="flex gap-4 p-5">
                      {/* File type icon */}
                      <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{ color: fc.color, backgroundColor: fc.bg }}>
                        {fc.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                                {mat.category}
                              </span>
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ color: fc.color, backgroundColor: fc.bg }}>
                                {mat.fileType}
                              </span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-brand-800 transition-colors">
                              {mat.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 leading-relaxed line-clamp-2">
                              {mat.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Download size={11} />
                            {mat.downloads} {mat.downloads === 1 ? 'download' : 'downloads'}
                          </span>
                          {session ? (
                            <a
                              href={`/materiais/download/${mat.id}`}
                              className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-all text-white"
                              style={{ background: 'linear-gradient(135deg, #102882, #1537ab)', boxShadow: '0 4px 12px rgba(16,40,130,.2)' }}
                            >
                              <Download size={13} /> Baixar
                            </a>
                          ) : (
                            <Link
                              href="/login"
                              className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl border border-brand-200 text-brand-700 hover:bg-brand-50 transition-colors"
                            >
                              Entrar para baixar
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
