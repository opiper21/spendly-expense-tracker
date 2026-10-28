import type { Types } from "mongoose";
import type { TransactionType } from "../models/Transaction";

interface DemoItem {
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  daysAgo: number;
}

const demoItems: DemoItem[] = [
  { type: "income", amount: 4200, category: "Salary", note: "Monthly salary", daysAgo: 2 },
  { type: "income", amount: 4200, category: "Salary", note: "Monthly salary", daysAgo: 31 },
  { type: "income", amount: 4200, category: "Salary", note: "Monthly salary", daysAgo: 60 },
  { type: "income", amount: 650, category: "Freelance", note: "Logo design project", daysAgo: 12 },
  { type: "income", amount: 480, category: "Freelance", note: "Website fixes", daysAgo: 41 },

  { type: "expense", amount: 1200, category: "Rent", note: "Monthly rent", daysAgo: 1 },
  { type: "expense", amount: 1200, category: "Rent", note: "Monthly rent", daysAgo: 30 },
  { type: "expense", amount: 1200, category: "Rent", note: "Monthly rent", daysAgo: 59 },

  { type: "expense", amount: 86, category: "Food", note: "Groceries", daysAgo: 0 },
  { type: "expense", amount: 54, category: "Food", note: "Lunch with friends", daysAgo: 4 },
  { type: "expense", amount: 72, category: "Food", note: "Weekly groceries", daysAgo: 9 },
  { type: "expense", amount: 41, category: "Food", note: "Takeaway", daysAgo: 15 },
  { type: "expense", amount: 95, category: "Food", note: "Groceries", daysAgo: 22 },
  { type: "expense", amount: 63, category: "Food", note: "Dinner out", daysAgo: 28 },
  { type: "expense", amount: 58, category: "Food", note: "Groceries", daysAgo: 36 },
  { type: "expense", amount: 77, category: "Food", note: "Weekend brunch", daysAgo: 47 },
  { type: "expense", amount: 49, category: "Food", note: "Lunch", daysAgo: 53 },

  { type: "expense", amount: 35, category: "Transport", note: "Fuel", daysAgo: 3 },
  { type: "expense", amount: 60, category: "Transport", note: "Taxi rides", daysAgo: 11 },
  { type: "expense", amount: 28, category: "Transport", note: "Bus pass", daysAgo: 20 },
  { type: "expense", amount: 45, category: "Transport", note: "Fuel", daysAgo: 34 },
  { type: "expense", amount: 52, category: "Transport", note: "Rides", daysAgo: 44 },

  { type: "expense", amount: 180, category: "Shopping", note: "New sneakers", daysAgo: 6 },
  { type: "expense", amount: 95, category: "Shopping", note: "Home supplies", daysAgo: 18 },
  { type: "expense", amount: 240, category: "Shopping", note: "Headphones", daysAgo: 39 },
  { type: "expense", amount: 120, category: "Shopping", note: "Clothes", daysAgo: 50 },

  { type: "expense", amount: 45, category: "Entertainment", note: "Cinema", daysAgo: 7 },
  { type: "expense", amount: 30, category: "Entertainment", note: "Streaming", daysAgo: 16 },
  { type: "expense", amount: 65, category: "Entertainment", note: "Concert tickets", daysAgo: 27 },
  { type: "expense", amount: 52, category: "Entertainment", note: "Games", daysAgo: 42 },

  { type: "expense", amount: 110, category: "Bills", note: "Electricity", daysAgo: 5 },
  { type: "expense", amount: 95, category: "Bills", note: "Internet", daysAgo: 35 },
  { type: "expense", amount: 105, category: "Bills", note: "Electricity", daysAgo: 57 },

  { type: "expense", amount: 60, category: "Health", note: "Pharmacy", daysAgo: 13 },
  { type: "expense", amount: 90, category: "Health", note: "Dentist", daysAgo: 45 },

  { type: "expense", amount: 320, category: "Travel", note: "Weekend trip", daysAgo: 25 },
];

function dateDaysAgo(daysAgo: number): Date {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date;
}

export function buildDemoTransactions(userId: Types.ObjectId, expiresAt: Date) {
  return demoItems.map((item) => ({
    user: userId,
    type: item.type,
    amount: item.amount,
    category: item.category,
    note: item.note,
    date: dateDaysAgo(item.daysAgo),
    expiresAt,
  }));
}