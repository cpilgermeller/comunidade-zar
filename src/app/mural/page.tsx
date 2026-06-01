import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { Navbar } from '@/components/navbar'
import { InterestButton } from '@/components/interest-modal'
import { EXPERIENCE_LABELS, DELIVERY_LABELS } from '@/lib/mural-constants'
import { Briefcase, CheckCircle, Clock, FileText, Info, Plus, ShieldCheck, Sparkles } from 'lucide-react'
import Link from 'next/link'

const EXPERIENCE_COLORS: Record<string, string> = {
  proven: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  studied: 'bg-blue-50 text-blue-700 border-blue-200',
  beginner: 'bg-violet-50 text-violet-700 border-violet-200',
}

const EXPERIENCE_ICONS: Record<string, string> = {
  proven: '🏆',
  studied: '📚',
  beginner: '🌱',
}

export default async function MuralPage({
  searchParams,
}: {
  searchParams: Promise<{ piece?: string; delivery?: string; cadastrado?: string }>
}) {
  const { piece, delivery, cadastrado } = await searchParams
  const session = await getSession()

  const [profiles, myProfile] = await Promise.all([
    db.opportunityProfile.findMany({
      where: {
        status: 'approved',
        ...(piece ? { pieces: { contains: piece } } : {}),
        ...(delivery ? { deliveryTime: delivery } : {}),
      },
      include: { interests: { where: session ? { fromUserId: session.userId } : { fromUserId: '' } } },
      orderBy: { createdAt: 'desc' },
    }),
    session ? db.opportunityProfile.findUnique({ where: { userId: session.userId } }) : null,
  ])

  const PIECES_ALL = ['Petição Inicial', 'Réplica', 'Agravo de Instrumento', 'Agravo Interno', 'Apelação', 'Embargos de Declaração', 'Contestação', 'Outro']

  return (
    <div className="flex h-full">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8 animate-fade-in">

          {/* Banner de sucesso no cadastro */}
          {cadastrado === '1' && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-2xl mb-6 flex items-start gap-3">
              <CheckCircle size={20} className="shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <p className="font-semibold">Cadastro enviado com sucesso!</p>
                <p className="text-sm text-emerald-700 mt-0.5">Seu perfil está em análise. Assim que aprovado, ele aparecerá no mural para os outros membros.</p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-900 to-brand-700 rounded-xl flex items-center justify-center shadow-md shadow-brand-200">
                <Briefcase size={18} className="text-white" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Mural de Oportunidades</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1 ml-13">Conectando quem precisa de petições com quem sabe fazê-las.</p>
          </div>

          {/* Bloco explicativo */}
          <div className="bg-gradient-to-br from-brand-950 to-brand-800 rounded-2xl p-6 mb-8 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-gold-300" />
              <h2 className="font-bold text-base">O que é o Mural de Oportunidades?</h2>
            </div>
            <p className="text-sm text-brand-100 leading-relaxed mb-5">
              Este é um espaço criado para conectar membros da Comunidade ZAR que desejam <strong className="text-white">oferecer serviços de peticionamento</strong> com colegas que precisam <strong className="text-white">contratar esse suporte</strong> na modalidade avulsa ou por demanda — tudo dentro da área de Revisionais Bancárias.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div className="bg-white/10 rounded-xl p-4">
                <p className="font-semibold text-sm mb-1.5 flex items-center gap-2"><FileText size={14} /> Para quem quer ser correspondente</p>
                <p className="text-xs text-brand-200 leading-relaxed">Cadastre-se no mural, informe suas habilidades e condições. Após aprovação, outros membros poderão entrar em contato diretamente com você.</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="font-semibold text-sm mb-1.5 flex items-center gap-2"><ShieldCheck size={14} /> Para quem quer contratar</p>
                <p className="text-xs text-brand-200 leading-relaxed">Navegue pelos perfis, filtre por tipo de peça ou prazo e clique em "Tenho interesse". O correspondente receberá seu WhatsApp e entrará em contato.</p>
              </div>
            </div>

            <div className="bg-amber-400/20 border border-amber-300/30 rounded-xl p-3 flex items-start gap-2">
              <Info size={14} className="text-amber-300 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-100 leading-relaxed">
                <strong>Importante:</strong> Este mural é apenas um meio de conexão. A Comunidade ZAR não se responsabiliza por contratações, negociações ou pagamentos. Você provavelmente trabalhará com modelos fornecidos pelo colega — não precisará criar peças do zero.
              </p>
            </div>
          </div>

          {/* CTA cadastro */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Correspondentes disponíveis
                <span className="ml-2 text-sm font-normal text-gray-400">({profiles.length})</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Perfis aprovados pela administração</p>
            </div>
            {session && !myProfile && (
              <Link href="/mural/cadastrar"
                className="flex items-center gap-2 bg-brand-800 hover:bg-brand-900 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
                <Plus size={15} /> Quero ser correspondente
              </Link>
            )}
            {myProfile && (
              <div className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                myProfile.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                myProfile.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-red-50 text-red-700 border-red-200'
              }`}>
                {myProfile.status === 'approved' ? '✓ Seu perfil está no mural' :
                 myProfile.status === 'pending' ? '⏳ Seu cadastro está em análise' :
                 '✗ Cadastro não aprovado'}
              </div>
            )}
          </div>

          {/* Filtros */}
          <form className="bg-white border border-[#f0eae6] rounded-2xl p-4 mb-6 shadow-sm flex flex-wrap gap-3" action="/mural" method="GET">
            <select name="piece" defaultValue={piece ?? ''}
              className="flex-1 min-w-40 border border-[#ede8e3] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-[#fdf9f7]">
              <option value="">Todas as peças</option>
              {PIECES_ALL.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select name="delivery" defaultValue={delivery ?? ''}
              className="border border-[#ede8e3] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-[#fdf9f7]">
              <option value="">Qualquer prazo</option>
              <option value="24h">Entrega em 24h</option>
              <option value="48h">Entrega em 48h</option>
              <option value="72h">Entrega em 72h</option>
              <option value="other">A combinar</option>
            </select>
            <button type="submit" className="bg-brand-800 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-brand-900 transition-colors">
              Filtrar
            </button>
            {(piece || delivery) && (
              <Link href="/mural" className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2 transition-colors">Limpar</Link>
            )}
          </form>

          {/* Cards */}
          {profiles.length === 0 ? (
            <div className="bg-white border border-[#f0eae6] rounded-2xl p-16 text-center shadow-sm">
              <Briefcase size={32} className="text-[#e8ddd9] mx-auto mb-3" />
              <p className="font-semibold text-gray-600">Nenhum correspondente disponível</p>
              <p className="text-sm text-[#b5a9a4] mt-1">
                {piece || delivery ? 'Tente outros filtros.' : 'Seja o primeiro a se cadastrar!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profiles.map((profile) => {
                const pieces = profile.pieces.split(',').map((p) => p.trim()).filter(Boolean)
                const alreadyInterested = profile.interests.length > 0
                const isOwn = session?.userId === profile.userId

                return (
                  <div key={profile.id} className="bg-white border border-[#f0eae6] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">

                    {/* Badges topo */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${EXPERIENCE_COLORS[profile.experience]}`}>
                        {EXPERIENCE_ICONS[profile.experience]} {EXPERIENCE_LABELS[profile.experience]}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-600">
                        <Clock size={11} /> {DELIVERY_LABELS[profile.deliveryTime]}
                      </span>
                    </div>

                    {/* Peças */}
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Peças que realiza</p>
                      <div className="flex flex-wrap gap-1.5">
                        {pieces.map((p) => (
                          <span key={p} className="text-xs bg-brand-50 text-brand-800 border border-brand-100 px-2 py-0.5 rounded-full font-medium">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Condições */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {profile.acceptsTestPiece && (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <CheckCircle size={12} /> Aceita peça teste
                        </span>
                      )}
                      {profile.acceptsNegotiation && (
                        <span className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                          <CheckCircle size={12} /> Aceita negociar valores
                        </span>
                      )}
                      {profile.city && profile.state && (
                        <span className="text-xs text-gray-400">📍 {profile.city}/{profile.state}</span>
                      )}
                    </div>

                    {/* CTA */}
                    {session && !isOwn && (
                      alreadyInterested ? (
                        <div className="w-full text-center bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-2.5 rounded-xl">
                          ✓ Interesse já enviado
                        </div>
                      ) : (
                        <InterestButton
                          profileId={profile.id}
                          userPhone={null}
                        />
                      )
                    )}
                    {isOwn && (
                      <div className="text-center text-xs text-gray-400 py-1">Este é o seu perfil</div>
                    )}
                    {!session && (
                      <p className="text-center text-xs text-gray-400">Faça login para demonstrar interesse</p>
                    )}
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
