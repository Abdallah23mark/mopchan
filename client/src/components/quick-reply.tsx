import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface QuickReplyProps {
  threadId: number;
}

export default function QuickReply({ threadId }: QuickReplyProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const createPostMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(`/api/threads/${threadId}/posts`, {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create post");
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/threads", threadId] });
      queryClient.invalidateQueries({ queryKey: ["/api/threads"] });
      toast({ title: "Reply posted successfully!" });
      setContent("");
      setImage(null);
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    },
    onError: (error) => {
      toast({ 
        title: "Failed to post reply", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({ title: "Content is required", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append("content", content.trim());
    if (image) formData.append("image", image);

    createPostMutation.mutate(formData);
  };

  return (
    <div className="mt-6 bg-blue-50 border border-gray-400 p-4">
      <h3 className="font-bold text-sm mb-3">Quick Reply</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Textarea
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="Comment"
            className="w-full p-2 text-xs border border-gray-400 font-sans resize-none"
            required
          />
        </div>
        <div>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="text-xs"
          />
          <div className="text-xs text-gray-600 mt-1">
            Max file size: 3MB. Supported: JPG, PNG, GIF
          </div>
        </div>
        <div className="flex justify-between items-center">
          <Button
            type="submit"
            disabled={createPostMutation.isPending}
            className="bg-white border border-gray-400 px-4 py-1 text-xs hover:bg-gray-100 text-black"
          >
            {createPostMutation.isPending ? "Posting..." : "Post Reply"}
          </Button>
          <div className="text-xs text-gray-600">
            Posting as: <span className="font-bold text-green-600">Anonymous</span>
          </div>
        </div>
      </form>
    </div>
  );
}
