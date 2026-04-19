"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Sparkles, Trash2, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { formatCurrency } from "@/lib/utils";
import { CategorizeResponse, Transaction } from "@/lib/types";

export default function Dashboard() {
  const { dashboard, categorize, addTransaction, deleteTransaction, loading } = useApp();
  const [inputText, setInputText] = useState("");
  const [inputOpen, setInputOpen] = useState(false);
  const [aiResult, setAiResult] = useState<CategorizeResponse | null>(null);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setProcessing(true);
    const result = await categorize(inputText);
    setProcessing(false);
    if (result) {
      setAiResult(result);
    } else {
      showToast("Não consegui entender. Tente escrever de outra forma.", "error");
    }
  };

  const handleConfirm = async () => {
    if (!aiResult) return;
    await addTransaction({
      description: aiResult.description || inputText,
      amount: aiResult.amount,
      type: aiResult.type,
      category: aiResult.category,
      subcategory: aiResult.subcategory,
      emoji: aiResult.emoji,
      date: aiResult.date,
      aiConfidence: aiResult.confidence,
      source: "ai",
    });
    setInputText("");
    setAiResult(null);
    setInputOpen(false);
    showToast(`${aiResult.emoji} ${formatCurrency(aiResult.amount)} adicionado!`);
  };

  const handleDelete = async (id: string) => {
    await deleteTransaction(id);
    showToast("Gasto removido.", "error");
  };

  const pct = dashboard.progressPct;
  const barColor = pct > 80 ? "from-orange-500 to-red-500" : pct > 60 ? "from-yellow-400 to-orange-400" : "from-primary to-[#50C878]";

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <div className="p-6 pt-12 pb-4 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)]">CashIn</h1>
        <div className="w-10 h-10 rounded-full bg-[#1E293B] flex items-center justify-center text-[#10B981] font-bold text-sm ring-2 ring-[#10B981]/30">
          U
        </div>
      </div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1E293B] rounded-3xl p-6 mb-6 relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#10B981]/10 rounded-full blur-3xl -mr-16 -mt-16" />
        <p className="text-[#94A3B8] text-sm mb-1">Você ainda pode gastar</p>
        <h2 className="text-4xl font-bold font-[family-name:var(--font-mono)] mb-5">
          {formatCurrency(dashboard.available)}
        </h2>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-[#10B981] font-semibold">{pct}% do mês</span>
            <span className="text-[#94A3B8]">{formatCurrency(dashboard.budgetLimit)}</span>
          </div>
          <div className="h-2.5 bg-[#0F172A] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className={`h-full bg-gradient-to-r ${barColor} rounded-full`}
            />
          </div>
        </div>

        <div className="flex gap-3 text-xs">
          <span className="text-[#F59E0B]">⚡ Ritmo: {formatCurrency(dashboard.dailyPace)}/dia</span>
          <span className="text-[#94A3B8]">|</span>
          <span className="text-[#94A3B8]">🎯 Meta: {formatCurrency(dashboard.dailyTarget)}/dia</span>
        </div>
      </motion.div>

      {/* Input Field */}
      <div className="mb-6">
        {!inputOpen ? (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => { setInputOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
            className="w-full bg-[#1E293B] rounded-2xl p-4 flex items-center justify-between text-[#94A3B8] shadow"
          >
            <span className="flex items-center gap-2 text-sm">
              <Sparkles size={18} className="text-[#6366F1]" />
              Digite um gasto... ("uber 18", "mercado 45")
            </span>
            <div className="w-8 h-8 rounded-full bg-[#10B981]/20 flex items-center justify-center text-[#10B981]">
              <Plus size={18} />
            </div>
          </motion.button>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-[#1E293B] rounded-2xl p-4 shadow-lg"
            >
              {!aiResult ? (
                <>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                    placeholder="Ex: gastei 45 no mercado, salário 3200..."
                    className="w-full bg-transparent outline-none text-sm text-white placeholder:text-[#94A3B8] mb-3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAnalyze}
                      disabled={processing || !inputText.trim()}
                      className="flex-1 bg-[#10B981] text-[#0F172A] font-bold text-sm py-2.5 rounded-xl disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      {processing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      {processing ? "Analisando..." : "Categorizar com IA"}
                    </button>
                    <button
                      onClick={() => { setInputOpen(false); setAiResult(null); setInputText(""); }}
                      className="px-4 py-2.5 rounded-xl bg-[#0F172A] text-[#94A3B8] text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <div>
                  <p className="text-xs text-[#94A3B8] mb-3">
                    <Sparkles size={12} className="inline mr-1 text-[#6366F1]" />
                    IA identificou — confirme ou cancele:
                  </p>
                  <div className="bg-[#0F172A] rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{aiResult.emoji}</span>
                        <div>
                          <p className="font-bold capitalize text-sm">{aiResult.category}</p>
                          <p className="text-xs text-[#94A3B8]">{aiResult.subcategory}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold font-[family-name:var(--font-mono)] ${aiResult.type === "income" ? "text-[#22C55E]" : "text-white"}`}>
                          {aiResult.type === "income" ? "+" : "-"}{formatCurrency(aiResult.amount)}
                        </p>
                        <p className="text-xs text-[#94A3B8]">{Math.round(aiResult.confidence * 100)}% confiança</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleConfirm} className="flex-1 bg-[#10B981] text-[#0F172A] font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2">
                      <CheckCircle size={16} /> Confirmar
                    </button>
                    <button onClick={() => setAiResult(null)} className="px-4 py-2.5 rounded-xl bg-[#0F172A] text-[#94A3B8] text-sm">
                      Corrigir
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Recent Transactions */}
      <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-widest mb-4">Últimos gastos</h3>

      {dashboard.transactions.length === 0 ? (
        <div className="text-center py-12 text-[#94A3B8]">
          <p className="text-4xl mb-3">💸</p>
          <p className="text-sm">Nenhum gasto registrado ainda.</p>
          <p className="text-xs mt-1">Use o campo acima para começar!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dashboard.transactions.slice(0, 10).map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-3 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#1E293B] flex items-center justify-center text-xl flex-shrink-0">
                  {tx.emoji}
                </div>
                <div>
                  <p className="font-medium text-sm text-white capitalize">{tx.category}</p>
                  <p className="text-xs text-[#94A3B8] truncate max-w-[160px]">{tx.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-mono font-bold text-sm ${tx.type === "income" ? "text-[#22C55E]" : "text-white"}`}>
                  {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                </span>
                <button
                  onClick={() => handleDelete(tx.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[#EF4444] p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`fixed bottom-28 left-4 right-4 max-w-md mx-auto p-4 rounded-2xl shadow-xl flex items-center gap-3 z-50 ${
              toast.type === "success" ? "bg-[#10B981] text-[#0F172A]" : "bg-[#EF4444] text-white"
            }`}
          >
            {toast.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium text-sm">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
