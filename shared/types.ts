// shared/types.ts

export type BoardDTO = {
  id: number;
  slug: string;
  title: string;
};

export type ThreadDTO = {
  id: number;
  boardId: number;
  title: string | null;
  content: string;
  createdAt: string;
  pinned: boolean;
  locked: boolean;
};

export type PostDTO = {
  id: number;
  threadId: number;
  content: string;
  createdAt: string;
};

export type NewThreadInput = {
  boardSlug: string;
  title?: string;
  content: string;
};

export type NewPostInput = {
  threadId: number;
  content: string;
};

export type ApiError = {
  error: string;
};

export type AdminPayload = {
  userId: number;
  isModerator?: boolean;
};

export type JwtToken = string;
