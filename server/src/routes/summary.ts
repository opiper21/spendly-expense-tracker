import { Router, Response } from "express";
import { Types } from "mongoose";
import { Transaction, TransactionType } from "../models/Transaction";
import { protect, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(protect);

interface GroupRow {
  _id: { type: TransactionType; category: string };
  total: number;
  count: number;
}

interface CategoryTotal {
  category: string;
  total: number;
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };

    const match: {
      user: Types.ObjectId;
      date?: { $gte?: Date; $lte?: Date };
    } = { user: new Types.ObjectId(req.userId) };

    if (from || to) {
      const dateFilter: { $gte?: Date; $lte?: Date } = {};

      if (from) {
        const start = parseDate(from);
        if (!start) {
          res.status(400).json({ message: "'from' is not a valid date" });
          return;
        }
        dateFilter.$gte = start;
      }

      if (to) {
        const end = parseDate(to);
        if (!end) {
          res.status(400).json({ message: "'to' is not a valid date" });
          return;
        }
        end.setUTCHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }

      match.date = dateFilter;
    }

    const rows = await Transaction.aggregate<GroupRow>([
      { $match: match },
      {
        $group: {
          _id: { type: "$type", category: "$category" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;
    let transactionCount = 0;
    const spendingByCategory: CategoryTotal[] = [];

    for (const row of rows) {
      transactionCount += row.count;

      if (row._id.type === "income") {
        totalIncome += row.total;
      } else {
        totalExpenses += row.total;
        spendingByCategory.push({ category: row._id.category, total: round2(row.total) });
      }
    }

    spendingByCategory.sort((a, b) => b.total - a.total);

    res.json({
      balance: round2(totalIncome - totalExpenses),
      totalIncome: round2(totalIncome),
      totalExpenses: round2(totalExpenses),
      transactionCount,
      spendingByCategory,
    });
  } catch (error) {
    console.error("Summary error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;