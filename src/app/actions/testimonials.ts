'use server'

import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createTestimonial(
  _prev: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession()
  if (!session) return { error: 'Não autenticado.' }

  const body = (formData.get('body') as string).trim()
  const imageUrl = (formData.get('imageUrl') as string | null)?.trim() || null

  // Strip HTML tags to check min length
  const textOnly = body.replace(/<[^>]+>/g, '').trim()
  if (!textOnly || textOnly.length < 300) return { error: `Depoimento muito curto (${textOnly.length}/300 caracteres mínimos). Conte sua história com mais detalhes — isso inspira toda a comunidade!` }
  if (textOnly.length > 5000) return { error: 'Depoimento muito longo. Máximo 5000 caracteres.' }

  const existing = await db.testimonial.findFirst({ where: { authorId: session.userId } })
  if (existing) {
    await db.testimonial.update({ where: { id: existing.id }, data: { body, imageUrl } })
  } else {
    await db.testimonial.create({ data: { body, imageUrl, authorId: session.userId } })
  }

  revalidatePath('/depoimentos')
  return { success: true }
}

export async function deleteTestimonial(id: string) {
  const session = await getSession()
  if (!session) return

  const t = await db.testimonial.findUnique({ where: { id } })
  if (!t) return
  if (t.authorId !== session.userId && session.role !== 'admin') return

  await db.testimonial.delete({ where: { id } })
  revalidatePath('/depoimentos')
}
