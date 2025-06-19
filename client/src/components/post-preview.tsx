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

  useEffect(() => {
    // First check if the post is already visible on the current page
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (postElement) {
      // Try to extract data from the current page
      const contentElement = postElement.querySelector('.text-xs.leading-relaxed');
      const timeElement = postElement.querySelector('.text-gray-600');
      const imageElement = postElement.querySelector('img');
      const nameElement = postElement.querySelector('.theme-text-green');
      
      if (contentElement && timeElement) {
        setPostData({
          id: parseInt(postId),
          threadId: 0, // We don't need this for preview
          content: contentElement.textContent || '',
          imageUrl: imageElement?.getAttribute('src') || null,
          imageName: imageElement?.getAttribute('alt') || null,
          createdAt: new Date(), // Use current time for simplicity
          name: nameElement?.textContent?.split('!')[0] || "Anonymous",
          tripcode: nameElement?.textContent?.includes('!') ? nameElement.textContent.split('!')[1] : null,
        });
        return;
      }
    }

    // If not found on current page, search through API
    const findPost = async () => {
      try {
        // Get all threads first
        const threadsResponse = await fetch('/api/threads');
        if (!threadsResponse.ok) return;
        
        const threads = await threadsResponse.json();
        
        for (const thread of threads) {
          // Check if it's the OP
          if (thread.id.toString() === postId) {
            setPostData({
              id: thread.id,
              threadId: thread.id,
              content: thread.content,
              imageUrl: thread.imageUrl,
              imageName: thread.imageName,
              createdAt: thread.createdAt,
            });
            return;
          }
          
          // Check posts in this thread
          try {
            const response = await fetch(`/api/threads/${thread.id}`);
            if (response.ok) {
              const data = await response.json();
              const post = data.posts.find((p: Post) => p.id.toString() === postId);
              if (post) {
                setPostData(post);
                return;
              }
            }
          } catch (error) {
            console.error('Error fetching thread:', error);
          }
        }
      } catch (error) {
        console.error('Error finding post:', error);
      }
    };
    
    findPost();
  }, [postId]);

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
            <span className="font-bold theme-text-green">
              {(postData as any).name || "Anonymous"}
              {(postData as any).tripcode && <span className="theme-text-quote"> !{(postData as any).tripcode}</span>}
            </span>
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