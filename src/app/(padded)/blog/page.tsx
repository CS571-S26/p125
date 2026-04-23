import type { Metadata } from 'next'

import { getAllContent } from '@/lib/mdx'
import { BlogCard } from '@/components/cards/blog-card'

export const metadata: Metadata = {
  title: 'Blog',
}

export default async function BlogPage() {
  const posts = getAllContent('blog')

  return (
    <main className="w-full">
      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground font-(family-name:--font-jetbrains-mono)">
          No posts yet. Check back soon.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <BlogCard key={post.slug} {...post} />
          ))}
        </div>
      )}
    </main>
  )
}
