'use client'

import { motion, useScroll } from 'motion/react'

export function ReadingProgress() {
  const { scrollYProgress } = useScroll()

  return (
    <motion.div
      aria-hidden
      className="fixed top-0 left-0 right-0 z-50 h-1 origin-left bg-gradient-to-r from-primary via-primary to-primary/80 shadow-[0_0_12px_color-mix(in_oklch,var(--primary)_70%,transparent)]"
      style={{ scaleX: scrollYProgress }}
    />
  )
}
