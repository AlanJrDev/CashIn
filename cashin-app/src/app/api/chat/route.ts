import { NextRequest } from "next/server";
import { groq, MODELS } from "@/lib/groq";
import { ChatMessage, UserFinancialContext } from "@/lib/types";

const SYSTEM_PROMPT = `Você é o "Assistente do Cidadão" do CashIn, um app de controle de gastos para brasileiros comuns.

Seu papel:
- Responder dúvidas sobre finanças pessoais, impostos, INSS, MEI, direitos do consumidor e burocracia em geral.
- Auxiliar o usuário com base nos DADOS FINANCEIROS atuais dele (fornecidos no contexto). Se ele perguntar "quanto posso gastar?", "como estão meus gastos?", use os dados para dar respostas precisas.
- Usar linguagem simples, acolhedora e sem jargão técnico.
- Ser empático e nunca julgar a situação financeira do usuário.
- Citar legislação ou órgãos oficiais quando relevante.

LIMITES IMPORTANTES:
- NUNCA dar recomendação de investimento específica ("invista no fundo X").
- NUNCA pedir ou confirmar CPF, senhas ou dados bancários externos.

Responda sempre em português brasileiro, de forma concisa e direta.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = body.messages;
    const userContext: UserFinancialContext = body.userContext;

    if (!messages || !Array.isArray(messages)) {
      return new Response("Mensagens inválidas", { status: 400 });
    }

    // Cria o bloco de contexto para injetar no sistema
    let contextPrompt = "";
    if (userContext && Object.keys(userContext).length > 0) {
      contextPrompt = `\n\n--- DADOS FINANCEIROS ATUAIS DO USUÁRIO ---\nNome: ${userContext.name}\nRenda Mensal: R$ ${userContext.monthlyIncome}\nGastos Totais este mês: R$ ${userContext.currentMonth.totalExpenses}\nDisponível para gastar: R$ ${userContext.currentMonth.available}\nLimite ideal: R$ ${userContext.currentMonth.budgetLimit}\nProgresso do orçamento: ${userContext.currentMonth.progressPct}%\nRitmo de gastos (por dia): R$ ${userContext.currentMonth.dailyPace.toFixed(2)}\n\nÚltimas 5 transações:\n${userContext.currentMonth.recentTransactions.slice(0, 5).map(t => `- ${t.date}: ${t.description} (R$ ${t.amount}) [${t.category}]`).join('\n')}\n-------------------------------------------`;
    }

    const recentMessages = messages.slice(-10);

    const stream = await groq.chat.completions.create({
      model: MODELS.smart,
      messages: [
        { role: "system", content: SYSTEM_PROMPT + contextPrompt },
        ...recentMessages,
      ],
      temperature: 0.7,
      max_tokens: 1024,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? "";
            if (delta) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (err) {
          console.error("[/api/chat stream]", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    console.error("[/api/chat]", error);
    const message = error instanceof Error ? error.message : "Erro interno";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
