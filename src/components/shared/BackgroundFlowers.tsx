"use client"

import { motion } from 'framer-motion'

export function BackgroundFlowers() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Giant Rotating Flower 1 */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[250px] -right-[250px] text-[600px] leading-none opacity-[0.03]"
      >
        🌸
      </motion.div>

      {/* Medium Rotating Flower */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-150px] -left-[150px] text-[400px] leading-none opacity-[0.04]"
      >
        🌸
      </motion.div>

      {/* Small Rotating Flower */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute top-[30%] -right-[100px] text-[200px] leading-none opacity-[0.05]"
      >
        🌸
      </motion.div>
      
      {/* Another Small Rotating Flower */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 75, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[20%] -left-[100px] text-[250px] leading-none opacity-[0.04]"
      >
        🌸
      </motion.div>
    </div>
  )
}
