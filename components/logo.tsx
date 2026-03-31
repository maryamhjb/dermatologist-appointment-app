import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  href?: string
  showText?: boolean
  className?: string
}

export function Logo({ href = '/', showText = true, className = '' }: LogoProps) {
  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative w-12 h-12 md:w-14 md:h-14">
        <Image
          src="/logo.png"
          alt="Dr. Maryam Logo"
          width={56}
          height={56}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-lg md:text-xl font-bold text-primary whitespace-nowrap">
            دکتر مریم
          </span>
          <span className="text-xs md:text-sm text-muted-foreground font-medium">
            حاجی‌بابایی
          </span>
        </div>
      )}
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
