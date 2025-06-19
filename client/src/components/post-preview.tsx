import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Post, Thread } from "@shared/schema";

interface PostPreviewProps {
  postId: string;
  x: number;
  y: number;
  onClose: () => void;
}

export default function PostPreview({ postId, x, y, onClose }: PostPreviewProps) {
  const [postData, setPostData] = useState<Post | null>(null);

  // Try to find the post in the current page first
  useEffect(() => {
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (postElement) {
      // Extract post data from the DOM if available
      const postIdNum = parseInt(postId);
      // For now, we'll fetch from API since we don't have easy access to post data
    }
  }, [postId]);

  // Fetch post data - we'll need to search through threads
  const { data: threads } = useQuery<Thread[]>({
    queryKey: ["/api/threads"],
  });

  useEffect(() => {
    if (threads) {
      // Find the post by searching through all threads
      const findPost = async () => {
        for (const thread of threads) {
          try {
            const response = await fetch(`/api/threads/${thread.id}`);
            if (response.ok) {
              const data = await response.json();
              const post = data.posts.find((p: Post) => p.id.toString() === postId);
              if (post) {
                setPostData(post);
                return;
              }
              // Check if it's the OP
              if (data.thread.id.toString() === postId) {
                setPostData({
                  id: data.thread.id,
                  threadId: data.thread.id,
                  content: data.thread.content,
                  imageUrl: data.thread.imageUrl,
                  imageName: data.thread.imageName,
                  createdAt: data.thread.createdAt,
                });
                return;
              }
            }
          } catch (error) {
            console.error('Error fetching thread:', error);
          }
        }
      };
      findPost();
    }
  }, [threads, postId]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('>')) {
        if (line.match(/^>>(No\. )?\d+$/)) {
          return (
            <div key={index} className="theme-text-quote">
              {line}
            </div>
          );
        } else {
          return (
            <div key={index} className="theme-text-green">
              {line}
            </div>
          );
        }
      }
      return <div key={index}>{line || "\u00A0"}</div>;
    });
  };

  if (!postData) {
    return (
      <div
        className="fixed z-50 theme-bg-post theme-border border p-2 text-xs max-w-xs shadow-lg pointer-events-none"
        style={{ left: x + 10, top: y - 10 }}
      >
        Loading post #{postId}...
      </div>
    );
  }

  return (
    <div
      className="fixed z-50 theme-bg-post theme-border border p-3 text-xs max-w-sm shadow-lg pointer-events-none"
      style={{ left: x + 10, top: y - 10 }}
    >
      <div className="flex flex-col gap-2">
        {postData.imageUrl && (
          <img
            src={postData.imageUrl}
            alt={postData.imageName || "Post image"}
            className="max-w-full max-h-32 object-contain"
          />
        )}
        <div>
          <div className="mb-1">
            <span className="font-bold theme-text-green">Anonymous</span>
            <span className="text-gray-600 ml-2">{formatDate(postData.createdAt)}</span>
            <span className="text-blue-600 ml-2">No. {postData.id}</span>
          </div>
          <div className="leading-relaxed">
            {formatContent(postData.content)}
          </div>
        </div>
      </div>
    </div>
  );
}