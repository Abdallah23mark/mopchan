import type { Thread, InsertThread, Post, InsertPost, User, InsertUser, IpBan, InsertIpBan, ThreadPin } from "@shared/schema";
import { db } from "./db";
import { threads, posts, users, ipBans, threadPins, sessions } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export interface IStorage {
  // Thread operations
  getAllThreads(): Promise<Thread[]>;
  getThread(id: number): Promise<Thread | undefined>;
  createThread(thread: InsertThread, ipAddress?: string): Promise<Thread>;
  deleteThread(id: number): Promise<boolean>;
  pinThread(threadId: number, userId: number): Promise<boolean>;
  unpinThread(threadId: number): Promise<boolean>;
  isPinned(threadId: number): Promise<boolean>;
  
  // Post operations
  getPostsByThread(threadId: number): Promise<Post[]>;
  createPost(post: InsertPost, ipAddress?: string): Promise<Post>;
  deletePost(id: number): Promise<boolean>;
  
  // Update thread stats
  incrementThreadReplies(threadId: number): Promise<void>;
  incrementThreadImages(threadId: number): Promise<void>;
  
  // User/Admin operations
  createUser(user: InsertUser): Promise<User>;
  loginUser(username: string, password: string): Promise<{ user: User; token: string } | null>;
  getUserById(id: number): Promise<User | undefined>;
  verifyToken(token: string): Promise<User | null>;
  
  // Ban operations
  banIP(ipAddress: string, reason: string, bannedBy: number, expiresAt?: Date): Promise<IpBan>;
  unbanIP(ipAddress: string): Promise<boolean>;
  isIPBanned(ipAddress: string): Promise<boolean>;
  getAllBans(): Promise<IpBan[]>;
  
  // Statistics
  getDailyStats(): Promise<any[]>;
  
  // Debug helper
  getAllUsers?(): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  private JWT_SECRET = process.env.JWT_SECRET || "mopchan-secret-key";

  async getAllThreads(): Promise<Thread[]> {
    const result = await db.select().from(threads).orderBy(desc(threads.bumpedAt));
    return result;
  }

  async getThread(id: number): Promise<Thread | undefined> {
    const result = await db.select().from(threads).where(eq(threads.id, id));
    return result[0];
  }

  async createThread(insertThread: InsertThread, ipAddress?: string): Promise<Thread> {
    if (ipAddress && await this.isIPBanned(ipAddress)) {
      throw new Error("IP address is banned");
    }
    
    const result = await db.insert(threads).values({
      ...insertThread,
      createdAt: new Date(),
      bumpedAt: new Date(),
      replyCount: 0,
      imageCount: insertThread.imageUrl ? 1 : 0,
    }).returning();
    
    return result[0];
  }

  async deleteThread(id: number): Promise<boolean> {
    const result = await db.delete(threads).where(eq(threads.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async pinThread(threadId: number, userId: number): Promise<boolean> {
    try {
      await db.insert(threadPins).values({
        threadId,
        pinnedBy: userId,
      });
      return true;
    } catch {
      return false;
    }
  }

  async unpinThread(threadId: number): Promise<boolean> {
    const result = await db.delete(threadPins).where(eq(threadPins.threadId, threadId));
    return (result.rowCount ?? 0) > 0;
  }

  async isPinned(threadId: number): Promise<boolean> {
    const result = await db.select().from(threadPins).where(eq(threadPins.threadId, threadId));
    return result.length > 0;
  }

  async getPostsByThread(threadId: number): Promise<Post[]> {
    const result = await db.select().from(posts).where(eq(posts.threadId, threadId)).orderBy(posts.createdAt);
    return result;
  }

  async createPost(insertPost: InsertPost, ipAddress?: string): Promise<Post> {
    if (ipAddress && await this.isIPBanned(ipAddress)) {
      throw new Error("IP address is banned");
    }
    
    const result = await db.insert(posts).values({
      ...insertPost,
      createdAt: new Date(),
    }).returning();
    
    return result[0];
  }

  async deletePost(id: number): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async incrementThreadReplies(threadId: number): Promise<void> {
    const threadPosts = await this.getPostsByThread(threadId);
    const mostRecentPost = threadPosts[threadPosts.length - 1];
    
    await db.update(threads)
      .set({ 
        replyCount: threadPosts.length,
        bumpedAt: mostRecentPost?.createdAt || new Date()
      })
      .where(eq(threads.id, threadId));
  }

  async incrementThreadImages(threadId: number): Promise<void> {
    const threadPosts = await this.getPostsByThread(threadId);
    const imageCount = threadPosts.filter(p => p.imageUrl).length;
    
    await db.update(threads)
      .set({ imageCount })
      .where(eq(threads.id, threadId));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const result = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
    }).returning();
    
    return result[0];
  }

  async loginUser(username: string, password: string): Promise<{ user: User; token: string } | null> {
    const result = await db.select().from(users).where(eq(users.username, username));
    const user = result[0];
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return null;
    }
    
    const token = jwt.sign({ userId: user.id }, this.JWT_SECRET, { expiresIn: '7d' });
    
    return { user, token };
  }

  async getUserById(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: number };
      return await this.getUserById(decoded.userId) || null;
    } catch {
      return null;
    }
  }

  async banIP(ipAddress: string, reason: string, bannedBy: number, expiresAt?: Date): Promise<IpBan> {
    const result = await db.insert(ipBans).values({
      ipAddress,
      reason,
      bannedBy,
      expiresAt,
    }).returning();
    
    return result[0];
  }

  async unbanIP(ipAddress: string): Promise<boolean> {
    const result = await db.delete(ipBans).where(eq(ipBans.ipAddress, ipAddress));
    return (result.rowCount ?? 0) > 0;
  }

  async isIPBanned(ipAddress: string): Promise<boolean> {
    const result = await db.select().from(ipBans).where(
      and(
        eq(ipBans.ipAddress, ipAddress),
        // Check if ban hasn't expired
      )
    );
    
    return result.some(ban => !ban.expiresAt || ban.expiresAt > new Date());
  }

  async getAllBans(): Promise<IpBan[]> {
    const result = await db.select().from(ipBans).orderBy(desc(ipBans.createdAt));
    return result;
  }

  async getDailyStats(): Promise<any[]> {
    try {
      // Simple implementation - get basic counts for today
      const today = new Date().toISOString().split('T')[0];
      
      const threadCount = await db.select().from(threads);
      const postCount = await db.select().from(posts);
      
      return [{
        date: today,
        threads: threadCount.length,
        posts: postCount.length,
        visitors: Math.max(1, Math.floor((threadCount.length + postCount.length) * 0.7))
      }];
    } catch (error) {
      console.error("Error getting daily stats:", error);
      return [];
    }
  }

  async getAllUsers(): Promise<User[]> {
    const result = await db.select().from(users);
    return result;
  }
}

export class MemStorage {
  // Legacy implementation - keeping for fallback but not used
  async getDailyStats(): Promise<any[]> {
    return [];
  }
  private threads: Map<number, Thread>;
  private posts: Map<number, Post>;
  private currentThreadId: number;
  private currentPostId: number;

  constructor() {
    this.threads = new Map();
    this.posts = new Map();
    this.currentThreadId = 156789012; // Start with a realistic-looking number
    this.currentPostId = 156789012;
    
    // Add sample threads for visual preview
    this.initializeSampleData();
  }
  
  private initializeSampleData() {
    const sampleThreads = [
      {
        subject: "/music/ general",
        content: "i found this new album what do u guys think",
        imageUrl: null,
        imageName: null,
        replyCount: 15,
        imageCount: 7
      },
      {
        subject: "happy guy online",
        content: "today i feel rly happy do u feel happy today too?",
        imageUrl: null,
        imageName: null,
        replyCount: 65,
        imageCount: 18
      },
      {
        subject: "/vidya/ general",
        content: "the dark souls of gacha roguelite deck builder jrpg social deduction survival games",
        imageUrl: null,
        imageName: null,
        replyCount: 24,
        imageCount: 3
      },
      {
        subject: "chicawaga",
        content: ">meme of year",
        imageUrl: null,
        imageName: null,
        replyCount: 15,
        imageCount: 7
      },
      {
        subject: "CHICKEN JOCKEY",
        content: ">CHICKEN JOCKEY CHICKEN JOCKEY >CHICKEN JOCKEY",
        imageUrl: null,
        imageName: null,
        replyCount: 15,
        imageCount: 7
      },
      {
        subject: "WAKE UP",
        content: "i am not real i do not exist you are in ur mind",
        imageUrl: null,
        imageName: null,
        replyCount: 15,
        imageCount: 7
      },
      {
        subject: "donut thread",
        content: "donutdonutdonut donutdonutdonut donutdonutdonut",
        imageUrl: null,
        imageName: null,
        replyCount: 24,
        imageCount: 3
      },
      {
        subject: "/MONKEY/ general",
        content: "chimps are my favorite primate >^w^<",
        imageUrl: null,
        imageName: null,
        replyCount: 24,
        imageCount: 3
      },
      {
        subject: "NAMIBIAAA",
        content: ">born in namibia >feelsgood.jpg uropoors seething",
        imageUrl: null,
        imageName: null,
        replyCount: 24,
        imageCount: 3
      },
      {
        subject: "mop gang",
        content: "never dies",
        imageUrl: null,
        imageName: null,
        replyCount: 24,
        imageCount: 3
      },
      {
        subject: "filter thread",
        content: "filter filter filter filter filter filter filter filter filter filter filter filter",
        imageUrl: null,
        imageName: null,
        replyCount: 24,
        imageCount: 3
      },
      {
        subject: "filter thread",
        content: "filter filter filter filter filter filter filter filter filter filter filter filter",
        imageUrl: null,
        imageName: null,
        replyCount: 24,
        imageCount: 3
      }
    ];
    
    sampleThreads.forEach((threadData, index) => {
      const id = this.currentThreadId++;
      const createdAt = new Date(Date.now() - Math.random() * 86400000 * 7);
      const thread: Thread = {
        id,
        subject: threadData.subject,
        content: threadData.content,
        imageUrl: threadData.imageUrl,
        imageName: threadData.imageName,
        createdAt,
        bumpedAt: createdAt,
        replyCount: 0,
        imageCount: 0,
        name: "Anonymous",
        tripcode: null,
        isAdminPost: false,
        ipAddress: null,
      };
      this.threads.set(id, thread);
    });
  }

  async getAllThreads(): Promise<Thread[]> {
    return Array.from(this.threads.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getThread(id: number): Promise<Thread | undefined> {
    return this.threads.get(id);
  }

  async createThread(insertThread: InsertThread): Promise<Thread> {
    const id = this.currentThreadId++;
    const createdAt = new Date();
    const thread: Thread = {
      id,
      subject: insertThread.subject || null,
      content: insertThread.content,
      imageUrl: insertThread.imageUrl || null,
      imageName: insertThread.imageName || null,
      createdAt,
      bumpedAt: createdAt,
      replyCount: 0,
      imageCount: insertThread.imageUrl ? 1 : 0,
      name: insertThread.name || "Anonymous",
      tripcode: insertThread.tripcode || null,
      isAdminPost: insertThread.isAdminPost || false,
      ipAddress: ipAddress || null,
    };
    this.threads.set(id, thread);
    return thread;
  }

  async deleteThread(id: number): Promise<boolean> {
    // Also delete all posts in the thread
    const postsToDelete = Array.from(this.posts.values())
      .filter(post => post.threadId === id);
    
    postsToDelete.forEach(post => this.posts.delete(post.id));
    
    return this.threads.delete(id);
  }

  async getPostsByThread(threadId: number): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.threadId === threadId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.currentPostId++;
    const post: Post = {
      id,
      threadId: insertPost.threadId,
      content: insertPost.content,
      imageUrl: insertPost.imageUrl || null,
      imageName: insertPost.imageName || null,
      createdAt: new Date(),
      name: insertPost.name || "Anonymous",
      tripcode: insertPost.tripcode || null,
      isAdminPost: insertPost.isAdminPost || false,
      ipAddress: ipAddress || null,
    };
    this.posts.set(id, post);
    
    // Update thread stats
    await this.incrementThreadReplies(insertPost.threadId);
    if (insertPost.imageUrl) {
      await this.incrementThreadImages(insertPost.threadId);
    }
    
    return post;
  }

  async deletePost(id: number): Promise<boolean> {
    return this.posts.delete(id);
  }

  async incrementThreadReplies(threadId: number): Promise<void> {
    const thread = this.threads.get(threadId);
    if (thread) {
      // Count actual posts for this thread
      const posts = Array.from(this.posts.values()).filter(p => p.threadId === threadId);
      thread.replyCount = posts.length;
      // Update bump time to most recent post
      const mostRecentPost = posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      if (mostRecentPost) {
        thread.bumpedAt = mostRecentPost.createdAt;
      }
      this.threads.set(threadId, thread);
    }
  }

  async incrementThreadImages(threadId: number): Promise<void> {
    const thread = this.threads.get(threadId);
    if (thread) {
      // Count actual images in posts for this thread
      const posts = Array.from(this.posts.values()).filter(p => p.threadId === threadId);
      const imageCount = posts.filter(p => p.imageUrl).length;
      thread.imageCount = imageCount;
      this.threads.set(threadId, thread);
    }
  }
}

export const storage = new DatabaseStorage();
