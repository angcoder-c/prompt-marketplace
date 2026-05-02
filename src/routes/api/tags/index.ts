import { createFileRoute } from '@tanstack/react-router'

import { listTags } from '#/lib/db'

export const Route = createFileRoute('/api/tags/')({
  server: {
    handlers: {
      GET: async () => {
        const result = await listTags()
        return Response.json(result, { status: 200 })
      },
    },
  },
})
