export type TransactionType = "income" | "expense";

export interface User {
  id: string;
  name: string;
  email: string;
  isDemo: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Transaction {
  _id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTotal {
  category: string;
  total: number;
}

export interface Summary {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  transactionCount: number;
  spendingByCategory: CategoryTotal[];
}