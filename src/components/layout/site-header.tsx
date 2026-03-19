import { NavLinks } from '@/components/layout/nav-links'

export function SiteHeader() {
  return (
    <header className="bg-background">
      <div className="max-w-3xl mx-auto px-4 pt-12">
        <NavLinks />
      </div>
    </header>
  )
}
