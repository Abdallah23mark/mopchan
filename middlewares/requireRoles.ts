
import { Request, Response, NextFunction } from "express";

export function requireRole(roles: ("admin" | "moderator")[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    };
}
