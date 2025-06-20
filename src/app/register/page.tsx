"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, User, Mail, Lock, UserPlus } from "lucide-react";
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
} from "@/components/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, loading: authLoading } = useAuthContext();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validations, setValidations] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
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
      case "username":
        return value.length >= 3 && /^[a-zA-Z0-9_]+$/.test(value);
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case "password":
        return value.length >= 6 && /^(?=.*[a-zA-Z])(?=.*\d)/.test(value);
      case "confirmPassword":
        return value === formData.password && value.length > 0;
      default:
        return false;
    }
  };

  const getValidationMessage = (fieldName: string) => {
    switch (fieldName) {
      case "username":
        return "Mín. 3 caracteres, apenas letras, números e _";
      case "email":
        return "Email inválido";
      case "password":
        return "Mín. 6 caracteres, pelo menos 1 letra e 1 número";
      case "confirmPassword":
        return "Senhas diferentes";
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
    setSuccess(false);

    // Validação final
    if (!isFormValid()) {
      setError("Preencha todos os campos corretamente");
      setLoading(false);
      return;
    }

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      setSuccess(true);

      // Aguardar um momento para mostrar sucesso, depois redirecionar
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
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
    const newValidations = {
      ...validations,
      [name]: validateField(name, value),
    };

    // Re-validar confirmPassword se a senha mudou
    if (name === "password") {
      newValidations.confirmPassword = validateField(
        "confirmPassword",
        formData.confirmPassword
      );
    }

    setValidations(newValidations);

    // Limpar erro quando usuário começar a digitar
    if (error) {
      setError("");
    }
  };

  const isFormValid = () => {
    return (
      Object.values(validations).every(Boolean) &&
      formData.username &&
      formData.email &&
      formData.password &&
      formData.confirmPassword
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

  // Se registro foi bem-sucedido
  if (success) {
    return (
      <AuthLayout footerText="Bem-vindo à comunidade de aventureiros!">
        <AuthCard>
          <AuthHeader
            icon={UserPlus}
            title="Conta Criada!"
            subtitle="Sua jornada épica está começando"
            iconBgColor="from-green-500 to-emerald-600"
          />

          <AuthAlert
            type="success"
            message="Conta criada com sucesso! Redirecionando para o dashboard..."
          />

          <div className="flex items-center justify-center py-4">
            <div className="w-6 h-6 border-2 border-green-300 border-t-green-600 rounded-full animate-spin"></div>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout footerText="Pronto para criar histórias épicas?">
      <AuthNavigation type="back" href="/" text="Voltar ao Login" />

      <AuthCard>
        {/* Header */}
        <AuthHeader
          icon={UserPlus}
          title="Criar Conta"
          subtitle="Junte-se à comunidade de aventureiros"
          iconBgColor="from-green-500 to-emerald-600"
        />

        {/* Formulário */}
        <div className="space-y-5">
          {error && <AuthAlert type="error" message={error} />}

          <AuthInput
            name="username"
            type="text"
            label="Username"
            placeholder="seu_username"
            value={formData.username}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            icon={User}
            required
            validation={
              formData.username
                ? {
                    isValid: validations.username,
                    message: getValidationMessage("username"),
                  }
                : undefined
            }
          />

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

          <AuthInput
            name="confirmPassword"
            type="password"
            label="Confirmar Senha"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            icon={Lock}
            required
            validation={
              formData.confirmPassword
                ? {
                    isValid: validations.confirmPassword,
                    message: getValidationMessage("confirmPassword"),
                  }
                : undefined
            }
          />

          <AuthButton
            onClick={handleSubmit}
            disabled={isButtonDisabled}
            loading={loading}
            icon={Shield}
            text="Iniciar Jornada"
            loadingText="Criando conta..."
            variant="secondary"
          />
        </div>

        {/* Link para login */}
        <div className="text-center pt-4">
          <p className="text-purple-200 text-sm">
            Já tem uma conta?{" "}
            <Link
              href="/"
              className="text-green-400 hover:text-green-300 font-medium transition-colors"
            >
              Faça login aqui
            </Link>
          </p>
        </div>

        {/* Informações de segurança */}
        <AuthAlert
          type="info"
          message="🔒 Seus dados estão seguros e criptografados"
          className="mt-4"
        />
      </AuthCard>
    </AuthLayout>
  );
}
