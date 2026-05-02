import { createFileRoute } from '@tanstack/react-router'

import { auth } from '#/lib/auth'
import { applyPromptVote, findPromptOwner } from '#/lib/db'

type VoteBody = {
  vote_type?: 'up' | 'down'
}

export const Route = createFileRoute('/api/prompts/$id/vote')({
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

        const owner = await findPromptOwner(params.id)
        if (!owner) {
          return Response.json(
            { error: { code: 'PROMPT_NOT_FOUND', message: 'Prompt not found' } },
            { status: 404 },
          )
        }

        if (owner.user_id === session.user.id) {
          return Response.json(
            { error: { code: 'FORBIDDEN', message: 'Cannot vote your own prompt' } },
            { status: 403 },
          )
        }

        const body = (await request.json().catch(() => ({}))) as VoteBody
        if (body.vote_type !== 'up' && body.vote_type !== 'down') {
          return Response.json(
            { error: { code: 'INVALID_VOTE_TYPE', message: 'vote_type must be up or down' } },
            { status: 400 },
          )
        }

        const result = await applyPromptVote({
          userId: session.user.id,
          promptId: params.id,
          voteType: body.vote_type,
        })

        return Response.json(result, { status: 200 })
      },
    },
  },
})
