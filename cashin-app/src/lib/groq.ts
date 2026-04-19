import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY não configurada no .env.local");
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const MODELS = {
  fast: "llama-3.1-8b-instant",   // categorização rápida
  smart: "llama-3.3-70b-versatile", // chat inteligente
} as const;
