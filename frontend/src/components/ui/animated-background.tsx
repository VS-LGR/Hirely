'use client'

import { useEffect, useState } from 'react'

interface Bubble {
  id: number
  size: number
  left: number
  duration: number
  delay: number
  opacity: number
}

export function AnimatedBackground() {
  const [bubbles, setBubbles] = useState<Bubble[]>([])

  useEffect(() => {
    // Criar bolhas iniciais
    const createBubble = (id: number, delay: number = 0): Bubble => ({
      id,
      size: Math.random() * 150 + 80, // 80-230px
      left: Math.random() * 100, // 0-100%
      duration: Math.random() * 25 + 20, // 20-45s
      delay,
      opacity: Math.random() * 0.4 + 0.15, // 0.15-0.55 (mais visível)
    })

    const initialBubbles: Bubble[] = Array.from({ length: 10 }, (_, i) =>
      createBubble(i, Math.random() * 5)
    )
    setBubbles(initialBubbles)

    // Adicionar novas bolhas periodicamente
    const interval = setInterval(() => {
      const newBubble = createBubble(Date.now(), 0)
      setBubbles((prev) => [...prev, newBubble])
    }, 6000) // Nova bolha a cada 6 segundos

    // Limpar bolhas antigas (após animação completa)
    const cleanupInterval = setInterval(() => {
      setBubbles((prev) => {
        // Manter apenas as últimas 15 bolhas
        if (prev.length > 15) {
          return prev.slice(-15)
        }
        return prev
      })
    }, 10000)

    return () => {
      clearInterval(interval)
      clearInterval(cleanupInterval)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="bubble-float absolute rounded-full bg-primary/12 blur-2xl"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.left}%`,
            bottom: '-150px',
            opacity: bubble.opacity,
            animation: `bubbleFloat ${bubble.duration}s ease-in-out ${bubble.delay}s infinite`,
            '--bubble-opacity': bubble.opacity,
          } as React.CSSProperties & { '--bubble-opacity': number }}
        />
      ))}
    </div>
  )
}

