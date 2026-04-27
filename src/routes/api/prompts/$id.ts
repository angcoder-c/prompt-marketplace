import { createFileRoute } from '@tanstack/react-router'

import { auth } from '#/lib/auth'
import {
  findPromptOwner,
  findPromptById,
  hasUserPurchasedPrompt,
  findUserVote,
  updatePrompt,
  deletePrompt,
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

export const Route = createFileRoute('/api/prompts/$id')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const promptId = params.id
        const prompt = await findPromptById(promptId)

        if (!prompt) {
          return Response.json(
            { error: { code: 'PROMPT_NOT_FOUND', message: 'Prompt not found' } },
            { status: 404 },
          )
        }

        const session = await auth.api.getSession({ headers: request.headers })
        const userId = session?.user?.id ?? null

        const isOwner = Boolean(userId && userId === prompt.user_id)
        const isPurchased = userId
          ? await hasUserPurchasedPrompt(userId, prompt.id_prompt)
          : false

        if (!prompt.is_published && !isOwner) {
          return Response.json(
            { error: { code: 'PROMPT_NOT_FOUND', message: 'Prompt not found' } },
            { status: 404 },
          )
        }

        const userVote = userId ? await findUserVote(userId, prompt.id_prompt) : null

        return Response.json(
          {
            id_prompt: prompt.id_prompt,
            user: {
              id_user: prompt.user_id,
              username: prompt.username,
              avatar_url: prompt.avatar_url,
              airank: prompt.airank,
            },
            title: prompt.title,
            content: isOwner || isPurchased ? prompt.content : null,
            description: prompt.description,
            model: prompt.model,
            aipoints_price: prompt.aipoints_price,
            upvotes: prompt.upvotes,
            downvotes: prompt.downvotes,
            uses_count: prompt.uses_count,
            is_published: Boolean(prompt.is_published),
            is_purchased: isPurchased,
            is_owner: isOwner,
            user_vote: userVote,
            tags: prompt.tags,
            response: {
              content: prompt.response_preview.content,
              tokens_prompt: prompt.response_preview.tokens_prompt,
              tokens_response: prompt.response_preview.tokens_response,
            },
            created_at: prompt.created_at,
            updated_at: prompt.updated_at,
          },
          { status: 200 },
        )
      },
      PATCH: async ({ request, params }) => {
        const session = await auth.api.getSession({ headers: request.headers })

        if (!session?.user) {
          return Response.json(
            { error: { code: 'UNAUTHORIZED', message: 'Invalid or expired session' } },
            { status: 401 },
          )
        }

        const promptId = params.id
        const owner = await findPromptOwner(promptId)
        if (!owner) {
          return Response.json(
            { error: { code: 'PROMPT_NOT_FOUND', message: 'Prompt not found' } },
            { status: 404 },
          )
        }

        if (owner.user_id !== session.user.id) {
          return Response.json(
            { error: { code: 'FORBIDDEN', message: 'Only the owner can update this prompt' } },
            { status: 403 },
          )
        }

        const body = (await request.json().catch(() => ({}))) as PromptBody

        const updated = await updatePrompt({
          promptId,
          title: body.title?.trim(),
          content: body.content?.trim(),
          description: body.description,
          model: body.model?.trim(),
          aipointsPrice:
            body.aipoints_price !== undefined
              ? Math.max(0, Number(body.aipoints_price))
              : undefined,
          isPublished:
            body.is_published !== undefined ? Boolean(body.is_published) : undefined,
          tags: Array.isArray(body.tags) ? body.tags : undefined,
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

        const promptId = params.id
        const owner = await findPromptOwner(promptId)
        if (!owner) {
          return Response.json(
            { error: { code: 'PROMPT_NOT_FOUND', message: 'Prompt not found' } },
            { status: 404 },
          )
        }

        if (owner.user_id !== session.user.id) {
          return Response.json(
            { error: { code: 'FORBIDDEN', message: 'Only the owner can delete this prompt' } },
            { status: 403 },
          )
        }

        await deletePrompt(promptId)
        return new Response(null, { status: 204 })
      },
    },
  },
})
