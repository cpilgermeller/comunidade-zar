'use client'

import { login } from '@/app/actions/auth'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Zap, Mail, Lock, ArrowRight, Clock } from 'lucide-react'
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
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gold-100 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="relative w-full max-w-sm animate-fade-in">
        <div className="bg-white rounded-3xl shadow-xl shadow-[#e8d5d0]/60 border border-[#f0eae6] p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-900 to-brand-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-200">
              <Zap size={28} className="text-white fill-white" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Comunidade ZAR</h1>
            <p className="text-sm text-[#b5a9a4] mt-1">Acesse sua conta para continuar</p>
          </div>

          <Suspense fallback={null}>
            <ExpiredBanner />
          </Suspense>

          <LoginForm />

          <p className="text-center text-xs text-[#c8b8b4] mt-6">
            Não tem acesso? Entre em contato com o administrador.
          </p>
        </div>
      </div>
    </div>
  )
}
