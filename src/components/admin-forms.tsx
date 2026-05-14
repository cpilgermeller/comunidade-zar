'use client'

import { useActionState } from 'react'
import { createUser, createCategory } from '@/app/actions/admin'
import { UserPlus, FolderPlus, Infinity } from 'lucide-react'

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
            <Infinity size={13} className="text-gold-500" /> Acesso Vitalício
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
