import { Router, Response } from "express";
import { isValidObjectId } from "mongoose";
import { RecurringRule } from "../models/RecurringRule";
import { User } from "../models/User";
import { protect, AuthRequest } from "../middleware/auth";
import { startOfTodayUTC, syncRecurring } from "../lib/recurring";

const router = Router();

router.use(protect);

const MAX_RULES = 20;

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const rules = await RecurringRule.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ count: rules.length, rules });
  } catch (error) {
    console.error("List recurring error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const { type, amount, category, note, frequency, startDate } = (req.body ?? {}) as {
      type?: string;
      amount?: number;
      category?: string;
      note?: string;
      frequency?: string;
      startDate?: string;
    };

    if (type !== "income" && type !== "expense") {
      res.status(400).json({ message: "Type must be 'income' or 'expense'" });
      return;
    }

    if (frequency !== "weekly" && frequency !== "monthly") {
      res.status(400).json({ message: "Frequency must be 'weekly' or 'monthly'" });
      return;
    }

    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      res.status(400).json({ message: "Amount must be a number greater than 0" });
      return;
    }

    if (!category || !category.trim()) {
      res.status(400).json({ message: "Category is required" });
      return;
    }

    if (typeof startDate !== "string") {
      res.status(400).json({ message: "Start date is required" });
      return;
    }

    const start = new Date(startDate);
    if (Number.isNaN(start.getTime())) {
      res.status(400).json({ message: "Start date is not valid" });
      return;
    }

    start.setUTCHours(0, 0, 0, 0);
    if (frequency === "monthly" && start.getUTCDate() > 28) {
      start.setUTCDate(28);
    }

    const today = startOfTodayUTC();
    const earliest = new Date(today);
    earliest.setUTCFullYear(today.getUTCFullYear() - 1);
    const latest = new Date(today);
    latest.setUTCFullYear(today.getUTCFullYear() + 1);

    if (start.getTime() < earliest.getTime() || start.getTime() > latest.getTime()) {
      res.status(400).json({ message: "Start date must be within a year of today" });
      return;
    }

    const count = await RecurringRule.countDocuments({ user: req.userId });
    if (count >= MAX_RULES) {
      res.status(400).json({ message: `You can have up to ${MAX_RULES} repeating transactions` });
      return;
    }

    const user = await User.findById(req.userId).select("isDemo expiresAt");

    const rule = await RecurringRule.create({
      user: req.userId,
      type,
      amount,
      category,
      note: note ?? "",
      frequency,
      startDate: start,
      nextDue: start,
      expiresAt: user?.isDemo ? user.expiresAt : undefined,
    });

    const created = req.userId ? await syncRecurring(req.userId) : 0;
    const fresh = await RecurringRule.findById(rule._id);

    res.status(201).json({ rule: fresh ?? rule, created });
  } catch (error) {
    console.error("Create recurring error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);

    if (!isValidObjectId(id)) {
      res.status(400).json({ message: "Id is not valid" });
      return;
    }

    const rule = await RecurringRule.findOneAndDelete({ _id: id, user: req.userId });

    if (!rule) {
      res.status(404).json({ message: "Repeating transaction not found" });
      return;
    }

    res.json({ message: "Repeating transaction deleted" });
  } catch (error) {
    console.error("Delete recurring error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;