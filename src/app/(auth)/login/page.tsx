'use client'

import { login } from '@/app/actions/auth'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Mail, Lock, ArrowRight, Clock } from 'lucide-react'
import { Suspense } from 'react'

const WHATSAPP_URL = 'https://wa.me/55996094922?text=Ol%C3%A1%2C%20meu%20acesso%20%C3%A0%20Comunidade%20ZAR%20expirou%20e%20preciso%20de%20ajuda%20para%20renovar.'

function ExpiredBanner() {
  const searchParams = useSearchParams()
  if (searchParams.get('expired') !== '1') return null
  return (
    <div className="bg-orange-50 border border-orange-200 text-orange-800 text-sm px-4 py-4 rounded-2xl mb-4 space-y-2">
      <div className="flex items-center gap-2 font-semibold">
        <Clock size={14} className="shrink-0" />
        Seu acesso expirou
      </div>
      <p className="text-orange-700 text-xs leading-relaxed">
        Seu período de acesso à Comunidade ZAR chegou ao fim. Para renovar e continuar sua jornada de transformação, entre em contato com o suporte.
      </p>
      <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors mt-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
        Falar com o suporte no WhatsApp
      </a>
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
                Cada acesso te leva a um passo mais próximo da sua melhor versão.
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
