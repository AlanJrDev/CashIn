// Tipos compartilhados — v2 com User e auth
export type TransactionType = "expense" | "income";

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash?: string; // nunca exposto no frontend
  monthlyIncome: number;
  savingsGoalPct: number;
  createdAt: string;
}
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export interface Transaction {
  id: string;
  userId: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  subcategory: string;
  emoji: string;
  date: string;
  aiConfidence: number;
  source: "ai" | "manual";
}

export interface DashboardData {
  available: number;
  totalIncome: number;
  totalExpenses: number;
  budgetLimit: number;
  progressPct: number;
  dailyPace: number;
  dailyTarget: number;
  transactions: Transaction[];
}

export interface CategorizeResponse {
  amount: number;
  type: TransactionType;
  category: string;
  subcategory: string;
  emoji: string;
  date: string;
  confidence: number;
  description: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Contexto financeiro passado à IA
export interface UserFinancialContext {
  name: string;
  monthlyIncome: number;
  savingsGoalPct: number;
  currentMonth: {
    totalExpenses: number;
    totalIncome: number;
    available: number;
    budgetLimit: number;
    progressPct: number;
    dailyPace: number;
    dailyTarget: number;
    topCategories: { category: string; amount: number; emoji: string }[];
    recentTransactions: { description: string; amount: number; type: string; category: string; date: string }[];
  };
}
