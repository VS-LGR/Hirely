'use client'

import { useEffect } from 'react'

export function ScrollGradient() {
  useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false

    const updateGradient = () => {
      const scrollY = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      
      // Calcular posição do gradiente baseado no scroll (0% a 100%)
      const scrollProgress = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0
      
      // Mapear para posição do gradiente (0% a 100% do background-position)
      const gradientPosition = scrollProgress
      
      // Atualizar background-position do body
      document.body.style.backgroundPosition = `${gradientPosition}% 50%`
      
      ticking = false
    }

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateGradient)
        ticking = true
      }
    }

    // Adicionar listener de scroll
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Atualizar posição inicial
    updateGradient()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return null
}

