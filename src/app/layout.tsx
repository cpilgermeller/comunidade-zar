import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', style: ['italic'] })

export const metadata: Metadata = {
  title: 'Comunidade ZAR',
  description: 'Espaço de discussão e dúvidas da Comunidade ZAR',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${inter.variable} ${playfair.variable} font-sans h-full bg-white antialiased`}>{children}</body>
    </html>
  )
}
