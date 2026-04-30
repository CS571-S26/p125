'use client'

import type { CSSProperties } from 'react'
import Link from 'next/link'
import { ExternalLink, Github } from 'lucide-react'

import { GlassCard } from '@/components/ui/custom/glass-card'
import { Button } from '@/components/ui/button'
import {
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { ProjectFrontmatter } from '@/types/mdx'

type LinkSpec = {
  url: string
  label: string
  icon: typeof Github
}

function ActionLink({
  href,
  label,
  icon: Icon,
  delayMs,
}: {
  href: string
  label: string
  icon: typeof Github
  delayMs: number
}) {
  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      style={{ transitionDelay: `${delayMs}ms` } as CSSProperties}
      className="translate-y-0 opacity-100 transition-all duration-300 sm:translate-y-3 sm:opacity-0 sm:group-hover/card:translate-y-0 sm:group-hover/card:opacity-100"
    >
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        <Icon />
        {label}
      </Link>
    </Button>
  )
}

export function ProjectCard({ project }: { project: ProjectFrontmatter }) {
  const links: LinkSpec[] = []
  if (project.githubUrl) {
    links.push({ url: project.githubUrl, label: 'GitHub', icon: Github })
  }
  if (project.secondaryLink) {
    links.push({
      url: project.secondaryLink.url,
      label: project.secondaryLink.label,
      icon: ExternalLink,
    })
  }

  const accent = project.colors[0] ?? '#888888'
  const hoverTint = `radial-gradient(circle at top right, color-mix(in oklch, ${accent} 12%, transparent), transparent 65%)`

  return (
    <GlassCard
      colors={project.colors}
      seed={project.slug}
      solid
      className="group/card"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
        style={{ background: hoverTint }}
      />
      <div className="relative min-h-[240px]">
        <CardHeader className="py-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground tabular-nums">
              {project.dateStart}
              {project.dateEnd && project.dateEnd !== project.dateStart
                ? ` – ${project.dateEnd}`
                : ''}
            </span>
            <CardTitle>{project.title}</CardTitle>
          </div>
        </CardHeader>

        <div className="transition-all duration-300 sm:group-hover/card:-translate-y-1 sm:group-hover/card:opacity-0">
          <CardContent className="pb-4 pt-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {project.summary}
            </p>
          </CardContent>
        </div>

        {links.length > 0 && (
          <div className="mt-2 flex flex-col items-center gap-2 px-6 pb-4 sm:absolute sm:inset-x-0 sm:top-[45%] sm:bottom-auto sm:mt-0 sm:items-center sm:justify-start sm:px-6 sm:pb-0">
            {links.map((l, i) => (
              <ActionLink
                key={l.url}
                href={l.url}
                label={l.label}
                icon={l.icon}
                delayMs={i * 50}
              />
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  )
}

export function ProjectCardGrid({
  projects,
}: {
  projects: ProjectFrontmatter[]
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.slug} project={project} />
      ))}
    </div>
  )
}
