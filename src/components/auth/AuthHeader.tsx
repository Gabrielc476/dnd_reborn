"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface AuthHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  iconBgColor?: string;
}

export default function AuthHeader({
  icon: Icon,
  title,
  subtitle,
  iconBgColor = "from-purple-500 to-indigo-600",
}: AuthHeaderProps) {
  return (
    <div className="text-center space-y-2">
      <div
        className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${iconBgColor} rounded-2xl mb-4 shadow-lg`}
      >
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-white">{title}</h1>
      <p className="text-purple-200">{subtitle}</p>
    </div>
  );
}
