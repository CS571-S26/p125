import type { MetadataRoute } from 'next'

import { getAllContent } from '@/lib/mdx'
import { siteMetadata } from '@/lib/metadata'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteMetadata.url
  const blog = getAllContent('blog').map(post => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.date),
  }))

  return [
    { url: base },
    { url: `${base}/experience` },
    { url: `${base}/projects` },
    { url: `${base}/blog` },
    ...blog,
  ]
}
