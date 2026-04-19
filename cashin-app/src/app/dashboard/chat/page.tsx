"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { ChatMessage } from "@/lib/types";
import { useApp } from "@/lib/AppContext";

const SUGGESTIONS = [
  "Como declarar IR?",
  "O que é MEI?",
  "Tenho direito a férias?",
  "Como sair das dívidas?",
  "O que é FGTS?",
];

export default function ChatScreen() {
  const { getFinancialContext } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Olá! Sou o Assistente do Cidadão 👋\nComo posso ajudar com suas finanças ou direitos hoje?" },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || streaming) return;

    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setStreaming(true);

    // Adiciona bolha vazia para o assistente começar a preencher
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          userContext: getFinancialContext()
        }),
      });

      if (!res.body) throw new Error("Sem resposta");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              fullContent += parsed.delta ?? "";
              // Atualiza a última mensagem do assistente em tempo real
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: fullContent };
                return updated;
              });
            } catch {}
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Desculpe, tive um problema. Tente novamente.",
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0F172A]/90 backdrop-blur-md p-4 flex items-center gap-4 border-b border-[#1E293B]">
        <Link href="/dashboard" className="p-2 rounded-full hover:bg-[#1E293B] transition-colors">
          <ArrowLeft size={22} />
        </Link>
        <div>
          <h1 className="font-bold">Assistente do Cidadão</h1>
          <p className="text-xs text-[#10B981] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse inline-block" />
            Llama 3.3 70B via Groq
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto pb-40 max-w-4xl mx-auto w-full">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-[#6366F1]/20 flex-shrink-0 flex items-center justify-center text-[#6366F1] mt-1">
                <Sparkles size={16} />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-[#10B981] text-[#0F172A] font-medium rounded-tr-sm"
                  : "bg-[#1E293B] text-white rounded-tl-sm"
              }`}
            >
              {msg.content}
              {streaming && i === messages.length - 1 && msg.role === "assistant" && msg.content === "" && (
                <Loader2 size={16} className="animate-spin text-[#94A3B8]" />
              )}
            </div>
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Fixed Bottom */}
      <div className="fixed bottom-20 md:bottom-0 left-0 right-0 md:pl-24 lg:pl-64 w-full z-20">
        <div className="max-w-4xl mx-auto w-full px-4 pb-4 pt-8 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/90 to-transparent">
          {/* Suggestions — show only when chat is empty or first msg */}
          {messages.length <= 1 && (
            <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
            {SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                onClick={() => sendMessage(sug)}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-[#1E293B]/90 backdrop-blur-md border border-[#1E293B] text-xs text-[#94A3B8] hover:text-white hover:border-[#10B981]/40 transition-colors"
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Pergunte algo..."
            disabled={streaming}
            className="w-full bg-[#1E293B] border border-[#1E293B] focus:border-[#10B981]/50 rounded-full py-4 pl-5 pr-14 text-sm outline-none transition-colors disabled:opacity-60"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || streaming}
            className={`absolute right-2 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              input.trim() && !streaming
                ? "bg-[#10B981] text-[#0F172A] scale-100"
                : "bg-[#1E293B] text-[#94A3B8] scale-90"
            }`}
          >
            {streaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
          <p className="text-[10px] text-[#94A3B8] text-center mt-2">
            ⚠️ Assistente informativo — não substitui consultoria profissional
          </p>
        </div>
      </div>
    </div>
  );
}
