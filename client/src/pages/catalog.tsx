import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Thread } from "@shared/schema";
import ThreadCard from "@/components/thread-card";
import { Button } from "@/components/ui/button";

export default function Catalog() {
  const { data: threads, isLoading, error } = useQuery<Thread[]>({
    queryKey: ["/api/threads"],
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center">Loading threads...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center text-red-600">Failed to load threads</div>
      </div>
    );
  }

  return (
    <div className="p-4" style={{ backgroundColor: '#FFFFEE' }}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
        {threads?.map((thread) => (
          <ThreadCard key={thread.id} thread={thread} />
        ))}
      </div>

      {(!threads || threads.length === 0) && (
        <div className="text-center text-gray-600 mt-8 text-xs">
          No threads found. <Link href="/create" className="text-blue-600 underline">Create the first one!</Link>
        </div>
      )}
    </div>
  );
}
