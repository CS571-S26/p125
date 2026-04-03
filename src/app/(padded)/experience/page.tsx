import type { Metadata } from 'next'

import { getAllContent } from '@/lib/mdx'
import { ExperienceCard } from '@/components/cards/experience-card'

export const metadata: Metadata = {
  title: 'Experience',
}

export default function ExperiencePage() {
  const experiences = getAllContent('experience')

  return (
    <main className="w-full">
      <div className="flex flex-col gap-4">
        {experiences.map((exp) => (
          <ExperienceCard key={exp.slug} {...exp} />
        ))}
      </div>
    </main>
  )
}
