export const RANKS = [
  {
    id: 'aprendiz',
    name: 'Aprendiz',
    emoji: '🪶',
    months: 0,
    label: '0 – 6 meses',
    essence: 'Cada caso que você estuda hoje é uma vitória que alguém vai conquistar amanhã.',
    color: '#6366f1',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
  },
  {
    id: 'guardiao',
    name: 'Guardião',
    emoji: '🦅',
    months: 6,
    label: '6 meses – 1 ano',
    essence: 'Você já encontrou seu espaço na luta. Agora é hora de defendê-lo com estratégia.',
    color: '#0ea5e9',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-700',
  },
  {
    id: 'estrategista',
    name: 'Estrategista',
    emoji: '⚡',
    months: 12,
    label: '1 – 2 anos',
    essence: 'Você não reage mais — você antecipa. O banco já não te surpreende.',
    color: '#f59e0b',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
  },
  {
    id: 'mago',
    name: 'Mago',
    emoji: '🔮',
    months: 24,
    label: '2 – 3 anos',
    essence: 'Você transforma complexidade em resultado. O que outros não enxergam, você resolve.',
    color: '#8b5cf6',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-700',
  },
  {
    id: 'governante',
    name: 'Governante',
    emoji: '👑',
    months: 36,
    label: '3+ anos',
    essence: 'Você é referência. Sua presença no processo já muda o jogo antes de começar.',
    color: '#d97706',
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    text: 'text-yellow-800',
  },
]

export type Rank = (typeof RANKS)[number]

export function getRank(memberSince: Date | null | undefined): Rank {
  if (!memberSince) return RANKS[0]
  const months = (Date.now() - new Date(memberSince).getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  const rank = [...RANKS].reverse().find((r) => months >= r.months)
  return rank ?? RANKS[0]
}
