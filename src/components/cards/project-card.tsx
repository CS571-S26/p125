'use client'

import { useState } from 'react'

import { GlassCard } from '@/components/ui/custom/glass-card'
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ProjectFrontmatter } from '@/types/mdx'

export function ProjectCard({
  project,
  focused,
  onFocus,
  onBlur,
}: {
  project: ProjectFrontmatter
  focused: boolean
  onFocus: () => void
  onBlur: () => void
}) {
  return (
    <div
      className={cn(
        'transition-all duration-300',
        focused ? 'scale-[1.02]' : '',
        focused === false ? 'opacity-40 blur-sm scale-[0.98]' : '',
      )}
      onMouseEnter={onFocus}
      onMouseLeave={onBlur}
    >
      <GlassCard colors={project.colors} seed={project.slug}>
        <CardHeader className="py-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground tabular-nums">
              {project.dateStart}
              {project.dateEnd && project.dateEnd !== project.dateStart
                ? ` – ${project.dateEnd}`
                : ''}
            </span>
            <CardTitle>{project.title}</CardTitle>
            <CardDescription>{project.tagline}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {project.summary}
          </p>
        </CardContent>
      </GlassCard>
    </div>
  )
}

export function ProjectCardGrid({ projects }: { projects: ProjectFrontmatter[] }) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project, i) => (
        <ProjectCard
          key={project.slug}
          project={project}
          focused={focusedIndex === null ? true : focusedIndex === i}
          onFocus={() => setFocusedIndex(i)}
          onBlur={() => setFocusedIndex(null)}
        />
      ))}
    </div>
  )
}
