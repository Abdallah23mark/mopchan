import { pgTable, text, serial, integer, timestamp, boolean, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const threads = pgTable("threads", {
  id: serial("id").primaryKey(),
  subject: text("subject"),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  imageName: text("image_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  bumpedAt: timestamp("bumped_at").defaultNow().notNull(),
  replyCount: integer("reply_count").default(0).notNull(),
  imageCount: integer("image_count").default(0).notNull(),
  name: text("name").default("Anonymous"),
  tripcode: text("tripcode"),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  imageName: text("image_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  name: text("name").default("Anonymous"),
  tripcode: text("tripcode"),
});

// Admin users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  redText: boolean("red_text").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// IP bans table
export const ipBans = pgTable("ip_bans", {
  id: serial("id").primaryKey(),
  ipAddress: varchar("ip_address", { length: 45 }).unique().notNull(),
  reason: text("reason"),
  bannedBy: integer("banned_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

// Thread pins table
export const threadPins = pgTable("thread_pins", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").references(() => threads.id).notNull(),
  pinnedBy: integer("pinned_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sessions table for admin login
export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertThreadSchema = createInsertSchema(threads).omit({
  id: true,
  createdAt: true,
  bumpedAt: true,
  replyCount: true,
  imageCount: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertIpBanSchema = createInsertSchema(ipBans).omit({
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