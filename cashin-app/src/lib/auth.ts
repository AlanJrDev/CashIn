// Camada de autenticação — Supabase Auth

import { createClient } from './supabase/client';
import { User, LoginCredentials, RegisterData } from "./types";

export const auth = {
  async register(data: RegisterData): Promise<{ user: User | null; error: string | null }> {
    const supabase = createClient();
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          }
        }
      });

      if (error) return { user: null, error: error.message };
      if (!authData.user) return { user: null, error: "Falha ao criar conta" };

      const user: User = {
        id: authData.user.id,
        name: data.name,
        email: data.email,
        monthlyIncome: 0,
        savingsGoalPct: 20,
        createdAt: new Date().toISOString()
      };

      return { user, error: null };
    } catch (e: any) {
      return { user: null, error: e.message || "Erro interno" };
    }
  },

  async login(credentials: LoginCredentials): Promise<{ user: User | null; error: string | null }> {
    const supabase = createClient();
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) return { user: null, error: error.message };
      if (!authData.user) return { user: null, error: "Usuário não encontrado" };

      // Fetch profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      const user: User = {
        id: authData.user.id,
        name: profileData?.name || authData.user.user_metadata?.name || "Usuário",
        email: credentials.email,
        monthlyIncome: profileData?.monthly_income || 0,
        savingsGoalPct: profileData?.savings_goal_pct || 20,
        createdAt: profileData?.created_at || authData.user.created_at || new Date().toISOString()
      };

      return { user, error: null };
    } catch (e: any) {
      return { user: null, error: e.message || "Erro interno" };
    }
  },

  async logout(): Promise<void> {
    const supabase = createClient();
    await supabase.auth.signOut();
  },

  async getCurrentUser(): Promise<User | null> {
    const supabase = createClient();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      return {
        id: session.user.id,
        name: profileData?.name || session.user.user_metadata?.name || "Usuário",
        email: session.user.email || "",
        monthlyIncome: profileData?.monthly_income || 0,
        savingsGoalPct: profileData?.savings_goal_pct || 20,
        createdAt: profileData?.created_at || session.user.created_at || new Date().toISOString()
      };
    } catch {
      return null;
    }
  }
};
