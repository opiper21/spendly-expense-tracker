import { Schema, model, Document, Types } from "mongoose";
import type { TransactionType } from "./Transaction";

export type RecurringFrequency = "weekly" | "monthly";

export interface IRecurringRule extends Document {
  user: Types.ObjectId;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  frequency: RecurringFrequency;
  startDate: Date;
  nextDue: Date;
  active: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const recurringRuleSchema = new Schema<IRecurringRule>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: String, required: true, trim: true },
    note: { type: String, trim: true, maxlength: 200, default: "" },
    frequency: { type: String, enum: ["weekly", "monthly"], required: true },
    startDate: { type: Date, required: true },
    nextDue: { type: Date, required: true },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true }
);

recurringRuleSchema.index({ user: 1, active: 1, nextDue: 1 });

export const RecurringRule = model<IRecurringRule>("RecurringRule", recurringRuleSchema);