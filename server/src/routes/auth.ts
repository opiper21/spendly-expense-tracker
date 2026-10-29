import { Router, Request, Response } from "express";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import type { HydratedDocument } from "mongoose";
import { User } from "../models/User";
import type { IUser } from "../models/User";
import { Transaction } from "../models/Transaction";
import { buildDemoTransactions } from "../lib/demoData";
import { protect, AuthRequest } from "../middleware/auth";

const router = Router();

const DEMO_TTL_MS = 24 * 60 * 60 * 1000;

const demoLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many demo sessions from this network. Please try again later." },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many failed login attempts. Please try again in 15 minutes." },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many sign-ups from this network. Please try again later." },
});

function signToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set in your .env file");
  }
  return jwt.sign({ id: userId }, secret, { expiresIn: "7d" });
}

function toPublicUser(user: HydratedDocument<IUser>) {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    isDemo: user.isDemo,
  };
}

router.post("/register", registerLimiter, async (req: Request, res: Response) => {
  try {
    const { name, email, password } = (req.body ?? {}) as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || !email || !password) {
      res.status(400).json({ message: "Name, email and password are required" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters" });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ message: "An account with this email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    const token = signToken(user.id);

    res.status(201).json({ token, user: toPublicUser(user) });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", loginLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = (req.body ?? {}) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = signToken(user.id);

    res.json({ token, user: toPublicUser(user) });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/demo", demoLimiter, async (_req: Request, res: Response) => {
  try {
    const expiresAt = new Date(Date.now() + DEMO_TTL_MS);
    const password = await bcrypt.hash(randomBytes(24).toString("hex"), 10);

    const user = await User.create({
      name: "Demo User",
      email: `demo-${randomBytes(6).toString("hex")}@demo.invalid`,
      password,
      isDemo: true,
      expiresAt,
    });

    await Transaction.insertMany(buildDemoTransactions(user._id, expiresAt));

    const token = signToken(user.id);

    res.status(201).json({ token, user: toPublicUser(user) });
  } catch (error) {
    console.error("Demo error:", error);
    res.status(500).json({ message: "Could not start the demo" });
  }
});

router.get("/me", protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({ user: toPublicUser(user) });
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;