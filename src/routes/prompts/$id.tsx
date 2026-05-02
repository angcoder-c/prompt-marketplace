import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/prompts/$id')({
  component: PromptDetail,
})

function PromptDetail() {
  const { id } = Route.useParams()

  return (
    <div className="min-h-screen bg-[#0b1020] text-slate-100">
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <div className="rounded-3xl border border-white/10 bg-[#111a34] p-6">
          <h1 className="text-2xl font-semibold text-white">Prompt Detail</h1>
          <p className="mt-2 text-slate-400">ID: {id}</p>
          {/* Aquí irá la lógica para cargar y mostrar el prompt */}
        </div>
      </div>
    </div>
  )
}
