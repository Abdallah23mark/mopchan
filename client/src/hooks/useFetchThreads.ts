// client/src/hooks/useFetchThreads.ts
import { useState, useEffect } from "react";

export type ThreadSummary = {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: string;
  postCount: number;
};

export function useFetchThreads(board: string) {
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/catalog/${board}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load threads");
        return res.json();
      })
      .then((data: ThreadSummary[]) => {
        if (!cancelled) setThreads(data);
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
  }, [board]);

  return { threads, loading, error };
}
