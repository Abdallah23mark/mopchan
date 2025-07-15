import { useState } from "react";
import type { Post } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/hooks/useAdmin";
import BanUserModal from "./ban-user-modal";
import { useQuery } from "@tanstack/react-query";

import React from "react";

function formatContentForDisplay(
  content: any,
  isAdminPost?: boolean,
  showPreview?: (id: string, x: number, y: number) => void,
  hidePreview?: () => void
): React.ReactNode {
  const textContent = typeof content === 'string' ? content : String(content || '');
  if (!textContent) return null;

  const paragraphs = textContent.split(/\n{2,}/g);

  return paragraphs.map((para, pIndex) => {
    const lines = para.split('\n');

    const lineElements = lines.map((line, lineIndex) => {
      const isGreentext = line.startsWith('>') && !line.startsWith('>>');

      const quoteRegex = />>(No\. )?(\d+)/g;
      let lastIndex = 0;
      const parts: React.ReactNode[] = [];
      let match: RegExpExecArray | null;

      while ((match = quoteRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          const before = line.slice(lastIndex, match.index);
          parts.push(
            <span
              key={`text-${pIndex}-${lineIndex}-${lastIndex}`}
              className={isGreentext && !isAdminPost ? 'text-green-600 font-bold' : ''}
            >
              {before}
            </span>
          );
        }

        const postId = match[2];
        parts.push(
          <span
            key={`quote-${pIndex}-${lineIndex}-${match.index}`}
            className="text-blue-600 hover:text-blue-800 cursor-pointer underline"
            onMouseEnter={(e) => showPreview?.(postId, e.clientX, e.clientY)}
            onMouseLeave={() => hidePreview?.()}
            onClick={() => {
              const el = document.querySelector(`[data-post-number="${postId}"]`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add("bg-yellow-100");
                setTimeout(() => el.classList.remove("bg-yellow-100"), 2000);
              }
            }}
          >
            {match[0].includes("No.") ? match[0] : `>>No. ${postId}`}
          </span>
        );

        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < line.length) {
        const remaining = line.slice(lastIndex);
        parts.push(
          <span
            key={`tail-${pIndex}-${lineIndex}`}
            className={isGreentext && !isAdminPost ? 'text-green-600 font-bold' : ''}
          >
            {remaining}
          </span>
        );
      }

      return (
        <React.Fragment key={`line-${pIndex}-${lineIndex}`}>
          {parts}
          <br />
        </React.Fragment>
      );
    });

    return (
      <p key={`para-${pIndex}`} className="mb-2 last:mb-0">
        {lineElements}
      </p>
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
  const [showBanModal, setShowBanModal] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [expandedImageName, setExpandedImageName] = useState<string | null>(null);
  const [hoverPreview, setHoverPreview] = useState<{ postId: string; x: number; y: number; content: string; name: string; date: string; isAdminPost: boolean } | null>(null);

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

  const expandImage = (imageUrl: string, imageName?: string) => {
    setExpandedImage(imageUrl);
    setExpandedImageName(imageName || null);
  };

  const showPostPreview = (postNumber: string, x: number, y: number) => {
    // Find post by post number instead of post ID
    const postElement = document.querySelector(`[data-post-number="${postNumber}"]`);
    if (postElement) {
      const contentElement = postElement.querySelector('.post-content');
      const nameElement = postElement.querySelector('.post-name');
      const dateElement = postElement.querySelector('.post-date');

      // Get the raw content from the post data
      const postData = (postElement as any).__postData;
      const rawContent = postData?.content || contentElement?.textContent || 'Post content not found';
      const isAdminPost = postData?.isAdminPost || false;

      setHoverPreview({
        postId: postNumber,
        x: Math.min(x, window.innerWidth - 400),
        y: Math.min(y, window.innerHeight - 300),
        content: rawContent,
        isAdminPost,
        name: nameElement?.textContent || 'Anonymous',
        date: dateElement?.textContent || ''
      });

      // Highlight referenced post
      postElement.classList.add('bg-red-100', 'border-red-300');
    }
  };

  const hidePostPreview = () => {
    setHoverPreview(null);
    // Remove highlighting
    document.querySelectorAll('.bg-red-100').forEach(el => {
      el.classList.remove('bg-red-100', 'border-red-300');
    });
  };



  return (
    <div
      id={`post-${post.id}`}
      className={`flex flex-col md:flex-row gap-4 p-2 ${isOP ? 'theme-bg-post' : 'theme-bg-reply'} transition-all duration-200`}
      data-post-id={post.id}
      data-post-number={post.postNumber || post.id}
      ref={(el) => {
        if (el) {
          (el as any).__postData = post;
        }
      }}
    >
      {post.imageUrl && (
        <div className="flex-shrink-0">
          {post.imageName?.toLowerCase().endsWith('.webm') ? (
            <video
              src={post.imageUrl}
              className="image-thumb cursor-pointer"
              muted
              loop
              preload="metadata"
              style={{
                maxWidth: '250px',
                maxHeight: '250px',
                width: 'auto',
                height: 'auto',
                backgroundColor: '#000',
                border: '1px solid #ccc'
              }}
              onClick={() => expandImage(post.imageUrl!, post.imageName)}
              onMouseEnter={(e) => {
                const video = e.target as HTMLVideoElement;
                video.play();
              }}
              onMouseLeave={(e) => {
                const video = e.target as HTMLVideoElement;
                video.pause();
                video.currentTime = 0;
              }}
              onError={(e) => {
                console.error('Video failed to load:', post.imageUrl);
              }}
            />
          ) : (
            <img
              src={post.imageUrl}
              alt={post.imageName || "Post image"}
              className="image-thumb max-w-full md:max-w-xs border chan-border cursor-pointer"
              onClick={() => expandImage(post.imageUrl!, post.imageName)}
            />
          )}
          {post.imageName && (
            <div
              className="text-xs text-gray-600 mt-1 w-[250px] cursor-help truncate"
              title={post.imageName}
            >
              {post.imageName.length > 30 ? post.imageName.substring(0, 30) + '...' : post.imageName}
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
          <span className="text-blue-600 ml-2">No. {post.postNumber || post.id}</span>
          <Button
            onClick={() => onQuote(post.postNumber || post.id)}
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
          className={`text-xs leading-relaxed whitespace-pre-wrap post-content ${(post as any).isAdminPost ? 'text-red-600 font-bold' : ''}`}
        >
          {formatContentForDisplay(post.content, (post as any).isAdminPost, showPostPreview, hidePostPreview)}
        </div>
      </div>

      {hoverPreview && (
        <div
          className="fixed bg-white border-2 border-red-500 p-3 shadow-lg z-50 max-w-md pointer-events-none"
          style={{ left: hoverPreview.x, top: hoverPreview.y }}
        >
          <div className="text-xs text-gray-500 mb-1">
            <span className="font-medium">{hoverPreview.name}</span>
            <span className="ml-2">{hoverPreview.date}</span>
            <span className="ml-2 text-blue-600">No. {hoverPreview.postId}</span>
          </div>
          <div className={`text-xs leading-relaxed ${hoverPreview.isAdminPost ? 'text-red-600 font-bold' : ''}`}>
            {typeof hoverPreview.content === 'string'
              ? formatContentForDisplay(
                hoverPreview.content.length > 200
                  ? hoverPreview.content.substring(0, 200) + '...'
                  : hoverPreview.content,
                hoverPreview.isAdminPost
              )
              : hoverPreview.content}
          </div>
        </div>
      )}

      {expandedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 cursor-pointer"
          onClick={() => {
            setExpandedImage(null);
            setExpandedImageName(null);
          }}
        >
          {expandedImageName?.toLowerCase().endsWith('.webm') ? (
            <video
              src={expandedImage}
              className="max-w-full max-h-full object-contain"
              controls
              autoPlay
              loop
              style={{ maxWidth: '90vw', maxHeight: '90vh' }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={expandedImage}
              alt="Expanded image"
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = '/attached_assets/imagenotfound3_1750389506282.png';
                img.onerror = null; // Prevent infinite loop
              }}
            />
          )}
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