// client/src/pages/ThreadPage.tsx

import { useParams } from "react-router-dom";
import { useFetchThread } from "../hooks/useFetchThread";
import { useWebSocket } from "../hooks/useWebSocket";
import { PostItem } from "../components/Post";
import { NewPostForm } from "../components/NewPostForm";

export function ThreadPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const { thread, loading, error } = useFetchThread(threadId!);

  // When a new reply arrives via WS, append it to the UI
  useWebSocket(threadId!, (msg) => {
    if (msg.type === "new-reply" && thread) {
      thread.posts.push(msg.reply);
    }
  });

  const handleRefresh = () => {
    // You could re-fetch via your hook, but simplest is window.location.reload()
    window.location.reload();
  };

  if (loading) return <div className="p-4 text-white">Loading thread…</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!thread) return <div className="p-4 text-white">Thread not found.</div>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-green-300">OP: {thread.title}</h1>
      <div className="space-y-4">
        {thread.posts.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </div>
      <NewPostForm
        threadId={Number(threadId)}
        onPostSuccess={handleRefresh}
      />
    </div>
  );
}
