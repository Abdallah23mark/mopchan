// shared/schema.ts

import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

// BOARD
export const boards = pgTable('boards', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 16 }).notNull().unique(), // e.g., "a"
  title: varchar('title', { length: 64 }).notNull(),        // e.g., "Anime"
  isLocked: boolean('is_locked').default(false),
});

// THREAD
export const threads = pgTable('threads', {
  id: serial('id').primaryKey(),
  boardId: integer('board_id').references(() => boards.id).notNull(),
  title: varchar('title', { length: 128 }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  pinned: boolean('pinned').default(false),
  locked: boolean('locked').default(false),
  deleted: boolean('deleted').default(false),
  authorIp: varchar('author_ip', { length: 64 }),
}, (table) => ({
  boardIndex: index().on(table.boardId),
}));

// POST (Reply)
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  threadId: integer('thread_id').references(() => threads.id).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  deleted: boolean('deleted').default(false),
  authorIp: varchar('author_ip', { length: 64 }),
}, (table) => ({
  threadIndex: index().on(table.threadId),
}));

// IP BANS
export const ipBans = pgTable("ip_bans", {
  ip: varchar("ip", { length: 255 }).primaryKey(),
  reason: varchar("reason", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ADMIN / MODERATOR ACCOUNTS
export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 64 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  isModerator: boolean('is_moderator').default(false),
});
