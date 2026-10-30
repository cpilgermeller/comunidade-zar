'use server'

import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createBonusMaterial(formData: FormData) {
  const session = await getSession()
  if (!session || session.role !== 'admin') throw new Error('Não autorizado')

  const title = (formData.get('title') as string).trim()
  const description = (formData.get('description') as string).trim()
  const fileUrl = (formData.get('fileUrl') as string).trim()
  const fileType = (formData.get('fileType') as string) || 'PDF'
  const category = (formData.get('category') as string) || 'Geral'
  const thumbnailUrl = (formData.get('thumbnailUrl') as string)?.trim() || null

  if (!title || !description || !fileUrl) return

  await db.bonusMaterial.create({
    data: { title, description, fileUrl, fileType, category, thumbnailUrl, authorId: session.userId },
  })

  revalidatePath('/materiais')
  revalidatePath('/admin')
}

export async function updateBonusMaterial(formData: FormData) {
  const session = await getSession()
  if (!session || session.role !== 'admin') throw new Error('Não autorizado')

  const id = formData.get('id') as string
  const title = (formData.get('title') as string).trim()
  const description = (formData.get('description') as string).trim()
  const fileUrl = (formData.get('fileUrl') as string).trim()
  const fileType = (formData.get('fileType') as string) || 'PDF'
  const category = (formData.get('category') as string) || 'Geral'
  const thumbnailUrl = (formData.get('thumbnailUrl') as string)?.trim() || null
  const published = formData.get('published') === 'true'

  await db.bonusMaterial.update({
    where: { id },
    data: { title, description, fileUrl, fileType, category, thumbnailUrl, published },
  })

  revalidatePath('/materiais')
  revalidatePath('/admin')
}

export async function deleteBonusMaterial(id: string) {
  const session = await getSession()
  if (!session || session.role !== 'admin') throw new Error('Não autorizado')

  await db.bonusMaterial.delete({ where: { id } })
  revalidatePath('/materiais')
  revalidatePath('/admin')
}

export async function trackDownload(materialId: string) {
  const material = await db.bonusMaterial.findUnique({
    where: { id: materialId, published: true },
    select: { fileUrl: true },
  })
  if (!material) redirect('/materiais')

  await db.bonusMaterial.update({
    where: { id: materialId },
    data: { downloads: { increment: 1 } },
  }).catch(() => {})

  redirect(material.fileUrl)
}
