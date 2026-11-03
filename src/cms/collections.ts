import path from 'node:path'
import type { CollectionConfig } from 'payload'
import { authenticated, publicRead, publishedOrAuthenticated } from './access'

const protectedWrites = { create: authenticated, update: authenticated, delete: authenticated }

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'name', group: 'Administration' },
  access: { ...protectedWrites, admin: authenticated, read: authenticated },
  fields: [{ name: 'name', type: 'text', required: true }],
}

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Website' },
  access: { ...protectedWrites, read: publicRead },
  upload: {
    staticDir: process.env.MEDIA_DIR || path.resolve(process.cwd(), 'public/media'),
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    imageSizes: [{ name: 'preview', width: 1200, height: 900, position: 'centre' }],
    adminThumbnail: 'preview',
  },
  fields: [
    { name: 'alt', label: 'Image description', type: 'text', required: true },
    { name: 'sourceKey', type: 'text', unique: true, admin: { hidden: true } },
  ],
}

export const MenuItems: CollectionConfig = {
  slug: 'menu-items',
  admin: {
    useAsTitle: 'title',
    group: 'Website',
    defaultColumns: ['title', 'price', 'status', 'order'],
  },
  access: { ...protectedWrites, read: publishedOrAuthenticated },
  defaultSort: 'order',
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 40 },
    {
      name: 'emphasis',
      type: 'text',
      maxLength: 40,
      admin: { description: 'The italic second line, for example “Flat White.”' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      validate: (value: string | null | undefined) =>
        Boolean(value && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) ||
        'Use lowercase words separated by hyphens.',
    },
    { name: 'price', type: 'number', required: true, min: 0, max: 1000000 },
    { name: 'description', type: 'textarea', maxLength: 200 },
    { name: 'details', type: 'textarea', maxLength: 1500 },
    { name: 'eyebrow', label: 'Small label', type: 'text', maxLength: 60 },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'imageCaption', type: 'text', maxLength: 80 },
    { name: 'actionLabel', type: 'text', maxLength: 50, defaultValue: 'A little more' },
    {
      name: 'flavorNotes',
      type: 'array',
      maxRows: 5,
      fields: [{ name: 'note', type: 'text', required: true, maxLength: 35 }],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 10000,
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      required: true,
      options: ['draft', 'published'],
      admin: {
        position: 'sidebar',
        description: 'Only published items appear on the website and public API.',
      },
    },
  ],
}
