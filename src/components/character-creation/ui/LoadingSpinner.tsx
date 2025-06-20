"use client";

import { Loader2, Dice6 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  variant?: "default" | "dice";
  className?: string;
}

export default function LoadingSpinner({
  size = "md",
  text,
  variant = "default",
  className = "",
}: LoadingSpinnerProps) {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-4 h-4";
      case "md":
        return "w-8 h-8";
      case "lg":
        return "w-12 h-12";
      default:
        return "w-8 h-8";
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "sm":
        return "text-sm";
      case "md":
        return "text-base";
      case "lg":
        return "text-lg";
      default:
        return "text-base";
    }
  };

  const SpinnerIcon = variant === "dice" ? Dice6 : Loader2;

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <div className={`${getSizeClasses()} animate-spin text-purple-400`}>
        <SpinnerIcon className="w-full h-full" />
      </div>

      {text && (
        <p className={`text-purple-200 text-center ${getTextSize()}`}>{text}</p>
      )}
    </div>
  );
}
