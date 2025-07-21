import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { db } from './db';
import { ipBans } from '../shared/schema';
import { eq } from 'drizzle-orm';

// 1) Check banned IPs
export async function checkIpBan(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip;
  const bans = await db.select().from(ipBans).where(eq(ipBans.ip, ip)).limit(1);
  if (bans.length > 0) {
    return res.status(403).json({ error: 'Your IP has been banned.' });
  }
  next();
}

// 2) Rate limiter for anonymous posting
export const postRateLimiter = rateLimit({
  windowMs: 60_000,  // 1 minute
  max: 10,           // limit 10 requests per IP per window
  message: { error: 'Too many requests, please slow down.' },
});

// 3) Admin authentication via JWT
export function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header.' });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number; isModerator?: boolean };
    (req as any).admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// 4) Moderator-only guard (optional)
export function requireModerator(req: Request, res: Response, next: NextFunction) {
  const admin = (req as any).admin;
  if (!admin?.isModerator) {
    return res.status(403).json({ error: 'Moderator privileges required.' });
  }
  next();
}