import { initials } from '@/lib/utils'

const GRADIENTS = [
  'from-violet-500 to-purple-600',
  'from-indigo-500 to-blue-600',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-500',
  'from-cyan-500 to-sky-600',
  'from-fuchsia-500 to-purple-600',
]

function gradientFor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
}

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sz =
    size === 'sm' ? 'w-7 h-7 text-[10px]' :
    size === 'lg' ? 'w-12 h-12 text-base' :
    size === 'xl' ? 'w-full h-full text-xl' :
    'w-9 h-9 text-xs'

  return (
    <div className={`${sz} bg-gradient-to-br ${gradientFor(name)} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm ring-2 ring-white`}>
      {initials(name)}
    </div>
  )
}
