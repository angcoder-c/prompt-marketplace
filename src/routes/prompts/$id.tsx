import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { PromptDetailModal } from '#/components/prompt-detail-modal'

export const Route = createFileRoute('/prompts/$id')({
  component: PromptDetail,
})

function PromptDetail() {
  const { id } = Route.useParams()
  const navigate = useNavigate({ from: Route.fullPath })

  return (
    <PromptDetailModal
      open
      promptId={id}
      mode="page"
      onClose={() => {
        void navigate({ to: '/' })
      }}
    />
  )
}
