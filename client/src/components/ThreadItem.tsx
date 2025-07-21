import { Link } from "react-router-dom";

type Thread = {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: string;
  replyCount: number;
};

type Props = {
  thread: Thread;
};

export function ThreadItem({ thread }: Props) {
  return (
    <Link to={`/thread/${thread.id}`} className="block bg-neutral-900 hover:bg-neutral-800 p-4 rounded shadow">
      <div className="flex gap-4">
        <img
          src={thread.imageUrl}
          alt="thread"
          className="w-24 h-24 object-cover rounded"
        />
        <div className="flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              {thread.title || "(No Title)"}
            </h3>
            <p className="text-sm text-gray-300 line-clamp-3">
              {thread.content}
            </p>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {new Date(thread.createdAt).toLocaleString()} · {thread.replyCount} replies
          </div>
        </div>
      </div>
    </Link>
  );
}
