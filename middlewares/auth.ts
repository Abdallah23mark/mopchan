// middleware/auth.ts

export const authMiddleware = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  req.user = req.session.user;
  next();
};

export const requireRole = (roles) => {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    const role = req.user.role || (req.user.isAdmin ? "admin" : "user");
    if (!allowed.includes(role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
};
