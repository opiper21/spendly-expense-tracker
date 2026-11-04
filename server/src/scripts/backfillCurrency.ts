import "dotenv/config";
import mongoose from "mongoose";
import { DEFAULT_CURRENCY } from "../lib/currencies";
import { RecurringRule } from "../models/RecurringRule";
import { Transaction } from "../models/Transaction";

async function main(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not set in your .env file");
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });

  const transactions = await Transaction.updateMany(
    { currency: { $exists: false } },
    { $set: { currency: DEFAULT_CURRENCY } }
  );

  const rules = await RecurringRule.updateMany(
    { currency: { $exists: false } },
    { $set: { currency: DEFAULT_CURRENCY } }
  );

  console.log(`Transactions labelled: ${transactions.modifiedCount}`);
  console.log(`Recurring items labelled: ${rules.modifiedCount}`);

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("Backfill failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});