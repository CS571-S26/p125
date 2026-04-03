'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, MapPin, ExternalLink } from 'lucide-react'

import type { ExperienceFrontmatter } from '@/types/mdx'
import { TechBadge } from '@/components/shared/tech-badge'

export function ExperienceCard({
  company,
  role,
  dateStart,
  dateEnd,
  location,
  website,
  summary,
  tech,
}: ExperienceFrontmatter) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      layout
      onClick={() => setIsOpen(prev => !prev)}
      whileHover={{ scale: 1.01 }}
      transition={{ layout: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 hover:ring-foreground/25 transition-shadow hover:shadow-lg"
    >
      {/* Animated left accent bar */}
      <motion.div
        className="absolute left-0 top-0 h-full w-[2px] bg-foreground/60 origin-top"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      />

      <div className="px-5 py-4">
        {/* Header row */}
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

        {/* Expandable content */}
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

                {tech.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tech.map(t => (
                      <TechBadge key={t} tech={t} />
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {location && (
                    <span className="flex items-center gap-1">
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
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
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
