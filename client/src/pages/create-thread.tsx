import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

export default function CreateThread() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [sage, setSage] = useState(false);

  const createThreadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/threads", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create thread");
      }
      
      return res.json();
    },
    onSuccess: (thread) => {
      queryClient.invalidateQueries({ queryKey: ["/api/threads"] });
      toast({ title: "Thread created successfully!" });
      setLocation(`/thread/${thread.id}`);
    },
    onError: (error) => {
      toast({ 
        title: "Failed to create thread", 
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
    if (subject.trim()) formData.append("subject", subject.trim());
    formData.append("content", content.trim());
    if (image) formData.append("image", image);
    if (sage) formData.append("sage", "true");

    createThreadMutation.mutate(formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 theme-bg-main">
      <div className="mb-4">
        <div className="text-xs text-gray-600 mb-2">
          <Link href="/" className="text-blue-600 underline">Return to Catalog</Link>
        </div>
        <h2 className="text-lg font-bold theme-text-quote mb-2">Start a New Thread</h2>
        <div className="text-xs text-gray-600 mb-4">
          Remember: All the stories and information posted here are artistic works of fiction.
        </div>
      </div>

      <div className="theme-bg-post theme-border border p-4 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="block text-xs font-bold mb-1">Subject (Optional)</Label>
            <Input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={75}
              placeholder="Subject"
              className="w-full p-2 text-xs border border-gray-400 font-sans"
            />
          </div>
          
          <div>
            <Label className="block text-xs font-bold mb-1">Comment *</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              required
              placeholder="Enter your message here..."
              className="w-full p-2 text-xs border border-gray-400 font-sans resize-none"
            />
          </div>
          
          <div>
            <Label className="block text-xs font-bold mb-1">Image (Optional)</Label>
            <Input
              type="file"
              accept="image/*,video/webm"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="text-xs mb-2"
            />
            <div className="text-xs text-gray-600">
              Max file size: 3MB. Supported formats: JPG, PNG, GIF, WEBP, WEBM
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button
              type="submit"
              disabled={createThreadMutation.isPending}
              className="bg-white border border-gray-400 px-6 py-2 text-xs hover:bg-gray-100 text-black"
            >
              {createThreadMutation.isPending ? "Creating..." : "Create Thread"}
            </Button>
            <div className="text-xs text-gray-600">
              Posting as: <span className="font-bold text-green-600">Anonymous</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
