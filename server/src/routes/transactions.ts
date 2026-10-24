import { Router, Response } from "express";
import { isValidObjectId } from "mongoose";
import { Transaction, TransactionType } from "../models/Transaction";
import { protect, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(protect);

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const { type, amount, category, date, note } = (req.body ?? {}) as {
      type?: string;
      amount?: number;
      category?: string;
      date?: string;
      note?: string;
    };

    if (type !== "income" && type !== "expense") {
      res.status(400).json({ message: "Type must be 'income' or 'expense'" });
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

    let parsedDate = new Date();
    if (date !== undefined) {
      const checked = parseDate(date);
      if (!checked) {
        res.status(400).json({ message: "Date is not valid" });
        return;
      }
      parsedDate = checked;
    }

    const transaction = await Transaction.create({
      user: req.userId,
      type: type as TransactionType,
      amount,
      category,
      date: parsedDate,
      note: note ?? "",
    });

    res.status(201).json({ transaction });
  } catch (error) {
    console.error("Create transaction error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const { from, to, type } = req.query as {
      from?: string;
      to?: string;
      type?: string;
    };

    const filter: Record<string, unknown> = { user: req.userId };

    if (type !== undefined) {
      if (type !== "income" && type !== "expense") {
        res.status(400).json({ message: "Type must be 'income' or 'expense'" });
        return;
      }
      filter.type = type;
    }

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

      filter.date = dateFilter;
    }

    const transactions = await Transaction.find(filter).sort({ date: -1, createdAt: -1 });

    res.json({ count: transactions.length, transactions });
  } catch (error) {
    console.error("List transactions error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);

    if (!isValidObjectId(id)) {
      res.status(400).json({ message: "Transaction id is not valid" });
      return;
    }

    const { type, amount, category, date, note } = (req.body ?? {}) as {
      type?: string;
      amount?: number;
      category?: string;
      date?: string;
      note?: string;
    };

    const updates: {
      type?: TransactionType;
      amount?: number;
      category?: string;
      date?: Date;
      note?: string;
    } = {};

    if (type !== undefined) {
      if (type !== "income" && type !== "expense") {
        res.status(400).json({ message: "Type must be 'income' or 'expense'" });
        return;
      }
      updates.type = type;
    }

    if (amount !== undefined) {
      if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
        res.status(400).json({ message: "Amount must be a number greater than 0" });
        return;
      }
      updates.amount = amount;
    }

    if (category !== undefined) {
      if (!category.trim()) {
        res.status(400).json({ message: "Category cannot be empty" });
        return;
      }
      updates.category = category;
    }

    if (date !== undefined) {
      const checked = parseDate(date);
      if (!checked) {
        res.status(400).json({ message: "Date is not valid" });
        return;
      }
      updates.date = checked;
    }

    if (note !== undefined) {
      updates.note = note;
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ message: "Nothing to update" });
      return;
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, user: req.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    res.json({ transaction });
  } catch (error) {
    console.error("Update transaction error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);

    if (!isValidObjectId(id)) {
      res.status(400).json({ message: "Transaction id is not valid" });
      return;
    }

    const transaction = await Transaction.findOneAndDelete({ _id: id, user: req.userId });

    if (!transaction) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    res.json({ message: "Transaction deleted" });
  } catch (error) {
    console.error("Delete transaction error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;