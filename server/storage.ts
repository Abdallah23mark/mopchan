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

export const storage = new MemStorage();
