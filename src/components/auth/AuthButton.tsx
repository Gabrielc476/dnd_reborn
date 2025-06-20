"use client";

import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface AuthButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon: LucideIcon;
  text: string;
  loadingText: string;
  variant?: "primary" | "secondary";
  className?: string;
}

export default function AuthButton({
  onClick,
  disabled = false,
  loading = false,
  icon: Icon,
  text,
  loadingText,
  variant = "primary",
  className = "",
}: AuthButtonProps) {
  const getButtonStyle = () => {
    switch (variant) {
      case "primary":
        return "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700";
      case "secondary":
        return "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700";
      default:
        return "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700";
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full ${getButtonStyle()} text-white font-semibold py-3 px-4 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 ${className}`}
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          <Icon className="w-5 h-5" />
          <span>{text}</span>
        </>
      )}
    </Button>
  );
}
