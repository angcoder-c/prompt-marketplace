import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTagsStore } from "#/stores/tagsStore";

interface Tag {
  id_tag: string;
  name: string;
  slug: string;
  description: string | null;
  followers_count?: number;
}

interface TagsResponse {
  data: Tag[];
}

export function useTags() {
  const { setTags, setLoading } = useTagsStore();

  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/tags");
        if (!res.ok) throw new Error("Failed to fetch tags");
        const data: TagsResponse = await res.json();
        setTags(data.data);
        return data.data;
      } finally {
        setLoading(false);
      }
    },
  });
}

interface TagDetailResponse {
  tag: Tag;
  is_following: boolean;
  prompts: {
    data: Array<{
      id_prompt: string;
      title: string;
      description: string | null;
      aipoints_price: number;
      model: string;
      upvotes: number;
      downvotes: number;
      username: string;
      avatar_url: string | null;
      created_at: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

interface TagParams {
  slug: string;
  page?: number;
  limit?: number;
  sort?: "recent" | "popular" | "top_rated";
}

export function useTag(params: TagParams) {
  const { setSelectedTag } = useTagsStore();
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const sort = params.sort ?? "recent";

  return useQuery({
    queryKey: ["tag", params.slug, { page, limit, sort }],
    queryFn: async () => {
      setSelectedTag(params.slug);
      const url = new URL(`/api/tags/${params.slug}`, window.location.origin);
      url.searchParams.set("page", String(page));
      url.searchParams.set("limit", String(limit));
      url.searchParams.set("sort", sort);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch tag");
      const data: TagDetailResponse = await res.json();
      return data;
    },
  });
}

export function useTagFollow(slug: string, _enabled = true) {
  const queryClient = useQueryClient();
  const { invalidateQueries } = queryClient;

  const follow = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tags/${slug}/follow`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to follow tag");
      return res.json();
    },
    onSuccess: () => {
      invalidateQueries({ queryKey: ["tag", slug] });
    },
  });

  const unfollow = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tags/${slug}/follow`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to unfollow tag");
      return res.json();
    },
    onSuccess: () => {
      invalidateQueries({ queryKey: ["tag", slug] });
    },
  });

  return { follow, unfollow };
}