import type { Field, GlobalConfig } from 'payload'
import { defaultContent } from '../lib/default-content'
import { authenticated, publicRead } from './access'

function textFields(values: Record<string, string>): Field[] {
  return Object.entries(values).map(([name, defaultValue]): Field => {
    const shared = {
      name,
      label: name.replace(/([A-Z])/g, ' $1').replace(/^./, (character) => character.toUpperCase()),
      defaultValue,
      maxLength: ['body', 'caption', 'description'].includes(name) ? 1500 : 150,
    }
    return ['body', 'caption', 'description'].includes(name)
      ? { ...shared, type: 'textarea' }
      : { ...shared, type: 'text' }
  })
}

const sharedAccess = { read: publicRead, update: authenticated }

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Homepage',
  admin: {
    group: 'Website',
    description: 'Edit the story displayed throughout the scroll experience.',
  },
  access: sharedAccess,
  fields: [
    { name: 'hero', type: 'group', fields: textFields(defaultContent.hero) },
    { name: 'origin', type: 'group', fields: textFields(defaultContent.origin) },
    {
      name: 'roast',
      type: 'group',
      fields: [
        ...textFields({
          label: defaultContent.roast.label,
          firstWord: 'HEAT.',
          secondWord: 'HEART.',
          thirdWord: 'HANDS.',
          caption: defaultContent.roast.caption,
        }),
        {
          name: 'temperature',
          label: 'Brewing temperature (°C)',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 93,
        },
        {
          name: 'extractionTime',
          label: 'Extraction time (seconds)',
          type: 'number',
          min: 1,
          max: 120,
          defaultValue: 28,
        },
      ],
    },
    { name: 'pause', type: 'group', fields: textFields(defaultContent.pause) },
    { name: 'menuHeading', type: 'group', fields: textFields(defaultContent.menuHeading) },
    {
      name: 'visit',
      type: 'group',
      fields: [
        ...textFields({
          label: defaultContent.visit.label,
          title: defaultContent.visit.title,
          emphasis: defaultContent.visit.emphasis,
          body: defaultContent.visit.body,
        }),
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: {
    group: 'Website',
    description: 'Brand, search metadata, contact information, and opening hours.',
  },
  access: sharedAccess,
  fields: [
    { name: 'brandName', type: 'text', required: true, maxLength: 30, defaultValue: 'ember.' },
    {
      name: 'title',
      label: 'Page title',
      type: 'text',
      defaultValue: defaultContent.settings.title,
      maxLength: 100,
    },
    {
      name: 'description',
      type: 'textarea',
      defaultValue: defaultContent.settings.description,
      maxLength: 300,
    },
    {
      name: 'currency',
      type: 'select',
      options: ['PHP', 'USD', 'EUR', 'GBP'],
      defaultValue: 'PHP',
      required: true,
    },
    {
      name: 'locationLabel',
      type: 'text',
      defaultValue: defaultContent.settings.locationLabel,
      maxLength: 120,
    },
    { name: 'address', type: 'textarea', maxLength: 300 },
    { name: 'contactEmail', type: 'email' },
    {
      name: 'hours',
      type: 'array',
      maxRows: 14,
      fields: [
        { name: 'days', type: 'text', required: true, maxLength: 60 },
        { name: 'time', type: 'text', required: true, maxLength: 60 },
      ],
    },
  ],
}
