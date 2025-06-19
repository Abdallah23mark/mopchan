import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { insertThreadSchema, insertPostSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all threads for catalog
  app.get("/api/threads", async (req, res) => {
    try {
      const threads = await storage.getAllThreads();
      res.json(threads);
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
      const { subject, content, name, tripcode } = req.body;
      
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
      };

      const validatedData = insertThreadSchema.parse(threadData);
      const thread = await storage.createThread(validatedData);
      
      res.status(201).json(thread);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid thread data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create thread" });
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
      const post = await storage.createPost(validatedData);
      
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
      res.status(500).json({ message: "Failed to create post" });
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

  const httpServer = createServer(app);
  return httpServer;
}
