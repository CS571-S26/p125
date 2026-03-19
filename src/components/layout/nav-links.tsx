"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const homeLink = { href: "/", label: "Home", exact: true }

const navLinks = [
  { href: "/experience", label: "Experience" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
]

function linkClass(active: boolean) {
  return cn(
    "text-sm transition-colors hover:text-foreground font-semibold",
    active ? "text-foreground" : "text-muted-foreground"
  )
}

export function NavLinks() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center justify-between">
      <Link href={homeLink.href} className={linkClass(pathname === homeLink.href)}>
        {homeLink.label}
      </Link>
      <div className="flex items-center gap-6">
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={linkClass(pathname.startsWith(href))}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
