'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { useRef, useCallback } from 'react'
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  List, ListOrdered, Quote, Code, Minus,
  AlignLeft, AlignCenter, AlignRight,
  Link2, Image as ImageIcon, Heading1, Heading2, Heading3,
  Undo, Redo,
} from 'lucide-react'

type Props = {
  content?: string
  onChange: (html: string) => void
  placeholder?: string
}

function ToolbarButton({
  onClick, active, title, children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
      className={`p-1.5 rounded transition-colors ${active ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-100'}`}
    >
      {children}
    </button>
  )
}

export function RichTextEditor({ content, onChange, placeholder }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ HTMLAttributes: { class: 'max-w-full rounded-lg my-2' } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-brand-700 underline cursor-pointer' } }),
      Placeholder.configure({ placeholder: placeholder ?? 'Escreva o conteúdo aqui...' }),
    ],
    content: content ?? '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4' },
    },
  })

  const addLink = useCallback(() => {
    if (!editor) return
    const url = window.prompt('URL do link:')
    if (!url) return
    editor.chain().focus().setLink({ href: url }).run()
  }, [editor])

  const handleImageUpload = useCallback(async (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.url && editor) {
      editor.chain().focus().setImage({ src: data.url }).run()
    }
  }, [editor])

  if (!editor) return null

  const iconSize = 15

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-300">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-gray-100 bg-gray-50">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Desfazer"><Undo size={iconSize} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Refazer"><Redo size={iconSize} /></ToolbarButton>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Título 1"><Heading1 size={iconSize} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Título 2"><Heading2 size={iconSize} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Título 3"><Heading3 size={iconSize} /></ToolbarButton>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Negrito"><Bold size={iconSize} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Itálico"><Italic size={iconSize} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Sublinhado"><UnderlineIcon size={iconSize} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Tachado"><Strikethrough size={iconSize} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Código inline"><Code size={iconSize} /></ToolbarButton>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Alinhar esquerda"><AlignLeft size={iconSize} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Centralizar"><AlignCenter size={iconSize} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Alinhar direita"><AlignRight size={iconSize} /></ToolbarButton>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Lista com marcadores"><List size={iconSize} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista numerada"><ListOrdered size={iconSize} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Citação"><Quote size={iconSize} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Linha horizontal"><Minus size={iconSize} /></ToolbarButton>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <ToolbarButton onClick={addLink} active={editor.isActive('link')} title="Inserir link"><Link2 size={iconSize} /></ToolbarButton>
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          title="Inserir imagem"
        >
          <ImageIcon size={iconSize} />
        </ToolbarButton>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImageUpload(file)
            e.target.value = ''
          }}
        />
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}

export function RichTextDisplay({ html }: { html: string }) {
  return (
    <div
      className="prose prose-sm max-w-none prose-headings:font-semibold prose-a:text-brand-700 prose-img:rounded-lg prose-blockquote:border-brand-300 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
