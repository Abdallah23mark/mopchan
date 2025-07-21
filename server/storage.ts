import { db } from './db';
import {
  threads,
  posts,
  ipBans,
} from '../shared/schema';
import { eq, desc, and } from 'drizzle-orm';

// Create new thread (with first post)
export async function createThread({
  board,
  title,
  body,
  ip,
  imageUrl,
}: {
  board: string;
  title: string;
  body: string;
  ip: string;
  imageUrl?: string;
}) {
  const [thread] = await db
    .insert(threads)
    .values({
      board,
      title,
      pinned: false,
      createdAt: new Date(),
    })
    .returning();

  await db.insert(posts).values({
    threadId: thread.id,
    body,
    imageUrl,
    ip,
    createdAt: new Date(),
  });

  return thread;
}

// Add post (reply) to thread
export async function addReply({
  threadId,
  body,
  ip,
  imageUrl,
}: {
  threadId: number;
  body: string;
  ip: string;
  imageUrl?: string;
}) {
  return db.insert(posts).values({
    threadId,
    body,
    imageUrl,
    ip,
    createdAt: new Date(),
  });
}

// Get catalog (list of threads, sorted)
export async function getCatalog(board: string) {
  return db.query.threads.findMany({
    where: eq(threads.board, board),
    orderBy: [desc(threads.pinned), desc(threads.createdAt)],
    with: {
      posts: {
        columns: {
          id: true,
          body: true,
        },
        orderBy: [desc(posts.createdAt)],
        limit: 1,
      },
    },
  });
}

// Get full thread with replies
export async function getThread(threadId: number) {
  return db.query.threads.findFirst({
    where: eq(threads.id, threadId),
    with: {
      posts: {
        orderBy: [posts.createdAt],
      },
    },
  });
}

// Pin/unpin thread
export async function togglePin(threadId: number, pinned: boolean) {
  await db.update(threads).set({ pinned }).where(eq(threads.id, threadId));
}

// Delete thread (admin)
export async function deleteThread(threadId: number) {
  await db.delete(posts).where(eq(posts.threadId, threadId));
  await db.delete(threads).where(eq(threads.id, threadId));
}

// IP Ban a user
export async function banIp(ip: string, reason = 'violation') {
  await db.insert(ipBans).values({
    ip,
    reason,
    bannedAt: new Date(),
  });
}
