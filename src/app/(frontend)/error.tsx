'use client'

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#a6452f] px-6 text-center text-[#f4eddf]">
      <span className="text-5xl" aria-hidden="true">
        ✳
      </span>
      <h1 className="font-serif text-5xl">Another little moment.</h1>
      <p>The page couldn’t load. Please try again.</p>
      <button className="border border-current px-6 py-3" onClick={reset}>
        Try again ↗
      </button>
    </main>
  )
}
