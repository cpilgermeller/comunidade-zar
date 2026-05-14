import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { put } from '@vercel/blob'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'Tipo não permitido (use JPG, PNG, GIF ou WebP)' }, { status: 400 })
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Arquivo muito grande (máx 5MB)' }, { status: 400 })

    const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase()
    const filename = `uploads/${crypto.randomUUID()}.${ext}`

    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
    })

    return NextResponse.json({ url: blob.url })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Erro interno ao salvar arquivo.' }, { status: 500 })
  }
}
