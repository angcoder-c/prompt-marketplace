import { useMutation } from "@tanstack/react-query";
import { useVoteStore } from "#/stores/voteStore";

interface VoteResponse {
  prompt_id: string;
  vote_type: "up" | "down" | null;
  upvotes: number;
  downvotes: number;
}

interface UseVoteOptions {
  promptId: string;
  initialUpvotes?: number;
  initialDownvotes?: number;
  initialUserVote?: "up" | "down" | null;
}

export function useVote(options: UseVoteOptions) {
  const {
    setUpvotes,
    setDownvotes,
    setUserVote,
    optimisticVote,
    reset,
  } = useVoteStore();

  const voteMutation = useMutation({
    mutationFn: async (voteType: "up" | "down"): Promise<VoteResponse> => {
      const res = await fetch(`/api/prompts/${options.promptId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote_type: voteType }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || "Failed to vote");
      }
      return res.json();
    },
    onMutate: (voteType) => {
      optimisticVote(voteType);
    },
    onSuccess: (data) => {
      setUserVote(data.vote_type);
      setUpvotes(data.upvotes);
      setDownvotes(data.downvotes);
    },
    onError: () => {
      reset();
    },
  });

  return {
    vote: voteMutation.mutate,
    isPending: voteMutation.isPending,
    error: voteMutation.error,
    initializeVotes: (upvotes: number, downvotes: number, userVote: "up" | "down" | null) => {
      setUpvotes(upvotes);
      setDownvotes(downvotes);
      setUserVote(userVote);
    },
    cleanup: () => reset(),
  };
}