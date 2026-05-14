'use server'

import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createFundamento(_prev: { error?: string } | undefined, formData: FormData) {
  const session = await getSession()
  if (!session) return { error: 'Não autorizado' }

  const title = formData.get('title') as string
  const allegationType = formData.get('allegationType') as string
  const body = formData.get('body') as string

  if (!title?.trim() || !allegationType?.trim() || !body?.trim()) {
    return { error: 'Preencha todos os campos obrigatórios.' }
  }

  const isOfficial = session.role === 'admin'

  await db.fundamento.create({
    data: {
      title: title.trim(),
      allegationType: allegationType.trim(),
      body,
      isOfficial,
      authorId: session.userId,
    },
  })

  revalidatePath('/fundamentos')
  redirect('/fundamentos')
}

export async function deleteFundamento(id: string) {
  const session = await getSession()
  if (!session || session.role !== 'admin') return

  await db.fundamento.delete({ where: { id } })
  revalidatePath('/fundamentos')
}

export async function toggleFundamentoLike(fundamentoId: string) {
  const session = await getSession()
  if (!session) return

  const existing = await db.fundamentoLike.findUnique({
    where: { userId_fundamentoId: { userId: session.userId, fundamentoId } },
  })

  if (existing) {
    await db.fundamentoLike.delete({ where: { id: existing.id } })
  } else {
    await db.fundamentoLike.create({ data: { userId: session.userId, fundamentoId } })
  }

  revalidatePath('/fundamentos')
}
