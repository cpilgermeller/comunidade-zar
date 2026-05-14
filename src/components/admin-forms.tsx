'use client'

import { useActionState, useState } from 'react'
import { createUser, createCategory, updateUser } from '@/app/actions/admin'
import { UserPlus, FolderPlus, Pencil, X, Infinity as InfinityIcon } from 'lucide-react'

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300'

export function CreateUserForm() {
  const [state, action, pending] = useActionState(createUser, undefined)

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <UserPlus size={16} className="text-brand-700" /> Criar Usuário
      </h2>
      <form action={action} className="space-y-3">
        <input name="name" required placeholder="Nome completo" className={inputCls} />
        <input name="email" type="email" required placeholder="E-mail" className={inputCls} />
        <input name="password" type="password" required placeholder="Senha" className={inputCls} />
        <select name="role" className={inputCls}>
          <option value="member">Membro</option>
          <option value="admin">Administrador</option>
        </select>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Membro desde</label>
            <input name="memberSince" type="date" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Prazo de acesso</label>
            <input name="accessExpiresAt" type="date" className={inputCls} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
          <input type="checkbox" name="isLifetime" className="rounded border-gray-300 text-brand-800 focus:ring-brand-300" />
          <span className="flex items-center gap-1 font-medium">
            <InfinityIcon size={13} className="text-gold-500" /> Acesso Vitalício
          </span>
        </label>

        {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
        {state?.success && <p className="text-xs text-emerald-600">Usuário criado com sucesso!</p>}
        <button type="submit" disabled={pending} className="w-full bg-brand-800 hover:bg-brand-900 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg transition-colors">
          {pending ? 'Criando...' : 'Criar Usuário'}
        </button>
      </form>
    </div>
  )
}

export function CreateCategoryForm() {
  const [state, action, pending] = useActionState(createCategory, undefined)

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <FolderPlus size={16} className="text-emerald-600" /> Criar Categoria
      </h2>
      <form action={action} className="space-y-3">
        <input name="name" required placeholder="Nome da categoria" className={inputCls} />
        <input name="description" placeholder="Descrição (opcional)" className={inputCls} />
        <div className="flex gap-2 items-center">
          <label className="text-sm text-gray-600">Cor:</label>
          <input type="color" name="color" defaultValue="#102882" className="h-9 w-20 rounded border border-gray-200 cursor-pointer" />
        </div>
        {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
        {state?.success && <p className="text-xs text-emerald-600">Categoria criada!</p>}
        <button type="submit" disabled={pending} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg transition-colors">
          {pending ? 'Criando...' : 'Criar Categoria'}
        </button>
      </form>
    </div>
  )
}

type EditableUser = {
  id: string
  name: string
  email: string
  role: string
  isLifetime: boolean
  accessExpiresAt: Date | null
  memberSince: Date | null
}

function toDateInput(d: Date | null) {
  if (!d) return ''
  return new Date(d).toISOString().split('T')[0]
}

function EditUserModal({ user, onClose }: { user: EditableUser; onClose: () => void }) {
  const [state, action, pending] = useActionState(updateUser, undefined)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Pencil size={15} className="text-brand-700" /> Editar Membro
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form action={action} className="space-y-3">
          <input type="hidden" name="userId" value={user.id} />

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Nome</label>
            <input name="name" required defaultValue={user.name} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">E-mail</label>
            <input name="email" type="email" required defaultValue={user.email} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Nova senha <span className="text-gray-400 font-normal normal-case">(deixe em branco para manter)</span></label>
            <input name="password" type="password" placeholder="••••••••" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Papel</label>
            <select name="role" defaultValue={user.role} className={inputCls}>
              <option value="member">Membro</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Membro desde</label>
              <input name="memberSince" type="date" defaultValue={toDateInput(user.memberSince)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Prazo de acesso</label>
              <input name="accessExpiresAt" type="date" defaultValue={toDateInput(user.accessExpiresAt)} className={inputCls} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
            <input type="checkbox" name="isLifetime" defaultChecked={user.isLifetime} className="rounded border-gray-300 text-brand-800 focus:ring-brand-300" />
            <span className="flex items-center gap-1 font-medium">
              <InfinityIcon size={13} className="text-gold-500" /> Acesso Vitalício
            </span>
          </label>

          {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
          {state?.success && <p className="text-xs text-emerald-600">✓ Membro atualizado com sucesso!</p>}

          <button type="submit" disabled={pending}
            className="w-full bg-brand-800 hover:bg-brand-900 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors mt-1">
            {pending ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      </div>
    </div>
  )
}

export function EditUserButton({ user }: { user: EditableUser }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-2 py-1 rounded-lg border border-brand-200 text-brand-700 hover:bg-brand-50 transition-colors"
      >
        <Pencil size={12} />
      </button>
      {open && <EditUserModal user={user} onClose={() => setOpen(false)} />}
    </>
  )
}
