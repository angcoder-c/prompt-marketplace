import { createFileRoute } from '@tanstack/react-router'

import { auth } from '#/lib/auth'
import { followTagBySlug, unfollowTagBySlug } from '#/lib/db'

export const Route = createFileRoute('/api/tags/$slug/follow')({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const session = await auth.api.getSession({ headers: request.headers })

        if (!session?.user) {
          return Response.json(
            { error: { code: 'UNAUTHORIZED', message: 'Invalid or expired session' } },
            { status: 401 },
          )
        }

        const result = await followTagBySlug(session.user.id, params.slug)
        if (!result) {
          return Response.json(
            { error: { code: 'TAG_NOT_FOUND', message: 'Tag not found' } },
            { status: 404 },
          )
        }

        return Response.json(result, { status: 200 })
      },
      DELETE: async ({ request, params }) => {
        const session = await auth.api.getSession({ headers: request.headers })

        if (!session?.user) {
          return Response.json(
            { error: { code: 'UNAUTHORIZED', message: 'Invalid or expired session' } },
            { status: 401 },
          )
        }

        const result = await unfollowTagBySlug(session.user.id, params.slug)
        if (!result) {
          return Response.json(
            { error: { code: 'TAG_NOT_FOUND', message: 'Tag not found' } },
            { status: 404 },
          )
        }

        return Response.json(result, { status: 200 })
      },
    },
  },
})
