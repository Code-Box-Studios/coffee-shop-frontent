export interface ImageAsset {
  src: string
  alt: string
  width: number
  height: number
}

export interface MenuProduct {
  id: string
  slug: string
  eyebrow: string
  title: string
  emphasis: string
  description: string
  details: string
  flavorNotes: string[]
  price: number
  image: ImageAsset
  imageCaption: string
  actionLabel: string
}

export interface ExperienceContent {
  settings: {
    brandName: string
    title: string
    description: string
    locationLabel: string
    address: string
    contactEmail: string
    currency: 'PHP' | 'USD' | 'EUR' | 'GBP'
    hours: { days: string; time: string }[]
  }
  hero: { kicker: string; firstWord: string; secondWord: string; caption: string; badge: string }
  origin: {
    label: string
    title: string
    emphasis: string
    closing: string
    body: string
    footnote: string
  }
  roast: {
    label: string
    firstWord: string
    secondWord: string
    thirdWord: string
    caption: string
    temperature: number
    extractionTime: number
  }
  pause: { label: string; title: string; emphasis: string; body: string }
  menuHeading: { label: string; title: string; emphasis: string; footer: string }
  visit: { label: string; title: string; emphasis: string; body: string; image: ImageAsset }
  menu: MenuProduct[]
}
