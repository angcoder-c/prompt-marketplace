import { useEffect, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'

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

type FavoritesResponse = {
	data: Prompt[]
	pagination: {
		page: number
		limit: number
		total: number
	}
}

type FollowedTag = {
	id_tag: string
	name: string
	slug: string
	description: string | null
	followed_at: string
}

type FollowedTagsResponse = {
	data: FollowedTag[]
}

const pageSize = 8

export const Route = createFileRoute('/favorites')({
	validateSearch: (search: Record<string, unknown>) => ({
		prompt: typeof search.prompt === 'string' ? search.prompt : undefined,
	}),
	component: FavoritesPage,
})

function FavoritesPage() {
	const navigate = useNavigate({ from: Route.fullPath })
	const { prompt: selectedPromptId } = Route.useSearch()
	const { profile } = useMarketplaceProfile()
	const [response, setResponse] = useState<FavoritesResponse | null>(null)
	const [followedTags, setFollowedTags] = useState<FollowedTag[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		let cancelled = false

		const load = async () => {
			setLoading(true)
			setError(null)

			try {
				const favoritesUrl = new URL('/api/users/me/favorites', window.location.origin)
				favoritesUrl.searchParams.set('page', '1')
				favoritesUrl.searchParams.set('limit', String(pageSize))
				favoritesUrl.searchParams.set('sort', 'recent')

				const [favoritesRes, tagsRes] = await Promise.all([
					fetch(favoritesUrl, {
						credentials: 'include',
						headers: { Accept: 'application/json' },
					}),
					fetch('/api/users/me/following-tags', {
						credentials: 'include',
						headers: { Accept: 'application/json' },
					}),
				])

				const favoritesData = (await favoritesRes.json().catch(() => null)) as FavoritesResponse | { error?: { message?: string } } | null
				const tagsData = (await tagsRes.json().catch(() => null)) as FollowedTagsResponse | { error?: { message?: string } } | null
				const favoritesError = favoritesData && 'error' in favoritesData ? favoritesData.error : undefined
				const tagsError = tagsData && 'error' in tagsData ? tagsData.error : undefined

				if (!favoritesRes.ok) {
					throw new Error(favoritesError?.message || 'No se pudieron cargar tus favoritos')
				}

				if (!tagsRes.ok) {
					throw new Error(tagsError?.message || 'No se pudieron cargar tus categorías seguidas')
				}

				if (!cancelled) {
					setResponse(favoritesData as FavoritesResponse)
					setFollowedTags((tagsData as FollowedTagsResponse).data ?? [])
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

		void load()

		return () => {
			cancelled = true
		}
	}, [])

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
		<main className="min-h-screen bg-[#0b1020] text-slate-100">
			<Sidebar active="favorites" />

			<div className="min-h-screen lg:pl-72">
				<div className="p-4 sm:p-6 lg:p-8">
					<div className="mx-auto max-w-6xl space-y-6">
						<div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#111a34] p-5 shadow-[0_16px_60px_-28px_rgba(0,0,0,0.75)] lg:flex-row lg:items-end lg:justify-between">
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">Favorites feed</p>
								<h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Favoritos</h1>
								<p className="mt-2 max-w-2xl text-sm text-slate-400">Prompts publicados en las categorías que sigues.</p>
							</div>

							<div className="flex flex-wrap gap-2 text-sm text-slate-300">
								<span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">{followedTags.length} categorías seguidas</span>
								<span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">{response?.pagination.total ?? 0} prompts</span>
							</div>
						</div>

						{followedTags.length > 0 && (
							<div className="rounded-3xl border border-white/10 bg-[#111a34] p-4">
								<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Categorías seguidas</p>
								<div className="mt-3 flex flex-wrap gap-2">
									{followedTags.map((tag) => (
										<Link
											key={tag.id_tag}
											to="/tags/$slug"
											params={{ slug: tag.slug }}
											className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15"
										>
											{tag.name}
										</Link>
									))}
								</div>
							</div>
						)}

						{loading && <p className="text-slate-300">Cargando...</p>}
						{error && <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-rose-200">{error}</p>}

						{!loading && !error && (
							<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
								{prompts.map((prompt) => (
									<PromptFeedCard
										key={prompt.id_prompt}
										prompt={prompt}
										currentUserId={profile?.id_user ?? null}
										availableAipoints={profile?.aipoints ?? null}
									onClick={() => openPromptDetail(prompt)}
									/>
								))}

								{prompts.length === 0 && (
									<div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-300 md:col-span-2 xl:col-span-3">
										Aún no sigues categorías o no hay prompts publicados en esas categorías.
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
				mode="modal"
				onClose={closePromptDetail}
				/>
			</main>
	)
}