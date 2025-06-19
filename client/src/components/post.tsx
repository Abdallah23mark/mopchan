import { useState } from "react";
import type { Post } from "@shared/schema";
import { Button } from "@/components/ui/button";
import PostPreview from "./post-preview";

interface PostProps {
  post: Post;
  isOP?: boolean;
  subject?: string | null;
  onQuote: (postId: number) => void;
  onDelete: () => void;
}

export default function PostComponent({ post, isOP = false, subject, onQuote, onDelete }: PostProps) {
  const [hoverPreview, setHoverPreview] = useState<{ postId: string; x: number; y: number } | null>(null);

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
    // Convert >quotes to greentext
    return content.split('\n').map((line, index) => {
      if (line.startsWith('>')) {
        if (line.match(/^>>(No\. )?\d+$/)) {
          // Post quote - red maroon color with hover functionality
          const postNumber = line.replace(/^>>(No\. )?/, '');
          return (
            <div 
              key={index} 
              className="theme-text-quote hover:opacity-75 cursor-pointer inline-block"
              onClick={() => scrollToPost(postNumber)}
              onMouseEnter={(e) => showPostPreview(e, postNumber)}
              onMouseLeave={hidePostPreview}
              title={`Click to jump to post ${postNumber}`}
            >
              {line}
            </div>
          );
        } else {
          // Greentext - green color
          return (
            <div key={index} className="theme-text-green">
              {line}
            </div>
          );
        }
      }
      return <div key={index}>{line || "\u00A0"}</div>; // Non-breaking space for empty lines
    });
  };

  const scrollToPost = (postNumber: string) => {
    const element = document.querySelector(`[data-post-id="${postNumber}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('highlight-post');
      setTimeout(() => element.classList.remove('highlight-post'), 2000);
    }
  };

  const showPostPreview = (e: React.MouseEvent, postNumber: string) => {
    setHoverPreview({
      postId: postNumber,
      x: e.clientX,
      y: e.clientY
    });
  };

  const hidePostPreview = () => {
    setHoverPreview(null);
  };

  const expandImage = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };

  return (
    <div 
      className={`flex flex-col md:flex-row gap-4 ${isOP ? 'theme-bg-post' : ''}`}
      data-post-id={post.id}
    >
      {post.imageUrl && (
        <div className="flex-shrink-0">
          <img
            src={post.imageUrl}
            alt={post.imageName || "Post image"}
            className="image-thumb max-w-full md:max-w-xs border chan-border cursor-pointer"
            onClick={() => expandImage(post.imageUrl!)}
          />
          {post.imageName && (
            <div className="text-xs text-gray-600 mt-1">
              {post.imageName}
            </div>
          )}
        </div>
      )}
      <div className="flex-1">
        <div className="mb-2 text-xs">
          <span className="font-bold theme-text-green">Anonymous</span>
          <span className="text-gray-600 ml-2">{formatDate(post.createdAt)}</span>
          <span className="text-blue-600 ml-2">No. {post.id}</span>
          <Button
            onClick={() => onQuote(post.id)}
            variant="outline"
            size="sm"
            className="ml-2 text-xs bg-gray-200 px-1 hover:bg-gray-300 h-auto py-0"
          >
            [Quote]
          </Button>
          <Button
            onClick={onDelete}
            variant="outline"
            size="sm"
            className="ml-2 text-xs text-red-600 px-1 hover:bg-red-50 h-auto py-0"
          >
            [Delete]
          </Button>
        </div>
        {subject && isOP && (
          <div className="font-bold text-sm mb-2 text-blue-600">
            {subject}
          </div>
        )}
        <div className="text-xs leading-relaxed">
          {formatContent(post.content)}
        </div>
      </div>
      
      {hoverPreview && (
        <PostPreview
          postId={hoverPreview.postId}
          x={hoverPreview.x}
          y={hoverPreview.y}
          onClose={hidePostPreview}
        />
      )}
    </div>
  );
}
