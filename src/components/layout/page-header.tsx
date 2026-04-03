'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

type RouteConfig = {
  subtitle: string
  title: string
}

const routes: Record<string, RouteConfig> = {
  '/': { subtitle: 'Software Engineer', title: 'Vishrut Agrawal' },
  '/experience': { subtitle: '01.', title: 'Experience' },
  '/projects': { subtitle: '02.', title: 'Projects' },
  '/blog': { subtitle: '03.', title: 'Blog' },
}

function getRoute(pathname: string): RouteConfig {
  if (pathname === '/') return routes['/']
  const match = Object.keys(routes).find(
    (key) => key !== '/' && pathname.startsWith(key),
  )
  return match ? routes[match] : routes['/']
}

const ANIM_DURATION = 300

const ANIM_IN: React.CSSProperties = {
  animation: `page-header-in ${ANIM_DURATION}ms ease both`,
}

const ANIM_OUT: React.CSSProperties = {
  animation: `page-header-out ${ANIM_DURATION}ms ease both`,
}

function TextLayer({
  config,
  style,
}: {
  config: RouteConfig
  style?: React.CSSProperties
}) {
  return (
    <div className="absolute inset-0 px-8" style={style}>
      <p className="text-xs text-muted-foreground tracking-widest font-(family-name:--font-jetbrains-mono) mb-2 uppercase">
        {config.subtitle}
      </p>
      <h1 className="text-4xl tracking-tight font-(family-name:--font-josefin-sans)">{config.title}</h1>
    </div>
  )
}

export function PageHeader() {
  const pathname = usePathname()
  const [current, setCurrent] = useState(getRoute(pathname))
  const [exiting, setExiting] = useState<RouteConfig | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const prevRef = useRef(pathname)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (prevRef.current === pathname) return
    const prev = prevRef.current
    prevRef.current = pathname

    if (timerRef.current) clearTimeout(timerRef.current)

    const next = getRoute(pathname)
    const previous = getRoute(prev)

    setExiting(previous)
    setCurrent(next)
    setTransitioning(true)

    timerRef.current = setTimeout(() => {
      setExiting(null)
      setTransitioning(false)
    }, ANIM_DURATION)
  }, [pathname])

  return (
    <div className="mt-8 pb-2 relative overflow-hidden">
      {/* Spacer keeps the container at the right height */}
      <div aria-hidden className="invisible pointer-events-none select-none">
        <p className="text-xs mb-1">x</p>
        <h1 className="text-2xl font-semibold tracking-tight">x</h1>
      </div>

      {exiting && <TextLayer config={exiting} style={ANIM_OUT} />}
      <TextLayer config={current} style={transitioning ? ANIM_IN : undefined} />
    </div>
  )
}
