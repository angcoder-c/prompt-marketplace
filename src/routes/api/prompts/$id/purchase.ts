import { createFileRoute } from '@tanstack/react-router'

import { auth } from '#/lib/auth'
import { findMarketplaceUserById, purchasePrompt } from '#/lib/db'

export const Route = createFileRoute('/api/prompts/$id/purchase')({
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

				const profile = await findMarketplaceUserById(session.user.id)
				if (!profile) {
					return Response.json(
						{
							error: {
								code: 'PROFILE_NOT_FOUND',
								message: 'Complete profile setup first using POST /api/users/setup',
							},
						},
						{ status: 404 },
					)
				}

				const result = await purchasePrompt({
					buyerUserId: session.user.id,
					promptId: params.id,
				})

				if (result.status === 'not_found') {
					return Response.json(
						{ error: { code: 'PROMPT_NOT_FOUND', message: 'Prompt not found' } },
						{ status: 404 },
					)
				}

				if (result.status === 'forbidden') {
					return Response.json(
						{ error: { code: 'FORBIDDEN', message: 'Cannot purchase your own prompt' } },
						{ status: 403 },
					)
				}

				if (result.status === 'already_purchased') {
					return Response.json(
						{ error: { code: 'ALREADY_PURCHASED', message: 'You already purchased this prompt' } },
						{ status: 400 },
					)
				}

				if (result.status === 'insufficient_aipoints') {
					return Response.json(
						{
							error: {
								code: 'INSUFFICIENT_AIPOINTS',
								message: 'Not enough AI Points to purchase this prompt',
								details: {
									required: result.required,
									available: result.available,
								},
							},
						},
						{ status: 402 },
					)
				}

				return Response.json(result.purchase, { status: 200 })
			},
		},
	},
})