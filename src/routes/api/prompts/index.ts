import { createFileRoute } from '@tanstack/react-router'

import { auth } from '#/lib/auth'
import {
  createPrompt,
  listPublishedPrompts,
  findMarketplaceUserById,
} from '#/lib/db'

type PromptBody = {
  title?: string
  content?: string
  description?: string | null
  model?: string
  aipoints_price?: number
  is_published?: boolean
  tags?: string[]
}

const parseNumber = (value: string | null, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('parseNumber', () => {
    it('returns fallback when value is not numeric', () => {
      expect(parseNumber('not-a-number', 20)).toBe(20)
    })
  })
}

export const Route = createFileRoute('/api/prompts/')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const page = parseNumber(url.searchParams.get('page'), 1)
        const limit = parseNumber(url.searchParams.get('limit'), 20)
        const sortParam = (url.searchParams.get('sort') ?? 'recent').toLowerCase()
        const sort = sortParam === 'popular' || sortParam === 'top_rated' ? sortParam : 'recent'
        const tag = url.searchParams.get('tag') ?? undefined

        const result = await listPublishedPrompts({
          page,
          limit,
          sort,
          tag,
        })

        return Response.json(result, { status: 200 })
      },
      POST: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers })

        if (!session?.user) {
          return Response.json(
            { error: { code: 'UNAUTHORIZED', message: 'Invalid or expired session' } },
            { status: 401 },
          )
        }

        const localProfile = await findMarketplaceUserById(session.user.id)
        if (!localProfile) {
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

        const body = (await request.json().catch(() => ({}))) as PromptBody

        const title = body.title?.trim() ?? ''
        const content = body.content?.trim() ?? ''
        const model = body.model?.trim() ?? ''
        const aipointsPrice = Math.max(0, Number(body.aipoints_price ?? 0))

        if (!title || !content || !model) {
          return Response.json(
            {
              error: {
                code: 'MISSING_FIELDS',
                message: 'title, content and model are required',
              },
            },
            { status: 400 },
          )
        }

        const created = await createPrompt({
          userId: session.user.id,
          title,
          content,
          description: body.description ?? null,
          model,
          aipointsPrice,
          isPublished: Boolean(body.is_published),
          tags: Array.isArray(body.tags) ? body.tags : [],
        })

        return Response.json(created, { status: 201 })
      },
    },
  },
})
