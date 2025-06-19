import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AdminStatsProps {
  token: string;
}

interface DailyStats {
  date: string;
  threads: number;
  posts: number;
  visitors: number;
}

interface AllTimeStats {
  totalThreads: number;
  totalPosts: number;
  totalUsers: number;
  totalVisitors: number;
}

export default function AdminStats({ token }: AdminStatsProps) {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await apiRequest("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },
  });

  const stats = statsData?.daily || [];
  const allTimeStats = statsData?.allTime || {
    totalThreads: 0,
    totalPosts: 0,
    totalUsers: 0,
    totalVisitors: 0
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading statistics...</div>;
  }

  const today = stats.find((s: DailyStats) => {
    const today = new Date().toISOString().split('T')[0];
    return s.date === today;
  }) || { threads: 0, posts: 0, visitors: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold mb-4">All-Time Statistics</h3>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded border">
            <div className="text-2xl font-bold text-blue-600">{allTimeStats.totalThreads}</div>
            <div className="text-sm text-gray-600">Total Threads</div>
          </div>
          <div className="bg-green-50 p-4 rounded border">
            <div className="text-2xl font-bold text-green-600">{allTimeStats.totalPosts}</div>
            <div className="text-sm text-gray-600">Total Posts</div>
          </div>
          <div className="bg-purple-50 p-4 rounded border">
            <div className="text-2xl font-bold text-purple-600">{allTimeStats.totalVisitors}</div>
            <div className="text-sm text-gray-600">Total Visitors</div>
          </div>
          <div className="bg-orange-50 p-4 rounded border">
            <div className="text-2xl font-bold text-orange-600">{allTimeStats.totalUsers}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Today's Statistics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded border">
            <div className="text-2xl font-bold text-blue-600">{today.threads}</div>
            <div className="text-sm text-gray-600">New Threads</div>
          </div>
          <div className="bg-green-50 p-4 rounded border">
            <div className="text-2xl font-bold text-green-600">{today.posts}</div>
            <div className="text-sm text-gray-600">New Posts</div>
          </div>
          <div className="bg-purple-50 p-4 rounded border">
            <div className="text-2xl font-bold text-purple-600">{today.visitors}</div>
            <div className="text-sm text-gray-600">Unique Visitors</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-3">Recent Daily Activity</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {stats.length === 0 ? (
            <p className="text-gray-500 text-sm">No data available</p>
          ) : (
            stats.slice(0, 7).map((stat: DailyStats) => (
              <div key={stat.date} className="flex justify-between items-center p-2 border rounded text-sm">
                <div className="font-medium">{stat.date}</div>
                <div className="flex gap-4 text-xs">
                  <span className="text-blue-600">{stat.threads} threads</span>
                  <span className="text-green-600">{stat.posts} posts</span>
                  <span className="text-purple-600">{stat.visitors} visitors</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}