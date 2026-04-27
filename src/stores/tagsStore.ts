import { create } from 'zustand'

interface TagsState {
  tags: Array<{ id_tag: string; name: string; slug: string; description: string | null }>
  selectedTag: string | null
  loading: boolean
  setTags: (tags: TagsState['tags']) => void
  setSelectedTag: (tag: string | null) => void
  setLoading: (loading: boolean) => void
}

export const useTagsStore = create<TagsState>((set) => ({
  tags: [],
  selectedTag: null,
  loading: false,
  setTags: (tags) => set({ tags }),
  setSelectedTag: (selectedTag) => set({ selectedTag }),
  setLoading: (loading) => set({ loading }),
}))