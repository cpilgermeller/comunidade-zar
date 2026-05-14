import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { EditProfileForm } from '@/components/edit-profile-form'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default async function EditProfilePage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: { insignias: { include: { insignia: true } } },
  })
  if (!user) redirect('/login')

  return (
    <div className="flex h-full">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8 animate-fade-in">
          <Link href={`/perfil/${session.userId}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-800 mb-6 transition-colors">
            <ChevronLeft size={16} /> Meu perfil
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Editar Perfil</h1>
            <p className="text-sm text-[#94a3b8] mt-0.5">Suas informações de parceria e contato</p>
          </div>

          <EditProfileForm user={user} />
        </div>
      </main>
    </div>
  )
}
