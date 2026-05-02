import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight, ChevronLeft, ChevronRight, Flame, Trophy, Users } from 'lucide-react'

import { Sidebar } from '../components/sidebar'

type RankingUser = {
	rank: number
	airank: number
	total_upvotes: number
	total_downvotes: number
	prompts_published: number
	user: {
		id_user: string
		username: string
		avatar_url: string | null
	}
}

type RankingResponse = {
	stats: {
		active_users: number
		posts_last_24h: number
		trending_model: string | null
	}
	data: RankingUser[]
	pagination: {
		page: number
		limit: number
		total: number
	}
}

const pageSize = 10

export const Route = createFileRoute('/ranking')({ component: RankingPage })

function RankingPage() {
	const [page, setPage] = useState(1)
	const [response, setResponse] = useState<RankingResponse | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		let cancelled = false

		const loadRanking = async () => {
			setLoading(true)
			setError(null)

			try {
				const url = new URL('/api/ranking', window.location.origin)
				url.searchParams.set('page', String(page))
				url.searchParams.set('limit', String(pageSize))

				const res = await fetch(url)
				const data = (await res.json().catch(() => null)) as RankingResponse | { error?: { message?: string } } | null

				if (!res.ok) {
					throw new Error((data as { error?: { message?: string } } | null)?.error?.message || 'No se pudo cargar el ranking')
				}

				if (!cancelled) {
					setResponse(data as RankingResponse)
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

		void loadRanking()

		return () => {
			cancelled = true
		}
	}, [page])

	const totalPages = useMemo(() => {
		const total = response?.pagination.total ?? 0
		return Math.max(1, Math.ceil(total / pageSize))
	}, [response?.pagination.total])

	const topThree = response?.data.slice(0, 3) ?? []
	const rows = response?.data ?? []

	return (
		<div className="min-h-screen bg-[#0b1020] text-slate-100">
			<Sidebar active="ranking" />

			<main className="min-h-screen min-w-0 lg:pl-72">
				<div className="p-4 sm:p-6 lg:p-8">
					<div className="mx-auto max-w-6xl space-y-6">
						<section className="rounded-3xl border border-white/10 bg-[#111a34] p-6 shadow-[0_16px_60px_-28px_rgba(0,0,0,0.75)]">
							<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/80">Leaderboard</p>
									<h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">Ranking</h1>
									<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
										Usuarios con mayor <span className="text-white">airank</span>, ordenados por posición y paginados para explorar toda la tabla.
									</p>
								</div>

								<div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
									<Trophy className="h-4 w-4 text-cyan-200" />
									Top AI architects
								</div>
							</div>

							<div className="mt-5 grid gap-4 md:grid-cols-3">
								<StatCard icon={<Users className="h-5 w-5" />} label="Usuarios activos" value={String(response?.stats.active_users ?? 0)} />
								<StatCard icon={<Flame className="h-5 w-5" />} label="Posts últimas 24h" value={String(response?.stats.posts_last_24h ?? 0)} />
								<StatCard icon={<ArrowUpRight className="h-5 w-5" />} label="Modelo tendencia" value={response?.stats.trending_model ?? 'Sin datos'} />
							</div>
						</section>

						<section className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
							<div className="rounded-3xl border border-white/10 bg-[#111a34] p-4 shadow-[0_16px_60px_-28px_rgba(0,0,0,0.75)]">
								<div className="mb-4 flex items-center justify-between">
									<div>
										<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Ranked users</p>
										<h2 className="mt-1 text-xl font-semibold text-white">Usuarios con más airank</h2>
									</div>
									<div className="text-sm text-slate-400">Página {response?.pagination.page ?? page} de {totalPages}</div>
								</div>

								{loading ? (
									<div className="space-y-3">
										{Array.from({ length: pageSize }).map((_, index) => (
											<div key={index} className="h-20 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
										))}
									</div>
								) : error ? (
									<div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>
								) : rows.length > 0 ? (
									<div className="space-y-3">
										{rows.map((entry) => (
											<RankingRow key={entry.user.id_user} entry={entry} />
										))}
									</div>
								) : (
									<div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
										No hay usuarios para mostrar.
									</div>
								)}

								<div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
									<button
										className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
										onClick={() => setPage((current) => Math.max(1, current - 1))}
										disabled={page <= 1 || loading}
									>
										<ChevronLeft className="h-4 w-4" />
										Anterior
									</button>

									<div className="flex items-center gap-1">
										{Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => {
											const active = pageNumber === page;
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

							<div className="space-y-4">
								<div className="rounded-3xl border border-white/10 bg-[#111a34] p-4 shadow-[0_16px_60px_-28px_rgba(0,0,0,0.75)]">
									<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Top 3</p>
									<div className="mt-4 space-y-3">
										{topThree.map((entry) => (
											<div key={entry.user.id_user} className="rounded-2xl border border-white/10 bg-white/5 p-3">
												<div className="flex items-center justify-between gap-3">
													<div>
														<div className="text-sm font-semibold text-white">#{entry.rank} {entry.user.username}</div>
														<div className="text-xs text-slate-400">{entry.prompts_published} prompts publicados</div>
													</div>
													<div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-200">{entry.airank}</div>
												</div>
											</div>
										))}
									</div>
								</div>

								<div className="rounded-3xl border border-white/10 bg-[#111a34] p-4 shadow-[0_16px_60px_-28px_rgba(0,0,0,0.75)]">
									<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">About airank</p>
									<p className="mt-3 text-sm leading-6 text-slate-300">
										Airank refleja la actividad y reputación del usuario dentro del marketplace. La lista se ordena del mayor al menor valor.
									</p>
								</div>
							</div>
						</section>
					</div>
				</div>
			</main>
		</div>
	)
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
	return (
		<div className="rounded-3xl border border-white/10 bg-[#0c1326] p-4">
			<div className="flex items-center gap-3 text-slate-300">
				<div className="rounded-2xl border border-white/10 bg-white/5 p-2 text-cyan-200">{icon}</div>
				<p className="text-sm font-medium">{label}</p>
			</div>
			<div className="mt-4 text-3xl font-semibold tracking-tight text-white">{value}</div>
		</div>
	)
}

function RankingRow({ entry }: { entry: RankingUser }) {
	const rankClass =
		entry.rank === 1
			? 'border-cyan-300/30 bg-cyan-300/10'
			: entry.rank === 2
				? 'border-violet-300/30 bg-violet-300/10'
				: entry.rank === 3
					? 'border-rose-300/30 bg-rose-300/10'
					: 'border-white/10 bg-white/5'

	return (
		<div className={`rounded-3xl border p-4 ${rankClass}`}>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0b1020] text-lg font-semibold text-cyan-200">
						#{entry.rank}
					</div>
					<div>
						<div className="text-lg font-semibold text-white">{entry.user.username}</div>
						<div className="text-sm text-slate-400">{entry.prompts_published} prompts publicados</div>
					</div>
				</div>

				<div className="grid gap-3 text-right sm:grid-cols-3 sm:gap-4">
					<div>
						<div className="text-xs uppercase tracking-[0.2em] text-slate-500">airank</div>
						<div className="mt-1 text-2xl font-semibold text-white">{entry.airank}</div>
					</div>
					<div>
						<div className="text-xs uppercase tracking-[0.2em] text-slate-500">votos a favor</div>
						<div className="mt-1 text-2xl font-semibold text-white">{entry.total_upvotes}</div>
					</div>
					<div>
						<div className="text-xs uppercase tracking-[0.2em] text-slate-500">votos en contra</div>
						<div className="mt-1 text-2xl font-semibold text-white">{entry.total_downvotes}</div>
					</div>
				</div>
			</div>
		</div>
	)
}
