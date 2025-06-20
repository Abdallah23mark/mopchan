import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import FileInputButton from "./file-input-button";
import AdminPostToggle from "./admin-post-toggle";
import { parseNameField } from "@/utils/tripcode";

interface QuickReplyProps {
  threadId: number;
}

export default function QuickReply({ threadId }: QuickReplyProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [isAdminPost, setIsAdminPost] = useState(false);

  const createPostMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const token = localStorage.getItem("adminToken");
      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      
      const res = await fetch(`/api/threads/${threadId}/posts`, {
        method: "POST",
        headers,
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
      setName("");
      setIsAdminPost(false);
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
    
    const { name: parsedName, tripcode } = parseNameField(name);
    if (parsedName) formData.append("name", parsedName);
    if (tripcode) formData.append("tripcode", tripcode);
    if (isAdminPost) formData.append("isAdminPost", "true");

    createPostMutation.mutate(formData);
  };

  return (
    <div className="mt-6 bg-blue-50 border border-gray-400 p-4 relative">
      <AdminPostToggle 
        onToggle={setIsAdminPost}
        defaultValue={isAdminPost}
      />
      <h3 className="font-bold text-sm mb-3">Quick Reply</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label className="block text-xs font-bold mb-1">Name (Optional)</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Anonymous"
            className="w-full p-2 text-xs border border-gray-400"
          />
        </div>

        <div>
          <Label className="block text-xs font-bold mb-1">Comment *</Label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            required
            placeholder="Enter your reply here...
Use >text for greentext
Use >>No. 123 to quote posts"
            className="w-full p-2 text-xs border border-gray-400 font-sans resize-none"
          />
        </div>
        
        <div>
          <Label className="block text-xs font-bold mb-1">Image (Optional)</Label>
          <FileInputButton
            accept="image/*,video/webm"
            onChange={setImage}
            className="bg-white border border-gray-400 text-xs theme-text-main hover:bg-gray-100"
          >
            {image ? `Selected: ${image.name}` : "Choose File"}
          </FileInputButton>
          <div className="text-xs text-gray-600 mt-1">
            Max file size: 3MB. Supported formats: JPG, PNG, GIF, WEBP, WEBM
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button
            type="submit"
            disabled={createPostMutation.isPending}
            className="bg-white border border-gray-400 px-6 py-2 text-xs hover:bg-gray-100 text-black"
          >
            {createPostMutation.isPending ? "Posting..." : "Post Reply"}
          </Button>
          <div className="text-xs text-gray-600">
            Posting as: <span className={`font-bold ${isAdminPost ? 'text-red-600' : 'text-green-600'}`}>
              {name.trim() ? parseNameField(name).name : "Anonymous"}
            </span>
            {isAdminPost && <span className="text-red-600 ml-1">(Admin)</span>}
          </div>
        </div>
      </form>
    </div>
  );
}
