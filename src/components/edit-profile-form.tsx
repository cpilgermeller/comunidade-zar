'use client'

import { useActionState, useRef, useState } from 'react'
import { updateProfile } from '@/app/actions/profile'
import { Avatar } from './avatar'
import { Upload, Clock, Infinity, Shield } from 'lucide-react'

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

type UserData = {
  name: string
  avatar: string | null
  bio: string | null
  instagram: string | null
  contactEmail: string | null
  phone: string | null
  state: string | null
  areas: string | null
  accessExpiresAt: Date | null
  memberSince: Date | null
  isLifetime: boolean
  insignias: { insignia: { name: string; emoji: string; color: string } }[]
}

const inputCls = 'w-full border border-[#dce8ff] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-[#f7faff] focus:bg-white transition-colors'
const labelCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'

export function EditProfileForm({ user }: { user: UserData }) {
  const [result, action, pending] = useActionState(updateProfile, undefined)
  const [avatar, setAvatar] = useState(user.avatar ?? '')
  const [uploading, setUploading] = useState(false)
  const [selectedStates, setSelectedStates] = useState<string[]>(
    user.state ? user.state.split(',').map((s) => s.trim()).filter(Boolean) : []
  )
  const [nationwide, setNationwide] = useState(user.state === 'BR')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.url) setAvatar(data.url)
    setUploading(false)
  }

  function toggleState(uf: string) {
    setSelectedStates((prev) =>
      prev.includes(uf) ? prev.filter((s) => s !== uf) : [...prev, uf]
    )
  }

  const stateValue = nationwide ? 'BR' : selectedStates.join(',')

  const now = new Date()
  const expired = user.accessExpiresAt && user.accessExpiresAt < now

  return (
    <div className="space-y-6">
      {/* ── Acesso (read-only) ── */}
      <div className="bg-brand-50 border border-brand-200 rounded-2xl p-5">
        <h2 className="text-sm font-bold text-brand-900 mb-3 flex items-center gap-2">
          <Shield size={14} /> Meu acesso
        </h2>
        <div className="flex flex-wrap gap-3">
          {user.isLifetime && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-gold-700 bg-gold-100 border border-gold-300 px-3 py-1.5 rounded-full">
              <Infinity size={12} /> Acesso Vitalício
            </span>
          )}
          {user.memberSince && (
            <span className="text-xs text-brand-700 bg-white border border-brand-200 px-3 py-1.5 rounded-full">
              Membro desde {new Date(user.memberSince).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </span>
          )}
          {!user.isLifetime && user.accessExpiresAt && (
            <span className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border ${expired ? 'text-red-600 bg-red-50 border-red-200' : 'text-gray-600 bg-white border-gray-200'}`}>
              <Clock size={11} />
              {expired ? 'Acesso expirado em ' : 'Acesso até '}
              {new Date(user.accessExpiresAt).toLocaleDateString('pt-BR')}
            </span>
          )}
          {!user.isLifetime && !user.accessExpiresAt && (
            <span className="text-xs text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-full">
              Sem prazo definido
            </span>
          )}
          {user.insignias.length > 0 && (
            <div className="flex gap-1 items-center">
              {user.insignias.map(({ insignia }) => (
                <span key={insignia.name} title={insignia.name} className="text-lg">{insignia.emoji}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Formulário de edição ── */}
      <form action={action} className="space-y-5 bg-white border border-[#dce8ff] rounded-2xl p-6 shadow-sm">
        {/* Avatar */}
        <div>
          <label className={labelCls}>Foto de perfil</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#dce8ff] shadow-sm">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <Avatar name={user.name} size="xl" />
              )}
            </div>
            <div>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 text-xs font-semibold text-brand-800 border border-brand-200 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors">
                <Upload size={12} /> {uploading ? 'Enviando...' : 'Alterar foto'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>
          </div>
          <input type="hidden" name="avatar" value={avatar} />
        </div>

        {/* Bio */}
        <div>
          <label className={labelCls}>Sobre você</label>
          <textarea name="bio" rows={3} defaultValue={user.bio ?? ''} placeholder="Conte sobre sua trajetória, especialidades..."
            className={inputCls + ' resize-none'} />
        </div>

        {/* Estados de atuação */}
        <div>
          <label className={labelCls}>Estados de atuação</label>

          <label className="flex items-center gap-2 mb-3 cursor-pointer select-none">
            <input type="checkbox" checked={nationwide} onChange={(e) => { setNationwide(e.target.checked); setSelectedStates([]) }}
              className="rounded border-gray-300 text-brand-800 focus:ring-brand-300" />
            <span className="text-sm font-semibold text-brand-800">🇧🇷 Brasil inteiro</span>
          </label>

          {!nationwide && (
            <div className="flex flex-wrap gap-1.5">
              {UFS.map((uf) => (
                <button key={uf} type="button" onClick={() => toggleState(uf)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all ${
                    selectedStates.includes(uf)
                      ? 'bg-brand-800 text-white border-brand-800 shadow-sm'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-brand-300 hover:text-brand-700'
                  }`}>
                  {uf}
                </button>
              ))}
            </div>
          )}
          <input type="hidden" name="state" value={stateValue} />
          {selectedStates.length > 0 && !nationwide && (
            <p className="text-[11px] text-brand-700 mt-1.5 font-medium">{selectedStates.length} estado{selectedStates.length > 1 ? 's' : ''} selecionado{selectedStates.length > 1 ? 's' : ''}</p>
          )}
        </div>

        {/* Áreas */}
        <div>
          <label className={labelCls}>Áreas de atuação</label>
          <input name="areas" defaultValue={user.areas ?? ''} placeholder="Ex: Direito do Consumidor, Previdenciário, Trabalhista"
            className={inputCls} />
          <p className="text-[11px] text-[#94a3b8] mt-1">Separe por vírgulas. Aparecem como tags no seu perfil.</p>
        </div>

        {/* Instagram */}
        <div>
          <label className={labelCls}>Instagram</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#94a3b8]">@</span>
            <input name="instagram" defaultValue={user.instagram?.replace('@', '') ?? ''} placeholder="seuperfil"
              className={inputCls + ' pl-7'} />
          </div>
        </div>

        {/* E-mail parceria */}
        <div>
          <label className={labelCls}>E-mail para parcerias</label>
          <input name="contactEmail" type="email" defaultValue={user.contactEmail ?? ''} placeholder="contato@escritorio.com"
            className={inputCls} />
        </div>

        {/* WhatsApp */}
        <div>
          <label className={labelCls}>WhatsApp / Telefone</label>
          <input name="phone" defaultValue={user.phone ?? ''} placeholder="(11) 99999-9999"
            className={inputCls} />
        </div>

        {result?.error && <p className="text-sm text-red-500">{result.error}</p>}
        {result?.success && <p className="text-sm text-emerald-600 font-medium">✓ Perfil atualizado com sucesso!</p>}

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={pending}
            className="bg-gradient-to-r from-brand-900 to-brand-700 hover:from-brand-950 hover:to-brand-800 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm shadow-brand-200">
            {pending ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </div>
  )
}
