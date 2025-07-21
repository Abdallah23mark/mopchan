import { useEffect, useState } from "react";
import axios from "axios";

type Reply = {
  id: number;
  content: string;
  imageUrl: string;
  createdAt: string;
};

type Props = {
  threadId: number;
};

export function ReplyList({ threadId }: Props) {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReplies = async () => {
    try {
      const res = await axios.get(`/api/thread/${threadId}/replies`);
      setReplies(res.data);
    } catch (err: any) {
      setError("Failed to load replies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReplies();
  }, [threadId]);

  if (loading) return <p className="text-white">Loading replies...</p>;
  if (error) return <p className="text-red-400">{error}</p>;
  if (replies.length === 0) return <p className="text-white">No replies yet.</p>;

  return (
    <div className="mt-6 space-y-6">
      {replies.map((reply) => (
        <div key={reply.id} className="bg-neutral-900 p-4 rounded shadow">
          <img
            src={reply.imageUrl}
            alt="reply"
            className="max-w-xs mb-2 rounded"
          />
          <p className="text-white whitespace-pre-line">{reply.content}</p>
          <span className="text-sm text-gray-500 mt-1 block">
            Posted on {new Date(reply.createdAt).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
