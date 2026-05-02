import { create } from 'zustand'

type MessageType = 'ok' | 'error' | 'info'

interface PromptFormState {
  promptId: string
  promptTitle: string
  promptContent: string
  promptDescription: string
  promptTags: string
  promptModel: string
  promptPrice: string
  promptIsPublished: boolean
  manualGeneratedResponse: string
  loading: boolean
  message: string | null
  messageType: MessageType
  apiPreview: string
  setPromptId: (promptId: string) => void
  setPromptTitle: (promptTitle: string) => void
  setPromptContent: (promptContent: string) => void
  setPromptDescription: (promptDescription: string) => void
  setPromptTags: (promptTags: string) => void
  setPromptModel: (promptModel: string) => void
  setPromptPrice: (promptPrice: string) => void
  setPromptIsPublished: (promptIsPublished: boolean) => void
  setManualGeneratedResponse: (manualGeneratedResponse: string) => void
  setLoading: (loading: boolean) => void
  showMessage: (type: MessageType, text: string) => void
  clearMessage: () => void
  setApiPreview: (preview: string) => void
  reset: () => void
}

const initialState = {
  promptId: '',
  promptTitle: '',
  promptContent: '',
  promptDescription: '',
  promptTags: '',
  promptModel: 'meta-llama/llama-3.3-70b-instruct:free',
  promptPrice: '0',
  promptIsPublished: true,
  manualGeneratedResponse: '',
  loading: false,
  message: null,
  messageType: 'info' as MessageType,
  apiPreview: '',
}

export const usePromptFormStore = create<PromptFormState>((set) => ({
  ...initialState,
  setPromptId: (promptId) => set({ promptId }),
  setPromptTitle: (promptTitle) => set({ promptTitle }),
  setPromptContent: (promptContent) => set({ promptContent }),
  setPromptDescription: (promptDescription) => set({ promptDescription }),
  setPromptTags: (promptTags) => set({ promptTags }),
  setPromptModel: (promptModel) => set({ promptModel }),
  setPromptPrice: (promptPrice) => set({ promptPrice }),
  setPromptIsPublished: (promptIsPublished) => set({ promptIsPublished }),
  setManualGeneratedResponse: (manualGeneratedResponse) => set({ manualGeneratedResponse }),
  setLoading: (loading) => set({ loading }),
  showMessage: (messageType, message) => set({ messageType, message }),
  clearMessage: () => set({ message: null }),
  setApiPreview: (preview) => set({ apiPreview: preview }),
  reset: () => set(initialState),
}))