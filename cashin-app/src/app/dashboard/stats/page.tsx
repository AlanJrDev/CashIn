"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/lib/AppContext";
import { formatCurrency } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Coffee,
  Car,
  Pill,
  Home,
  Gamepad2,
  BookOpen,
  Shirt,
  Zap,
  Package,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// Mapeamento de categorias para ícones Lucide
const CATEGORY_ICONS: Record<string, any> = {
  alimentação: Coffee,
  transporte: Car,
  saúde: Pill,
  moradia: Home,
  lazer: Gamepad2,
  educação: BookOpen,
  vestuário: Shirt,
  serviços: Zap,
  receita: TrendingUp,
  outros: Package,
};

// Cores para os gráficos e toggles
const CATEGORY_COLORS: Record<string, string> = {
  despesas: "#EF4444", // Vermelho para gastos gerais
  receitas: "#10B981", // Verde esmeralda para entradas
  alimentação: "#F59E0B",
  transporte: "#6366F1",
  saúde: "#EF4444",
  moradia: "#8B5CF6",
  lazer: "#EC4899",
  educação: "#06B6D4",
  vestuário: "#F43F5E",
  serviços: "#94A3B8",
  outros: "#64748B",
};

// Componente Toggle estilo "Pill" da referência
function PillToggle({
  active,
  color,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  color: string;
  onClick: () => void;
  icon: any;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-[#94A3B8]" />
        <span className="text-xs text-[#94A3B8] capitalize font-medium">
          {label}
        </span>
      </div>
      <button
        onClick={onClick}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none`}
        style={{ backgroundColor: active ? color : "#334155" }}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition duration-300 ease-in-out ${
            active ? "translate-x-4.5" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function StatsPage() {
  const { dashboard, transactions } = useApp();

  // Estado para os filtros ativos no gráfico (por padrão mostra Receitas e Despesas gerais)
  const [activeFilters, setActiveFilters] = useState<Set<string>>(
    new Set(["receitas", "despesas"])
  );

  const toggleFilter = (key: string) => {
    setActiveFilters((prev) => {
      const newFilters = new Set(prev);
      if (newFilters.has(key)) {
        newFilters.delete(key);
      } else {
        newFilters.add(key);
      }
      return newFilters;
    });
  };

  // Processa transações para o formato AreaChart (Série temporal diária do mês atual)
  const chartData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Inicializa o array com todos os dias do mês
    const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
      const dayStr = String(i + 1).padStart(2, "0");
      const baseObj: any = { name: dayStr, receitas: 0, despesas: 0 };
      
      // Inicializa chaves de categorias em 0
      Object.keys(CATEGORY_ICONS).forEach((cat) => {
        if (cat !== "receita") baseObj[cat] = 0;
      });
      return baseObj;
    });

    // Agrupa transações por dia
    transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      if (txDate.getMonth() === month && txDate.getFullYear() === year) {
        const dayIndex = txDate.getDate() - 1; // 0-indexed
        
        if (tx.type === "income") {
          dailyData[dayIndex].receitas += tx.amount;
        } else {
          dailyData[dayIndex].despesas += tx.amount;
          if (dailyData[dayIndex][tx.category] !== undefined) {
            dailyData[dayIndex][tx.category] += tx.amount;
          }
        }
      }
    });

    return dailyData;
  }, [transactions]);

  return (
    <div className="p-6 pt-12 pb-24 md:pb-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-start">
      {/* Coluna Principal: Gráfico e Resumo */}
      <div className="flex-1 w-full min-w-0">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] mb-2">
          Análise Financeira
        </h1>
        <p className="text-[#94A3B8] text-sm mb-8">
          Fluxo de caixa e detalhamento de categorias
        </p>

        {/* Gráfico AreaChart Spline (Suave) */}
        <div className="bg-[#1E293B] rounded-3xl p-6 mb-8 shadow-xl">
          <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-widest mb-6">
            Evolução Mensal
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  {/* Gera os gradientes dinamicamente baseados nos filtros ativos */}
                  {Array.from(activeFilters).map((filter) => (
                    <linearGradient
                      key={`color-${filter}`}
                      id={`color-${filter}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={CATEGORY_COLORS[filter] || "#8884d8"}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={CATEGORY_COLORS[filter] || "#8884d8"}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#94A3B8", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                />
                <YAxis
                  tick={{ fill: "#94A3B8", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `R$${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    border: "1px solid #1E293B",
                    borderRadius: "12px",
                    color: "#fff",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.5)",
                  }}
                  itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                  labelStyle={{ color: "#94A3B8", marginBottom: "4px" }}
                  formatter={(value: any, name: any) => [
                    formatCurrency(Number(value) || 0),
                    String(name || "").charAt(0).toUpperCase() + String(name || "").slice(1),
                  ]}
                  labelFormatter={(label) => `Dia ${label}`}
                />

                {/* Renderiza as áreas baseadas nos filtros ativos */}
                {Array.from(activeFilters).map((filter) => (
                  <Area
                    key={filter}
                    type="monotone" // Curva suave
                    dataKey={filter}
                    stroke={CATEGORY_COLORS[filter] || "#8884d8"}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill={`url(#color-${filter})`}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total gasto",
              value: formatCurrency(dashboard.totalExpenses),
              color: "#EF4444",
            },
            {
              label: "Renda total",
              value: formatCurrency(dashboard.totalIncome),
              color: "#10B981",
            },
            {
              label: "Disponível",
              value: formatCurrency(dashboard.available),
              color: "#F8FAFC",
            },
            {
              label: "Orçamento",
              value: formatCurrency(dashboard.budgetLimit),
              color: "#6366F1",
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#1E293B] rounded-2xl p-4 shadow-lg min-w-0"
            >
              <p className="text-[#94A3B8] text-xs mb-1">{card.label}</p>
              <p
                className="font-bold text-lg font-[family-name:var(--font-mono)] truncate"
                style={{ color: card.color }}
              >
                {card.value}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Coluna Lateral: Filtros do Gráfico (Toggles) */}
      <div className="w-full md:w-72 flex-shrink-0 mt-8 md:mt-0">
        <div className="bg-[#1E293B] rounded-3xl p-6 shadow-xl sticky top-24">
          <h3 className="text-sm font-semibold text-white mb-1">
            Visualizar no Gráfico
          </h3>
          <p className="text-xs text-[#94A3B8] mb-6 leading-relaxed">
            Selecione quais dados projetar na linha do tempo.
          </p>

          {/* Filtros Principais */}
          <div className="space-y-1 mb-6 border-b border-[#334155] pb-4">
            <PillToggle
              label="Receitas (Vendas)"
              icon={TrendingUp}
              color={CATEGORY_COLORS.receitas}
              active={activeFilters.has("receitas")}
              onClick={() => toggleFilter("receitas")}
            />
            <PillToggle
              label="Despesas Totais"
              icon={TrendingDown}
              color={CATEGORY_COLORS.despesas}
              active={activeFilters.has("despesas")}
              onClick={() => toggleFilter("despesas")}
            />
          </div>

          {/* Filtros de Categorias Específicas */}
          <h4 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest mb-3">
            Explorar Categorias
          </h4>
          <div className="space-y-1 max-h-[40vh] overflow-y-auto no-scrollbar pr-2">
            {Object.keys(CATEGORY_ICONS).map(
              (cat) =>
                cat !== "receita" && (
                  <PillToggle
                    key={cat}
                    label={cat}
                    icon={CATEGORY_ICONS[cat]}
                    color={CATEGORY_COLORS[cat] || "#64748B"}
                    active={activeFilters.has(cat)}
                    onClick={() => toggleFilter(cat)}
                  />
                )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
