import { HeroSection } from '@/components/home/hero-section'
import { TerminalSection } from '@/components/home/terminal-section'

export default function Home() {
  return (
    <div className="flex flex-col py-10 px-4 space-y-10 max-w-3xl mx-auto">
      <HeroSection />
      <TerminalSection />
    </div>
  )
}
