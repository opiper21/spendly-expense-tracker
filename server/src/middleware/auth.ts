import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
}

export function protect(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ message: "Not authorised, no token" });
    return;
  }

  const token = header.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({ message: "Server configuration error" });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
    req.userId = decoded.id as string;
    next();
  } catch {
    res.status(401).json({ message: "Not authorised, token invalid or expired" });
  }
}