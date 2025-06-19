import { useState, useEffect } from "react";

interface AdminPostToggleProps {
  onToggle: (isAdminPost: boolean) => void;
  defaultValue?: boolean;
}

export default function AdminPostToggle({ onToggle, defaultValue = false }: AdminPostToggleProps) {
  const [isAdminPost, setIsAdminPost] = useState(defaultValue);

  useEffect(() => {
    onToggle(isAdminPost);
  }, [isAdminPost, onToggle]);

  // Admin controls completely disabled for security
  return null;
}