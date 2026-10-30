import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import { protect } from "./middleware/auth";
import { runRecurring } from "./middleware/recurring";
import accountRoutes from "./routes/account";
import authRoutes from "./routes/auth";
import recurringRoutes from "./routes/recurring";
import transactionRoutes from "./routes/transactions";
import summaryRoutes from "./routes/summary";

const app = express();
const PORT = Number(process.env.PORT) || 5001;

app.set("trust proxy", 1);

const allowedOrigins = (process.env.CLIENT_URL ?? "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

if (process.env.NODE_ENV === "production" && allowedOrigins.length === 0) {
  console.warn("CLIENT_URL is not set, so the API accepts requests from any origin");
}

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  })
);
app.use(express.json({ limit: "10kb" }));

app.get("/", (_req: Request, res: Response) => {
  res.send("Spendly API is running");
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    app: "Spendly API",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    time: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/recurring", recurringRoutes);
app.use("/api/transactions", protect, runRecurring, transactionRoutes);
app.use("/api/summary", protect, runRecurring, summaryRoutes);

async function start(): Promise<void> {
  try {
    await connectDB();
    app.listen(PORT, (error?: Error) => {
      if (error) {
        console.error(`Could not start server on port ${PORT}:`, error.message);
        process.exit(1);
      }
      console.log(`Spendly API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

start();