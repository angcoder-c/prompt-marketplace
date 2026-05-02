import { useQuery } from "@tanstack/react-query";

interface SearchResult {
  id_prompt: string;
  title: string;
  description: string | null;
  content: string;
  model: string;
  aipoints_price: number;
  upvotes: number;
  downvotes: number;
  username: string;
  avatar_url: string | null;
  created_at: string;
  tags: string[];
}

interface SearchResponse {
  query: string;
  data: SearchResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

interface UseSearchOptions {
  q: string;
  type?: "all" | "tag";
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useSearch(options: UseSearchOptions) {
  const { type = "all", page = 1, limit = 20, enabled = true } = options;

  return useQuery({
    queryKey: ["search", options.q, { type, page, limit }],
    queryFn: async () => {
      if (!options.q.trim()) throw new Error("Query is required");

      const url = new URL("/api/search", window.location.origin);
      url.searchParams.set("q", options.q);
      url.searchParams.set("type", type);
      url.searchParams.set("page", String(page));
      url.searchParams.set("limit", String(limit));

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to search");
      return res.json() as Promise<SearchResponse>;
    },
    enabled: enabled && Boolean(options.q.trim()),
  });
}