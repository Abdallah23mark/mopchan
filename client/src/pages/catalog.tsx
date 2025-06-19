import { useQuery } from "@tanstack/react-query";
import type { Thread } from "@shared/schema";
import ThreadCard from "@/components/thread-card";

export default function Catalog() {
  const { data: threads = [], isLoading } = useQuery({
    queryKey: ["/api/threads"],
    refetchInterval: 15000,
  });

  const sortedThreads = [...threads].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="text-lg theme-text-main">Loading threads...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
        {sortedThreads?.map((thread) => (
          <ThreadCard key={thread.id} thread={thread} />
        ))}
      </div>

      {(!sortedThreads || sortedThreads.length === 0) && (
        <div className="text-center text-gray-600 mt-8 text-xs">
          No threads found.
        </div>
      )}
    </div>
  );
}