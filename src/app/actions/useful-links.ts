'use server'

import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'admin') throw new Error('Acesso negado.')
  return session
}

export async function createUsefulLink(
  _prev: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  await requireAdmin()

  const label = (formData.get('label') as string).trim()
  const url = (formData.get('url') as string).trim()
  const emoji = (formData.get('emoji') as string | null)?.trim() || '🔗'

  if (!label || !url) return { error: 'Preencha todos os campos.' }

  await db.usefulLink.create({ data: { label, url, emoji } })
  revalidatePath('/')
  revalidatePath('/admin')
  return { success: true }
}

export async function deleteUsefulLink(id: string) {
  await requireAdmin()
  await db.usefulLink.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/admin')
}
