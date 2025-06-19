import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import AdminStats from "./admin-stats";
import type { User, IpBan } from "@shared/schema";

interface AdminPanelProps {
  user: User;
  token: string;
  onClose: () => void;
}

export default function AdminPanel({ user, token, onClose }: AdminPanelProps) {
  const [banIP, setBanIP] = useState("");
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("");
  const [activeTab, setActiveTab] = useState<"bans" | "stats">("bans");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bans = [] } = useQuery({
    queryKey: ["/api/admin/bans"],
    queryFn: async () => {
      const response = await apiRequest("/api/admin/bans", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },
  });

  const banMutation = useMutation({
    mutationFn: async (data: { ipAddress: string; reason: string; duration?: number }) => {
      await apiRequest("/api/admin/ban", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bans"] });
      setBanIP("");
      setBanReason("");
      setBanDuration("");
      toast({
        title: "IP banned successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to ban IP",
        variant: "destructive",
      });
    },
  });

  const unbanMutation = useMutation({
    mutationFn: async (ipAddress: string) => {
      await apiRequest(`/api/admin/ban/${encodeURIComponent(ipAddress)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bans"] });
      toast({
        title: "IP unbanned successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to unban IP",
        variant: "destructive",
      });
    },
  });

  const handleBan = (e: React.FormEvent) => {
    e.preventDefault();
    if (banIP.trim()) {
      const duration = banDuration ? parseInt(banDuration) : undefined;
      banMutation.mutate({
        ipAddress: banIP.trim(),
        reason: banReason.trim() || "No reason provided",
        duration,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded border theme-border max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Admin Panel</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Logged in as: <span className="font-medium">{user.username}</span>
            {user.redText && <span className="text-red-600 ml-2">[Red Text Enabled]</span>}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab("bans")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "bans"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Ban Management
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "stats"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Statistics
          </button>
        </div>

        {activeTab === "bans" && (
          <div className="space-y-6">
            {/* Ban IP Section */}
            <div>
            <h3 className="font-bold mb-3">Ban IP Address</h3>
            <form onSubmit={handleBan} className="space-y-3">
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="IP Address (required)"
                    value={banIP}
                    onChange={(e) => setBanIP(e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Duration in days (empty = permanent)"
                    type="number"
                    min="0"
                    value={banDuration}
                    onChange={(e) => setBanDuration(e.target.value)}
                  />
                </div>
                <Input
                  placeholder="Ban reason (optional but recommended)"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                disabled={banMutation.isPending}
                size="sm"
              >
                {banMutation.isPending ? "Banning..." : "Ban IP"}
              </Button>
            </form>
          </div>

          {/* Active Bans Section */}
          <div>
            <h3 className="font-bold mb-3">Ban Management ({bans.length} total)</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {bans.length === 0 ? (
                <p className="text-gray-500 text-sm">No bans</p>
              ) : (
                bans.map((ban: IpBan) => {
                  const isExpired = ban.expiresAt && new Date(ban.expiresAt) < new Date();
                  const isPermanent = !ban.expiresAt;
                  
                  return (
                    <div key={ban.id} className={`p-3 border rounded text-sm ${isExpired ? 'bg-gray-50 opacity-75' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-mono font-bold text-base">{ban.ipAddress}</div>
                          
                          <div className="mt-1 space-y-1">
                            <div>
                              <span className="font-medium">Reason:</span> 
                              <span className="ml-1">{ban.reason || "No reason provided"}</span>
                            </div>
                            
                            <div>
                              <span className="font-medium">Banned:</span> 
                              <span className="ml-1">{new Date(ban.createdAt).toLocaleString()}</span>
                            </div>
                            
                            <div>
                              <span className="font-medium">Duration:</span> 
                              <span className="ml-1">
                                {isPermanent ? (
                                  <span className="text-red-600 font-medium">Permanent</span>
                                ) : isExpired ? (
                                  <span className="text-green-600">Expired ({new Date(ban.expiresAt).toLocaleString()})</span>
                                ) : (
                                  <span>Until {new Date(ban.expiresAt!).toLocaleString()}</span>
                                )}
                              </span>
                            </div>
                            
                            {ban.bannedBy && (
                              <div>
                                <span className="font-medium">Banned by:</span> 
                                <span className="ml-1">Admin ID #{ban.bannedBy}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          {!isExpired && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => unbanMutation.mutate(ban.ipAddress)}
                              disabled={unbanMutation.isPending}
                            >
                              Unban
                            </Button>
                          )}
                          {isExpired && (
                            <span className="text-xs text-green-600 font-medium">EXPIRED</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        )}

        {activeTab === "stats" && (
          <AdminStats token={token} />
        )}
      </div>
    </div>
  );
}