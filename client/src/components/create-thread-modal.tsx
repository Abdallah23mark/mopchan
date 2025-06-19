import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import FileInputButton from "./file-input-button";
import { parseNameField } from "@/utils/tripcode";

interface CreateThreadModalProps {
  trigger: React.ReactNode;
}

export default function CreateThreadModal({ trigger }: CreateThreadModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [name, setName] = useState("");

  const createThreadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const token = localStorage.getItem("adminToken");
      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      
      const res = await fetch("/api/threads", {
        method: "POST",
        headers,
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
      setOpen(false);
      setSubject("");
      setContent("");
      setImage(null);
      setName("");
      // Navigate to the new thread
      window.location.href = `/thread/${thread.id}`;
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
    
    const { name: parsedName, tripcode } = parseNameField(name);
    formData.append("name", parsedName);
    if (tripcode) formData.append("tripcode", tripcode);

    createThreadMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl" style={{ backgroundColor: '#E0E8FF' }}>
        <DialogHeader>
          <DialogTitle className="text-red-800 font-bold">Start a New Thread</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Enter your message here...
Use >text for greentext
Use >>No. 123 to quote posts"
              className="w-full p-2 text-xs border border-gray-400 font-sans resize-none"
            />
          </div>
          
          <div>
            <Label className="block text-xs font-bold mb-1">Image (Optional)</Label>
            <div className="mb-2">
              <FileInputButton
                accept="image/*"
                onChange={setImage}
                className="bg-white border border-gray-400 text-xs theme-text-main hover:bg-gray-100"
              >
                {image ? `Selected: ${image.name}` : "Choose File"}
              </FileInputButton>
            </div>
            <div className="text-xs text-gray-600">
              Max file size: 3MB. Supported formats: JPG, PNG, GIF, WEBP
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
      </DialogContent>
    </Dialog>
  );
}