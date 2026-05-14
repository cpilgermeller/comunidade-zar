'use server'

import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createJurisprudence(_prev: { error?: string } | undefined, formData: FormData) {
  const session = await getSession()
  if (!session) return { error: 'Não autorizado' }

  const title = formData.get('title') as string
  const tribunal = formData.get('tribunal') as string
  const subject = formData.get('subject') as string
  const body = formData.get('body') as string
  const sourceLink = formData.get('sourceLink') as string
  const decisionDateRaw = formData.get('decisionDate') as string

  if (!title?.trim() || !tribunal?.trim() || !subject?.trim() || !body?.trim()) {
    return { error: 'Preencha todos os campos obrigatórios.' }
  }

  await db.jurisprudence.create({
    data: {
      title: title.trim(),
      tribunal: tribunal.trim(),
      subject: subject.trim(),
      body,
      sourceLink: sourceLink?.trim() || null,
      decisionDate: decisionDateRaw ? new Date(decisionDateRaw) : null,
      authorId: session.userId,
    },
  })

  revalidatePath('/jurisprudencias')
  redirect('/jurisprudencias')
}

export async function deleteJurisprudence(id: string) {
  const session = await getSession()
  if (!session || session.role !== 'admin') return

  await db.jurisprudence.delete({ where: { id } })
  revalidatePath('/jurisprudencias')
}
