import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Link } from "wouter";
import type { Thread, Post } from "@shared/schema";
import PostComponent from "@/components/post";
import QuickReply from "@/components/quick-reply";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ThreadData {
  thread: Thread;
  posts: Post[];
}

export default function ThreadPage() {
  const [match, params] = useRoute("/thread/:id");
  const threadId = params?.id ? parseInt(params.id) : 0;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<ThreadData>({
    queryKey: ["/api/threads", threadId],
    queryFn: async () => {
      const res = await fetch(`/api/threads/${threadId}`);
      if (!res.ok) throw new Error("Failed to fetch thread");
      return res.json();
    },
    enabled: !!threadId,
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      await apiRequest("DELETE", `/api/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/threads", threadId] });
      toast({ title: "Post deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete post", variant: "destructive" });
    },
  });

  const deleteThreadMutation = useMutation({
    mutationFn: async (threadId: number) => {
      await apiRequest("DELETE", `/api/threads/${threadId}`);
    },
    onSuccess: () => {
      toast({ title: "Thread deleted successfully" });
      // Redirect to catalog
      window.location.href = "/";
    },
    onError: () => {
      toast({ title: "Failed to delete thread", variant: "destructive" });
    },
  });

  if (!match || !threadId) {
    return <div>Invalid thread ID</div>;
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center">Loading thread...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center text-red-600">Failed to load thread</div>
        <div className="text-center mt-2">
          <Link href="/" className="chan-link">Return to Catalog</Link>
        </div>
      </div>
    );
  }

  const { thread, posts } = data;

  const handleQuote = (postId: number) => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (textarea) {
      const quote = `>>${postId}\n`;
      textarea.value += quote;
      textarea.focus();
    }
  };

  const handleDeletePost = (postId: number) => {
    if (confirm(`Delete post #${postId}?`)) {
      deletePostMutation.mutate(postId);
    }
  };

  const handleDeleteThread = () => {
    if (confirm(`Delete entire thread #${thread.id}?`)) {
      deleteThreadMutation.mutate(thread.id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4" style={{ backgroundColor: '#FFFFEE' }}>
      <div className="mb-4">
        <div className="text-xs text-gray-600 mb-2">
          <Link href="/" className="text-blue-600 underline">Return to Catalog</Link>
        </div>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-red-800 mb-2">
            Thread #{thread.id}
          </h2>
          <Button
            onClick={handleDeleteThread}
            variant="outline"
            size="sm"
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Delete Thread
          </Button>
        </div>
      </div>

      {/* Original Post */}
      <div className="bg-blue-50 border border-gray-400 p-3 mb-4">
        <PostComponent
          post={{
            id: thread.id,
            threadId: thread.id,
            content: thread.content,
            imageUrl: thread.imageUrl,
            imageName: thread.imageName,
            createdAt: thread.createdAt,
          }}
          isOP={true}
          subject={thread.subject}
          onQuote={handleQuote}
          onDelete={handleDeleteThread}
        />
      </div>

      {/* Replies */}
      <div className="space-y-2">
        {posts.map((post) => (
          <div key={post.id} className="border-l-4 border-gray-400 pl-4 py-2 bg-white">
            <PostComponent
              post={post}
              isOP={false}
              onQuote={handleQuote}
              onDelete={() => handleDeletePost(post.id)}
            />
          </div>
        ))}
      </div>

      <QuickReply threadId={thread.id} />
    </div>
  );
}
