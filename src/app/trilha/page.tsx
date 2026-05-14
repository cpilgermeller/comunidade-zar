import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { Navbar } from '@/components/navbar'
import { RANKS, getRank } from '@/lib/rank'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default async function TrilhaPage() {
  const session = await getSession()

  let currentRank = RANKS[0]
  let nextRank = RANKS[1]

  if (session) {
    const user = await db.user.findUnique({ where: { id: session.userId }, select: { memberSince: true } })
    currentRank = getRank(user?.memberSince)
    const idx = RANKS.findIndex((r) => r.id === currentRank.id)
    nextRank = RANKS[idx + 1] ?? RANKS[RANKS.length - 1]
  }

  const currentIdx = RANKS.findIndex((r) => r.id === currentRank.id)

  return (
    <div className="flex h-full">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-10 animate-fade-in">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-brand-900 to-brand-700 rounded-2xl shadow-lg shadow-brand-200 mb-4">
              <span className="text-3xl">🦅</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Trilha de Evolução ZAR</h1>
            <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
              Cada fase da sua jornada tem um nome, uma essência e um propósito.
              Quanto mais você avança, mais você transforma.
            </p>
          </div>

          {/* Seu nível atual */}
          {session && (
            <div
              className="rounded-2xl border-2 p-5 mb-10 text-center"
              style={{ borderColor: currentRank.color + '60', backgroundColor: currentRank.color + '08' }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: currentRank.color }}>
                Seu nível atual
              </p>
              <div className="text-4xl mb-1">{currentRank.emoji}</div>
              <h2 className="text-xl font-black text-gray-900">{currentRank.name}</h2>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-xs mx-auto italic">
                "{currentRank.essence}"
              </p>
              {currentRank.id !== 'governante' && (
                <p className="text-xs text-gray-400 mt-3">
                  Próximo nível: <span className="font-semibold">{nextRank.emoji} {nextRank.name}</span> — {nextRank.label}
                </p>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="relative">
            {/* Linha vertical conectando os nós */}
            <div className="absolute left-7 top-8 bottom-8 w-0.5 bg-gradient-to-b from-indigo-200 via-violet-200 to-yellow-200" />

            <div className="space-y-4">
              {RANKS.map((rank, idx) => {
                const isActive = idx === currentIdx
                const isPast = idx < currentIdx
                const isFuture = idx > currentIdx

                return (
                  <div key={rank.id} className={`relative flex gap-4 transition-all`}>
                    {/* Nó da timeline */}
                    <div className="shrink-0 z-10">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-all
                          ${isActive ? 'shadow-md ring-2 ring-offset-2' : ''}
                          ${isFuture ? 'opacity-40 grayscale' : ''}`}
                        style={{
                          backgroundColor: isActive ? rank.color + '20' : isPast ? rank.color + '15' : '#f1f5f9',
                          borderWidth: 2,
                          borderColor: isActive ? rank.color : isPast ? rank.color + '60' : '#e2e8f0',
                          ...(isActive ? { '--tw-ring-color': rank.color + '40' } as React.CSSProperties : {}),
                        }}
                      >
                        {rank.emoji}
                      </div>
                    </div>

                    {/* Conteúdo do card */}
                    <div
                      className={`flex-1 rounded-2xl border p-4 transition-all
                        ${isActive ? 'shadow-sm' : ''}
                        ${isFuture ? 'opacity-50' : ''}`}
                      style={{
                        borderColor: isActive ? rank.color + '50' : '#f0eae6',
                        backgroundColor: isActive ? rank.color + '06' : 'white',
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900">{rank.name}</h3>
                            {isActive && session && (
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: rank.color + '20', color: rank.color }}
                              >
                                Você está aqui
                              </span>
                            )}
                            {isPast && (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                ✓ Conquistado
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{rank.label}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2 leading-relaxed italic">
                        "{rank.essence}"
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Rodapé */}
          <div className="mt-10 text-center">
            <p className="text-xs text-gray-400 leading-relaxed">
              Os níveis são calculados automaticamente com base no tempo de comunidade. <br />
              Resultados extraordinários chegam para quem permanece e pratica.
            </p>
            <Link href="/membros"
              className="inline-flex items-center gap-1 mt-4 text-sm text-brand-700 hover:text-brand-900 font-medium transition-colors">
              Ver membros da comunidade <ChevronRight size={14} />
            </Link>
          </div>

        </div>
      </main>
    </div>
  )
}
