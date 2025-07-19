// routes/admin.user.routes.ts
import { Router } from "express";
import { db } from "./db"; // adjust import
import { users } from "../shared/mysql-schema";
import { eq } from "drizzle-orm";
import { requireRole } from "../middlewares/requireRoles";

const router = Router();

// routes/admin.ban.routes.ts
router.post("/ban-ip", requireRole(["admin"]), async (req, res) => {
  const { ipAddress, reason, expiresAt } = req.body;
  const bannedBy = req.user.id;

  await db.insert(ipBans).values({ ipAddress, reason, bannedBy, expiresAt });
  res.json({ success: true });
});
