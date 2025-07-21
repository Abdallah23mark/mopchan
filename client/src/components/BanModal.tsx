import { useState } from "react";

interface BanModalProps {
  ip: string;
  onClose: () => void;
  onBanned: () => void;
}

export function BanModal({ ip, onClose, onBanned }: BanModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("jwt");

  const handleBan = async () => {
    if (!reason.trim()) {
      setError("Please provide a reason.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/ban", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ip, reason }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to ban IP.");
      } else {
        onBanned(); // Notify parent
        onClose();  // Close modal
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-neutral-900 p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h2 className="text-lg font-semibold text-white mb-4">Ban IP: {ip}</h2>
        <textarea
          className="w-full p-2 rounded bg-neutral-800 text-white mb-2 resize-none"
          rows={3}
          placeholder="Reason for ban"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-500 text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleBan}
            disabled={loading}
            className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white"
          >
            {loading ? "Banning..." : "Ban"}
          </button>
        </div>
      </div>
    </div>
  );
}
