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

  useEffect(() => {
    // Clear any existing admin state on initialization
    setState({ isAdmin: false, isLoading: false, user: null, token: null });
  }, []);

  return state;
}