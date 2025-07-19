// routes/admin.user.routes.ts
import { Router } from "express";
import { db } from "./db"; // adjust import
import { users } from "../shared/mysql-schema";
import { eq } from "drizzle-orm";
import { requireRole } from "../middlewares/requireRoles";
import { threadPins } from "../shared/mysql-schema"; 
const router = Router();
import type { Request } from "express";

interface AuthRequest extends Request {
  user: { id: number; role: string };
}
// Then, in your route handler:
router.post("/threads/:threadId/pin", requireRole(["admin", "moderator"]), async (req: AuthRequest, res) => {
  const threadId = parseInt(req.params.threadId, 10);
  const pinnedBy = req.user.id;
  await db.insert(threadPins).values({ threadId, pinnedBy });
  res.json({ success: true });
});

router.delete("/threads/:threadId/pin", requireRole(["admin", "moderator"]), async (req, res) => {
  const threadId = parseInt(req.params.threadId, 10);
  await db.delete(threadPins).where(eq(threadPins.threadId, threadId));
  res.json({ success: true });
});
