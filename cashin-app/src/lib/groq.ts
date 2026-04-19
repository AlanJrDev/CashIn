import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;

export const groq = new Groq({
  apiKey: apiKey || "dummy-key-for-build",
});

if (!apiKey && typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  console.warn("⚠️ GROQ_API_KEY is not defined. This will cause runtime errors if Groq is used.");
}

export const MODELS = {
  fast: "llama-3.1-8b-instant",   // categorização rápida
  smart: "llama-3.3-70b-versatile", // chat inteligente
} as const;
