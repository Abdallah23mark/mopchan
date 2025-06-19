import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Thread } from "@shared/schema";
import ThreadCard from "@/components/thread-card";
import ThreadWatcher from "@/components/thread-watcher";

export default function Catalog() {
  const [sortBy, setSortBy] = useState<"bump" | "reply" | "time">("bump");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: threads = [], isLoading } = useQuery({
    queryKey: ["/api/threads"],
    refetchInterval: 15000, // Auto-refresh every 15 seconds
  });

  const filteredThreads = threads.filter(thread => 
    thread.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedThreads = [...filteredThreads].sort((a, b) => {
    switch (sortBy) {
      case "bump":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "reply":
        return b.replyCount - a.replyCount;
      case "time":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg theme-text-main">Loading threads...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg">
      <div className="max-w-7xl mx-auto p-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold theme-text-main">Catalog</h1>
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search threads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="theme-bg theme-border border px-3 py-1 rounded"
            />
            <div className="text-sm">
              <label className="mr-2 theme-text-main">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "bump" | "reply" | "time")}
                className="theme-bg theme-border border px-2 py-1 rounded"
              >
                <option value="bump">Bump Order</option>
                <option value="reply">Reply Count</option>
                <option value="time">Time Posted</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ThreadWatcher />
            <div className="text-sm theme-text-main">
              Total threads: {filteredThreads.length}
            </div>
            <button 
              onClick={scrollToBottom}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            >
              Bottom
            </button>
          </div>
        </div>

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
    </div>
  );
}