"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

export default function AuthCard({ children, className = "" }: AuthCardProps) {
  return (
    <Card
      className={`bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl ${className}`}
    >
      <CardContent className="p-8 space-y-6">{children}</CardContent>
    </Card>
  );
}
