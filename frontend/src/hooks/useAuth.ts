import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export function useAuth(redirectTo?: string) {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated() && redirectTo) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, redirectTo, router])

  return {
    user,
    isAuthenticated: isAuthenticated(),
  }
}


