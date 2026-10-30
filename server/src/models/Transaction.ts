import { Schema, model, Document, Types } from "mongoose";

export type TransactionType = "income" | "expense";

export interface ITransaction extends Document {
  user: Types.ObjectId;
  type: TransactionType;
  amount: number;
  category: string;
  date: Date;
  note: string;
  recurringId?: Types.ObjectId;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: String, required: true, trim: true },
    date: { type: Date, required: true, default: Date.now },
    note: { type: String, trim: true, maxlength: 200, default: "" },
    recurringId: { type: Schema.Types.ObjectId, ref: "RecurringRule" },
    expiresAt: { type: Date, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true }
);

export const Transaction = model<ITransaction>("Transaction", transactionSchema);