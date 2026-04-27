import { createFileRoute } from '@tanstack/react-router'

import { auth } from '#/lib/auth'
import {
  createMarketplaceUserProfile,
  findAuthProviderByUserId,
  findMarketplaceUserById,
  findMarketplaceUserByUsername,
} from '#/lib/db'

type SetupBody = {
  username?: string
}

const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/

export const Route = createFileRoute('/api/users/setup')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await auth.api.getSession({
          headers: request.headers,
        })

        if (!session?.user) {
          return Response.json(
            { error: { code: 'UNAUTHORIZED', message: 'Invalid or expired session' } },
            { status: 401 },
          )
        }

        const existingById = await findMarketplaceUserById(session.user.id)
        if (existingById) {
          return Response.json(
            { error: { code: 'PROFILE_EXISTS', message: 'Profile already exists' } },
            { status: 409 },
          )
        }

        const body = (await request.json().catch(() => ({}))) as SetupBody
        const username = body.username?.trim() ?? ''

        if (!usernameRegex.test(username)) {
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

        const existingByUsername = await findMarketplaceUserByUsername(username)
        if (existingByUsername) {
          return Response.json(
            { error: { code: 'USERNAME_TAKEN', message: 'Username is already in use' } },
            { status: 400 },
          )
        }

        const providerData = await findAuthProviderByUserId(session.user.id)

        const profile = await createMarketplaceUserProfile({
          idUser: session.user.id,
          username,
          email: session.user.email,
          avatarUrl: session.user.image,
          provider: providerData.provider,
          providerId: providerData.providerId,
        })

        return Response.json(profile, { status: 201 })
      },
    },
  },
})
