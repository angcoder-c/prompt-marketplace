import { createFileRoute } from '@tanstack/react-router'
import { useSearch as useSearchHook } from '../hooks/useSearch'

interface SearchResult {
  id_prompt: string;
  title: string;
  description: string | null;
  content: string;
  model: string;
  aipoints_price: number;
  upvotes: number;
  downvotes: number;
  username: string;
  avatar_url: string | null;
  created_at: string;
  tags: string[];
}

interface SearchResponse {
  query: string;
  data: SearchResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export const Route = createFileRoute('/search')({
  validateSearch: (search: Record<string, unknown>) => {
    return { q: (search.q as string) || '' }
  },
  component: SearchPage,
})

function SearchPage() {
  const { q } = Route.useSearch()
  const { data, isLoading, isError } = useSearchHook({
    q,
    page: 1,
    limit: 20,
  })

  return (
    <div className="min-h-screen bg-[#0b1020] text-slate-100">
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <h1 className="mb-6 text-2xl font-semibold text-white">
          Resultados de búsqueda: "{q}"
        </h1>

        {isLoading && (
          <div className="py-8 text-center text-sm text-slate-400">
            Buscando...
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">
            Error al buscar. Intenta de nuevo.
          </div>
        )}

        {!isLoading && !isError && data?.data && (
          <>
            {data.data.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-slate-400">
                No se encontraron resultados para "{q}"
              </div>
            ) : (
              <div className="space-y-3">
                {data.data.map((result) => (
                  <div
                    key={result.id_prompt}
                    className="rounded-2xl border border-white/10 bg-[#111a34] p-4 transition hover:border-cyan-300/20"
                  >
                    <h2 className="text-lg font-medium text-white">{result.title}</h2>
                    {result.description && (
                      <p className="mt-2 text-sm text-slate-400">{result.description}</p>
                    )}
                    <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                      <span>{result.username}</span>
                      <span>•</span>
                      <span>{result.upvotes} votos</span>
                      <span>•</span>
                      <span>{result.aipoints_price} AIP</span>
                      <span>•</span>
                      <span className="rounded-lg bg-white/5 px-2 py-0.5 text-cyan-200">
                        {result.model}
                      </span>
                    </div>
                    {result.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {result.tags.map((tag: string, i: number) => (
                          <span
                            key={i}
                            className="rounded-lg bg-cyan-300/10 px-2 py-0.5 text-xs text-cyan-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
