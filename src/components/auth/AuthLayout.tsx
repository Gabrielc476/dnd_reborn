"use client";

import { ReactNode } from "react";
import { Dice6, Sparkles } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  footerText?: string;
}

export default function AuthLayout({
  children,
  footerText = "Aventuras épicas te aguardam",
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Efeitos de fundo animados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Padrão de dados flutuantes */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute text-white/5 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              fontSize: "2rem",
            }}
          >
            <Dice6 />
          </div>
        ))}
      </div>

      {/* Container principal */}
      <div className="w-full max-w-md relative z-10">
        {children}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-purple-300/70 text-sm flex items-center justify-center space-x-1">
            <Sparkles className="w-4 h-4" />
            <span>{footerText}</span>
            <Sparkles className="w-4 h-4" />
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
