// routes/admin.routes.ts

import express from "express";
import { db } from "./db"; // your drizzle db instance
import { users, threadPins, ipBans, threads } from "../shared/mysql-schema";
import { eq } from "drizzle-orm";
import { authMiddleware, requireRole } from "../middlewares/auth";

const router = express.Router();

// Get all users (admin only)
router.get("/api/users", authMiddleware, requireRole("admin"), async (req, res) => {
  const allUsers = await db.select().from(users);
  res.json(allUsers);
});

// Get current user info
router.get("/api/me", authMiddleware, async (req, res) => {
  res.json({ id: req.user.id, role: req.user.role, username: req.user.username });
});

// Get all threads (mod or admin)
router.get("/api/threads", authMiddleware, requireRole(["admin", "moderator"]), async (req, res) => {
  const result = await db.select().from(threads);
  res.json(result);
});

// Change user role (admin only)
router.post("/admin/user/:id/role", authMiddleware, requireRole("admin"), async (req, res) => {
  const { role } = req.body;
  const userId = parseInt(req.params.id);
  if (!["admin", "moderator", "user"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  await db.update(users).set({ isAdmin: role === "admin" }).where(eq(users.id, userId));
  res.json({ success: true });
});

// Pin a thread
router.post("/admin/threads/:id/pin", authMiddleware, requireRole(["admin", "moderator"]), async (req, res) => {
  const threadId = parseInt(req.params.id);

  const exists = await db.select().from(threadPins).where(eq(threadPins.threadId, threadId));
  if (exists.length > 0) return res.status(400).json({ error: "Already pinned" });

  await db.insert(threadPins).values({
    threadId,
    pinnedBy: req.user.id,
  });

  res.json({ success: true });
});

// Unpin a thread
router.delete("/admin/threads/:id/pin", authMiddleware, requireRole(["admin", "moderator"]), async (req, res) => {
  const threadId = parseInt(req.params.id);
  await db.delete(threadPins).where(eq(threadPins.threadId, threadId));
  res.json({ success: true });
});

// Ban an IP address
router.post("/admin/ban-ip", authMiddleware, requireRole("admin"), async (req, res) => {
  const { ipAddress, reason } = req.body;
  if (!ipAddress) return res.status(400).json({ error: "IP address is required" });

  await db.insert(ipBans).values({
    ipAddress,
    reason,
    bannedBy: req.user.id,
  });

  res.json({ success: true });
});

export default router;
