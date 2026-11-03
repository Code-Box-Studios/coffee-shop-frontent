import { defaultContent } from './default-content'
import type { ExperienceContent, ImageAsset, MenuProduct } from './types'

type RecordValue = Record<string, unknown>
const record = (value: unknown): RecordValue =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as RecordValue) : {}

const text = (value: unknown, fallback: string): string =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback

const boundedNumber = (value: unknown, fallback: number, min: number, max: number): number =>
  typeof value === 'number' && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback

function textSection<T extends Record<string, string>>(value: unknown, defaults: T): T {
  const data = record(value)
  return Object.fromEntries(
    Object.entries(defaults).map(([key, fallback]) => [key, text(data[key], fallback)]),
  ) as T
}

function imageAsset(value: unknown, fallback: ImageAsset): ImageAsset {
  const image = record(value)
  let src = text(image.url, '')
  if (/^https?:\/\//.test(src)) {
    try {
      src = new URL(src).pathname
    } catch {
      src = ''
    }
  }
  if (!/^\/(?:api\/media\/file|media|images)\//.test(src)) return { ...fallback }
  return {
    src,
    alt: text(image.alt, fallback.alt),
    width: boundedNumber(image.width, fallback.width, 1, 20000),
    height: boundedNumber(image.height, fallback.height, 1, 20000),
  }
}

export function normalizeContent(input: {
  homepage?: unknown
  settings?: unknown
  menu?: unknown
}): ExperienceContent {
  const home = record(input.homepage)
  const settings = record(input.settings)
  const roast = record(home.roast)
  const visit = record(home.visit)
  const items = Array.isArray(input.menu) ? input.menu : []
  const menu: MenuProduct[] = items
    .map(record)
    .filter((item) => item.status === 'published')
    .sort((a, b) => boundedNumber(a.order, 0, 0, 10000) - boundedNumber(b.order, 0, 0, 10000))
    .map((item, index) => {
      const fallback = defaultContent.menu[index % defaultContent.menu.length]
      return {
        id: String(item.id ?? index),
        slug: text(item.slug, `menu-${index}`),
        eyebrow: text(item.eyebrow, 'SOMETHING GOOD'),
        title: text(item.title, 'Seasonal coffee'),
        emphasis: text(item.emphasis, ''),
        description: text(item.description, ''),
        details: text(item.details, text(item.description, 'Made with care, one order at a time.')),
        flavorNotes: Array.isArray(item.flavorNotes)
          ? item.flavorNotes.map((note) => text(record(note).note, '')).filter(Boolean)
          : [],
        price: boundedNumber(item.price, 0, 0, 1000000),
        image: imageAsset(item.image, fallback.image),
        imageCaption: text(item.imageCaption, 'MADE WITH A LITTLE HEART'),
        actionLabel: text(item.actionLabel, 'A little more'),
      }
    })
  const currencies: Record<string, ExperienceContent['settings']['currency']> = {
    PHP: 'PHP',
    USD: 'USD',
    EUR: 'EUR',
    GBP: 'GBP',
  }
  const currency = text(settings.currency, 'PHP')
  return {
    settings: {
      ...textSection(settings, {
        brandName: defaultContent.settings.brandName,
        title: defaultContent.settings.title,
        description: defaultContent.settings.description,
        locationLabel: defaultContent.settings.locationLabel,
        address: '',
        contactEmail: '',
      }),
      currency: currencies[currency] ?? 'PHP',
      hours: Array.isArray(settings.hours)
        ? settings.hours
            .map(record)
            .map((hour) => ({ days: text(hour.days, ''), time: text(hour.time, '') }))
            .filter((hour) => hour.days && hour.time)
        : [],
    },
    hero: textSection(home.hero, defaultContent.hero),
    origin: textSection(home.origin, defaultContent.origin),
    roast: {
      ...textSection(roast, {
        label: defaultContent.roast.label,
        firstWord: defaultContent.roast.firstWord,
        secondWord: defaultContent.roast.secondWord,
        thirdWord: defaultContent.roast.thirdWord,
        caption: defaultContent.roast.caption,
      }),
      temperature: boundedNumber(roast.temperature, 93, 0, 100),
      extractionTime: boundedNumber(roast.extractionTime, 28, 1, 120),
    },
    pause: textSection(home.pause, defaultContent.pause),
    menuHeading: textSection(home.menuHeading, defaultContent.menuHeading),
    visit: {
      ...textSection(visit, {
        label: defaultContent.visit.label,
        title: defaultContent.visit.title,
        emphasis: defaultContent.visit.emphasis,
        body: defaultContent.visit.body,
      }),
      image: imageAsset(visit.image, defaultContent.visit.image),
    },
    menu,
  }
}
