'use server'

import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
export { PIECES_OPTIONS, EXPERIENCE_LABELS, DELIVERY_LABELS } from '@/lib/mural-constants'

export async function createOpportunityProfile(formData: FormData) {
  const session = await getSession()
  if (!session) throw new Error('Não autorizado')

  const existing = await db.opportunityProfile.findUnique({ where: { userId: session.userId } })
  if (existing) return { error: 'Você já possui um cadastro no mural.' }

  const whatsapp = (formData.get('whatsapp') as string).trim()
  const city = (formData.get('city') as string | null)?.trim() || null
  const state = (formData.get('state') as string | null)?.trim() || null
  const experience = formData.get('experience') as string
  const processTypes = (formData.get('processTypes') as string).trim()
  const pieces = formData.getAll('pieces') as string[]
  const deliveryTime = formData.get('deliveryTime') as string
  const acceptsTestPiece = formData.get('acceptsTestPiece') === 'true'
  const pricing = (formData.get('pricing') as string).trim()
  const acceptsNegotiation = formData.get('acceptsNegotiation') === 'true'

  if (!whatsapp || !experience || !processTypes || pieces.length === 0 || !deliveryTime || !pricing) {
    return { error: 'Preencha todos os campos obrigatórios.' }
  }

  await db.opportunityProfile.create({
    data: {
      userId: session.userId,
      whatsapp,
      city,
      state,
      experience,
      processTypes,
      pieces: pieces.join(','),
      deliveryTime,
      acceptsTestPiece,
      pricing,
      acceptsNegotiation,
      status: 'pending',
    },
  })

  redirect('/mural?cadastrado=1')
}

export async function expressInterest(profileId: string, fromWhatsapp: string, message?: string) {
  const session = await getSession()
  if (!session) throw new Error('Não autorizado')

  const profile = await db.opportunityProfile.findUnique({
    where: { id: profileId, status: 'approved' },
    include: { user: { select: { id: true, name: true } } },
  })
  if (!profile) return { error: 'Perfil não encontrado.' }
  if (profile.userId === session.userId) return { error: 'Você não pode demonstrar interesse no seu próprio perfil.' }

  // Verifica se já demonstrou interesse
  const existing = await db.opportunityInterest.findFirst({
    where: { profileId, fromUserId: session.userId },
  })
  if (existing) return { error: 'Você já demonstrou interesse neste perfil.' }

  await db.opportunityInterest.create({
    data: { profileId, fromUserId: session.userId, fromWhatsapp, message: message || null },
  })

  // Notifica o correspondente
  try {
    const senderName = session.name.split(' ')[0]
    await db.notification.create({
      data: {
        userId: profile.userId,
        actorId: session.userId,
        type: 'opportunity_interest',
        title: `${senderName} quer te contratar! WhatsApp: ${fromWhatsapp}${message ? ` — "${message.slice(0, 60)}"` : ''}`,
        link: '/mural',
      },
    })
  } catch (err) {
    console.error('Erro ao criar notificação de interesse:', err)
  }

  return { ok: true }
}

export async function approveOpportunityProfile(profileId: string) {
  const session = await getSession()
  if (!session || session.role !== 'admin') throw new Error('Não autorizado')
  await db.opportunityProfile.update({ where: { id: profileId }, data: { status: 'approved' } })
  revalidatePath('/admin')
  revalidatePath('/mural')
}

export async function rejectOpportunityProfile(profileId: string, note?: string) {
  const session = await getSession()
  if (!session || session.role !== 'admin') throw new Error('Não autorizado')
  await db.opportunityProfile.update({
    where: { id: profileId },
    data: { status: 'rejected', adminNote: note || null },
  })
  revalidatePath('/admin')
}

export async function deleteOpportunityProfile(profileId: string) {
  const session = await getSession()
  if (!session || session.role !== 'admin') throw new Error('Não autorizado')
  await db.opportunityProfile.delete({ where: { id: profileId } })
  revalidatePath('/admin')
  revalidatePath('/mural')
}
