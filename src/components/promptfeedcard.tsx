import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

export function PromptFeedCard({
  prompt,
  currentUserId,
  availableAipoints,
  onClick,
}: {
  prompt: any
  currentUserId?: string | null
  availableAipoints?: number | null
  onClick?: () => unknown
}) {
  const [votingState, setVotingState] = useState<{ type: 'up' | 'down' | null; loading: boolean }>({
    type: null,
    loading: false,
  })

  const handleVote = async (e: React.MouseEvent, voteType: 'up' | 'down') => {
    e.stopPropagation()

    if (!currentUserId || currentUserId === prompt.user_id) return

    setVotingState({ type: voteType, loading: true })

    try {
      const res = await fetch(`/api/prompts/${prompt.id_prompt}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ vote_type: voteType }),
      })

      if (res.ok) {
        // Update local vote state
        setVotingState({ type: voteType, loading: false })
      } else {
        setVotingState({ type: null, loading: false })
      }
    } catch (err) {
      console.error('Vote error:', err)
      setVotingState({ type: null, loading: false })
    }
  }

  const interactiveProps = onClick
    ? {
        role: 'button' as const,
        tabIndex: 0,
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onClick()
          }
        },
      }
    : {}

  return (
    <article
      onClick={onClick}
      className={`rounded-3xl border border-white/10 bg-[#111a34] p-4 text-slate-100 shadow-[0_16px_60px_-28px_rgba(0,0,0,0.75)] transition hover:-translate-y-0.5 hover:border-cyan-300/20 hover:bg-[#131d3a] ${onClick ? 'cursor-pointer' : ''}`}
      {...interactiveProps}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/80">Prompt del Marketplace</div>
          <h3 className="mt-2 truncate text-lg font-semibold text-white">{prompt.title}</h3>
        </div>
        <span className="rounded-full border border-violet-300/30 bg-violet-300/10 px-2.5 py-1 text-xs font-semibold text-violet-200">
          {(prompt.aipoints_price ?? 0) + ' AIP'}
        </span>
      </div>

      {prompt.description ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{prompt.description}</p> : null}

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div>
            <span className="text-slate-300">por {prompt.username || 'anón'}</span>
            {currentUserId && currentUserId === prompt.user_id ? <span className="ml-2 text-cyan-200">• Tú</span> : null}
          </div>
          <div>
            {availableAipoints !== undefined && availableAipoints !== null ? <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-300">{availableAipoints} disponibles</span> : null}
          </div>
        </div>

        {currentUserId && currentUserId !== prompt.user_id ? (
          <div className="flex gap-2">
            <button
              onClick={(e) => handleVote(e, 'up')}
              disabled={votingState.loading}
              className={`rounded-full p-1.5 transition ${
                votingState.type === 'up'
                  ? 'bg-green-500/30 text-green-300'
                  : 'border border-slate-600 bg-slate-800/50 text-slate-400 hover:border-green-500/50 hover:text-green-400'
              } disabled:opacity-50`}
              title="Votar a favor"
            >
              <ThumbsUp className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => handleVote(e, 'down')}
              disabled={votingState.loading}
              className={`rounded-full p-1.5 transition ${
                votingState.type === 'down'
                  ? 'bg-red-500/30 text-red-300'
                  : 'border border-slate-600 bg-slate-800/50 text-slate-400 hover:border-red-500/50 hover:text-red-400'
              } disabled:opacity-50`}
              title="Votar en contra"
            >
              <ThumbsDown className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </article>
  )
}

export default PromptFeedCard
