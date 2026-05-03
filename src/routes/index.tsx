import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

import { authClient } from '#/lib/auth-client'
import { SearchBar } from '#/components/searchbar'
import { PromptDetailModal } from '#/components/prompt-detail-modal'
import { PromptFeedCard } from '#/components/promptfeedcard'
import { Sidebar } from '#/components/sidebar'

type Prompt = {
  id_prompt: string
  user_id: string
  title: string
  description: string | null
  content: string
  model: string
  aipoints_price: number
  username: string
  avatar_url: string | null
  created_at: string
  updated_at: string
  upvotes: number
  downvotes: number
  tags: string[]
}

type PromptResponse = {
  data: Prompt[]
  pagination: {
    page: number
    limit: number
    total: number
  }
}

const pageSize = 8

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>) => ({
    prompt: typeof search.prompt === 'string' ? search.prompt : undefined,
  }),
  component: Home,
})

function Home() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { prompt: selectedPromptId } = Route.useSearch()

  const session = authClient.useSession()
  const user = session.data?.user ?? null

  const [page, setPage] = useState(1)
  const [response, setResponse] = useState<PromptResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadPrompts = async () => {
      setLoading(true)
      setError(null)

      try {
        const url = new URL('/api/prompts', window.location.origin)
        url.searchParams.set('page', String(page))
        url.searchParams.set('limit', String(pageSize))
        url.searchParams.set('sort', 'recent')

        const res = await fetch(url)
        const data = (await res.json().catch(() => null)) as PromptResponse | { error?: { message?: string } } | null

        if (!res.ok) {
          throw new Error((data as { error?: { message?: string } } | null)?.error?.message || 'No se pudo cargar prompts')
        }

        if (!cancelled) {
          setResponse(data as PromptResponse)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error inesperado')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadPrompts()

    return () => {
      cancelled = true
    }
  }, [page])

  const totalPages = useMemo(() => {
    const total = response?.pagination.total ?? 0
    return Math.max(1, Math.ceil(total / pageSize))
  }, [response?.pagination.total])

  const prompts = response?.data ?? []
  const selectedPrompt = selectedPromptId
    ? prompts.find((prompt) => prompt.id_prompt === selectedPromptId) ?? null
    : null

  const openPromptDetail = (prompt: Prompt) => {
    void navigate({
      search: (prev) => ({ ...prev, prompt: prompt.id_prompt }),
      mask: {
        to: '/prompts/$id',
        params: { id: prompt.id_prompt },
      },
    })
  }

  const closePromptDetail = () => {
    void navigate({
      search: (prev) => ({ ...prev, prompt: undefined }),
      replace: true,
    })
  }

  return (
    <div className="min-h-screen bg-[#0b1020] text-slate-100">
      <Sidebar active="home" />

      <main className="flex min-h-screen min-w-0 flex-col lg:pl-72">
          <div className="border-b border-white/10 bg-[#0c1326] px-4 py-4 shadow-[0_12px_40px_-28px_rgba(0,0,0,0.85)] sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Descubrimiento del Marketplace</div>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Marketplace de Prompts</h1>
              </div>

              <div className="flex flex-wrap gap-3">
                {user && (
                  <Link
                    to="/create"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                  >
                    <Sparkles className="h-4 w-4" />
                    Crear Prompt
                  </Link>
                )}
                {user && (
                  <Link
                    to="/my-prompts"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                  >
                    Mis Prompts
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 rounded-3xl border border-white/10 bg-[#111a34] p-3 sm:flex-row sm:items-center">
              <SearchBar />

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">{response?.pagination.total ?? 0} prompts</span>
              </div>
            </div>
          </div>

          <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {loading ? (
                Array.from({ length: pageSize }).map((_, index) => (
                  <div key={index} className="h-44 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
                ))
              ) : error ? (
                <div className="rounded-3xl border border-rose-400/30 bg-rose-500/10 p-5 text-sm text-rose-200">{error}</div>
              ) : prompts.length > 0 ? (
                prompts.map((prompt) => (
                  <PromptFeedCard
                    key={prompt.id_prompt}
                    prompt={prompt}
                    currentUserId={user?.id ?? null}
                    availableAipoints={user ? 100 : null}
                    onClick={() => openPromptDetail(prompt)}
                  />
                ))
              ) : (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300 md:col-span-2 xl:col-span-3">
                  No hay prompts para mostrar.
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-400">
                Página <span className="text-slate-100">{response?.pagination.page ?? page}</span> de <span className="text-slate-100">{totalPages}</span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>

                <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-[#0e1427] p-1">
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
                    const pageNumber = index + 1
                    const active = pageNumber === page
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setPage(pageNumber)}
                        className={`min-w-10 rounded-xl px-3 py-2 text-sm transition ${active ? 'bg-cyan-300 text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
                      >
                        {pageNumber}
                      </button>
                    )
                  })}
                </div>

                <button
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page >= totalPages || loading}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
      </main>

      <PromptDetailModal
        open={Boolean(selectedPromptId)}
        promptId={selectedPromptId ?? null}
        fallbackPrompt={selectedPrompt}
        onClose={closePromptDetail}
      />
    </div>
  )
}
