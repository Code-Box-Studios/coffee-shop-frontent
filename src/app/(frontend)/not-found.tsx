import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#a6452f] px-6 text-center text-[#f4eddf]">
      <span className="text-5xl" aria-hidden="true">
        ✳
      </span>
      <h1 className="font-serif text-5xl">A little off the beaten path.</h1>
      <p>There’s no page here, but there’s always good coffee.</p>
      <Link href="/" className="border border-current px-6 py-3">
        Back to the good stuff ↗
      </Link>
    </main>
  )
}
