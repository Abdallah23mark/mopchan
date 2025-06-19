import { useState } from "react";
import type { Post } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
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

  // Check if user is admin
  const { data: adminUser } = useQuery({
    queryKey: ["/api/admin/verify"],
    queryFn: async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) return null;
      
      const response = await fetch("/api/admin/verify", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return null;
      return response.json();
    },
    retry: false,
  });

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
    // Convert >quotes to greentext and >>post references to blue links
    return content.split('\n').map((line, index) => {
      if (line.startsWith('>')) {
        // Check if it's a post reference (>>123456 or >>No. 123456)
        if (line.match(/^>>(No\. )?\d+/)) {
          // Post quote - blue link color with hover functionality
          const postNumber = line.replace(/^>>(No\. )?/, '').split(' ')[0]; // Get just the number part
          return (
            <div key={index}>
              <span 
                className="text-blue-600 hover:text-blue-800 cursor-pointer underline"
                onClick={() => scrollToPost(postNumber)}
                onMouseEnter={(e) => showPostPreview(e, postNumber)}
                onMouseLeave={hidePostPreview}
                title={`Click to jump to post ${postNumber}`}
              >
                {line.match(/^>>(No\. )?\d+$/) ? line : line.replace(/^(>>(No\. )?\d+)/, '$1')}
              </span>
              {line.replace(/^>>(No\. )?\d+\s*/, '').trim() && (
                <span className="ml-1">{line.replace(/^>>(No\. )?\d+\s*/, '')}</span>
              )}
            </div>
          );
        } else {
          // Regular greentext - green color
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
    const cleanPostNumber = postNumber.replace(/[\r\n\t]/g, '').trim();
    const element = document.querySelector(`[data-post-id="${cleanPostNumber}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('highlight-post');
      setTimeout(() => element.classList.remove('highlight-post'), 2000);
    }
  };

  const showPostPreview = (e: React.MouseEvent, postNumber: string) => {
    // Clean the post number to remove any invalid characters
    const cleanPostNumber = postNumber.replace(/[\r\n\t]/g, '').trim();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    
    // Highlight the referenced post in red
    const referencedPost = document.querySelector(`[data-post-id="${cleanPostNumber}"]`);
    if (referencedPost) {
      referencedPost.classList.add('quote-highlight');
    }
    
    setHoverPreview({
      postId: cleanPostNumber,
      x: rect.right + 10,
      y: rect.top
    });
  };

  const hidePostPreview = () => {
    // Remove highlight from any referenced posts
    const highlightedPosts = document.querySelectorAll('.quote-highlight');
    highlightedPosts.forEach(post => post.classList.remove('quote-highlight'));
    
    setHoverPreview(null);
  };

  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const expandImage = (imageUrl: string) => {
    setExpandedImage(imageUrl);
  };

  return (
    <div 
      id={`post-${post.id}`}
      className={`flex flex-col md:flex-row gap-4 p-2 ${isOP ? 'theme-bg-post' : 'theme-bg-reply'} transition-all duration-200`}
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
          <span className={`font-bold ${(post as any).isAdminPost ? 'text-red-600 admin-name' : 'theme-text-green'}`}>
            {(post as any).name || "Anonymous"}
            {(post as any).tripcode && (
              <span className={`${(post as any).isAdminPost ? 'text-red-600' : 'theme-text-quote'}`}>
                {' '}!{(post as any).tripcode}
              </span>
            )}
          </span>
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
          {adminUser?.user?.isAdmin && (
            <Button
              onClick={() => onDelete()}
              variant="outline"
              size="sm"
              className="ml-2 text-xs bg-red-200 px-1 hover:bg-red-300 h-auto py-0 text-red-600"
            >
              [Delete]
            </Button>
          )}
        </div>
        {subject && isOP && (
          <div className={`font-bold text-sm mb-2 ${(post as any).isAdminPost ? 'text-red-600 admin-subject' : 'text-blue-600'}`}>
            {subject}
          </div>
        )}
        <div 
          className={`text-xs leading-relaxed ${(post as any).isAdminPost ? 'text-red-600 font-medium' : ''}`}
          dangerouslySetInnerHTML={{ 
            __html: formatContent(String(post.content || ''), (post as any).isAdminPost) 
          }}
        />
      </div>
      
      {hoverPreview && (
        <PostPreview
          postId={hoverPreview.postId}
          x={hoverPreview.x}
          y={hoverPreview.y}
          onClose={hidePostPreview}
        />
      )}
      
      {expandedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 cursor-pointer"
          onClick={() => setExpandedImage(null)}
        >
          <img
            src={expandedImage}
            alt="Expanded image"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
