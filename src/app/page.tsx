"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Sword, User, Mail, Lock } from "lucide-react";
import { useAuthContext } from "@/hooks/useAuth";

// Componentes reutilizáveis
import {
  AuthLayout,
  AuthCard,
  AuthHeader,
  AuthInput,
  AuthButton,
  AuthNavigation,
  AuthAlert,
  AuthDivider,
} from "@/components/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading: authLoading } = useAuthContext();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validations, setValidations] = useState({
    email: false,
    password: false,
  });

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Validações em tempo real
  const validateField = (name: string, value: string) => {
    switch (name) {
      case "email":
        return value.includes("@") && value.includes(".");
      case "password":
        return value.length >= 6;
      default:
        return false;
    }
  };

  const getValidationMessage = (fieldName: string) => {
    switch (fieldName) {
      case "email":
        return "Email inválido";
      case "password":
        return "Mín. 6 caracteres";
      default:
        return "";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading && !authLoading && isFormValid()) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    // Validação final
    if (!isFormValid()) {
      setError("Preencha todos os campos corretamente");
      setLoading(false);
      return;
    }

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });

      // O redirecionamento será feito pelo useEffect quando isAuthenticated mudar
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Atualizar validações em tempo real
    setValidations({
      ...validations,
      [name]: validateField(name, value),
    });

    // Limpar erro quando usuário começar a digitar
    if (error) {
      setError("");
    }
  };

  const isFormValid = () => {
    return (
      formData.email &&
      formData.password &&
      validations.email &&
      validations.password
    );
  };

  const isButtonDisabled = loading || authLoading || !isFormValid();

  // Se ainda está carregando o estado inicial
  if (authLoading) {
    return (
      <AuthLayout>
        <AuthCard>
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-purple-300 border-t-white rounded-full animate-spin"></div>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard>
        {/* Header */}
        <AuthHeader
          icon={Shield}
          title="D&D Manager"
          subtitle="Gerencie seus personagens e campanhas"
        />

        {/* Formulário */}
        <div className="space-y-5">
          {error && <AuthAlert type="error" message={error} />}

          <AuthInput
            name="email"
            type="email"
            label="Email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            icon={Mail}
            required
            validation={
              formData.email
                ? {
                    isValid: validations.email,
                    message: getValidationMessage("email"),
                  }
                : undefined
            }
          />

          <AuthInput
            name="password"
            type="password"
            label="Senha"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            icon={Lock}
            required
            validation={
              formData.password
                ? {
                    isValid: validations.password,
                    message: getValidationMessage("password"),
                  }
                : undefined
            }
          />

          <AuthButton
            onClick={handleSubmit}
            disabled={isButtonDisabled}
            loading={loading}
            icon={Sword}
            text="Entrar na Aventura"
            loadingText="Entrando..."
            variant="primary"
          />
        </div>

        <AuthDivider />

        <AuthNavigation
          type="link"
          href="/register"
          text="Criar Nova Conta"
          icon={User}
        />

        {/* Informações de desenvolvimento */}
        {process.env.NODE_ENV === "development" && (
          <AuthAlert
            type="info"
            message="🚀 Modo desenvolvimento: Use qualquer email/senha válidos para testar"
            className="mt-4"
          />
        )}
      </AuthCard>
    </AuthLayout>
  );
}
