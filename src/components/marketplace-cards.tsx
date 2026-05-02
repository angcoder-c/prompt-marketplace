export function PromptCard({ prompt }: { prompt: { id_prompt: string; title: string; description?: string | null; aipoints_price?: number; username?: string } }) {
  return (
    <div className="border rounded p-4 shadow-sm bg-white">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{prompt.title}</h3>
          {prompt.description ? <p className="text-sm text-gray-600">{prompt.description}</p> : null}
          <div className="text-xs text-gray-500 mt-2">por {prompt.username || 'anón'}</div>
        </div>
        <div className="text-sm font-medium">{(prompt.aipoints_price ?? 0) + ' AI'}</div>
      </div>
    </div>
  )
}

export default PromptCard
