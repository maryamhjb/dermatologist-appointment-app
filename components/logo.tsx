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
      <div className="relative size-12 md:size-14 flex-shrink-0">
        <Image
          src="/logo.png"
          alt="Dr. Maryam Logo"
          fill
          className="object-contain"
          sizes="(min-width: 768px) 56px, 48px"
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
