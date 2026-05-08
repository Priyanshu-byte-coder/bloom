"use client"

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Flower {
  id: number
  x: number
  delay: number
  duration: number
  size: number
  opacity: number
}

export function FallingFlowers() {
  const [flowers, setFlowers] = useState<Flower[]>([])

  useEffect(() => {
    // Generate random flowers on the client to avoid hydration mismatch
    const newFlowers = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // random x percentage (0-100)
      delay: Math.random() * 10, // random delay up to 10s
      duration: 15 + Math.random() * 15, // random duration between 15-30s
      size: 20 + Math.random() * 30, // random size between 20-50px
      opacity: 0.1 + Math.random() * 0.3, // opacity between 0.1 and 0.4
    }))
    setFlowers(newFlowers)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
      {flowers.map((flower) => (
        <motion.div
          key={flower.id}
          initial={{ y: -100, rotate: 0 }}
          animate={{ y: '120vh', rotate: 360 }}
          transition={{
            duration: flower.duration,
            delay: flower.delay,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="absolute top-0"
          style={{ 
            fontSize: flower.size,
            opacity: flower.opacity,
            left: `${flower.x}%`
          }}
        >
          🌸
        </motion.div>
      ))}
    </div>
  )
}
