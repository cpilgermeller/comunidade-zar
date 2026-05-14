'use client'

import { useActionState, useRef, useState } from 'react'
import { createTestimonial } from '@/app/actions/testimonials'
import { RichTextEditor } from './rich-text-editor'
import { ImageIcon, X, Upload } from 'lucide-react'

export default function TestimonialForm({
  existing,
  existingImage,
}: {
  existing: string | null
  existingImage?: string | null
}) {
  const [body, setBody] = useState(existing ?? '')
  const [imageUrl, setImageUrl] = useState(existingImage ?? '')
  const [uploading, setUploading] = useState(false)
  const [state, action, pending] = useActionState(createTestimonial, undefined)
  const formRef = useRef<HTMLFormElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) setImageUrl(data.url)
      else alert(data.error ?? 'Erro ao enviar imagem')
    } catch {
      alert('Erro ao enviar imagem')
    }
    setUploading(false)
    e.target.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData(formRef.current!)
    fd.set('body', body)
    fd.set('imageUrl', imageUrl)
    await createTestimonial(undefined, fd)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {/* Rich text editor */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Seu depoimento</p>
        <RichTextEditor
          content={existing ?? ''}
          onChange={setBody}
          placeholder="Como a Comunidade ZAR transformou sua advocacia? Conte sua história com detalhes — seus resultados, o que aprendeu, como cresceu..."
        />
      </div>

      {/* Foto do resultado */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Foto do resultado <span className="text-[#94a3b8] font-normal normal-case">(opcional — screenshot, celebração, etc.)</span>
        </p>
        {imageUrl ? (
          <div className="relative inline-block">
            <img src={imageUrl} alt="Foto do resultado" className="max-h-48 rounded-xl border border-[#dce8ff] object-cover shadow-sm" />
            <button type="button" onClick={() => setImageUrl('')}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm">
              <X size={12} />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-[#dce8ff] rounded-xl text-sm text-[#94a3b8] hover:border-brand-300 hover:text-brand-700 transition-colors">
            <Upload size={15} />
            {uploading ? 'Enviando...' : 'Adicionar foto do resultado'}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
        <input type="hidden" name="imageUrl" value={imageUrl} />
        <input type="hidden" name="body" value={body} />
      </div>

      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-600 font-medium">✓ Depoimento salvo com sucesso!</p>}

      <div className="flex justify-end">
        <button type="submit" disabled={pending}
          className="bg-gradient-to-r from-brand-900 to-brand-700 hover:from-brand-950 hover:to-brand-800 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm shadow-brand-200">
          {pending ? 'Salvando...' : existing ? 'Atualizar depoimento' : 'Publicar depoimento'}
        </button>
      </div>
    </form>
  )
}
