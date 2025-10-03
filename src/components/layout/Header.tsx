'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { AuthDialog } from '@/components/auth/AuthDialog'
import { UserMenu } from '@/components/auth/UserMenu'
import { Plus, Bot, Server, Home, Search, Menu, X, Trophy, CalendarDays } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export function Header() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
              <div className="flex items-center space-x-2">
                {/* Logo Image */}
                <div className="w-8 h-8 flex items-center justify-center">
                  <img 
                    src="/logos/agentsvalley.png" 
                    alt="AgentsValley Logo" 
                    className="h-8 w-auto object-contain"
                    onError={(e) => {
                      // Fallback to gradient logo if image fails to load
                      e.currentTarget.style.display = 'none'
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement
                      if (fallback) {
                        fallback.style.display = 'flex'
                      }
                    }}
                  />
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm" style={{display: 'none'}}>
                    <span className="text-white font-bold text-sm">AV</span>
                  </div>
                </div>
                {/* Logo Text */}
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
                  AgentsValley
                </span>
                <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent sm:hidden">
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
          <div className="lg:hidden border-t bg-white/95 backdrop-blur">
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

