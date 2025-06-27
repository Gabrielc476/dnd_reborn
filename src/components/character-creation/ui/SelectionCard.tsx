"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface SelectionCardProps {
  title: string;
  description: string;
  details?: string;
  selected: boolean;
  onClick: () => void;
  badge?: string;
  disabled?: boolean;
  className?: string;
  isRequired?: boolean; // Adicionado para indicar se é obrigatório
}

export default function SelectionCard({
  title,
  description,
  details,
  selected,
  onClick,
  badge,
  disabled = false,
  className = "",
  isRequired = false,
}: SelectionCardProps) {
  const getCardStyle = () => {
    if (disabled) {
      return "bg-gray-800/20 border-gray-600/20 cursor-not-allowed opacity-50";
    }

    if (selected) {
      return "bg-purple-500/20 border-purple-400/50 ring-2 ring-purple-400/30";
    }

    return "bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 cursor-pointer";
  };

  return (
    <Card
      className={`${getCardStyle()} transition-all duration-200 relative ${className}`}
      onClick={disabled ? undefined : onClick}
    >
      {/* Required Badge */}
      {isRequired && !selected && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10">
          Obrigatório
        </div>
      )}

      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-white font-semibold text-sm truncate">
                {title}
              </h3>
              {badge && (
                <span className="bg-purple-500/30 text-purple-200 text-xs px-2 py-1 rounded-full">
                  {badge}
                </span>
              )}
            </div>

            <p className="text-purple-200 text-xs mb-2 leading-relaxed">
              {description}
            </p>

            {details && (
              <p className="text-gray-300 text-xs line-clamp-2 leading-relaxed">
                {details}
              </p>
            )}
          </div>

          {selected && (
            <div className="flex-shrink-0 ml-2">
              <CheckCircle className="w-5 h-5 text-purple-400" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}