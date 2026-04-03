import fs from 'fs'
import path from 'path'

import matter from 'gray-matter'

import type { BlogFrontmatter, ExperienceFrontmatter, ProjectFrontmatter } from '@/types/mdx'

const CONTENT_ROOT = path.join(process.cwd(), 'content')

type ContentType = 'experience' | 'projects' | 'blog'

type FrontmatterFor<T extends ContentType> = T extends 'experience'
  ? ExperienceFrontmatter
  : T extends 'projects'
    ? ProjectFrontmatter
    : BlogFrontmatter

function parseFrontmatter<T extends ContentType>(type: T, slug: string): FrontmatterFor<T> {
  const filePath = path.join(CONTENT_ROOT, type, `${slug}.mdx`)
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data } = matter(raw)
  return { ...data, slug } as FrontmatterFor<T>
}

export function getAllContent<T extends ContentType>(type: T): FrontmatterFor<T>[] {
  const dir = path.join(CONTENT_ROOT, type)
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'))

  const items = files.map(file => {
    const slug = file.replace(/\.mdx$/, '')
    return parseFrontmatter(type, slug)
  })

  const published = items.filter(item => {
    if ('published' in item) return (item as { published: boolean }).published
    return true
  })

  if (type === 'blog') {
    return published.sort((a, b) => {
      const aDate = (a as BlogFrontmatter).date
      const bDate = (b as BlogFrontmatter).date
      return new Date(bDate).getTime() - new Date(aDate).getTime()
    })
  }

  return published.sort((a, b) => {
    const aOrder = (a as ExperienceFrontmatter | ProjectFrontmatter).order
    const bOrder = (b as ExperienceFrontmatter | ProjectFrontmatter).order
    return aOrder - bOrder
  })
}

export function getContentBySlug<T extends ContentType>(type: T, slug: string): FrontmatterFor<T> {
  return parseFrontmatter(type, slug)
}
