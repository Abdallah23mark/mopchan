import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AdminPostToggleProps {
  onToggle: (isAdminPost: boolean) => void;
  defaultValue?: boolean;
}

export default function AdminPostToggle({ onToggle, defaultValue = false }: AdminPostToggleProps) {
  const [isAdminPost, setIsAdminPost] = useState(defaultValue);
  
  // Check if user is admin
  const { data: adminUser } = useQuery({
    queryKey: ["/api/admin/verify"],
    queryFn: async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) return null;
      
      const response = await fetch("/api/admin/verify", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return null;
      return response.json();
    },
    retry: false,
  });

  useEffect(() => {
    onToggle(isAdminPost);
  }, [isAdminPost, onToggle]);

  // Don't show toggle if not admin
  if (!adminUser?.user?.isAdmin) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <Button
        type="button"
        size="sm"
        variant={isAdminPost ? "default" : "outline"}
        onClick={() => setIsAdminPost(!isAdminPost)}
        className={isAdminPost ? "bg-red-600 hover:bg-red-700 text-white" : ""}
        data-admin-post={isAdminPost ? "true" : "false"}
      >
        {isAdminPost ? "Admin Post ON" : "Admin Post OFF"}
      </Button>
      {isAdminPost && (
        <span className="text-red-600 text-xs">
          (Posts with red text)
        </span>
      )}
    </div>
  );
}