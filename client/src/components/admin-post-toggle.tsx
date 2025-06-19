import { useState, useEffect } from "react";
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

  return (
    <div className="absolute top-2 right-12 z-10">
      <button
        type="button"
        onClick={() => setIsAdminPost(!isAdminPost)}
        className={`px-3 py-1 text-xs font-medium rounded border transition-colors ${
          isAdminPost 
            ? "bg-red-600 text-white border-red-600 hover:bg-red-700" 
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
        }`}
      >
        {isAdminPost ? "Admin Post ON" : "Admin Post OFF"}
      </button>
    </div>
  );
}