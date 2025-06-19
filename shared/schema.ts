import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const threads = pgTable("threads", {
  id: serial("id").primaryKey(),
  subject: text("subject"),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  imageName: text("image_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  replyCount: integer("reply_count").default(0).notNull(),
  imageCount: integer("image_count").default(0).notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  imageName: text("image_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertThreadSchema = createInsertSchema(threads).omit({
  id: true,
  createdAt: true,
  replyCount: true,
  imageCount: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
});

export type InsertThread = z.infer<typeof insertThreadSchema>;
export type Thread = typeof threads.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
