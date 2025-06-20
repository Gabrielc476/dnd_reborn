"use client";

import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";

interface SearchableListProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  className?: string;
}

export default function SearchableList({
  searchValue,
  onSearchChange,
  placeholder = "Buscar...",
  loading = false,
  className = "",
}: SearchableListProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {loading ? (
          <Loader2 className="h-4 w-4 text-purple-300 animate-spin" />
        ) : (
          <Search className="h-4 w-4 text-purple-300" />
        )}
      </div>
      <Input
        type="text"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 bg-white/10 border-white/20 text-white placeholder-purple-300/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      />
    </div>
  );
}
