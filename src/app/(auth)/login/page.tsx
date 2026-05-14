'use client'

import { login } from '@/app/actions/auth'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Mail, Lock, ArrowRight, Clock } from 'lucide-react'
import { Suspense } from 'react'

function ExpiredBanner() {
  const searchParams = useSearchParams()
  if (searchParams.get('expired') !== '1') return null
  return (
    <div className="bg-orange-50 border border-orange-100 text-orange-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2 mb-4">
      <Clock size={14} className="shrink-0" />
      Seu período de acesso expirou. Entre em contato com o administrador para renovar.
    </div>
  )
}

function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">E-mail</label>
        <div className="relative">
          <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c8b8b4]" />
          <input type="email" name="email" required autoComplete="email"
            className="w-full pl-10 pr-4 py-3 text-sm border border-[#ede8e3] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 bg-[#fdf9f7] focus:bg-white transition-colors"
            placeholder="seu@email.com" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Senha</label>
        <div className="relative">
          <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c8b8b4]" />
          <input type="password" name="password" required autoComplete="current-password"
            className="w-full pl-10 pr-4 py-3 text-sm border border-[#ede8e3] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 bg-[#fdf9f7] focus:bg-white transition-colors"
            placeholder="••••••••" />
        </div>
      </div>

      {state?.error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
          {state.error}
        </div>
      )}

      <button type="submit" disabled={pending}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-900 to-brand-700 hover:from-brand-950 hover:to-brand-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-brand-200 hover:shadow-brand-300 hover:-translate-y-px active:translate-y-0 mt-2">
        {pending ? 'Entrando...' : <> Entrar <ArrowRight size={15} /> </>}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#faf7f4] flex items-center justify-center p-4">

      {/* Fundo decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-brand-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gold-100 rounded-full blur-3xl opacity-35" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-brand-50 rounded-full blur-3xl opacity-60" />

        {/* Estrelas decorativas flutuando */}
        <span className="absolute top-[12%] left-[18%] text-2xl opacity-20 animate-pulse">✦</span>
        <span className="absolute top-[20%] right-[22%] text-lg opacity-15 animate-pulse" style={{ animationDelay: '0.8s' }}>✨</span>
        <span className="absolute top-[65%] left-[12%] text-xl opacity-15 animate-pulse" style={{ animationDelay: '1.4s' }}>✦</span>
        <span className="absolute top-[75%] right-[16%] text-2xl opacity-20 animate-pulse" style={{ animationDelay: '0.4s' }}>✨</span>
        <span className="absolute top-[40%] right-[8%] text-sm opacity-10 animate-pulse" style={{ animationDelay: '2s' }}>✦</span>
        <span className="absolute bottom-[20%] left-[30%] text-sm opacity-10 animate-pulse" style={{ animationDelay: '1.2s' }}>✨</span>
      </div>

      <div className="relative w-full max-w-sm animate-fade-in">
        <div className="bg-white rounded-3xl shadow-xl shadow-[#e8d5d0]/60 border border-[#f0eae6] p-8">

          {/* Header */}
          <div className="text-center mb-8">
            {/* Ícone estrela de 4 pontas */}
            <div className="relative inline-flex mb-5">
              <div className="w-20 h-20 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-200/60">
                <span className="text-5xl leading-none select-none text-white">✦</span>
              </div>
            </div>

            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Comunidade ZAR</h1>
            <p className="text-sm text-brand-700/70 font-medium mt-1">Sua transformação está aqui.</p>

            {/* Frase motivacional */}
            <div className="mt-4 px-4 py-3 bg-gradient-to-r from-brand-50 to-gold-50 rounded-2xl border border-brand-100/60">
              <p className="text-xs text-gray-500 leading-relaxed italic">
                "Cada acesso te leva a um passo mais próximo da sua melhor versão."
              </p>
            </div>
          </div>

          <Suspense fallback={null}>
            <ExpiredBanner />
          </Suspense>

          <LoginForm />

          <p className="text-center text-xs text-[#c8b8b4] mt-6">
            Não tem acesso? Entre em contato com o administrador.
          </p>
        </div>

        {/* Tagline abaixo do card */}
        <p className="text-center text-xs text-[#c8b8b4] mt-5 tracking-wide">
          ✦ &nbsp;Transformação, estratégia e resultados&nbsp; ✦
        </p>
      </div>
    </div>
  )
}
