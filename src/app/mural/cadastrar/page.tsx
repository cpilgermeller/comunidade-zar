'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { createOpportunityProfile, PIECES_OPTIONS } from '@/app/actions/mural'
import { ChevronLeft, Briefcase } from 'lucide-react'
import Link from 'next/link'

export default function CadastrarMuralPage() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const result = await createOpportunityProfile(formData)
    setPending(false)
    if (result?.error) setError(result.error)
  }

  const fieldClass = "w-full px-3 py-2.5 text-sm border border-[#ede8e3] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 bg-[#fdf9f7] focus:bg-white transition-colors"
  const labelClass = "block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide"

  return (
    <div className="flex h-full">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8 animate-fade-in">
          <Link href="/mural" className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-800 mb-6 transition-colors">
            <ChevronLeft size={16} /> Mural de Oportunidades
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-900 to-brand-700 rounded-xl flex items-center justify-center shadow-md shadow-brand-200">
              <Briefcase size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Cadastro de Correspondente</h1>
              <p className="text-sm text-gray-500">Seu perfil será revisado antes de aparecer no mural.</p>
            </div>
          </div>

          {/* Aviso */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-800 leading-relaxed">
            <p className="font-semibold mb-1">⚠️ Antes de continuar, leia com atenção:</p>
            <ul className="text-xs space-y-1 text-amber-700 list-disc list-inside">
              <li>Seus dados de contato serão compartilhados com membros que demonstrarem interesse em contratar você.</li>
              <li>A Comunidade ZAR não se responsabiliza por contratações, negociações ou pagamentos firmados entre as partes.</li>
              <li>Você provavelmente trabalhará com modelos fornecidos pelo colega — não precisará criar peças do zero.</li>
              <li>Seu nome <strong>não</strong> aparecerá no mural público — apenas suas habilidades e condições.</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-[#f0eae6] rounded-2xl p-6 shadow-sm space-y-5">

            {/* Contato */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>WhatsApp com DDD *</label>
                <input name="whatsapp" type="text" required placeholder="(51) 99999-9999" className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Cidade</label>
                <input name="city" type="text" placeholder="Porto Alegre" className={fieldClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Estado</label>
              <select name="state" className={fieldClass}>
                <option value="">Selecione (opcional)</option>
                {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Experiência */}
            <div>
              <label className={labelClass}>Experiência em Revisionais Bancárias *</label>
              <div className="space-y-2">
                {[
                  { value: 'proven', label: '🏆 Sim, tenho experiência comprovada' },
                  { value: 'studied', label: '📚 Já estudei e estou pronto(a) para atuar' },
                  { value: 'beginner', label: '🌱 Estou iniciando e quero aprender na prática' },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-3 p-3 border border-[#ede8e3] rounded-xl cursor-pointer hover:bg-brand-50 transition-colors has-[:checked]:border-brand-300 has-[:checked]:bg-brand-50">
                    <input type="radio" name="experience" value={opt.value} required className="accent-brand-700" />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tipos de processos */}
            <div>
              <label className={labelClass}>Tipos de peças/processos com os quais já trabalhou *</label>
              <textarea name="processTypes" required rows={3} placeholder="Ex.: Ação revisional de financiamento, embargo de execução, defesa em busca e apreensão..." className={fieldClass} />
            </div>

            {/* Peças */}
            <div>
              <label className={labelClass}>Quais peças você aceita fazer por demanda? *</label>
              <div className="grid grid-cols-2 gap-2">
                {PIECES_OPTIONS.map((p) => (
                  <label key={p} className="flex items-center gap-2.5 p-2.5 border border-[#ede8e3] rounded-xl cursor-pointer hover:bg-brand-50 transition-colors has-[:checked]:border-brand-300 has-[:checked]:bg-brand-50">
                    <input type="checkbox" name="pieces" value={p} className="accent-brand-700" />
                    <span className="text-sm text-gray-700">{p}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Prazo */}
            <div>
              <label className={labelClass}>Prazo médio de entrega *</label>
              <select name="deliveryTime" required className={fieldClass}>
                <option value="">Selecione...</option>
                <option value="24h">24 horas</option>
                <option value="48h">48 horas</option>
                <option value="72h">72 horas</option>
                <option value="other">A combinar</option>
              </select>
            </div>

            {/* Peça teste */}
            <div>
              <label className={labelClass}>Aceita realizar uma peça teste antes da contratação? *</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2.5 flex-1 p-3 border border-[#ede8e3] rounded-xl cursor-pointer hover:bg-brand-50 has-[:checked]:border-brand-300 has-[:checked]:bg-brand-50">
                  <input type="radio" name="acceptsTestPiece" value="true" required className="accent-brand-700" />
                  <span className="text-sm text-gray-700">Sim</span>
                </label>
                <label className="flex items-center gap-2.5 flex-1 p-3 border border-[#ede8e3] rounded-xl cursor-pointer hover:bg-brand-50 has-[:checked]:border-brand-300 has-[:checked]:bg-brand-50">
                  <input type="radio" name="acceptsTestPiece" value="false" className="accent-brand-700" />
                  <span className="text-sm text-gray-700">Não</span>
                </label>
              </div>
            </div>

            {/* Valores */}
            <div>
              <label className={labelClass}>Seus valores por peça e por pacote *</label>
              <p className="text-xs text-gray-400 mb-2">Esta informação é visível apenas para a administração. Informe seu custo por peça avulsa e por pacotes (10, 20, 30 e 40 peças).</p>
              <textarea name="pricing" required rows={4}
                placeholder="Ex.: Petição Inicial: R$ 80 avulsa. Pacote 10 peças: R$ 700. Pacote 20: R$ 1.300. Pacote 40: R$ 2.400..." className={fieldClass} />
            </div>

            {/* Negociação */}
            <div>
              <label className={labelClass}>Aceita negociar valores dependendo do volume? *</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2.5 flex-1 p-3 border border-[#ede8e3] rounded-xl cursor-pointer hover:bg-brand-50 has-[:checked]:border-brand-300 has-[:checked]:bg-brand-50">
                  <input type="radio" name="acceptsNegotiation" value="true" required className="accent-brand-700" />
                  <span className="text-sm text-gray-700">Sim</span>
                </label>
                <label className="flex items-center gap-2.5 flex-1 p-3 border border-[#ede8e3] rounded-xl cursor-pointer hover:bg-brand-50 has-[:checked]:border-brand-300 has-[:checked]:bg-brand-50">
                  <input type="radio" name="acceptsNegotiation" value="false" className="accent-brand-700" />
                  <span className="text-sm text-gray-700">Não</span>
                </label>
              </div>
            </div>

            {/* Declaração */}
            <div className="bg-gray-50 rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" required className="accent-brand-700 mt-0.5 shrink-0" />
                <span className="text-xs text-gray-600 leading-relaxed">
                  Declaro que as informações fornecidas são verdadeiras e concordo com a divulgação das minhas habilidades e condições (sem nome ou contato) para os membros da Comunidade ZAR, exclusivamente para fins de contratação.
                </span>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

            <button type="submit" disabled={pending}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-900 to-brand-700 hover:from-brand-950 hover:to-brand-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-brand-200">
              {pending ? 'Enviando...' : 'Enviar cadastro para análise'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
