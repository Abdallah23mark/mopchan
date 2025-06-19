import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Post } from "@shared/schema";

interface BanModalProps {
  open: boolean;
  onClose: () => void;
  post: Post;
}

export default function BanModal({ open, onClose, post }: BanModalProps) {
  const [banType, setBanType] = useState<"temp" | "perm">("temp");
  const [duration, setDuration] = useState("1");
  const [reason, setReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const banMutation = useMutation({
    mutationFn: async () => {
      const banData = {
        ipAddress: post.ipAddress,
        reason,
        type: banType,
        duration: banType === "temp" ? parseInt(duration) : null
      };
      
      return apiRequest("/api/admin/ban", {
        method: "POST",
        body: JSON.stringify(banData),
        headers: {
          "Content-Type": "application/json"
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "User banned",
        description: `IP address banned ${banType === "perm" ? "permanently" : `for ${duration} days`}`
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bans"] });
      onClose();
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to ban user",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setBanType("temp");
    setDuration("1");
    setReason("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for the ban",
        variant: "destructive"
      });
      return;
    }
    banMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Ban Type</Label>
            <RadioGroup value={banType} onValueChange={(value) => setBanType(value as "temp" | "perm")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="temp" id="temp" />
                <Label htmlFor="temp">Temporary</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="perm" id="perm" />
                <Label htmlFor="perm">Permanent</Label>
              </div>
            </RadioGroup>
          </div>

          {banType === "temp" && (
            <div>
              <Label htmlFor="duration" className="text-sm font-medium">Duration (days)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="365"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="mt-1"
              />
            </div>
          )}

          <div>
            <Label htmlFor="reason" className="text-sm font-medium">Reason</Label>
            <Textarea
              id="reason"
              placeholder="Enter ban reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={banMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {banMutation.isPending ? "Banning..." : "Ban User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}