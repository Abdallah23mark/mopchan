"use strict";
// shared/schema.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.admins = exports.ipBans = exports.posts = exports.threads = exports.boards = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
// BOARD
exports.boards = (0, pg_core_1.pgTable)('boards', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    slug: (0, pg_core_1.varchar)('slug', { length: 16 }).notNull().unique(),
    title: (0, pg_core_1.varchar)('title', { length: 64 }).notNull(),
    isLocked: (0, pg_core_1.boolean)('is_locked').default(false),
});
// THREAD
exports.threads = (0, pg_core_1.pgTable)('threads', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    boardId: (0, pg_core_1.integer)('board_id').references(() => exports.boards.id).notNull(),
    title: (0, pg_core_1.varchar)('title', { length: 128 }),
    content: (0, pg_core_1.text)('content').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    pinned: (0, pg_core_1.boolean)('pinned').default(false),
    locked: (0, pg_core_1.boolean)('locked').default(false),
    deleted: (0, pg_core_1.boolean)('deleted').default(false),
    authorIp: (0, pg_core_1.varchar)('author_ip', { length: 64 }),
}, (table) => ({
    boardIndex: (0, pg_core_1.index)().on(table.boardId),
}));
// POST (Reply)
exports.posts = (0, pg_core_1.pgTable)('posts', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    threadId: (0, pg_core_1.integer)('thread_id').references(() => exports.threads.id).notNull(),
    content: (0, pg_core_1.text)('content').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    deleted: (0, pg_core_1.boolean)('deleted').default(false),
    authorIp: (0, pg_core_1.varchar)('author_ip', { length: 64 }),
}, (table) => ({
    threadIndex: (0, pg_core_1.index)().on(table.threadId),
}));
// IP BANS
exports.ipBans = (0, pg_core_1.pgTable)("ip_bans", {
    ip: (0, pg_core_1.varchar)("ip", { length: 255 }).primaryKey(),
    reason: (0, pg_core_1.varchar)("reason", { length: 255 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
});
// ADMIN / MODERATOR ACCOUNTS
exports.admins = (0, pg_core_1.pgTable)('admins', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    username: (0, pg_core_1.varchar)('username', { length: 64 }).notNull().unique(),
    passwordHash: (0, pg_core_1.varchar)('password_hash', { length: 255 }).notNull(),
    isModerator: (0, pg_core_1.boolean)('is_moderator').default(false),
});
