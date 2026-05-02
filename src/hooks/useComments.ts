import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCommentsStore } from "#/stores/commentsStore";

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

interface CommentsResponse {
  data: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

interface UseCommentsOptions {
  promptId: string;
  page?: number;
  limit?: number;
}

export function useComments(options: UseCommentsOptions) {
  const { setComments, setPagination, setLoading } = useCommentsStore();
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;

  return useQuery({
    queryKey: ["comments", options.promptId, { page, limit }],
    queryFn: async () => {
      setLoading(true);
      try {
        const url = new URL(`/api/prompts/${options.promptId}/comments`, window.location.origin);
        url.searchParams.set("page", String(page));
        url.searchParams.set("limit", String(limit));
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch comments");
        const data: CommentsResponse = await res.json();
        setComments(data.data);
        setPagination(data.pagination);
        return data;
      } finally {
        setLoading(false);
      }
    },
  });
}

interface UseCreateCommentOptions {
  promptId: string;
  onSuccess?: () => void;
}

export function useCreateComment(options: UseCreateCommentOptions) {
  const queryClient = useQueryClient();
  const { addComment, setNewCommentContent, setSubmitting } = useCommentsStore();

  return useMutation({
    mutationFn: async (content: string): Promise<Comment> => {
      setSubmitting(true);
      try {
        const res = await fetch(`/api/prompts/${options.promptId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error?.message || "Failed to create comment");
        }
        return res.json();
      } finally {
        setSubmitting(false);
      }
    },
    onSuccess: (comment) => {
      addComment(comment);
      setNewCommentContent("");
      queryClient.invalidateQueries({ queryKey: ["comments", options.promptId] });
      options.onSuccess?.();
    },
  });
}

interface UseUpdateCommentOptions {
  promptId: string;
  commentId: string;
  onSuccess?: () => void;
}

export function useUpdateComment(options: UseUpdateCommentOptions) {
  const queryClient = useQueryClient();
  const { setComments } = useCommentsStore();

  return useMutation({
    mutationFn: async (content: string): Promise<Comment> => {
      const res = await fetch(`/api/prompts/${options.promptId}/comments/${options.commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || "Failed to update comment");
      }
      return res.json();
    },
    onSuccess: (updatedComment) => {
      setComments((prev: Comment[]) =>
        prev.map((c: Comment) => (c.id_comment === updatedComment.id_comment ? updatedComment : c))
      );
      queryClient.invalidateQueries({ queryKey: ["comments", options.promptId] });
      options.onSuccess?.();
    },
  });
}

interface UseDeleteCommentOptions {
  promptId: string;
  onSuccess?: () => void;
}

export function useDeleteComment(options: UseDeleteCommentOptions) {
  const queryClient = useQueryClient();
  const { removeComment } = useCommentsStore();

  return useMutation({
    mutationFn: async (commentId: string): Promise<void> => {
      const res = await fetch(`/api/prompts/${options.promptId}/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || "Failed to delete comment");
      }
    },
    onSuccess: (_, commentId) => {
      removeComment(commentId);
      queryClient.invalidateQueries({ queryKey: ["comments", options.promptId] });
      options.onSuccess?.();
    },
  });
}