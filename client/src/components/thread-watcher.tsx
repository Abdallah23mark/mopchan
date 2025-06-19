import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Eye, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Thread } from "@shared/schema";

interface WatchedThread {
  id: number;
  subject: string;
  lastReplyCount: number;
}

export default function ThreadWatcher() {
  const [watchedThreads, setWatchedThreads] = useState<WatchedThread[]>([]);
  const [notifications, setNotifications] = useState<{ threadId: number; newReplies: number }[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  // Load watched threads from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('watchedThreads');
    if (saved) {
      setWatchedThreads(JSON.parse(saved));
    }
  }, []);

  // Save watched threads to localStorage
  useEffect(() => {
    localStorage.setItem('watchedThreads', JSON.stringify(watchedThreads));
  }, [watchedThreads]);

  // Fetch all threads to check for updates
  const { data: allThreads } = useQuery<Thread[]>({
    queryKey: ["/api/threads"],
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Check for new replies
  useEffect(() => {
    if (!allThreads) return;

    const newNotifications: { threadId: number; newReplies: number }[] = [];

    watchedThreads.forEach(watched => {
      const currentThread = allThreads.find(t => t.id === watched.id);
      if (currentThread && currentThread.replyCount > watched.lastReplyCount) {
        const newReplies = currentThread.replyCount - watched.lastReplyCount;
        newNotifications.push({ threadId: watched.id, newReplies });
        
        // Update the last reply count
        setWatchedThreads(prev => 
          prev.map(w => 
            w.id === watched.id 
              ? { ...w, lastReplyCount: currentThread.replyCount }
              : w
          )
        );
      }
    });

    if (newNotifications.length > 0) {
      setNotifications(prev => [...prev, ...newNotifications]);
    }
  }, [allThreads, watchedThreads]);

  const addWatchedThread = (thread: Thread) => {
    const isAlreadyWatched = watchedThreads.some(w => w.id === thread.id);
    if (!isAlreadyWatched) {
      setWatchedThreads(prev => [...prev, {
        id: thread.id,
        subject: thread.subject || `Thread #${thread.id}`,
        lastReplyCount: thread.replyCount
      }]);
    }
  };

  const removeWatchedThread = (threadId: number) => {
    setWatchedThreads(prev => prev.filter(w => w.id !== threadId));
    setNotifications(prev => prev.filter(n => n.threadId !== threadId));
  };

  const clearNotification = (threadId: number) => {
    setNotifications(prev => prev.filter(n => n.threadId !== threadId));
  };

  // Expose addWatchedThread globally so other components can use it
  useEffect(() => {
    (window as any).addWatchedThread = addWatchedThread;
  }, []);

  if (watchedThreads.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-blue-50 border border-gray-400 rounded shadow-lg max-w-xs">
        <div className="flex items-center justify-between p-2 bg-gray-200 border-b border-gray-400">
          <div className="flex items-center gap-2 text-xs font-bold">
            <Eye className="w-3 h-3" />
            Thread Watcher ({watchedThreads.length})
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? '+' : '−'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={() => setWatchedThreads([])}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        {!isMinimized && (
          <div className="max-h-48 overflow-y-auto">
            {watchedThreads.map(thread => {
              const notification = notifications.find(n => n.threadId === thread.id);
              return (
                <div key={thread.id} className="p-2 border-b border-gray-300 text-xs">
                  <div className="flex items-center justify-between">
                    <a 
                      href={`/thread/${thread.id}`}
                      className="text-blue-600 hover:underline flex-1 truncate"
                      onClick={() => clearNotification(thread.id)}
                    >
                      {thread.subject}
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => removeWatchedThread(thread.id)}
                    >
                      <X className="w-2 h-2" />
                    </Button>
                  </div>
                  {notification && (
                    <div className="text-red-600 font-bold mt-1">
                      +{notification.newReplies} new {notification.newReplies === 1 ? 'reply' : 'replies'}!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}