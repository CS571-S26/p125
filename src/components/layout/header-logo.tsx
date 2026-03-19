import Link from 'next/link'

export function HeaderLogo() {
  return (
    <Link
      href="/"
      className="text-base font-semibold tracking-tight transition-colors duration-150 hover:text-primary"
    >
      Home
    </Link>
  )
}
