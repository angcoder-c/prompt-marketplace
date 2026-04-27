import { create } from 'zustand'

interface VoteState {
  userVote: 'up' | 'down' | null
  upvotes: number
  downvotes: number
  loading: boolean
  setUserVote: (vote: 'up' | 'down' | null) => void
  setUpvotes: (upvotes: number) => void
  setDownvotes: (downvotes: number) => void
  setLoading: (loading: boolean) => void
  optimisticVote: (type: 'up' | 'down') => void
  reset: () => void
}

const initialState = {
  userVote: null,
  upvotes: 0,
  downvotes: 0,
  loading: false,
}

export const useVoteStore = create<VoteState>((set, get) => ({
  ...initialState,
  setUserVote: (userVote) => set({ userVote }),
  setUpvotes: (upvotes) => set({ upvotes }),
  setDownvotes: (downvotes) => set({ downvotes }),
  setLoading: (loading) => set({ loading }),
  optimisticVote: (type) => {
    const state = get()
    if (state.userVote === type) {
      set({
        userVote: null,
        upvotes: type === 'up' ? state.upvotes - 1 : state.upvotes,
        downvotes: type === 'down' ? state.downvotes - 1 : state.downvotes,
      })
    } else {
      const prevUp = state.userVote === 'up' ? 1 : 0
      const prevDown = state.userVote === 'down' ? 1 : 0
      set({
        userVote: type,
        upvotes: state.upvotes + (type === 'up' ? 1 : 0) - prevUp,
        downvotes: state.downvotes + (type === 'down' ? 1 : 0) - prevDown,
      })
    }
  },
  reset: () => set(initialState),
}))