// routes/admin.user.routes.ts
import { Router } from "express";
import { db } from "./db"; // adjust import
import { users } from "../shared/mysql-schema";
import { eq } from "drizzle-orm";
import { requireRole } from "../middlewares/requireRoles";

const router = Router();

// POST /admin/user/:id/role
router.post("/user/:id/role", requireRole(["admin"]), async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { role } = req.body; // "user", "moderator", "admin"

  if (!["user", "moderator", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  await db.update(users).set({ role }).where(eq(users.id, userId));
  res.json({ success: true, role });
});

export default router;
