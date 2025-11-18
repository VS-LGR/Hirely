import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { ScrollGradient } from '@/components/ui/scroll-gradient'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hirely - ATS Inteligente com IA',
  description: 'Plataforma de recrutamento e seleção com inteligência artificial',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ScrollGradient />
        <AnimatedBackground />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}


