import { Link } from "wouter";
import type { Thread } from "@shared/schema";

interface ThreadCardProps {
  thread: Thread;
}

export default function ThreadCard({ thread }: ThreadCardProps) {
  const formatContent = (content: string) => {
    // Truncate content for card display
    return content.length > 100 ? content.substring(0, 100) + "..." : content;
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear().toString().slice(-2)}`;
  };

  return (
    <Link href={`/thread/${thread.id}`}>
      <div className="bg-white border border-gray-400 cursor-pointer hover:bg-gray-50 transition-colors" style={{ minHeight: '150px' }}>
        {thread.imageUrl && (
          <div className="relative">
            <img
              src={thread.imageUrl}
              alt={thread.imageName || "Thread image"}
              className="w-full h-32 object-cover"
              style={{ maxHeight: '128px' }}
            />
          </div>
        )}
        <div className="p-2 text-xs leading-tight">
          <div className="text-right text-gray-600 mb-1 text-xs">
            {formatDate(thread.createdAt)}
          </div>
          {thread.subject && (
            <div className="font-bold mb-1 text-black break-words">
              {thread.subject}
            </div>
          )}
          <div className="mb-2 text-black break-words leading-relaxed">
            {formatContent(thread.content)}
          </div>
          <div className="text-gray-600 text-xs">
            R: {thread.replyCount} / I: {thread.imageCount}
          </div>
        </div>
      </div>
    </Link>
  );
}
