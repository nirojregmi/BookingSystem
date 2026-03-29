import jwt from "jsonwebtoken";

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  const cookieHeader = req.headers.cookie || "";
  const cookies = Object.fromEntries(
    cookieHeader
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        const key = index >= 0 ? decodeURIComponent(part.slice(0, index).trim()) : part;
        const value = index >= 0 ? decodeURIComponent(part.slice(index + 1).trim()) : "";
        return [key, value];
      })
  );

  return cookies.token || null;
}

export function requireAuth(req, res, next) {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({
      ok: false,
      error: "Authentication required",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
    };
    next();
  } catch (err) {
    return res.status(401).json({
      ok: false,
      error: "Invalid or expired token",
    });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        error: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        error: "Forbidden",
      });
    }

    next();
  };
}
