import { createFileRoute } from '@tanstack/react-router'

import { listRanking } from '#/lib/db'

const parseNumber = (value: string | null, fallback: number) => {
	const parsed = Number(value)
	return Number.isFinite(parsed) ? parsed : fallback
}

export const Route = createFileRoute('/api/ranking')({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const url = new URL(request.url)
				const page = parseNumber(url.searchParams.get('page'), 1)
				const limit = parseNumber(url.searchParams.get('limit'), 20)

				const result = await listRanking({
					page,
					limit,
				})

				return Response.json(result, { status: 200 })
			},
		},
	},
})