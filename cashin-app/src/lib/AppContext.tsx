"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Transaction, User, DashboardData, CategorizeResponse } from "@/lib/types";
import { computeDashboard, buildFinancialContext } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { createClient } from "./supabase/client";

interface AppState {
  user: User | null;
  transactions: Transaction[];
  dashboard: DashboardData;
  loading: boolean;
  categorize: (text: string) => Promise<CategorizeResponse | null>;
  addTransaction: (tx: Omit<Transaction, "id" | "userId">) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateProfile: (p: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  getFinancialContext: () => object;
}

const defaultDash: DashboardData = {
  available: 0, totalIncome: 0, totalExpenses: 0, budgetLimit: 0,
  progressPct: 0, dailyPace: 0, dailyTarget: 0, transactions: [],
};

const AppCtx = createContext<AppState | null>(null);

const mapTx = (dbTx: any): Transaction => ({
  id: dbTx.id,
  userId: dbTx.user_id,
  description: dbTx.description,
  amount: Number(dbTx.amount),
  type: dbTx.type,
  category: dbTx.category,
  subcategory: dbTx.subcategory,
  emoji: dbTx.emoji,
  date: dbTx.date,
  aiConfidence: dbTx.ai_confidence ? Number(dbTx.ai_confidence) : 1,
  source: dbTx.source,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    const currentUser = await auth.getCurrentUser();
    setUser(currentUser);

    if (currentUser) {
      const supabase = createClient();
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("date", { ascending: false });

      if (data) {
        setTransactions(data.map(mapTx));
      }
    } else {
      setTransactions([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const categorize = useCallback(async (text: string): Promise<CategorizeResponse | null> => {
    try {
      const res = await fetch("/api/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      return res.ok ? res.json() : null;
    } catch {
      return null;
    }
  }, []);

  const addTransaction = useCallback(async (tx: Omit<Transaction, "id" | "userId">) => {
    if (!user) return;
    const supabase = createClient();
    
    const dbTx = {
      user_id: user.id,
      description: tx.description,
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      subcategory: tx.subcategory,
      emoji: tx.emoji,
      date: tx.date,
      ai_confidence: tx.aiConfidence,
      source: tx.source
    };

    const { data, error } = await supabase
      .from("transactions")
      .insert(dbTx)
      .select()
      .single();

    if (!error && data) {
      setTransactions((prev) => [mapTx(data), ...prev]);
    }
  }, [user]);

  const deleteTransaction = useCallback(async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (!error) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  }, []);

  const updateProfile = useCallback(async (p: Partial<User>) => {
    if (!user) return;
    const supabase = createClient();
    
    const dbProfile = {
      name: p.name !== undefined ? p.name : user.name,
      monthly_income: p.monthlyIncome !== undefined ? p.monthlyIncome : user.monthlyIncome,
      savings_goal_pct: p.savingsGoalPct !== undefined ? p.savingsGoalPct : user.savingsGoalPct,
    };

    const { error } = await supabase
      .from("profiles")
      .update(dbProfile)
      .eq("id", user.id);

    if (!error) {
      await refreshUser(); // Fetch the updated user
    }
  }, [user, refreshUser]);

  const logout = useCallback(async () => {
    await auth.logout();
    setUser(null);
    setTransactions([]);
  }, []);

  const getFinancialContext = useCallback(() => {
    if (!user) return {};
    return buildFinancialContext(user, transactions);
  }, [user, transactions]);

  const dashboard = user ? computeDashboard(transactions, user) : defaultDash;

  return (
    <AppCtx.Provider value={{
      user, transactions, dashboard, loading,
      categorize, addTransaction, deleteTransaction,
      updateProfile, logout, refreshUser, getFinancialContext,
    }}>
      {children}
    </AppCtx.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp deve estar dentro de AppProvider");
  return ctx;
}
