import { useQuery } from "@tanstack/react-query";

export function useAdmin() {
  const { data: adminData, isLoading, error } = useQuery({
    queryKey: ["/api/admin/verify"],
    queryFn: async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        return { user: null, isAdmin: false };
      }
      
      try {
        const response = await fetch("/api/admin/verify", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!response.ok) {
          return { user: null, isAdmin: false };
        }
        
        const result = await response.json();
        return {
          user: result.user,
          isAdmin: result.user?.isAdmin === true
        };
      } catch (error) {
        return { user: null, isAdmin: false };
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user: adminData?.user || null,
    isAdmin: adminData?.isAdmin === true,
    isLoading: isLoading,
    hasToken: !!localStorage.getItem("adminToken")
  };
}