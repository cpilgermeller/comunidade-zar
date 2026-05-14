'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { Lock, ArrowRight, CheckCircle } from 'lucide-react'

function DefinirSenhaForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!token) setError('Link inválido. Solicite acesso ao administrador.')
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) return setError('A senha deve ter pelo menos 8 caracteres.')
    if (password !== confirm) return setError('As senhas não coincidem.')

    setLoading(true)
    const res = await fetch('/api/auth/definir-senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) return setError(data.error ?? 'Erro ao definir senha.')
    setDone(true)
    setTimeout(() => router.push('/login'), 3000)
  }

  return (
    <div className="min-h-screen bg-[#faf7f4] flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gold-100 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative w-full max-w-sm animate-fade-in">
        <div className="bg-white rounded-3xl shadow-xl shadow-[#e8d5d0]/60 border border-[#f0eae6] p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-900 to-brand-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-200">
              {done
                ? <CheckCircle size={28} className="text-white" />
                : <span className="text-3xl text-white">✦</span>}
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Comunidade ZAR</h1>
            <p className="text-sm text-brand-700/70 font-medium mt-1">
              {done ? 'Senha definida com sucesso!' : 'Crie sua senha de acesso'}
            </p>
          </div>

          {done ? (
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">Você será redirecionado para o login em instantes...</p>
              <button onClick={() => router.push('/login')}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-900 to-brand-700 text-white font-bold py-3 rounded-xl transition-all">
                Ir para o login <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Nova senha</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c8b8b4]" />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full pl-10 pr-4 py-3 text-sm border border-[#ede8e3] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 bg-[#fdf9f7] focus:bg-white transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Confirmar senha</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c8b8b4]" />
                  <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full pl-10 pr-4 py-3 text-sm border border-[#ede8e3] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 bg-[#fdf9f7] focus:bg-white transition-colors" />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || !token}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-900 to-brand-700 hover:from-brand-950 hover:to-brand-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-brand-200 mt-2">
                {loading ? 'Salvando...' : <> Definir senha <ArrowRight size={15} /> </>}
              </button>
            </form>
          )}
        </div>
        <p className="text-center text-xs text-[#c8b8b4] mt-5 tracking-wide">
          ✦ &nbsp;Transformação, estratégia e resultados&nbsp; ✦
        </p>
      </div>
    </div>
  )
}

export default function DefinirSenhaPage() {
  return (
    <Suspense fallback={null}>
      <DefinirSenhaForm />
    </Suspense>
  )
}
