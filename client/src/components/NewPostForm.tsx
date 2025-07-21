import { useState } from "react";

type NewPostFormProps = {
  threadId: number;
  onPostSuccess: () => void;
};

export function NewPostForm({ threadId, onPostSuccess }: NewPostFormProps) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!image) {
      setError("An image is required.");
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("content", content);
    formData.append("image", image);

    try {
      const res = await fetch(`/api/thread/${threadId}/post`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const { error } = await res.json();
        setError(error || "Something went wrong");
      } else {
        setContent("");
        setImage(null);
        onPostSuccess(); // Refresh thread
      }
    } catch (err) {
      setError("Failed to post. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mt-6 border-t pt-4">
      {error && <div className="text-red-400 text-sm">{error}</div>}

      <textarea
        className="w-full p-2 bg-neutral-800 border border-gray-600 rounded text-white"
        placeholder="Write your reply here..."
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />

      <input
        type="file"
        accept="image/*"
        required
        onChange={(e) => setImage(e.target.files?.[0] || null)}
        className="block text-sm text-gray-300"
      />

      <button
        type="submit"
        disabled={submitting}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {submitting ? "Posting..." : "Post Reply"}
      </button>
    </form>
  );
}
