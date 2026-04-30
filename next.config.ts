import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  reactCompiler: true,
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [
      'remark-frontmatter',
      'remark-gfm',
      ['remark-toc', { heading: 'Contents' }],
    ],
    rehypePlugins: [
      'rehype-slug',
      ['rehype-pretty-code', { theme: 'github-dark', keepBackground: false }],
      'rehype-autolink-headings',
    ],
  },
})

export default withMDX(nextConfig)
