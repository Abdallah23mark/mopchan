// client/src/hooks/useFetchThread.ts
import { useState, useEffect } from "react";

export type Post = {
  id: number;
  content: string;
  imageUrl: string;
  createdAt: string;
};

export type ThreadDetail = {
  id: number;
  title: string;
  posts: Post[];
};

export function useFetchThread(threadId: number | string) {
  const [thread, setThread] = useState<ThreadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/thread/${threadId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Thread not found");
        return res.json();
      })
      .then((data: ThreadDetail) => {
        if (!cancelled) setThread(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [threadId]);

  return { thread, loading, error };
}
