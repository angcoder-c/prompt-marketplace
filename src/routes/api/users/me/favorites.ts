import { createFileRoute } from '@tanstack/react-router'

import { auth } from '#/lib/auth'
import { findMarketplaceUserById, listPromptsFollowedByUser } from '#/lib/db'

const parseNumber = (value: string | null, fallback: number) => {
	const parsed = Number(value)
	return Number.isFinite(parsed) ? parsed : fallback
}

export const Route = createFileRoute('/api/users/me/favorites')({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const session = await auth.api.getSession({ headers: request.headers })

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

				const url = new URL(request.url)
				const page = parseNumber(url.searchParams.get('page'), 1)
				const limit = parseNumber(url.searchParams.get('limit'), 20)
				const sortParam = (url.searchParams.get('sort') ?? 'recent').toLowerCase()
				const sort = sortParam === 'popular' || sortParam === 'top_rated' ? sortParam : 'recent'

				const result = await listPromptsFollowedByUser({
					userId: session.user.id,
					page,
					limit,
					sort,
				})

				return Response.json(result, { status: 200 })
			},
		},
	},
})