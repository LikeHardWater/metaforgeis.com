import Image from 'next/image'

export default function QuotePublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <Image src="/images/MFIS_Logo.svg" alt="MetaForge Industrial Systems" width={140} height={40} />
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-10">
        {children}
      </main>
      <footer className="max-w-2xl mx-auto px-6 py-6 text-xs text-slate-400 border-t border-slate-200">
        MetaForge Industrial Systems · (866) 563-8247 · info@metaforgeis.com
      </footer>
    </div>
  )
}
