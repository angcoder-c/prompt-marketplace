import { createFileRoute } from '@tanstack/react-router'

import { auth } from '#/lib/auth'
import { MODELS } from '#/types'
import { generateFromOpenRouter } from '#/lib/openrouter'

type GenerateBody = {
  prompt?: string
  model?: string
}

export const Route = createFileRoute('/api/generate-response')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers })

        if (!session?.user) {
          return Response.json(
            { error: { code: 'UNAUTHORIZED', message: 'Invalid or expired session' } },
            { status: 401 },
          )
        }

        const body = (await request.json().catch(() => ({}))) as GenerateBody

        const prompt = body.prompt?.trim() ?? ''
        const selectedModel = body.model?.trim() ?? ''

        if (!prompt) {
          return Response.json(
            {
              error: {
                code: 'MISSING_PROMPT',
                message: 'prompt is required',
              },
            },
            { status: 400 },
          )
        }

        if (!selectedModel) {
          return Response.json(
            {
              error: {
                code: 'MODEL_REQUIRED',
                message: 'Model is required to generate a response',
              },
            },
            { status: 422 },
          )
        }

        if (!MODELS.includes(selectedModel as never)) {
          return Response.json(
            {
              error: {
                code: 'INVALID_MODEL',
                message: 'Selected model is not in the allowed list',
                allowed_models: MODELS,
              },
            },
            { status: 422 },
          )
        }

        const generated = await generateFromOpenRouter({
          model: selectedModel,
          prompt,
        })

        if (!generated.ok) {
          return Response.json(
            {
              error: {
                code: 'GENERATION_FAILED',
                message: generated.message,
              },
              fallback: {
                manual_required: true,
                field: 'manual_response',
              },
            },
            { status: 503 },
          )
        }

        return Response.json(
          {
            content: generated.content,
            model: selectedModel,
            tokens_prompt: generated.tokensPrompt,
            tokens_response: generated.tokensResponse,
          },
          { status: 200 },
        )
      },
    },
  },
})
