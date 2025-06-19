import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";

interface AdminPostToggleProps {
  onToggle: (isAdminPost: boolean) => void;
  defaultValue?: boolean;
}

export default function AdminPostToggle({ onToggle, defaultValue = false }: AdminPostToggleProps) {
  const [isAdminPost, setIsAdminPost] = useState(defaultValue);
  const { isAdmin, isLoading: adminLoading } = useAdmin();

  useEffect(() => {
    onToggle(isAdminPost);
  }, [isAdminPost, onToggle]);

  // Only show if user is admin
  if (adminLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="absolute top-4 right-14 z-10">
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