import { NextRequest, NextResponse } from "next/server";
import { groq, MODELS } from "@/lib/groq";
import { CategorizeResponse } from "@/lib/types";

const SYSTEM_PROMPT = `Você é um assistente de categorização financeira para brasileiros.
Dado um texto em português descrevendo um gasto ou receita, extraia:
- amount: valor numérico (sem R$)
- type: "expense" ou "income"
- category: uma das categorias permitidas
- subcategory: subcategoria específica
- emoji: emoji representativo
- date: data no formato ISO (use hoje se não mencionada)
- confidence: 0 a 1 (sua confiança na categorização)
- description: versão limpa do input original

Categorias permitidas:
- alimentação (restaurante, supermercado, lanche, delivery, padaria, açougue)
- transporte (uber, taxi, combustível, ônibus, metrô, estacionamento)
- saúde (farmácia, médico, plano de saúde, exame, academia)
- moradia (aluguel, condomínio, luz, água, internet, gás, reforma)
- educação (curso, livro, escola, faculdade, material)
- lazer (streaming, cinema, jogo, viagem, bar, show)
- vestuário (roupa, calçado, acessório)
- serviços (celular, banco, assinatura, seguro)
- receita (salário, freelance, venda, transferência recebida, dividendo)
- outros (qualquer coisa que não se encaixe acima)

REGRAS:
- Se o texto mencionar salário, renda, recebeu, ganhou → type: "income"
- Responda APENAS JSON válido, sem texto extra
- Se não conseguir extrair valor → amount: 0, confidence: 0.3
- Use a data de hoje (${new Date().toISOString().split("T")[0]}) se não mencionada`;

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Texto obrigatório" }, { status: 400 });
    }

    // Sanitiza o input (remove dados muito sensíveis)
    const sanitized = text.trim().slice(0, 500);

    const completion = await groq.chat.completions.create({
      model: MODELS.fast,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: sanitized },
      ],
      temperature: 0.1,
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("Resposta vazia da IA");

    const parsed = JSON.parse(raw) as CategorizeResponse;

    // Validações de segurança
    if (typeof parsed.amount !== "number" || parsed.amount < 0) {
      parsed.amount = 0;
    }
    if (!["expense", "income"].includes(parsed.type)) {
      parsed.type = "expense";
    }
    if (!parsed.date || isNaN(Date.parse(parsed.date))) {
      parsed.date = new Date().toISOString();
    }
    parsed.confidence = Math.max(0, Math.min(1, parsed.confidence ?? 0.5));

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("[/api/categorize]", error);
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
