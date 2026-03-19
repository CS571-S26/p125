import { HeaderLogo } from '@/components/layout/header-logo'
import { NavLinks } from '@/components/layout/nav-links'

export function SiteHeader() {
  return (
    <header className="bg-background">
      <div className="max-w-3xl mx-auto px-4 pt-12 flex items-center justify-between">
        <HeaderLogo />
        <NavLinks />
      </div>
    </header>
  )
}
