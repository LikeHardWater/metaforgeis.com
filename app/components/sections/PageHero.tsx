import Image from 'next/image'

interface PageHeroProps {
  eyebrow?: string
  title: string
  subtitle?: string
  image: string
  imageAlt?: string
  align?: 'left' | 'center'
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
  imageAlt = '',
  align = 'center',
}: PageHeroProps) {
  const textAlign = align === 'center' ? 'text-center' : 'text-left'
  const maxW = align === 'center' ? 'max-w-3xl mx-auto' : 'max-w-3xl'

  return (
    <section className="relative h-72 sm:h-80 flex items-center overflow-hidden">
      {/* Background photo */}
      <Image
        src={image}
        alt={imageAlt}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Content */}
      <div className={`relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${textAlign}`}>
        <div className={maxW}>
          {eyebrow && (
            <span className="inline-block text-gold text-xs font-bold uppercase tracking-widest mb-3">
              {eyebrow}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/75 text-lg mt-4 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
