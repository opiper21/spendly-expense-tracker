import type { NextFunction, Response } from "express";
import type { AuthRequest } from "./auth";
import { syncRecurring } from "../lib/recurring";

export async function runRecurring(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (req.method === "GET" && req.userId) {
      await syncRecurring(req.userId);
    }
  } catch (error) {
    console.error("Recurring sync error:", error);
  }

  next();
}