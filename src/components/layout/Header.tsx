'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useLoading } from '@/contexts/LoadingContext'
import { AuthDialog } from '@/components/auth/AuthDialog'
import { UserMenu } from '@/components/auth/UserMenu'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Plus, Bot, Server, Home, Search, Menu, X, Trophy, CalendarDays, RefreshCw } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { clearSupabaseCache } from '@/hooks/useSupabaseData'

export function Header() {
  const { user } = useAuth()
  const { forceReset } = useLoading()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const handleEmergencyReset = () => {
    // Clear all caches and reset loading states
    clearSupabaseCache()
    forceReset()
    // Reload the page to ensure clean state
    window.location.reload()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
              <div className="flex items-center space-x-2">
                {/* Logo Image */}
                <div className="w-10 h-10 flex items-center justify-center">
                  <img 
                    src="/logos/agentsvalley.png" 
                    alt="AgentsValley Logo" 
                    className="h-10 w-auto object-contain drop-shadow-sm"
                    onError={(e) => {
                      // Fallback to gradient logo if image fails to load
                      e.currentTarget.style.display = 'none'
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement
                      if (fallback) {
                        fallback.style.display = 'flex'
                      }
                    }}
                  />
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg" style={{display: 'none'}}>
                    <span className="text-white font-bold text-base">AV</span>
                  </div>
                </div>
                {/* Logo Text */}
                <span className="font-bold text-2xl bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent drop-shadow-sm hidden sm:block">
                  AgentsValley
                </span>
                <span className="font-bold text-xl bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent drop-shadow-sm sm:hidden">
                  AV
                </span>
              </div>
            </Link>
          </div>
          
                  {/* Desktop Navigation */}
                  <nav className="hidden lg:flex items-center space-x-1">
                    <Button
                      asChild
                      variant={isActive('/') ? "default" : "ghost"}
                      size="sm"
                      className="h-9 px-4"
                    >
                      <Link href="/" className="flex items-center">
                        <Home className="mr-2 h-4 w-4" />
                        Home
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant={isActive('/agents') ? "default" : "ghost"}
                      size="sm"
                      className="h-9 px-4"
                    >
                      <Link href="/agents" className="flex items-center">
                        <Bot className="mr-2 h-4 w-4" />
                        AI Agents
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant={isActive('/mcp-servers') ? "default" : "ghost"}
                      size="sm"
                      className="h-9 px-4"
                    >
                      <Link href="/mcp-servers" className="flex items-center">
                        <Server className="mr-2 h-4 w-4" />
                        MCP Servers
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant={isActive('/leaderboard') ? "default" : "ghost"}
                      size="sm"
                      className="h-9 px-4"
                    >
                      <Link href="/leaderboard" className="flex items-center">
                        <Trophy className="mr-2 h-4 w-4" />
                        Leaderboard
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant={isActive('/events') ? "default" : "ghost"}
                      size="sm"
                      className="h-9 px-4"
                    >
                      <Link href="/events" className="flex items-center">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Events
                      </Link>
                    </Button>
                  </nav>
          
          {/* Right side - Desktop */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Search */}
            <Button asChild variant="ghost" size="sm" className="h-9 w-9 p-0">
              <Link href="/search" className="flex items-center justify-center">
                <Search className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={handleEmergencyReset}
              title="Emergency Reset"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Auth */}
            {user ? (
              <>
                <Button asChild variant="default" size="sm" className="h-9">
                  <Link href="/publish" className="flex items-center">
                    <Plus className="mr-2 h-4 w-4" />
                    Publish
                  </Link>
                </Button>
                <UserMenu />
              </>
            ) : (
              <AuthDialog />
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center space-x-2">
            <ThemeToggle />
            {user && (
              <Button asChild variant="default" size="sm" className="h-9">
                <Link href="/publish" className="flex items-center">
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-background/95 backdrop-blur">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile nav items */}
              <Button 
                asChild 
                variant={isActive('/') ? "default" : "ghost"} 
                size="sm"
                className="w-full justify-start h-10"
                onClick={closeMobileMenu}
              >
                <Link href="/" className="flex items-center">
                  <Home className="mr-3 h-4 w-4" />
                  Home
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant={isActive('/agents') ? "default" : "ghost"} 
                size="sm"
                className="w-full justify-start h-10"
                onClick={closeMobileMenu}
              >
                <Link href="/agents" className="flex items-center">
                  <Bot className="mr-3 h-4 w-4" />
                  AI Agents
                </Link>
              </Button>
              
                      <Button
                        asChild
                        variant={isActive('/mcp-servers') ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start h-10"
                        onClick={closeMobileMenu}
                      >
                        <Link href="/mcp-servers" className="flex items-center">
                          <Server className="mr-3 h-4 w-4" />
                          MCP Servers
                        </Link>
                      </Button>

                      <Button
                        asChild
                        variant={isActive('/leaderboard') ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start h-10"
                        onClick={closeMobileMenu}
                      >
                        <Link href="/leaderboard" className="flex items-center">
                          <Trophy className="mr-3 h-4 w-4" />
                          Leaderboard
                        </Link>
                      </Button>

                      <Button
                        asChild
                        variant={isActive('/events') ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start h-10"
                        onClick={closeMobileMenu}
                      >
                        <Link href="/events" className="flex items-center">
                          <CalendarDays className="mr-3 h-4 w-4" />
                          Events
                        </Link>
                      </Button>

              {/* Mobile search */}
              <Button 
                asChild 
                variant="ghost" 
                size="sm"
                className="w-full justify-start h-10"
                onClick={closeMobileMenu}
              >
                <Link href="/search" className="flex items-center">
                  <Search className="mr-3 h-4 w-4" />
                  Search
                </Link>
              </Button>

              {/* Mobile auth */}
              <div className="pt-2 border-t">
                {user ? (
                  <div className="px-2">
                    <UserMenu />
                  </div>
                ) : (
                  <div className="px-2">
                    <AuthDialog />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

