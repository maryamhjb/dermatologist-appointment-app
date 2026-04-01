import { LogoFramedMark } from '@/components/logo-framed-mark'
import { cn } from '@/lib/utils'

/** Large brand mark for the home hero — same frame as header, scaled up. */
export function HeroLogo({ className }: { className?: string }) {
  return <LogoFramedMark variant="hero" className={cn(className)} />
}
