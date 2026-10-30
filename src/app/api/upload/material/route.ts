import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { put } from '@vercel/blob'

const ALLOWED = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'video/mp4', 'video/webm', 'video/quicktime',
])
const MAX_SIZE = 100 * 1024 * 1024 // 100 MB

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({
      error: 'Armazenamento de arquivos não configurado. Ative o Vercel Blob no painel do projeto.',
      setup: true,
    }, { status: 503 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    if (!ALLOWED.has(file.type)) return NextResponse.json({ error: 'Tipo não permitido. Use PDF, Word, Excel, PowerPoint ou vídeo.' }, { status: 400 })
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Arquivo muito grande (máximo 100 MB).' }, { status: 400 })

    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
    const filename = `materiais/${crypto.randomUUID()}-${safeName}`

    const blob = await put(filename, file, { access: 'public', contentType: file.type })
    return NextResponse.json({ url: blob.url })
  } catch (err) {
    console.error('Material upload error:', err)
    return NextResponse.json({ error: 'Erro interno ao salvar arquivo. Tente novamente.' }, { status: 500 })
  }
}
