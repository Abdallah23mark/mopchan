import express from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from './db';
import {
  createThread,
  addReply,
  getCatalog,
  getThread,
  togglePin,
  deleteThread,
  banIp,
} from './storage';
import {
  authenticateAdmin,
  postRateLimiter,
  checkIpBan,
} from './middleware';
import { ipBans } from '../shared/schema';

const router = express.Router();

// ----------------------
// 🧾 Anonymous Middleware
// ----------------------
router.use(checkIpBan);

// ----------------------
// 🧵 Anonymous Routes
// ----------------------

// Create a new thread
router.post('/api/thread', postRateLimiter, async (req, res) => {
  const { board, title, body, imageUrl } = req.body;
  const ip = req.ip;

  if (!board || !title || !body || !imageUrl) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const thread = await createThread({ board, title, body, imageUrl, ip });
    res.json(thread);
  } catch {
    res.status(500).json({ error: 'Failed to create thread' });
  }
});

// Post a reply
router.post('/api/reply', postRateLimiter, async (req, res) => {
  const { threadId, body, imageUrl } = req.body;
  const ip = req.ip;

  if (!threadId || !body || !imageUrl) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const post = await addReply({ threadId, body, imageUrl, ip });
    res.json(post);
  } catch {
    res.status(500).json({ error: 'Failed to post reply' });
  }
});

// Fetch catalog
router.get('/api/catalog/:board', async (req, res) => {
  const board = req.params.board;
  try {
    const threads = await getCatalog(board);
    res.json(threads);
  } catch {
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
});

// Fetch thread with replies
router.get('/api/thread/:id', async (req, res) => {
  const threadId = Number(req.params.id);
  try {
    const thread = await getThread(threadId);
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    res.json(thread);
  } catch {
    res.status(500).json({ error: 'Failed to fetch thread' });
  }
});

// ----------------------
// 🔐 Admin Routes
// ----------------------
router.use('/api/admin', authenticateAdmin);

// Toggle pin
router.post('/api/admin/pin', async (req, res) => {
  const { threadId, pinned } = req.body;
  if (typeof threadId !== 'number' || typeof pinned !== 'boolean') {
    return res.status(400).json({ error: 'Invalid threadId or pinned value' });
  }

  await togglePin(threadId, pinned);
  res.json({ success: true });
});

// Delete thread
router.delete('/api/admin/thread/:id', async (req, res) => {
  const threadId = Number(req.params.id);
  await deleteThread(threadId);
  res.json({ success: true });
});

// Ban an IP
router.post('/api/admin/ban', async (req, res) => {
  const schema = z.object({
    ip: z.string().min(3),
    reason: z.string().min(3),
  });

  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input.' });
  }

  const { ip, reason } = result.data;

  try {
    const exists = await db.select().from(ipBans).where(eq(ipBans.ip, ip));
    if (exists.length > 0) {
      await db
        .update(ipBans)
        .set({ reason, createdAt: new Date() })
        .where(eq(ipBans.ip, ip));
    } else {
      await db.insert(ipBans).values({ ip, reason, createdAt: new Date() });
    }

    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Failed to ban IP.' });
  }
});

// Get list of all bans
router.get('/api/admin/bans', async (_req, res) => {
  const bans = await db.select().from(ipBans);
  return res.json({ bans });
});

export default router;
