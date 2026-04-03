'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ExternalLink, MapPin } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

import type { ExperienceFrontmatter } from '@/types/mdx'
import { GlassCard } from '@/components/ui/custom/glass-card'
import {
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

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

  return (
    <GlassCard
      colors={colors}
      seed={company}
      onClick={() => setIsOpen((prev) => !prev)}
      className="group/card"
    >
      <CardHeader className="py-4">
        <CardTitle>{company}</CardTitle>
        <CardDescription>{role}</CardDescription>
        <CardAction>
          <div className="flex items-center gap-2">
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
        </CardAction>
      </CardHeader>

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
            <CardContent className="flex flex-col gap-3 pb-4">
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
                    onClick={(e) => e.stopPropagation()}
                    className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Website
                  </Link>
                )}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}
