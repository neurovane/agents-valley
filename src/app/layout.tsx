import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { LoadingProvider } from '@/contexts/LoadingContext'
import { Header } from '@/components/layout/Header'
import { ErrorBoundary } from '@/components/error-boundary'
import { GlobalLoading } from '@/components/ui/global-loading'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AgentsValley - Discover Amazing AI Agents',
  description: 'Explore, upvote, and share the best AI agents built by the community. Find your next productivity boost or creative inspiration.',
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <LoadingProvider>
            <AuthProvider>
              <div className="min-h-screen bg-background">
                <Header />
                <main>{children}</main>
              </div>
              <GlobalLoading />
              <Toaster />
            </AuthProvider>
          </LoadingProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}