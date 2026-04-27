import { create } from 'zustand'

interface Comment {
  id_comment: string
  prompt_id: string
  user: {
    id_user: string
    username: string
    avatar_url: string | null
  }
  content: string
  created_at: string
  updated_at?: string
}

interface CommentsState {
  comments: Comment[]
  pagination: {
    page: number
    limit: number
    total: number
  }
  newCommentContent: string
  loading: boolean
  submitting: boolean
  setComments: (comments: Comment[] | ((prev: Comment[]) => Comment[])) => void
  addComment: (comment: Comment) => void
  removeComment: (id: string) => void
  setPagination: (pagination: CommentsState['pagination']) => void
  setNewCommentContent: (content: string) => void
  setLoading: (loading: boolean) => void
  setSubmitting: (submitting: boolean) => void
  reset: () => void
}

const initialState = {
  comments: [],
  pagination: { page: 1, limit: 20, total: 0 },
  newCommentContent: '',
  loading: false,
  submitting: false,
}

export const useCommentsStore = create<CommentsState>((set) => ({
  ...initialState,
  setComments: (comments) => set((state) => ({
    comments: typeof comments === 'function' ? comments(state.comments) : comments,
  })),
  addComment: (comment) => set((state) => ({
    comments: [comment, ...state.comments],
    pagination: { ...state.pagination, total: state.pagination.total + 1 }
  })),
  removeComment: (id) => set((state) => ({
    comments: state.comments.filter((c) => c.id_comment !== id),
    pagination: { ...state.pagination, total: state.pagination.total - 1 }
  })),
  setPagination: (pagination) => set({ pagination }),
  setNewCommentContent: (newCommentContent) => set({ newCommentContent }),
  setLoading: (loading) => set({ loading }),
  setSubmitting: (submitting) => set({ submitting }),
  reset: () => set(initialState),
}))