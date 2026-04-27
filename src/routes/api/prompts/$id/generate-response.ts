import { createFileRoute } from '@tanstack/react-router'

import { auth } from '#/lib/auth'
import {
  createPromptResponse,
  findPromptById,
  findPromptOwner,
} from '#/lib/db'
import { generateFromOpenRouter } from '#/lib/openrouter'

type GenerateBody = {
  model?: string
  manual_response?: string
}

export const Route = createFileRoute('/api/prompts/$id/generate-response')({
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
            {
              error: {
                code: 'FORBIDDEN',
                message: 'Only the owner can generate or save prompt responses',
              },
            },
            { status: 403 },
          )
        }

        const prompt = await findPromptById(promptId)
        if (!prompt) {
          return Response.json(
            { error: { code: 'PROMPT_NOT_FOUND', message: 'Prompt not found' } },
            { status: 404 },
          )
        }

        const body = (await request.json().catch(() => ({}))) as GenerateBody
        const selectedModel = body.model?.trim() || prompt.model || process.env.LLAMA_MODEL || ''
        const manualResponse = body.manual_response?.trim()

        if (manualResponse) {
          const saved = await createPromptResponse({
            promptId,
            content: manualResponse,
            tokensPrompt: null,
            tokensResponse: null,
          })

          return Response.json(saved, { status: 200 })
        }

        if (!selectedModel) {
          return Response.json(
            {
              error: {
                code: 'MODEL_REQUIRED',
                message: 'Model is required to generate a response automatically',
              },
            },
            { status: 422 },
          )
        }

        const generated = await generateFromOpenRouter({
          model: selectedModel,
          prompt: prompt.content,
        })

        if (!generated.ok) {
          return Response.json(
            {
              error: {
                code: 'OPENROUTER_UNAVAILABLE',
                message: generated.message,
              },
              fallback: {
                manual_required: true,
                prompt_id: promptId,
                field: 'manual_response',
              },
            },
            { status: 503 },
          )
        }

        const saved = await createPromptResponse({
          promptId,
          content: generated.content,
          tokensPrompt: generated.tokensPrompt,
          tokensResponse: generated.tokensResponse,
        })

        return Response.json(saved, { status: 200 })
      },
    },
  },
})
