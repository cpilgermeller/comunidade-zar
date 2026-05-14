import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { Navbar } from '@/components/navbar'
import { NewThreadForm } from '@/components/new-thread-form'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function NovaDiscussaoPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const categories = await db.category.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="flex h-full">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <Link href="/discussoes" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
            <ChevronLeft size={16} /> Voltar
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Nova Discussão</h1>
          <NewThreadForm categories={categories} />
        </div>
      </main>
    </div>
  )
}
