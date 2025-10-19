import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/providers/QueryProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import { LoadingProvider } from '@/contexts/LoadingContext'
import { Header } from '@/components/layout/Header'
import { ErrorBoundary } from '@/components/error-boundary'
import { GlobalLoading } from '@/components/ui/global-loading'
import { Toaster } from '@/components/ui/sonner'
import { SkipNav } from '@/components/ui/skip-nav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AgentsValley - The Ultimate AI Agents Platform',
  description: 'The world\'s leading platform for discovering, sharing, and building AI agents. Join thousands of developers creating the future of artificial intelligence.',
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SkipNav />
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <LoadingProvider>
                <AuthProvider>
                  <div className="min-h-screen bg-background">
                    <Header />
                    <main id="main-content" tabIndex={-1}>{children}</main>
                  </div>
                  <GlobalLoading />
                  <Toaster />
                </AuthProvider>
              </LoadingProvider>
            </QueryProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}