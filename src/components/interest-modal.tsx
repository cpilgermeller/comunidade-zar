'use client'

import { useState } from 'react'
import { expressInterest } from '@/app/actions/mural'
import { MessageCircle, X, Send } from 'lucide-react'

export function InterestButton({ profileId, userPhone }: { profileId: string; userPhone?: string | null }) {
  const [open, setOpen] = useState(false)
  const [whatsapp, setWhatsapp] = useState(userPhone ?? '')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!whatsapp.trim()) return setError('Informe seu WhatsApp.')
    setLoading(true)
    setError('')
    const result = await expressInterest(profileId, whatsapp.trim(), message.trim() || undefined)
    setLoading(false)
    if (result?.error) return setError(result.error)
    setDone(true)
  }

  if (done) {
    return (
      <div className="w-full text-center bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-2.5 rounded-xl">
        ✓ Interesse enviado! O correspondente entrará em contato.
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-900 to-brand-700 hover:from-brand-950 hover:to-brand-800 text-white text-sm font-bold py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md"
      >
        <MessageCircle size={15} /> Tenho interesse
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Demonstrar interesse</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Seu WhatsApp será enviado ao correspondente para que ele entre em contato com você.
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors ml-4">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  Seu WhatsApp com DDD *
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="(51) 99999-9999"
                  className="w-full px-3 py-2.5 text-sm border border-[#ede8e3] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 bg-[#fdf9f7] focus:bg-white transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  Mensagem (opcional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ex: Preciso de petição inicial para revisional de financiamento, prazo 48h..."
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm border border-[#ede8e3] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 bg-[#fdf9f7] focus:bg-white transition-colors resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 text-sm text-gray-500 hover:text-gray-700 py-2.5 rounded-xl border border-gray-200 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-brand-900 to-brand-700 text-white text-sm font-bold py-2.5 rounded-xl disabled:opacity-60 transition-all">
                  <Send size={14} /> {loading ? 'Enviando...' : 'Enviar interesse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
