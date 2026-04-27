import { createFileRoute } from '@tanstack/react-router'

import { auth } from '#/lib/auth'
import {
  createPromptComment,
  findPromptOwner,
  listPromptComments,
} from '#/lib/db'

const parseNumber = (value: string | null, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

type CommentBody = {
  content?: string
}

export const Route = createFileRoute('/api/prompts/$id/comments/')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const owner = await findPromptOwner(params.id)
        if (!owner) {
          return Response.json(
            { error: { code: 'PROMPT_NOT_FOUND', message: 'Prompt not found' } },
            { status: 404 },
          )
        }

        const url = new URL(request.url)
        const page = parseNumber(url.searchParams.get('page'), 1)
        const limit = parseNumber(url.searchParams.get('limit'), 20)

        const result = await listPromptComments({
          promptId: params.id,
          page,
          limit,
        })

        return Response.json(result, { status: 200 })
      },
      POST: async ({ request, params }) => {
        const session = await auth.api.getSession({ headers: request.headers })

        if (!session?.user) {
          return Response.json(
            { error: { code: 'UNAUTHORIZED', message: 'Invalid or expired session' } },
            { status: 401 },
          )
        }

        const owner = await findPromptOwner(params.id)
        if (!owner) {
          return Response.json(
            { error: { code: 'PROMPT_NOT_FOUND', message: 'Prompt not found' } },
            { status: 404 },
          )
        }

        const body = (await request.json().catch(() => ({}))) as CommentBody
        const content = body.content?.trim() ?? ''

        if (!content) {
          return Response.json(
            { error: { code: 'CONTENT_REQUIRED', message: 'content is required' } },
            { status: 400 },
          )
        }

        const created = await createPromptComment({
          userId: session.user.id,
          promptId: params.id,
          content,
        })

        return Response.json(created, { status: 201 })
      },
    },
  },
})
