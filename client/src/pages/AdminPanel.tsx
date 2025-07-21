import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BanModal } from "../components/BanModal";

interface BanEntry {
  ip: string;
  reason: string;
  createdAt: string;
}

interface Thread {
  id: number;
  title: string;
  createdAt: string;
  isPinned: boolean;
}

export function AdminPanel() {
  const [bans, setBans] = useState<BanEntry[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedIp, setSelectedIp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("jwt");

  useEffect(() => {
    if (!token) {
      navigate("/");
    } else {
      fetchBans();
      fetchThreads();
    }
  }, []);

  // Fetch IP bans
  async function fetchBans() {
    try {
      const res = await fetch("/api/admin/bans", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBans(data.bans || []);
      }
    } catch (err) {
      console.error("Failed to fetch bans");
    }
  }

  // Fetch threads
  async function fetchThreads() {
    try {
      const res = await fetch("/api/catalog/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch threads");
      const data = await res.json();
      setThreads(data);
    } catch (err) {
      setError("Failed to load threads");
    }
  }

  async function togglePin(id: number, pin: boolean) {
    const res = await fetch("/api/admin/pin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ threadId: id, pin }),
    });
    if (res.ok) fetchThreads();
  }

  async function deleteThread(id: number) {
    const res = await fetch(`/api/admin/thread/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) fetchThreads();
  }

  return (
    <div className="p-4 max-w-4xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      {/* Thread Controls */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Threads</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <ul className="space-y-4">
          {threads.map((thread) => (
            <li key={thread.id} className="bg-neutral-800 p-4 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{thread.title || "(No Title)"}</h3>
                  <p className="text-sm text-gray-400">
                    {new Date(thread.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => togglePin(thread.id, !thread.isPinned)}
                    className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-500"
                  >
                    {thread.isPinned ? "Unpin" : "Pin"}
                  </button>
                  <button
                    onClick={() => deleteThread(thread.id)}
                    className="px-2 py-1 bg-red-600 rounded hover:bg-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* IP Ban List */}
      <section>
        <h2 className="text-xl font-semibold mb-4">IP Bans</h2>
        <table className="w-full text-sm text-left text-white bg-neutral-900 rounded">
          <thead className="bg-neutral-800 text-xs uppercase text-gray-300">
            <tr>
              <th className="px-4 py-2">IP</th>
              <th className="px-4 py-2">Reason</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bans.map((ban) => (
              <tr key={ban.ip} className="border-t border-neutral-700">
                <td className="px-4 py-2">{ban.ip}</td>
                <td className="px-4 py-2">{ban.reason}</td>
                <td className="px-4 py-2">{new Date(ban.createdAt).toLocaleString()}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => setSelectedIp(ban.ip)}
                    className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-white text-xs"
                  >
                    Ban Again
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selectedIp && (
          <BanModal
            ip={selectedIp}
            onClose={() => setSelectedIp(null)}
            onBanned={fetchBans}
          />
        )}
      </section>
    </div>
  );
}
