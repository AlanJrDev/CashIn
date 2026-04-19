import { NextRequest, NextResponse } from "next/server";
import { Transaction } from "@/lib/types";
import { generateId } from "@/lib/utils";

// In-memory store for MVP (substituir por Supabase em produção)
const store: Map<string, Transaction[]> = new Map();

function getStore(userId: string): Transaction[] {
  if (!store.has(userId)) store.set(userId, []);
  return store.get(userId)!;
}

// GET /api/transactions?userId=xxx
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId") ?? "demo";
  const transactions = getStore(userId);
  return NextResponse.json(transactions);
}

// POST /api/transactions
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId ?? "demo";

    const tx: Transaction = {
      id: generateId(),
      userId: userId,
      description: body.description ?? "",
      amount: Number(body.amount) || 0,
      type: body.type ?? "expense",
      category: body.category ?? "outros",
      subcategory: body.subcategory ?? "",
      emoji: body.emoji ?? "💸",
      date: body.date ?? new Date().toISOString(),
      aiConfidence: body.aiConfidence ?? 1,
      source: body.source ?? "manual",
    };

    getStore(userId).unshift(tx);
    return NextResponse.json(tx, { status: 201 });
  } catch (err) {
    console.error("[POST /api/transactions]", err);
    return NextResponse.json({ error: "Erro ao salvar transação" }, { status: 500 });
  }
}

// DELETE /api/transactions?id=xxx&userId=xxx
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const userId = req.nextUrl.searchParams.get("userId") ?? "demo";
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const list = getStore(userId);
  const idx = list.findIndex((t) => t.id === id);
  if (idx === -1) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });

  list.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
