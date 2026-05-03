import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

import { Sidebar } from '#/components/sidebar'
import { PromptDetailModal } from '#/components/prompt-detail-modal'
import { PromptFeedCard } from '#/components/promptfeedcard'
import { useMarketplaceProfile } from '#/hooks/useMarketplaceProfile'

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

export const Route = createFileRoute('/tags/$slug')({
  validateSearch: (search: Record<string, unknown>) => ({
    prompt: typeof search.prompt === 'string' ? search.prompt : undefined,
  }),
  component: TagPromptsPage,
})

function TagPromptsPage() {
  const { slug } = Route.useParams()
  const navigate = useNavigate({ from: Route.fullPath })
  const { prompt: selectedPromptId } = Route.useSearch()
  const { profile } = useMarketplaceProfile()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [tagName, setTagName] = useState('')
  const [tagFollowersCount, setTagFollowersCount] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/tags/${slug}`, {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })

        const data = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(data?.error?.message || 'No se pudo cargar la categoría')
        }

        if (!cancelled) {
          setTagName(data.tag?.name || slug)
          setTagFollowersCount(Number(data.tag?.followers_count ?? 0))
          setIsFollowing(Boolean(data.is_following))
          setPrompts(data.prompts?.data || [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error cargando prompts')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [slug])

  const selectedPrompt = selectedPromptId
    ? prompts.find((p) => p.id_prompt === selectedPromptId) ?? null
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

  const toggleFollowTag = async () => {
    if (followLoading) {
      return
    }

    setFollowLoading(true)

    try {
      const response = await fetch(`/api/tags/${slug}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error?.message || 'No se pudo actualizar el seguimiento de la categoría')
      }

      setIsFollowing(Boolean(data?.following))
      setTagFollowersCount((current) => Math.max(0, current + (isFollowing ? -1 : 1)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el seguimiento de la categoría')
    } finally {
      setFollowLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0b1020] text-slate-100">
      <Sidebar active="categories" />

      <div className="min-h-screen lg:pl-72">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-[#111a34] p-5 shadow-[0_16px_60px_-28px_rgba(0,0,0,0.75)]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">Categoría</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                  {tagName || slug}
                </h1>
                <p className="mt-2 text-sm text-slate-400">
                  {tagFollowersCount} seguidores · Prompts en esta categoría
                </p>
              </div>
              <div className="ml-auto flex items-center gap-3">
                {profile && (
                  <button
                    onClick={toggleFollowTag}
                    disabled={followLoading}
                    className={`rounded-2xl px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${isFollowing ? 'border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/15' : 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'}`}
                  >
                    {followLoading ? 'Actualizando...' : isFollowing ? 'Dejar de seguir' : 'Seguir categoría'}
                  </button>
                )}
                <button
                  onClick={() => navigate({ to: '/' })}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                >
                  Volver al inicio
                </button>
              </div>
            </div>

            {loading && (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-40 animate-pulse rounded-3xl bg-white/5" />
                ))}
              </div>
            )}

            {error && (
              <div className="rounded-3xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">
                {error}
              </div>
            )}

            {!loading && !error && (
              <div className="grid gap-4 md:grid-cols-2">
                {prompts.map((p: Prompt) => (
                  <PromptFeedCard
                    key={p.id_prompt}
                    prompt={p}
                    currentUserId={profile?.id_user ?? null}
                    availableAipoints={profile?.aipoints ?? null}
                    onClick={() => openPromptDetail(p)}
                  />
                ))}

                {prompts.length === 0 && (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-300 md:col-span-2">
                    No hay prompts en esta categoría aún.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <PromptDetailModal
        open={Boolean(selectedPromptId)}
        promptId={selectedPromptId ?? null}
        fallbackPrompt={selectedPrompt}
        onClose={closePromptDetail}
      />
    </main>
  )
}
