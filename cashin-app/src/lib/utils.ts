import { Transaction, DashboardData, User, UserFinancialContext } from "./types";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function computeDashboard(transactions: Transaction[], user: User): DashboardData {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();

  const monthTx = transactions.filter((t) => new Date(t.date) >= startOfMonth);
  const totalExpenses = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalIncome = user.monthlyIncome + monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const savingsAmount = (totalIncome * user.savingsGoalPct) / 100;
  const budgetLimit = totalIncome - savingsAmount;
  const available = budgetLimit - totalExpenses;
  const progressPct = Math.min(100, Math.round((totalExpenses / Math.max(budgetLimit, 1)) * 100));
  const dailyPace = dayOfMonth > 0 ? totalExpenses / dayOfMonth : 0;
  const remainingDays = daysInMonth - dayOfMonth || 1;
  const dailyTarget = available / remainingDays;

  return {
    available, totalIncome, totalExpenses, budgetLimit,
    progressPct, dailyPace, dailyTarget,
    transactions: monthTx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  };
}

// Gera o contexto financeiro do usuário para passar à IA
export function buildFinancialContext(user: User, transactions: Transaction[]): UserFinancialContext {
  const dash = computeDashboard(transactions, user);

  const categoryMap = dash.transactions
    .filter((t) => t.type === "expense")
    .reduce<Record<string, { amount: number; emoji: string }>>((acc, t) => {
      if (!acc[t.category]) acc[t.category] = { amount: 0, emoji: t.emoji };
      acc[t.category].amount += t.amount;
      return acc;
    }, {});

  const topCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1].amount - a[1].amount)
    .slice(0, 5)
    .map(([category, { amount, emoji }]) => ({ category, amount, emoji }));

  const recentTransactions = dash.transactions.slice(0, 10).map((t) => ({
    description: t.description,
    amount: t.amount,
    type: t.type,
    category: t.category,
    date: formatDate(t.date),
  }));

  return {
    name: user.name,
    monthlyIncome: user.monthlyIncome,
    savingsGoalPct: user.savingsGoalPct,
    currentMonth: {
      totalExpenses: dash.totalExpenses,
      totalIncome: dash.totalIncome,
      available: dash.available,
      budgetLimit: dash.budgetLimit,
      progressPct: dash.progressPct,
      dailyPace: dash.dailyPace,
      dailyTarget: dash.dailyTarget,
      topCategories,
      recentTransactions,
    },
  };
}

export function generateId(): string {
  return crypto.randomUUID();
}
