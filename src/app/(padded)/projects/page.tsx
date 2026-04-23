import type { Metadata } from 'next'

import { getAllContent } from '@/lib/mdx'
import { ProjectCardGrid } from '@/components/cards/project-card'

export const metadata: Metadata = {
  title: 'Projects',
}

export default async function ProjectsPage() {
  const projects = getAllContent('projects')

  return (
    <main className="w-full">
      <ProjectCardGrid projects={projects} />
    </main>
  )
}
