import { create } from 'zustand'

type MessageType = 'ok' | 'error' | 'info'

interface AuthState {
  mode: 'signin' | 'signup'
  email: string
  password: string
  name: string
  username: string
  loading: boolean
  message: string | null
  messageType: MessageType
  setMode: (mode: 'signin' | 'signup') => void
  setEmail: (email: string) => void
  setPassword: (password: string) => void
  setName: (name: string) => void
  setUsername: (username: string) => void
  setLoading: (loading: boolean) => void
  showMessage: (type: MessageType, text: string) => void
  clearMessage: () => void
  reset: () => void
}

const initialState = {
  mode: 'signin' as const,
  email: '',
  password: '',
  name: '',
  username: '',
  loading: false,
  message: null,
  messageType: 'info' as MessageType,
}

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  setMode: (mode) => set({ mode }),
  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
  setName: (name) => set({ name }),
  setUsername: (username) => set({ username }),
  setLoading: (loading) => set({ loading }),
  showMessage: (messageType, message) => set({ messageType, message }),
  clearMessage: () => set({ message: null }),
  reset: () => set(initialState),
}))