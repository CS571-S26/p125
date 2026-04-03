import type { Metadata } from 'next'

import { SectionHeader } from '@/components/shared/section-header'
import { ExperienceCard } from '@/components/cards/experience-card'
import { getAllContent } from '@/lib/mdx'

export const metadata: Metadata = {
  title: 'Experience',
}

export default function ExperiencePage() {
  const experiences = getAllContent('experience')

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <SectionHeader number="01" title="Experience" />
      <div className="flex flex-col gap-4">
        {experiences.map(exp => (
          <ExperienceCard key={exp.slug} {...exp} />
        ))}
      </div>
    </main>
  )
}