"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, LucideIcon } from "lucide-react";

interface AuthInputProps {
  name: string;
  type: "text" | "email" | "password";
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  icon: LucideIcon;
  required?: boolean;
  validation?: {
    isValid: boolean;
    message: string;
  };
  className?: string;
}

export default function AuthInput({
  name,
  type,
  label,
  placeholder,
  value,
  onChange,
  onKeyPress,
  icon: Icon,
  required = false,
  validation,
  className = "",
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  const getFieldStyle = () => {
    if (!value) return "border-white/20";
    if (validation) {
      return validation.isValid ? "border-green-400/50" : "border-red-400/50";
    }
    return "border-white/20";
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium text-purple-200 flex items-center justify-between">
        {label}
        {value && validation && (
          <span
            className={`text-xs ${
              validation.isValid ? "text-green-400" : "text-red-400"
            }`}
          >
            {validation.isValid ? "✓ Válido" : `✗ ${validation.message}`}
          </span>
        )}
      </Label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-purple-300" />
        </div>
        <Input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          required={required}
          className={`pl-10 ${
            isPassword ? "pr-12" : "pr-4"
          } py-3 bg-white/5 border ${getFieldStyle()} text-white placeholder-purple-300/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
          placeholder={placeholder}
        />
        {isPassword && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-300 hover:text-white hover:bg-transparent"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
