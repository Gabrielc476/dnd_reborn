"use client";

interface AuthDividerProps {
  text?: string;
  className?: string;
}

export default function AuthDivider({
  text = "ou",
  className = "",
}: AuthDividerProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-white/20"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-2 bg-transparent text-purple-200">{text}</span>
      </div>
    </div>
  );
}
