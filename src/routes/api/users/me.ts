import { createFileRoute } from '@tanstack/react-router'

import { auth } from '#/lib/auth'
import {
  findMarketplaceUserById,
  findMarketplaceUserByUsername,
  updateMarketplaceUserProfile,
} from '#/lib/db'

type UpdateMeBody = {
  username?: string
  bio?: string | null
}

const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/

export const Route = createFileRoute('/api/users/me')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await auth.api.getSession({
          headers: request.headers,
        })

        if (!session?.user) {
          return Response.json(
            { error: { code: 'UNAUTHORIZED', message: 'Invalid or expired session' } },
            { status: 401 },
          )
        }

        const profile = await findMarketplaceUserById(session.user.id)

        if (!profile) {
          return Response.json(
            {
              error: {
                code: 'PROFILE_NOT_FOUND',
                message: 'You need to complete setup first via POST /api/users/setup',
              },
            },
            { status: 404 },
          )
        }

        return Response.json(profile, { status: 200 })
      },
      PATCH: async ({ request }) => {
        const session = await auth.api.getSession({
          headers: request.headers,
        })

        if (!session?.user) {
          return Response.json(
            { error: { code: 'UNAUTHORIZED', message: 'Invalid or expired session' } },
            { status: 401 },
          )
        }

        const body = (await request.json().catch(() => ({}))) as UpdateMeBody
        const nextUsername = body.username?.trim()

        if (nextUsername !== undefined && !usernameRegex.test(nextUsername)) {
          return Response.json(
            {
              error: {
                code: 'INVALID_USERNAME',
                message:
                  'username must be 3-30 chars and only include letters, numbers, and underscore',
              },
            },
            { status: 422 },
          )
        }

        if (nextUsername) {
          const existing = await findMarketplaceUserByUsername(nextUsername)
          if (existing && existing.id_user !== session.user.id) {
            return Response.json(
              { error: { code: 'USERNAME_TAKEN', message: 'Username is already in use' } },
              { status: 400 },
            )
          }
        }

        const profile = await updateMarketplaceUserProfile({
          idUser: session.user.id,
          username: nextUsername,
          bio: body.bio,
        })

        if (!profile) {
          return Response.json(
            {
              error: {
                code: 'PROFILE_NOT_FOUND',
                message: 'You need to complete setup first via POST /api/users/setup',
              },
            },
            { status: 404 },
          )
        }

        return Response.json(profile, { status: 200 })
      },
    },
  },
})
