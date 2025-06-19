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
            <div key={index} className="theme-text-greentext">
              {line}
            </div>
          );
        }
      }
      return <div key={index}>{line}</div>;
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Link href={`/thread/${thread.id}`}>
      <div className="theme-thread-card p-4 border border-gray-300 hover:border-gray-400 transition-colors relative cursor-pointer">
        {/* Pin icon indicator */}
        {thread.isPinned && (
          <div className="absolute top-2 right-2">
            <Pin className="w-4 h-4 text-red-600 fill-current" />
          </div>
        )}
        
        <div className="flex items-start gap-3">
          {thread.imageUrl && (
            <div className="flex-shrink-0">
              <img
                src={thread.imageUrl}
                alt={thread.imageName || "Thread image"}
                className="w-16 h-16 object-cover border border-gray-300"
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {thread.subject && (
                <h3 className={`font-bold text-sm truncate ${thread.isPinned ? 'theme-text-pinned' : 'theme-text-subject'}`}>
                  {thread.subject}
                </h3>
              )}
              <span className="text-xs theme-text-name">
                {thread.name || "Anonymous"}
              </span>
              <span className="text-xs theme-text-date">
                {formatDate(thread.createdAt)}
              </span>
            </div>
            
            <div className="text-sm theme-text-content mb-2">
              {formatContent(thread.content)}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs theme-text-meta">
                <span>R: {thread.replyCount}</span>
                <span>I: {thread.imageCount}</span>
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
                  className="h-6 px-2 text-xs"
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
      </div>
    </Link>
  );
}