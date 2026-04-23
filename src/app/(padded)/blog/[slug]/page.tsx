import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getAllContent, getContentBySlug } from '@/lib/mdx'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PageHeaderSetter } from '@/components/layout/page-header-setter'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const posts = getAllContent('blog')
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getContentBySlug('blog', slug)
  return {
    title: post.title,
    description: post.description,
  }
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(dateStr))
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params

  let Post: React.ComponentType
  try {
    const mod = await import(`@content/blog/${slug}.mdx`)
    Post = mod.default
  } catch {
    notFound()
  }

  const posts = getAllContent('blog')
  const post = getContentBySlug('blog', slug)
  const postIndex = posts.findIndex((p) => p.slug === slug)
  const postNumber = String(postIndex + 1).padStart(2, '0')

  return (
    <>
      <PageHeaderSetter subtitle={`03.${postNumber}`} title={post.title} />

      <main className="w-full max-w-2xl">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60 font-(family-name:--font-jetbrains-mono) tabular-nums mb-4">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {post.readingTime && (
            <>
              <span aria-hidden>·</span>
              <span>{post.readingTime}</span>
            </>
          )}
        </div>

        {post.description && (
          <p className="text-muted-foreground leading-relaxed mb-4">{post.description}</p>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <Separator className="mb-8 opacity-30" />

        <article className="prose-sm">
          <Post />
        </article>
      </main>
    </>
  )
}
