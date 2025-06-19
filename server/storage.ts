import { threads, posts, type Thread, type Post, type InsertThread, type InsertPost } from "@shared/schema";

export interface IStorage {
  // Thread operations
  getAllThreads(): Promise<Thread[]>;
  getThread(id: number): Promise<Thread | undefined>;
  createThread(thread: InsertThread): Promise<Thread>;
  deleteThread(id: number): Promise<boolean>;
  
  // Post operations
  getPostsByThread(threadId: number): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  deletePost(id: number): Promise<boolean>;
  
  // Update thread stats
  incrementThreadReplies(threadId: number): Promise<void>;
  incrementThreadImages(threadId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private threads: Map<number, Thread>;
  private posts: Map<number, Post>;
  private currentThreadId: number;
  private currentPostId: number;

  constructor() {
    this.threads = new Map();
    this.posts = new Map();
    this.currentThreadId = 156789012; // Start with a realistic-looking number
    this.currentPostId = 156789012;
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
    const thread: Thread = {
      id,
      subject: insertThread.subject || null,
      content: insertThread.content,
      imageUrl: insertThread.imageUrl || null,
      imageName: insertThread.imageName || null,
      createdAt: new Date(),
      replyCount: 0,
      imageCount: insertThread.imageUrl ? 1 : 0,
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
      thread.replyCount++;
      this.threads.set(threadId, thread);
    }
  }

  async incrementThreadImages(threadId: number): Promise<void> {
    const thread = this.threads.get(threadId);
    if (thread) {
      thread.imageCount++;
      this.threads.set(threadId, thread);
    }
  }
}

export const storage = new MemStorage();
