import { useState } from "react";
import type { Post } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAdmin } from "@/hooks/useAdmin";
import PostPreview from "./post-preview";
import BanUserModal from "./ban-user-modal";

// Simple text formatting function that preserves functionality
function formatContentForDisplay(content: any, isAdminPost?: boolean) {
  // Ensure we have a string
  const textContent = typeof content === 'string' ? content : String(content || '');
  
  if (!textContent) return null;
  
  // Split into lines and process each
  const lines = textContent.split('\n');
  
  return lines.map((line, index) => {
    // Process line for quote links first, then apply greentext styling
    const processLineWithQuotes = (text: string, lineIndex: number, isGreentext: boolean = false) => {
      // Split by quote pattern but keep the quotes
      const parts = text.split(/(>>(\d+))/g);
      
      return parts.map((part, partIndex) => {
        if (part.match(/^>>(\d+)$/)) {
          // Quote link found - format as ">>No. X"
          const postId = part.match(/^>>(\d+)$/)?.[1];
          return (
            <span 
              key={`${lineIndex}-${partIndex}`} 
              className="text-blue-600 hover:text-blue-800 cursor-pointer underline"
              onMouseEnter={(e) => showPostPreview(postId!, e.clientX, e.clientY)}
              onMouseLeave={hidePostPreview}
            >
              &gt;&gt;No. {postId}
            </span>
          );
        } else if (part === '') {
          // Empty string from split, ignore
          return null;
        } else {
          // Regular text - apply greentext styling if needed
          return (
            <span 
              key={`${lineIndex}-${partIndex}`}
              className={isGreentext && !isAdminPost ? 'text-green-600 font-bold' : ''}
            >
              {part}
            </span>
          );
        }
      }).filter(Boolean);
    };

    // Check if line is greentext (starts with > but not >>)
    const isGreentext = line.startsWith('>') && !line.startsWith('>>');
    
    return (
      <span key={index}>
        {processLineWithQuotes(line, index, isGreentext)}
        {index < lines.length - 1 && <br />}
      </span>
    );
  });
}

interface PostProps {
  post: Post;
  isOP?: boolean;
  subject?: string | null;
  onQuote: (postId: number) => void;
  onDelete: () => void;
}

export default function PostComponent({ post, isOP = false, subject, onQuote, onDelete }: PostProps) {
  const [hoverPreview, setHoverPreview] = useState<{ postId: string; x: number; y: number } | null>(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const { isAdmin, isLoading: adminLoading, token: adminToken } = useAdmin();

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

  const expandImage = (imageUrl: string) => {
    setExpandedImage(imageUrl);
  };

  const showPostPreview = (postId: string, x: number, y: number) => {
    // Highlight the referenced post if it exists on the page
    const referencedPost = document.querySelector(`[data-post-id="${postId}"]`);
    if (referencedPost) {
      referencedPost.classList.add('bg-red-100', 'border-red-300');
    }
    
    setHoverPreview({
      postId,
      x,
      y,
    });
  };

  const hidePostPreview = () => {
    // Remove highlighting from all posts
    const highlightedPosts = document.querySelectorAll('.bg-red-100');
    highlightedPosts.forEach(post => {
      post.classList.remove('bg-red-100', 'border-red-300');
    });
    
    setHoverPreview(null);
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
          {isAdmin && !adminLoading && (
            <>
              <Button
                onClick={onDelete}
                variant="outline"
                size="sm"
                className="ml-1 text-xs bg-red-100 text-red-600 px-1 hover:bg-red-200 h-auto py-0"
              >
                [Delete]
              </Button>
              <Button
                onClick={() => setShowBanModal(true)}
                variant="outline"
                size="sm"
                className="ml-1 text-xs bg-orange-100 text-orange-600 px-1 hover:bg-orange-200 h-auto py-0"
              >
                [Ban]
              </Button>
            </>
          )}
        </div>
        {subject && (
          <div className={`font-bold text-sm mb-2 ${(post as any).isAdminPost ? 'text-red-600 admin-subject' : 'text-blue-600'}`}>
            {subject}
          </div>
        )}
        <div 
          className={`text-xs leading-relaxed whitespace-pre-wrap ${(post as any).isAdminPost ? 'text-red-600 font-bold' : ''}`}
        >
          {formatContentForDisplay(post.content, (post as any).isAdminPost)}
        </div>
      </div>
      
      {hoverPreview && (
        <PostPreview
          postId={hoverPreview.postId}
          x={hoverPreview.x}
          y={hoverPreview.y}
          onClose={() => setHoverPreview(null)}
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
      
      {showBanModal && adminToken && (
        <BanUserModal
          isOpen={showBanModal}
          onClose={() => setShowBanModal(false)}
          ipAddress={post.ipAddress || "Unknown"}
          adminToken={adminToken}
        />
      )}
    </div>
  );
}