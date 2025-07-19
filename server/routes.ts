import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { insertThreadSchema, insertPostSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";
import { WebSocketServer, WebSocket } from "ws";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for webm files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, png, gif, webp) and webm videos are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all threads for catalog
  app.get("/api/threads", async (req, res) => {
  try {
    // 1) fetch threads sorted by bumpedAt descending
    const threads = await storage.getAllThreads();

    // 2) annotate each with pinned flag
    const threadsWithPin = await Promise.all(
      threads.map(async (t) => ({
        ...t,
        pinned: await storage.isPinned(t.id),
      }))
    );

    // 3) sort pinned first, then by bumpedAt
    threadsWithPin.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.bumpedAt.getTime() - a.bumpedAt.getTime();
    });

    res.json(threadsWithPin);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch threads" });
  }
});


  // Get specific thread with posts
  app.get("/api/threads/:id", async (req, res) => {
    try {
      const threadId = parseInt(req.params.id);
      if (isNaN(threadId)) {
        return res.status(400).json({ message: "Invalid thread ID" });
      }

      const thread = await storage.getThread(threadId);
      if (!thread) {
        return res.status(404).json({ message: "Thread not found" });
      }

      const posts = await storage.getPostsByThread(threadId);
      res.json({ thread, posts });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch thread" });
    }
  });

  // Create new thread
  app.post("/api/threads", upload.single('image'), async (req, res) => {
    try {
      const { subject, content, name, tripcode, isAdminPost } = req.body;
      
      // Validate required fields
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Content is required" });
      }

      const threadData = {
        subject: subject || null,
        content: content.trim(),
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
        imageName: req.file ? req.file.originalname : null,
        name: name || "Anonymous",
        tripcode: tripcode || null,
        isAdminPost: Boolean(isAdminPost === "true" || isAdminPost === true),
      };

      const validatedData = insertThreadSchema.parse(threadData);
      const thread = await storage.createThread(validatedData);
      
      res.status(201).json(thread);
    } catch (error) {
      console.error("Thread creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid thread data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create thread", error: typeof error === "object" && error !== null && "message" in error ? (error as any).message : String(error) });
    }
  });

  // Create new post (reply)
  app.post("/api/threads/:id/posts", upload.single('image'), async (req, res) => {
    try {
      const threadId = parseInt(req.params.id);
      if (isNaN(threadId)) {
        return res.status(400).json({ message: "Invalid thread ID" });
      }

      // Check if thread exists
      const thread = await storage.getThread(threadId);
      if (!thread) {
        return res.status(404).json({ message: "Thread not found" });
      }

      const { content, name, tripcode, isAdminPost } = req.body;
      
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Content is required" });
      }

      const postData = {
        threadId,
        content: content.trim(),
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
        imageName: req.file ? req.file.originalname : null,
        name: name || "Anonymous",
        tripcode: tripcode || null,
        isAdminPost: Boolean(isAdminPost === "true" || isAdminPost === true),
      };

      const validatedData = insertPostSchema.parse(postData);
      const post = await storage.createPost(validatedData);
      
      // Update thread counts
      await storage.incrementThreadReplies(threadId);
      if (validatedData.imageUrl) {
        await storage.incrementThreadImages(threadId);
      }
      
      res.status(201).json(post);
    } catch (error) {
      console.error("Post creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create post", error: typeof error === "object" && error !== null && "message" in error ? (error as any).message : String(error) });
    }
  });

  // Delete post (basic moderation)
  app.delete("/api/posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const deleted = await storage.deletePost(postId);
      if (!deleted) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Delete thread (basic moderation)
  app.delete("/api/threads/:id", async (req, res) => {
    try {
      const threadId = parseInt(req.params.id);
      if (isNaN(threadId)) {
        return res.status(400).json({ message: "Invalid thread ID" });
      }

      const deleted = await storage.deleteThread(threadId);
      if (!deleted) {
        return res.status(404).json({ message: "Thread not found" });
      }

      res.json({ message: "Thread deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete thread" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Admin authentication middleware
  const authenticateAdmin = async (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    
    const user = await storage.verifyToken(token);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    req.user = user;
    next();
  };

  // Get client IP helper
  const getClientIP = (req: any) => {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || '127.0.0.1';
  };

  // Admin routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const result = await storage.loginUser(username, password);
      
      if (!result) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      if (!result.user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/admin/verify", authenticateAdmin, (req: any, res) => {
    res.json({ user: { ...req.user, isAdmin: true } });
  });

  // Admin statistics
  app.get("/api/admin/stats", authenticateAdmin, async (req, res) => {
    try {
      const dailyStats = await storage.getDailyStats();
      const allTimeStats = await storage.getAllTimeStats();
      res.json({ daily: dailyStats, allTime: allTimeStats });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Ban management
  app.get("/api/admin/bans", authenticateAdmin, async (req, res) => {
    try {
      const bans = await storage.getAllBans();
      res.json(bans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bans" });
    }
  });

  app.post("/api/admin/ban", authenticateAdmin, async (req: any, res) => {
    try {
      const { ipAddress, reason, expiresAt } = req.body;
      
      if (!ipAddress || !reason) {
        return res.status(400).json({ message: "IP address and reason are required" });
      }
      
      const ban = await storage.banIP(
        ipAddress, 
        reason, 
        req.user.id, 
        expiresAt ? new Date(expiresAt) : undefined
      );
      res.json(ban);
    } catch (error) {
      console.error("Ban error:", error);
      res.status(500).json({ message: "Failed to ban IP" });
    }
  });

  app.delete("/api/admin/ban/:ipAddress", authenticateAdmin, async (req, res) => {
    try {
      const success = await storage.unbanIP(req.params.ipAddress);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Failed to unban IP" });
    }
  });

  // Thread management
  app.post("/api/admin/threads/:id/pin", authenticateAdmin, async (req: any, res) => {
    try {
      const threadId = parseInt(req.params.id);
      const success = await storage.pinThread(threadId, req.user.id);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Failed to pin thread" });
    }
  });

  app.delete("/api/admin/threads/:id/pin", authenticateAdmin, async (req, res) => {
    try {
      const threadId = parseInt(req.params.id);
      const success = await storage.unpinThread(threadId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Failed to unpin thread" });
    }
  });

  app.delete("/api/admin/threads/:id", authenticateAdmin, async (req, res) => {
    try {
      const threadId = parseInt(req.params.id);
      const success = await storage.deleteThread(threadId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete thread" });
    }
  });

  app.delete("/api/admin/posts/:id", authenticateAdmin, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const success = await storage.deletePost(postId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Get pinned threads
  app.get("/api/threads/pinned", async (req, res) => {
    try {
      const threads = await storage.getAllThreads();
      const pinnedThreads = [];
      
      for (const thread of threads) {
        if (await storage.isPinned(thread.id)) {
          pinnedThreads.push(thread);
        }
      }
      
      res.json(pinnedThreads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pinned threads" });
    }
  });

  // Update thread creation to check IP bans
  app.post("/api/threads", upload.single('image'), async (req, res) => {
    try {
      const clientIP = getClientIP(req);
      
      const { subject, content, name, tripcode, isAdminPost } = req.body;
      
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Content is required" });
      }

      const threadData = {
        subject: subject || null,
        content: content.trim(),
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
        imageName: req.file ? req.file.originalname : null,
        name: name || "Anonymous",
        tripcode: tripcode || null,
        isAdminPost: isAdminPost === "true",
      };

      const validatedData = insertThreadSchema.parse(threadData);
      const thread = await storage.createThread(validatedData, clientIP);
      
      res.status(201).json(thread);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid thread data", errors: error.errors });
      }
      if ((error as any).message === "IP address is banned") {
        return res.status(403).json({ message: "Your IP address has been banned" });
      }
      res.status(500).json({ message: "Failed to create thread" });
    }
  });

  // Update post creation to check IP bans
  app.post("/api/threads/:id/posts", upload.single('image'), async (req, res) => {
    try {
      const clientIP = getClientIP(req);
      const threadId = parseInt(req.params.id);
      if (isNaN(threadId)) {
        return res.status(400).json({ message: "Invalid thread ID" });
      }

      // Check if thread exists
      const thread = await storage.getThread(threadId);
      if (!thread) {
        return res.status(404).json({ message: "Thread not found" });
      }

      const { content, name, tripcode } = req.body;
      
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Content is required" });
      }

      const postData = {
        threadId,
        content: content.trim(),
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
        imageName: req.file ? req.file.originalname : null,
        name: name || "Anonymous",
        tripcode: tripcode || null,
      };

      const validatedData = insertPostSchema.parse(postData);
      const post = await storage.createPost(validatedData, clientIP);
      
      // Update thread counts
      await storage.incrementThreadReplies(threadId);
      if (validatedData.imageUrl) {
        await storage.incrementThreadImages(threadId);
      }
      
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      if ((error as any).message === "IP address is banned") {
        return res.status(403).json({ message: "Your IP address has been banned" });
      }
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  // Chat routes
  app.get("/api/chat/messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages(50);
      res.json(messages.reverse()); // Reverse to show oldest first
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('Client connected to chat, total clients:', wss.clients.size);
    
    ws.on('message', async (data) => {
      try {
        const messageData = JSON.parse(data.toString());
        
        if (messageData.type === 'ping') {
          // Respond to ping with pong
          ws.send(JSON.stringify({ type: 'pong' }));
        } else if (messageData.type === 'chat_message') {
          const { username, message, tripcode } = messageData;
          console.log('Received chat message:', { username, message, tripcode });
          
          // Validate message data
          const validatedData = insertChatMessageSchema.parse({
            username: username || "Anonymous",
            message: message.trim(),
            tripcode: tripcode || null
          });
          
          // Save to database
          const savedMessage = await storage.createChatMessage(validatedData);
          console.log('Saved message to database:', savedMessage);
          
          // Broadcast to all connected clients
          const broadcastData = {
            type: 'chat_message',
            message: savedMessage
          };
          console.log('Broadcasting to', wss.clients.size, 'clients');
          
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              try {
                client.send(JSON.stringify(broadcastData));
                console.log('Message broadcasted to client');
              } catch (err) {
                console.error('Error broadcasting to client:', err);
              }
            }
          });
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Failed to process message' 
        }));
      }
    });
    
    ws.on('close', () => {
      console.log('Client disconnected from chat, remaining clients:', wss.clients.size);
    });
  });

  return httpServer;
}
