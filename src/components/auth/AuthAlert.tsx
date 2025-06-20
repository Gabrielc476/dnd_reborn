"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";

interface AuthAlertProps {
  type: "error" | "info" | "success";
  message: string;
  className?: string;
}

export default function AuthAlert({
  type,
  message,
  className = "",
}: AuthAlertProps) {
  const getAlertStyle = () => {
    switch (type) {
      case "error":
        return "bg-red-500/20 border-red-400/30";
      case "info":
        return "bg-blue-500/20 border-blue-400/30";
      case "success":
        return "bg-green-500/20 border-green-400/30";
      default:
        return "bg-red-500/20 border-red-400/30";
    }
  };

  const getTextStyle = () => {
    switch (type) {
      case "error":
        return "text-red-200";
      case "info":
        return "text-blue-200";
      case "success":
        return "text-green-200";
      default:
        return "text-red-200";
    }
  };

  return (
    <Alert className={`${getAlertStyle()} ${className}`}>
      <AlertDescription className={`${getTextStyle()} text-sm text-center`}>
        {message}
      </AlertDescription>
    </Alert>
  );
}
