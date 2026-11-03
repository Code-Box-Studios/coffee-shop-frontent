import type { Metadata } from 'next'
import { CoffeeExperience } from '@/components/experience/coffee-experience'
import { getExperienceContent } from '@/lib/get-content'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getExperienceContent()
  return {
    title: settings.title,
    description: settings.description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3341'),
    openGraph: {
      title: settings.title,
      description: settings.description,
      type: 'website',
      images: ['/images/latte.jpg'],
    },
  }
}

export default async function Page() {
  return <CoffeeExperience content={await getExperienceContent()} />
}
