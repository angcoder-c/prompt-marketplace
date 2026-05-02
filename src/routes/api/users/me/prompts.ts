import { createFileRoute } from '@tanstack/react-router'

import { auth } from '#/lib/auth'
import {
	findMarketplaceUserById,
	listPurchasedPromptsByUser,
	listPromptsCreatedByUser,
} from '#/lib/db'

export const Route = createFileRoute('/api/users/me/prompts')({
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

				const [created, purchased] = await Promise.all([
					listPromptsCreatedByUser(session.user.id),
					listPurchasedPromptsByUser(session.user.id),
				])

				return Response.json(
					{
						created: created.data,
						purchased: purchased.data,
					},
					{ status: 200 },
				)
			},
		},
	},
})
