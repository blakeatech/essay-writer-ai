import type { Metadata } from 'next'
import './globals.css'
import { Monda } from 'next/font/google'
import { AuthProvider } from './contexts/AuthContext'

// Initialize the Monda font with the weights you need
const monda = Monda({
  subsets: ['latin'],
  weight: ['400', '700'], // Monda is available in regular (400) and bold (700)
  display: 'swap',
  variable: '--font-monda',
})

export const metadata: Metadata = {
  title: 'EssayGeniusAI',
  description: 'EssayGeniusAI is a platform that helps you write essays.',
  generator: 'EssayGeniusAI',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={monda.variable} suppressHydrationWarning>
      <body className="font-monda">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
