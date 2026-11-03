import type { Access, PayloadRequest } from 'payload'

export const authenticated = ({ req }: { req: PayloadRequest }): boolean => Boolean(req.user)
export const publicRead: Access = () => true
export const publishedOrAuthenticated: Access = ({ req }) =>
  req.user ? true : { status: { equals: 'published' } }
