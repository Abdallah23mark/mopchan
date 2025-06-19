import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface BanUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  ipAddress: string;
  adminToken: string;
}

export default function BanUserModal({ isOpen, onClose, ipAddress, adminToken }: BanUserModalProps) {
  const [banType, setBanType] = useState<"temp" | "perm">("temp");
  const [length, setLength] = useState("24");
  const [reason, setReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const banMutation = useMutation({
    mutationFn: async () => {
      const expiresAt = banType === "perm" ? null : new Date(Date.now() + parseInt(length) * 60 * 60 * 1000);
      
      await apiRequest("/api/admin/ban", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          ipAddress,
          reason,
          expiresAt
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "User Banned",
        description: `IP ${ipAddress} has been banned successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bans"] });
      onClose();
      // Reset form
      setBanType("temp");
      setLength("24");
      setReason("");
    },
    onError: (error) => {
      toast({
        title: "Ban Failed", 
        description: error.message || "Failed to ban user",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for the ban.",
        variant: "destructive",
      });
      return;
    }
    banMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium">IP Address</Label>
            <div className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
              {ipAddress || "Unknown"}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Ban Type</Label>
            <RadioGroup value={banType} onValueChange={(value: "temp" | "perm") => setBanType(value)}>
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
              <Label htmlFor="length" className="text-sm font-medium">
                Length (hours)
              </Label>
              <Input
                id="length"
                type="number"
                min="1"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder="24"
              />
            </div>
          )}

          <div>
            <Label htmlFor="reason" className="text-sm font-medium">
              Reason
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for ban..."
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="destructive"
              disabled={banMutation.isPending}
            >
              {banMutation.isPending ? "Banning..." : "Ban User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}