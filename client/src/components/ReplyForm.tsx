import { useState } from "react";
import axios from "axios";

type Props = {
  threadId: number;
  onReplyCreated: () => void;
};

export function ReplyForm({ threadId, onReplyCreated }: Props) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      return setError("Reply text is required.");
    }
    if (!image) {
      return setError("Image is required.");
    }

    const formData = new FormData();
    formData.append("content", content);
    formData.append("image", image);
    formData.append("threadId", threadId.toString());

    try {
      setLoading(true);
      await axios.post(`/api/thread/${threadId}/reply`, formData);
      setContent("");
      setImage(null);
      onReplyCreated();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to post reply.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-neutral-900 p-4 rounded mt-4 shadow">
      <textarea
        className="w-full p-2 bg-neutral-800 text-white rounded resize-none"
        rows={3}
        placeholder="Write your reply..."
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
        className="mt-3 bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded"
      >
        {loading ? "Posting..." : "Post Reply"}
      </button>
    </form>
  );
}
