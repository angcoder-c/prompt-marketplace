import { createFileRoute } from '@tanstack/react-router'

import { searchPrompts } from '#/lib/db'

const parseNumber = (value: string | null, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const Route = createFileRoute('/api/search')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const q = (url.searchParams.get('q') ?? '').trim()

        if (!q) {
          return Response.json(
            { error: { code: 'QUERY_REQUIRED', message: 'q is required' } },
            { status: 400 },
          )
        }

        const typeParam = (url.searchParams.get('type') ?? 'all').toLowerCase()
        const type = typeParam === 'tag' ? 'tag' : 'all'
        const page = parseNumber(url.searchParams.get('page'), 1)
        const limit = parseNumber(url.searchParams.get('limit'), 20)

        const result = await searchPrompts({
          q,
          type,
          page,
          limit,
        })

        return Response.json(result, { status: 200 })
      },
    },
  },
})
