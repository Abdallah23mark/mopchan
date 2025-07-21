import type { Thread } from "../../../shared/types";
import { Link } from "react-router-dom";

type ThreadListProps = {
  threads: Thread[];
};

export function ThreadList({ threads }: ThreadListProps) {
  if (threads.length === 0) {
    return <p className="text-gray-300 text-center mt-6">No threads found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {threads.map((thread) => (
        <Link
          key={thread.id}
          to={`/thread/${thread.id}`}
          className="bg-neutral-900 border border-neutral-700 rounded p-3 hover:bg-neutral-800 transition-colors"
        >
          {thread.imageUrl && (
            <img
              src={thread.imageUrl}
              alt="Thread image"
              className="max-h-48 mx-auto mb-2 object-contain rounded"
            />
          )}
          <p className="text-white text-sm whitespace-pre-wrap">
            {thread.content.slice(0, 180)}...
          </p>
        </Link>
      ))}
    </div>
  );
}

