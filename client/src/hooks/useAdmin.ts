import { useState, useEffect } from "react";

interface AdminState {
  isAdmin: boolean;
  isLoading: boolean;
  user: any;
  token: string | null;
}

export function useAdmin(): AdminState {
  const [state, setState] = useState<AdminState>({
    isAdmin: false,
    isLoading: true,
    user: null,
    token: null
  });

  const checkAdminStatus = () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setState({ isAdmin: false, isLoading: false, user: null, token: null });
      return;
    }

    // Verify token with server
    fetch("/api/admin/verify", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error("Invalid token");
    })
    .then(data => {
      setState({
        isAdmin: true,
        isLoading: false,
        user: data.user,
        token
      });
    })
    .catch(() => {
      localStorage.removeItem("adminToken");
      setState({ isAdmin: false, isLoading: false, user: null, token: null });
    });
  };

  useEffect(() => {
    checkAdminStatus();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "adminToken") {
        checkAdminStatus();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Also check periodically in case localStorage was updated in same tab
    const interval = setInterval(checkAdminStatus, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return state;
}