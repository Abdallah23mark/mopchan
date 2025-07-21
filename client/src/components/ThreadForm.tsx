import { useState } from "react";
import axios from "axios";

type Props = {
  onThreadCreated: () => void;
};

export function ThreadForm({ onThreadCreated }: Props) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      return setError("Thread text is required.");
    }
    if (!image) {
      return setError("Image is required.");
    }

    const formData = new FormData();
    formData.append("content", content);
    formData.append("image", image);

    try {
      setLoading(true);
      await axios.post("/api/thread", formData);
      setContent("");
      setImage(null);
      onThreadCreated();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create thread.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-neutral-900 p-4 rounded shadow mt-4">
      <textarea
        className="w-full p-2 rounded bg-neutral-800 text-white resize-none"
        rows={4}
        placeholder="Start a new thread..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
        className="mt-2 text-white"
        required
      />

      {error && <p className="text-red-400 mt-2">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-3 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded"
      >
        {loading ? "Posting..." : "Create Thread"}
      </button>
    </form>
  );
}
