import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { BlogFrontmatter } from '@/types/mdx'

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(dateStr))
}

export function BlogCard({ slug, title, description, date, readingTime, tags }: BlogFrontmatter) {
  return (
    <Link
      href={`/blog/${slug}`}
      className={cn(
        'group block rounded-xl border border-muted-foreground/10 bg-muted-foreground/2',
        'px-5 py-4 transition-colors duration-200',
        'hover:border-muted-foreground/20 hover:bg-muted-foreground/4',
      )}
    >
      <article className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60 font-(family-name:--font-jetbrains-mono) tabular-nums">
          <time dateTime={date}>{formatDate(date)}</time>
          {readingTime && (
            <>
              <span aria-hidden>·</span>
              <span>{readingTime}</span>
            </>
          )}
        </div>

        <h2 className="text-base font-semibold leading-snug font-(family-name:--font-josefin-sans) group-hover:text-primary transition-colors duration-200">
          {title}
        </h2>

        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {description}
          </p>
        )}

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <span className="flex items-center gap-1 text-xs text-muted-foreground/50 group-hover:text-muted-foreground transition-colors duration-200 pt-0.5">
          Read more
          <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </article>
    </Link>
  )
}
