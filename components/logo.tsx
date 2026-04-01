import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  href?: string
  showText?: boolean
  className?: string
}

export function Logo({ href = '/', showText = true, className = '' }: LogoProps) {
  const content = (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="relative flex-shrink-0 w-14 h-14">
        <Image
          src="/logo.png"
          alt="Dr. Maryam Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className="text-lg md:text-xl font-bold text-primary whitespace-nowrap">
          دکتر مریم حاجی‌بابایی
        </span>
      )}
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
