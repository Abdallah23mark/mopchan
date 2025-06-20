import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import FileInputButton from "./file-input-button";
import { parseNameField } from "@/utils/tripcode";
import AdminPostToggle from "./admin-post-toggle";

interface QuickReplyModalProps {
  threadId: number;
  trigger: React.ReactNode;
}

export default function QuickReplyModal({ threadId, trigger }: QuickReplyModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [isAdminPost, setIsAdminPost] = useState(false);

  // Check for pending quotes when modal opens
  useEffect(() => {
    if (open) {
      const pendingQuote = localStorage.getItem('pendingQuote');
      if (pendingQuote) {
        setContent(pendingQuote);
        localStorage.removeItem('pendingQuote');
      }
    }
  }, [open]);

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
      setName("");
      setIsAdminPost(false);
      setOpen(false);
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
    formData.append("name", parsedName);
    if (tripcode) formData.append("tripcode", tripcode);
    if (isAdminPost) formData.append("isAdminPost", "true");

    createPostMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl" style={{ backgroundColor: '#E0E8FF' }}>
        <AdminPostToggle 
          onToggle={setIsAdminPost}
          defaultValue={isAdminPost}
        />
        <DialogHeader>
          <DialogTitle className="text-red-800 font-bold">Quick Reply</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="block text-xs font-bold mb-1">Name (Optional)</Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              placeholder="Anonymous (add #password for tripcode)"
              className="w-full p-2 text-xs border border-gray-400 font-sans"
            />
          </div>
          
          <div>
            <Textarea
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="Comment
Use >text for greentext
Use >>No. 123 to quote posts"
              className="w-full p-2 text-xs border border-gray-400 font-sans resize-none"
              required
            />
          </div>
          <div>
            <FileInputButton
              accept="image/*"
              onChange={setImage}
              className="bg-white border border-gray-400 text-xs theme-text-main hover:bg-gray-100 mb-2"
            >
              {image ? `Selected: ${image.name}` : "Choose File"}
            </FileInputButton>
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
              Posting as: <span className={`font-bold ${isAdminPost ? 'text-red-600' : 'text-green-600'}`}>
                {name.trim() ? parseNameField(name).name : "Anonymous"}
              </span>
              {isAdminPost && <span className="text-red-600 ml-1">(Admin)</span>}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}