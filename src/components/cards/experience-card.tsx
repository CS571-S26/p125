'use client'

import { useState, useEffect, useMemo } from 'react'
import type React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useAnimate } from 'motion/react'
import { ChevronDown, ExternalLink, MapPin } from 'lucide-react'

import type { ExperienceFrontmatter } from '@/types/mdx'

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

const blobCenters = [25, 50, 75]

function Blob({ color, position }: { color: string; position: React.CSSProperties }) {
  const [scope, animate] = useAnimate()

  useEffect(() => {
    let active = true

    async function roam() {
      // Start at a random position so blobs don't all launch from origin
      await animate(scope.current, {
        x: rand(-50, 50),
        y: rand(-40, 40),
        scale: rand(0.8, 1.3),
      }, { duration: 0 })

      while (active) {
        await animate(scope.current, {
          x: rand(-65, 65),
          y: rand(-55, 55),
          scale: rand(0.7, 1.45),
        }, {
          duration: rand(2.5, 5.5),
          ease: 'easeInOut',
        })
      }
    }

    roam()
    return () => { active = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div
      ref={scope}
      className="absolute h-44 w-44 rounded-full blur-3xl opacity-30 pointer-events-none"
      style={{ backgroundColor: color, ...position }}
    />
  )
}

export function ExperienceCard({
  company,
  role,
  dateStart,
  dateEnd,
  location,
  website,
  summary,
  colors,
}: ExperienceFrontmatter) {
  const [isOpen, setIsOpen] = useState(false)

  const blobPositions = useMemo<React.CSSProperties[]>(() =>
    blobCenters.map(cx => ({
      top: `${rand(10, 55)}%`,
      left: `${rand(cx - 10, cx + 10)}%`,
      transform: 'translate(-50%, -50%)',
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  , [])

  return (
    <motion.div
      layout
      onClick={() => setIsOpen(prev => !prev)}
      whileHover={{ scale: 1.01 }}
      transition={{ layout: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
      className="relative cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-sm hover:shadow-md hover:border-white/20 transition-[border-color,box-shadow]"
    >
      {colors.map((color, i) => (
        <Blob key={color} color={color} position={blobPositions[i]} />
      ))}

      {/* Glass sheen */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

      <div className="relative z-10 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-medium leading-snug font-(family-name:--font-josefin-sans)">
              {company}
            </span>
            <span className="text-sm text-muted-foreground">{role}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground tabular-nums">
              {dateStart} – {dateEnd}
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="text-muted-foreground"
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="details"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-3 flex flex-col gap-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {summary}
                </p>

                <div className="flex items-center justify-between">
                  {location && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {location}
                    </span>
                  )}
                  {website && (
                    <Link
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Website
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
