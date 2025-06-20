import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "D&D Character Manager",
  description: "Gerencie seus personagens e campanhas de D&D",
  keywords: "D&D, Dungeons & Dragons, RPG, personagens, campanhas",
  authors: [{ name: "D&D Manager Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {/* Container principal da aplicação */}
          <div id="app-root" className="min-h-screen">
            {children}
          </div>

          {/* Portal para modais (se necessário no futuro) */}
          <div id="modal-root" />

          {/* Portal para toasts (se necessário no futuro) */}
          <div id="toast-root" />
        </AuthProvider>
      </body>
    </html>
  );
}
