import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { User } from "../models/User";
import { Transaction } from "../models/Transaction";
import { RecurringRule } from "../models/RecurringRule";
import { protect, AuthRequest } from "../middleware/auth";

const router = Router();

const deleteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many failed attempts. Please try again in 15 minutes." },
});

router.delete("/", protect, deleteLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { password } = (req.body ?? {}) as { password?: string };

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.isDemo) {
      if (!password) {
        res.status(400).json({ message: "Enter your password to confirm" });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({ message: "Incorrect password" });
        return;
      }
    }

    await RecurringRule.deleteMany({ user: user._id });
    await Transaction.deleteMany({ user: user._id });
    await User.deleteOne({ _id: user._id });

    res.json({ message: "Account deleted" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;