// client/src/components/Post.tsx

import React from "react";

type PostProps = {
  post: {
    id: number;
    content: string;
    imageUrl?: string;
    createdAt: string;
  };
};

export const Post: React.FC<PostProps> = ({ post }) => {
  const time = new Date(post.createdAt).toLocaleString();

  return (
    <div className="border border-green-500 p-4 rounded bg-neutral-900 text-white space-y-2">
      <div className="text-sm text-green-300">
        <span>Post No.{post.id}</span> • <span>{time}</span>
      </div>

      {post.imageUrl && (
        <div>
          <img
            src={post.imageUrl}
            alt={`Post ${post.id}`}
            className="max-w-xs border border-gray-700 rounded"
          />
        </div>
      )}

      <div className="whitespace-pre-wrap">{post.content}</div>
    </div>
  );
};
