import { useEffect, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'

import { PromptDetailModal } from '../components/prompt-detail-modal'
import { Sidebar } from '../components/sidebar'
import { useMarketplaceProfile } from '../hooks/useMarketplaceProfile'
import { PromptFeedCard } from '../components/promptfeedcard'

type MyPromptsResponse = {
	created: any[]
	purchased: any[]
}

export const Route = createFileRoute('/my-prompts')({
	validateSearch: (search: Record<string, unknown>) => ({
		prompt: typeof search.prompt === 'string' ? search.prompt : undefined,
	}),
	component: RouteComponent,
})

function RouteComponent() {
	const navigate = useNavigate({ from: Route.fullPath })
	const { prompt: selectedPromptId } = Route.useSearch()
	const { profile } = useMarketplaceProfile()
	const [created, setCreated] = useState<any[]>([])
	const [purchased, setPurchased] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		let cancelled = false

		const load = async () => {
			setLoading(true)
			setError(null)

			try {
				const response = await fetch('/api/users/me/prompts', {
					credentials: 'include',
					headers: { Accept: 'application/json' },
				})
				const data = (await response.json().catch(() => ({}))) as MyPromptsResponse & {
					error?: { message?: string }
				}

				if (!response.ok) {
					throw new Error(data?.error?.message || 'No se pudieron cargar tus prompts')
				}

				if (!cancelled) {
					setCreated(data.created ?? [])
					setPurchased(data.purchased ?? [])
				}
			} catch (err) {
				if (!cancelled) setError(err instanceof Error ? err.message : 'Error loading prompts')
			} finally {
				if (!cancelled) setLoading(false)
			}
		}

		void load()
		return () => {
			cancelled = true
		}
	}, [])

	const allPrompts = [...created, ...purchased]
	const selectedPrompt = selectedPromptId
		? allPrompts.find((p) => p.id_prompt === selectedPromptId) ?? null
		: null

	const openPromptDetail = (prompt: any) => {
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
			<Sidebar active="my-prompts" />

			<div className="min-h-screen lg:pl-72">
				<div className="p-4 sm:p-6 lg:p-8">
					<div className="mx-auto max-w-5xl space-y-6">
						<div className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-[#111a34] p-5 shadow-[0_16px_60px_-28px_rgba(0,0,0,0.75)]">
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">Library</p>
								<h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Mis prompts</h1>
								<p className="mt-2 text-sm text-slate-400">Tus prompts creados y los que ya compraste.</p>
							</div>
							<Link to="/create" className="rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">
								Create Prompt
							</Link>
						</div>

						{loading && <p className="text-slate-300">Cargando...</p>}
						{error && <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-rose-200">{error}</p>}

						<section className="space-y-3">
							<h2 className="text-lg font-semibold text-white">Creados</h2>
							<div className="grid gap-4 md:grid-cols-2">
								{created.map((p) => (
									<PromptFeedCard
										key={p.id_prompt}
										prompt={p}
										currentUserId={profile?.id_user ?? null}
										availableAipoints={profile?.aipoints ?? null}
										onClick={() => openPromptDetail(p)}
									/>
								))}
								{!loading && created.length === 0 && (
									<div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-300 md:col-span-2">
										No tienes prompts creados.
									</div>
								)}
							</div>
						</section>

						<section className="space-y-3">
							<h2 className="text-lg font-semibold text-white">Comprados</h2>
							<div className="grid gap-4 md:grid-cols-2">
								{purchased.map((p) => (
									<PromptFeedCard
										key={p.id_prompt}
										prompt={p}
										currentUserId={profile?.id_user ?? null}
										availableAipoints={profile?.aipoints ?? null}
										onClick={() => openPromptDetail(p)}
									/>
								))}
								{!loading && purchased.length === 0 && (
									<div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-300 md:col-span-2">
										No has comprado prompts aún.
									</div>
								)}
							</div>
						</section>
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
