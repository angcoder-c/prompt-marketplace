import { createFileRoute } from '@tanstack/react-router'

import { auth } from '#/lib/auth'
import {
  deletePromptComment,
  findCommentOwner,
  updatePromptComment,
} from '#/lib/db'

type CommentBody = {
  content?: string
}

export const Route = createFileRoute('/api/prompts/$id/comments/$comment_id')({
  server: {
    handlers: {
      PATCH: async ({ request, params }) => {
        const session = await auth.api.getSession({ headers: request.headers })

        if (!session?.user) {
          return Response.json(
            { error: { code: 'UNAUTHORIZED', message: 'Invalid or expired session' } },
            { status: 401 },
          )
        }

        const owner = await findCommentOwner(params.comment_id)
        if (!owner || owner.prompt_id !== params.id) {
          return Response.json(
            { error: { code: 'COMMENT_NOT_FOUND', message: 'Comment not found' } },
            { status: 404 },
          )
        }

        if (owner.user_id !== session.user.id) {
          return Response.json(
            { error: { code: 'FORBIDDEN', message: 'Only author can edit comment' } },
            { status: 403 },
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

        const updated = await updatePromptComment({
          commentId: params.comment_id,
          content,
        })

        return Response.json(updated, { status: 200 })
      },
      DELETE: async ({ request, params }) => {
        const session = await auth.api.getSession({ headers: request.headers })

        if (!session?.user) {
          return Response.json(
            { error: { code: 'UNAUTHORIZED', message: 'Invalid or expired session' } },
            { status: 401 },
          )
        }

        const owner = await findCommentOwner(params.comment_id)
        if (!owner || owner.prompt_id !== params.id) {
          return Response.json(
            { error: { code: 'COMMENT_NOT_FOUND', message: 'Comment not found' } },
            { status: 404 },
          )
        }

        if (owner.user_id !== session.user.id) {
          return Response.json(
            { error: { code: 'FORBIDDEN', message: 'Only author can delete comment' } },
            { status: 403 },
          )
        }

        await deletePromptComment(params.comment_id)
        return new Response(null, { status: 204 })
      },
    },
  },
})
