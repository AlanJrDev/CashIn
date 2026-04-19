"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const user = await auth.getCurrentUser();
      if (user) {
        router.push("/dashboard");
      } else {
        setLoading(false);
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      const { error } = await auth.login({ email, password });
      if (error) setError(error);
      else {
        window.location.href = "/dashboard";
      }
    } else {
      if (!name.trim()) {
        setError("O nome é obrigatório.");
        return;
      }
      const { error } = await auth.register({ email, password, name });
      if (error) setError(error);
      else {
        window.location.href = "/dashboard";
      }
    }
  };

  const slideVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  return (
    <div className="flex flex-col min-h-screen p-6 relative bg-background">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-bold font-outfit text-primary mb-2">CashIn</h1>
          <p className="text-text-muted">Controle financeiro absurdamente simples.</p>
        </div>

        <div className="bg-surface p-6 rounded-3xl shadow-xl">
          <div className="flex gap-4 mb-6 border-b border-surface-high pb-4">
            <button
              onClick={() => { setIsLogin(true); setError(""); }}
              className={`flex-1 text-center font-semibold transition-colors ${isLogin ? "text-primary" : "text-text-muted hover:text-white"}`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(""); }}
              className={`flex-1 text-center font-semibold transition-colors ${!isLogin ? "text-primary" : "text-text-muted hover:text-white"}`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name"
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <label className="block text-xs text-text-muted mb-1">Como quer ser chamado?</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-surface-low border border-surface-high focus:border-primary/50 rounded-xl p-3 outline-none transition-colors"
                    placeholder="Seu nome"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div layout>
              <label className="block text-xs text-text-muted mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-surface-low border border-surface-high focus:border-primary/50 rounded-xl p-3 outline-none transition-colors"
                placeholder="seu@email.com"
              />
            </motion.div>

            <motion.div layout>
              <label className="block text-xs text-text-muted mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-surface-low border border-surface-high focus:border-primary/50 rounded-xl p-3 outline-none transition-colors"
                placeholder="••••••••"
              />
            </motion.div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-danger text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              layout
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-primary hover:bg-primary-container text-[#0F172A] font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors mt-4"
            >
              {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
              {isLogin ? "Acessar minha conta" : "Criar conta"}
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}
