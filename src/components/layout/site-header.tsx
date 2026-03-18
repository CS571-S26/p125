import Link from "next/link"
import { NavLinks } from "@/components/layout/nav-links"
import { ThemeToggle } from "@/components/layout/theme-toggle"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-base font-bold tracking-tight transition-colors duration-150 hover:text-primary"
        >
          Vishrut Agrawal
        </Link>
        <div className="flex items-center gap-4">
          <NavLinks />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
