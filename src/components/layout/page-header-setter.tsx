'use client'

import { useEffect } from 'react'

import { setOverride } from '@/lib/page-header-store'

interface Props {
  subtitle: string
  title: string
}

export function PageHeaderSetter({ subtitle, title }: Props) {
  useEffect(() => {
    setOverride({ subtitle, title })
    return () => setOverride(null)
  }, [subtitle, title])

  return null
}
