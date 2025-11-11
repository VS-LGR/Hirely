'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'

export function Header() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <header className="border-b border-brown-light bg-bege-light shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold text-brown-dark hover:text-brown-medium transition-colors">
            Hirely
          </Link>
          <nav className="flex items-center gap-4">
            {mounted && isAuthenticated() ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-brown-dark hover:text-brown-medium hover:bg-bege-medium">
                    Dashboard
                  </Button>
                </Link>
                {user && (
                  <span className="text-sm text-brown-medium font-medium hidden sm:inline">
                    {user.name}
                  </span>
                )}
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="border-brown-medium text-brown-dark hover:bg-brown-light hover:text-brown-dark"
                >
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-brown-dark hover:text-brown-medium hover:bg-bege-medium">
                    Entrar
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-brown-medium hover:bg-brown-dark text-white">
                    Cadastrar
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}


