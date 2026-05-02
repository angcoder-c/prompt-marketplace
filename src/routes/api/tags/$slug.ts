import { createFileRoute } from '@tanstack/react-router'
import { auth } from '#/lib/auth'
import { listPromptsByTag } from '#/lib/db'

const parseNumber = (value: string | null, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const Route = createFileRoute('/api/tags/$slug')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const url = new URL(request.url)
        const page = parseNumber(url.searchParams.get('page'), 1)
        const limit = parseNumber(url.searchParams.get('limit'), 20)
        const sortParam = (url.searchParams.get('sort') ?? 'recent').toLowerCase()
        const sort = sortParam === 'popular' || sortParam === 'top_rated' ? sortParam : 'recent'

        const session = await auth.api.getSession({ headers: request.headers })
        const result = await listPromptsByTag({
          slug: params.slug,
          userId: session?.user?.id ?? null,
          page,
          limit,
          sort,
        })

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
