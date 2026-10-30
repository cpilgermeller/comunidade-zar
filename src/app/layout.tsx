import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' })

export const metadata: Metadata = {
  title: 'Comunidade ZAR',
  description: 'Espaço de discussão e dúvidas da Comunidade ZAR',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${manrope.variable} font-sans h-full bg-[#f4f6fb] antialiased`}>{children}</body>
    </html>
  )
}
