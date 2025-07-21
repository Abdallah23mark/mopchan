// client/src/components/ThreadPreview.tsx

type ThreadPreviewProps = {
  thread: {
    id: number;
    title: string;
    postCount: number;
    imageUrl?: string;
    createdAt: string;
  };
};

export function ThreadPreview({ thread }: ThreadPreviewProps) {
  return (
    <div className="flex flex-col gap-2">
      {thread.imageUrl && (
        <img
          src={thread.imageUrl}
          alt="Thread Image"
          className="w-full h-48 object-cover rounded"
        />
      )}
      <div className="text-sm text-gray-700 font-semibold">{thread.title || "(no title)"}</div>
      <div className="text-xs text-gray-500">
        {thread.postCount} replies • {new Date(thread.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}
