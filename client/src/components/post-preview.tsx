import { useQuery } from "@tanstack/react-query";
import type { Post } from "@shared/schema";
import { formatDate } from "@/lib/utils";

interface PostPreviewProps {
  postId: string;
  x: number;
  y: number;
  onClose: () => void;
}

export default function PostPreview({ postId, x, y, onClose }: PostPreviewProps) {
  // Clean the post ID
  const cleanPostId = postId.replace(/[\r\n\t]/g, '').trim();

  // Query to get all threads to search for the post
  const { data: threadsData } = useQuery({
    queryKey: ['/api/threads'],
  });

  // Try to find which thread contains this post
  let foundPost: Post | null = null;
  let threadId: number | null = null;

  if (threadsData) {
    for (const thread of threadsData) {
      if (thread.id.toString() === cleanPostId || 
          (thread.replyCount > 0 && parseInt(cleanPostId) >= thread.id)) {
        threadId = thread.id;
        break;
      }
    }
  }

  // Query the specific thread if we found a candidate
  const { data: threadData, isLoading } = useQuery({
    queryKey: [`/api/threads/${threadId}`],
    enabled: !!threadId,
  });

  // Find the post in the thread data
  if (threadData?.posts) {
    foundPost = threadData.posts.find((p: Post) => p.id.toString() === cleanPostId) || null;
    // Also check if it's the OP
    if (!foundPost && threadData.thread.id.toString() === cleanPostId) {
      foundPost = {
        id: threadData.thread.id,
        threadId: threadData.thread.id,
        content: threadData.thread.content,
        imageUrl: threadData.thread.imageUrl,
        imageName: threadData.thread.imageName,
        createdAt: threadData.thread.createdAt,
        name: threadData.thread.name,
        tripcode: threadData.thread.tripcode,
      } as Post;
    }
  }

  if (isLoading) {
    return (
      <div
        className="absolute bg-white border-2 border-red-500 p-3 shadow-lg z-50 max-w-md"
        style={{ left: x, top: y }}
        onMouseEnter={(e) => e.stopPropagation()}
        onClick={onClose}
      >
        <div className="text-sm">Loading post preview...</div>
      </div>
    );
  }

  if (!foundPost) {
    return (
      <div
        className="absolute bg-white border-2 border-red-500 p-3 shadow-lg z-50 max-w-md"
        style={{ left: x, top: y }}
        onMouseEnter={(e) => e.stopPropagation()}
        onClick={onClose}
      >
        <div className="text-sm text-red-500">Post #{cleanPostId} not found</div>
      </div>
    );
  }

  const formatContent = (content: string) => {
    if (!content) return "";
    
    return content.split('\n').map((line, index) => {
      // Handle greentext
      if (line.startsWith('>') && !line.startsWith('>>')) {
        return (
          <div key={index} className="text-green-600 font-bold">
            {line}
          </div>
        );
      }
      
      // Handle quote links
      const parts = line.split(/(>>(\d+))/g);
      return (
        <div key={index}>
          {parts.map((part, partIndex) => {
            if (part.match(/^>>(\d+)$/)) {
              const quotedId = part.match(/^>>(\d+)$/)?.[1];
              return (
                <span key={partIndex} className="text-blue-600 underline">
                  &gt;&gt;No. {quotedId}
                </span>
              );
            }
            return part;
          })}
        </div>
      );
    });
  };

  return (
    <div
      className="absolute bg-white border-2 border-red-500 p-3 shadow-lg z-50 max-w-md cursor-pointer"
      style={{ 
        left: Math.min(x, window.innerWidth - 400), 
        top: Math.min(y, window.innerHeight - 200) 
      }}
      onMouseEnter={(e) => e.stopPropagation()}
      onClick={onClose}
    >
      <div className="mb-2 text-xs">
        <span className="font-bold text-green-600">
          {foundPost.name || "Anonymous"}
          {foundPost.tripcode && (
            <span className="text-blue-600">
              {' '}!{foundPost.tripcode}
            </span>
          )}
        </span>
        <span className="text-gray-600 ml-2">{formatDate(foundPost.createdAt)}</span>
        <span className="text-blue-600 ml-2">No. {foundPost.id}</span>
      </div>
      
      {foundPost.imageUrl && (
        <div className="mb-2">
          <img
            src={foundPost.imageUrl}
            alt={foundPost.imageName || "Post image"}
            className="max-w-full max-h-32 border cursor-pointer"
          />
          {foundPost.imageName && (
            <div className="text-xs text-gray-600 mt-1">
              {foundPost.imageName}
            </div>
          )}
        </div>
      )}
      
      <div className="text-xs leading-relaxed max-h-32 overflow-y-auto">
        {formatContent(foundPost.content)}
      </div>
    </div>
  );
}