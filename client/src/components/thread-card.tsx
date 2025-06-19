import { Link } from "wouter";
import { useAdmin } from "@/hooks/useAdmin";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Pin, PinOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Thread } from "@shared/schema";

interface ThreadCardProps {
  thread: Thread;
}

export default function ThreadCard({ thread }: ThreadCardProps) {
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const pinMutation = useMutation({
    mutationFn: async () => {
      if (thread.isPinned) {
        return apiRequest(`/api/admin/threads/${thread.id}/pin`, {
          method: "DELETE"
        });
      } else {
        return apiRequest(`/api/admin/threads/${thread.id}/pin`, {
          method: "POST"
        });
      }
    },
    onSuccess: () => {
      toast({
        title: thread.isPinned ? "Thread unpinned" : "Thread pinned",
        description: thread.isPinned ? "Thread removed from pinned position" : "Thread pinned to top of catalog"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/threads"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update thread pin status",
        variant: "destructive"
      });
    }
  });
  const formatContent = (content: string) => {
    // Truncate content for card display but preserve greentext formatting
    const truncated = content.length > 100 ? content.substring(0, 100) + "..." : content;
    return truncated.split('\n').map((line, index) => {
      if (line.startsWith('>')) {
        if (line.match(/^>>(No\. )?\d+$/)) {
          // Post quote - red maroon color
          return (
            <div key={index} className="theme-text-quote">
              {line}
            </div>
          );
        } else {
          // Greentext - green color
          return (
            <div key={index} className="text-green-700">
              {line}
            </div>
          );
        }
      }
      return <div key={index}>{line || "\u00A0"}</div>;
    });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const threadDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - threadDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  return (
    <Link href={`/thread/${thread.id}`}>
      <div className="theme-bg-post theme-border border cursor-pointer hover:opacity-90 transition-colors relative" style={{ minHeight: '150px' }}>
        {/* Pin icon indicator */}
        {thread.isPinned && (
          <div className="absolute top-2 right-2 z-10">
            <Pin className="w-4 h-4 text-red-600 fill-current" />
          </div>
        )}
        
        {thread.imageUrl && (
          <div className="relative">
            <img
              src={thread.imageUrl}
              alt={thread.imageName || "Thread image"}
              className="w-full object-contain cursor-pointer hover:opacity-80"
              style={{ maxHeight: '200px' }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(thread.imageUrl!, '_blank');
              }}
            />
          </div>
        )}
        <div className="p-2 text-xs leading-tight">
          <div className="text-right text-gray-600 mb-1 text-xs">
            {formatDate(thread.createdAt)}
          </div>
          <div className="text-xs text-gray-600 mb-1">
            <span className={`font-bold ${(thread as any).isAdminPost ? 'text-red-600 admin-name' : 'text-green-600'}`}>
              {(thread as any).name || "Anonymous"}
              {(thread as any).tripcode && (
                <span className={`${(thread as any).isAdminPost ? 'text-red-600' : 'text-blue-600'}`}>
                  {' '}!{(thread as any).tripcode}
                </span>
              )}
            </span>
          </div>
          {thread.subject && (
            <div className={`font-bold mb-1 break-words ${(thread as any).isAdminPost ? 'text-red-600 admin-subject' : 'text-black'}`}>
              {thread.subject}
            </div>
          )}
          <div 
            className={`mb-2 break-words leading-relaxed ${(thread as any).isAdminPost ? 'text-red-600 font-medium' : 'text-black'}`}
          >
            {String(thread.content || '')}
          </div>
          <div className="flex justify-between items-center">
            <div className="text-gray-600 text-xs">
              R: {thread.replyCount} / I: {thread.imageUrl ? thread.imageCount + 1 : thread.imageCount}
            </div>
            
            {/* Admin pin/unpin button */}
            {!adminLoading && isAdmin && (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  pinMutation.mutate();
                }}
                variant="outline"
                size="sm"
                disabled={pinMutation.isPending}
                className="h-5 px-1 text-xs"
              >
                {thread.isPinned ? (
                  <>
                    <PinOff className="w-3 h-3 mr-1" />
                    Unpin
                  </>
                ) : (
                  <>
                    <Pin className="w-3 h-3 mr-1" />
                    Pin
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
