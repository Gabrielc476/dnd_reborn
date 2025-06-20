"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LucideIcon } from "lucide-react";

interface AuthNavigationProps {
  type: "back" | "link";
  href: string;
  text: string;
  icon?: LucideIcon;
  className?: string;
}

export default function AuthNavigation({
  type,
  href,
  text,
  icon: Icon,
  className = "",
}: AuthNavigationProps) {
  if (type === "back") {
    return (
      <Link href={href}>
        <Button
          variant="ghost"
          className={`mb-6 inline-flex items-center space-x-2 text-purple-200 hover:text-white hover:bg-transparent transition-colors group ${className}`}
        >
          <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
          <span>{text}</span>
        </Button>
      </Link>
    );
  }

  return (
    <div className={`text-center space-y-3 ${className}`}>
      <p className="text-purple-200 text-sm">Ainda não tem uma conta?</p>
      <Link href={href}>
        <Button
          variant="outline"
          className="w-full bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/30 text-white font-medium py-3 px-4 transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
        >
          {Icon && <Icon className="w-5 h-5" />}
          <span>{text}</span>
        </Button>
      </Link>
    </div>
  );
}
