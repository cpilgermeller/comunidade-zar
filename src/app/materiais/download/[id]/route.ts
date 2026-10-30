import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const material = await db.bonusMaterial.findUnique({
    where: { id, published: true },
    select: { fileUrl: true },
  })
  if (!material) redirect('/materiais')

  await db.bonusMaterial.update({
    where: { id },
    data: { downloads: { increment: 1 } },
  }).catch(() => {})

  redirect(material.fileUrl)
}
