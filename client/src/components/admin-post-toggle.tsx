import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";

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

  const handleToggle = (checked: boolean) => {
    setIsAdminPost(checked);
  };

  return (
    <div className="flex items-center space-x-2 text-sm mr-8">
      <label htmlFor="admin-post" className="text-xs font-medium cursor-pointer">
        Admin Text
      </label>
      <Checkbox
        id="admin-post"
        checked={isAdminPost}
        onCheckedChange={handleToggle}
      />
    </div>
  );
}