
import { mysqlTable, text, int, timestamp, boolean, varchar } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const threads = mysqlTable("threads", {
  id: int("id").primaryKey().autoincrement(),
  postNumber: int("post_number").notNull(),
  subject: text("subject"),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  imageName: text("image_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  bumpedAt: timestamp("bumped_at").defaultNow().notNull(),
  replyCount: int("reply_count").default(0).notNull(),
  imageCount: int("image_count").default(0).notNull(),
  name: text("name").default("Anonymous"),
  tripcode: text("tripcode"),
  isAdminPost: boolean("is_admin_post").default(false).notNull(),
  ipAddress: text("ip_address"),
});

export const posts = mysqlTable("posts", {
  id: int("id").primaryKey().autoincrement(),
  threadId: int("thread_id").notNull(),
  postNumber: int("post_number").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  imageName: text("image_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  name: text("name").default("Anonymous"),
  tripcode: text("tripcode"),
  isAdminPost: boolean("is_admin_post").default(false).notNull(),
  ipAddress: text("ip_address"),
});

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  password: text("password").notNull(),
  role: varchar("role", { length: 20 }).default("user").notNull(), // "user" | "moderator" | "admin"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


export const ipBans = mysqlTable("ip_bans", {
  id: int("id").primaryKey().autoincrement(),
  ipAddress: varchar("ip_address", { length: 45 }).unique().notNull(),
  reason: text("reason"),
  bannedBy: int("banned_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

export const threadPins = mysqlTable("thread_pins", {
  id: int("id").primaryKey().autoincrement(),
  threadId: int("thread_id").notNull(),
  pinnedBy: int("pinned_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: int("user_id").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 255 }).notNull(),
  message: text("message").notNull(),
  tripcode: varchar("tripcode", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertThreadSchema = createInsertSchema(threads).omit({
  id: true,
  createdAt: true,
  bumpedAt: true,
  replyCount: true,
  imageCount: true,
  postNumber: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  postNumber: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});


export const insertIpBanSchema = createInsertSchema(ipBans).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertThread = z.infer<typeof insertThreadSchema>;
export type Thread = typeof threads.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type IpBan = typeof ipBans.$inferSelect;
export type InsertIpBan = z.infer<typeof insertIpBanSchema>;
export type ThreadPin = typeof threadPins.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
