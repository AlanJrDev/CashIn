import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/AppContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "CashIn - Controle de Gastos Simples",
  description: "Controle financeiro absurdamente simples com inteligência artificial para o cidadão comum.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} antialiased bg-[#0F172A] text-[#F8FAFC]`}>
        <AppProvider>
          <div className="min-h-screen bg-[#0F172A] relative">
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
