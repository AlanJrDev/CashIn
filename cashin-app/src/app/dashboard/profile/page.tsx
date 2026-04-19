"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, User, DollarSign, Target, Trash2 } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, updateProfile, transactions, deleteTransaction, logout } = useApp();
  const [name, setName] = useState(user?.name || "");
  const [income, setIncome] = useState(String(user?.monthlyIncome || 0));
  const [savings, setSavings] = useState(String(user?.savingsGoalPct || 20));
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const handleSave = () => {
    updateProfile({
      name: name.trim() || "Usuário",
      monthlyIncome: Number(income) || 0,
      savingsGoalPct: Math.min(100, Math.max(0, Number(savings) || 20)),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const clearAll = () => {
    if (confirm("Apagar todas as transações?")) {
      transactions.forEach((t) => deleteTransaction(t.id));
    }
  };

  return (
    <div className="p-6 pt-12 pb-24 md:pb-6 max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] mb-8">Perfil</h1>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-[#1E293B] flex items-center justify-center text-[#10B981] ring-4 ring-[#10B981]/30 mb-3">
          <User size={40} />
        </div>
        <p className="font-bold text-lg">{user?.name}</p>
        <p className="text-[#94A3B8] text-sm">Renda: {formatCurrency(user?.monthlyIncome || 0)}/mês</p>
      </div>

      {/* Form */}
      <div className="space-y-4 mb-8">
        {[
          { label: "Seu nome", value: name, set: setName, icon: User, type: "text", placeholder: "Como quer ser chamado?" },
          { label: "Renda mensal (R$)", value: income, set: setIncome, icon: DollarSign, type: "number", placeholder: "Ex: 3000" },
          { label: "Meta de economia (%)", value: savings, set: setSavings, icon: Target, type: "number", placeholder: "Ex: 20" },
        ].map((field, i) => {
          const Icon = field.icon;
          return (
            <div key={i} className="bg-[#1E293B] rounded-2xl p-4">
              <label className="flex items-center gap-2 text-xs text-[#94A3B8] mb-2">
                <Icon size={14} className="text-[#10B981]" />
                {field.label}
              </label>
              <input
                type={field.type}
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
                placeholder={field.placeholder}
                className="w-full bg-transparent outline-none text-white text-base font-medium"
              />
            </div>
          );
        })}
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        className={`w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors ${
          saved ? "bg-[#22C55E] text-[#0F172A]" : "bg-[#10B981] text-[#0F172A]"
        }`}
      >
        {saved ? <CheckCircle size={20} /> : null}
        {saved ? "Salvo!" : "Salvar alterações"}
      </motion.button>

      {/* Danger zone */}
      <div className="mt-10 border-t border-[#1E293B] pt-8">
        <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-widest mb-4">Zona de perigo</h3>
        <button
          onClick={clearAll}
          className="w-full py-3 rounded-2xl border border-[#EF4444]/40 text-[#EF4444] text-sm flex items-center justify-center gap-2 hover:bg-[#EF4444]/10 transition-colors mb-4"
        >
          <Trash2 size={16} />
          Apagar todas as transações
        </button>
        <button
          onClick={() => { logout(); router.push("/"); }}
          className="w-full py-3 rounded-2xl bg-[#0F172A] border border-[#1E293B] text-[#94A3B8] text-sm flex items-center justify-center gap-2 hover:bg-[#1E293B] transition-colors"
        >
          Sair da conta
        </button>
      </div>

      <p className="text-center text-[#94A3B8] text-xs mt-8">
        CashIn MVP · Dados salvos localmente no seu dispositivo
      </p>
    </div>
  );
}
