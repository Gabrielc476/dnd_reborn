// ===========================
// USE AUTH HOOK
// ===========================

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import { authAPI } from "@/api/authAPI";
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthContextType,
} from "@/types/user";

// ===========================
// UTILITY FUNCTIONS
// ===========================

/**
 * Valida formato de email
 */
const isValidEmail = (email: string): boolean => {
  return email.includes("@") && email.includes(".");
};

/**
 * Valida senha mínima
 */
const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

/**
 * Valida username mínimo
 */
const isValidUsername = (username: string): boolean => {
  return username.length >= 3;
};

/**
 * Salva dados no localStorage
 */
const saveAuthData = (token: string, user: User): void => {
  localStorage.setItem("auth_token", token);
  localStorage.setItem("auth_user", JSON.stringify(user));
};

/**
 * Recupera dados do localStorage
 */
const getAuthData = (): { token: string; user: User } | null => {
  try {
    const token = localStorage.getItem("auth_token");
    const userStr = localStorage.getItem("auth_user");

    if (!token || !userStr) return null;

    const user = JSON.parse(userStr);
    return { token, user };
  } catch (error) {
    return null;
  }
};

/**
 * Remove dados do localStorage
 */
const clearAuthData = (): void => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
};

/**
 * Formata nome do usuário
 */
const formatUserName = (user: User): string => {
  return user.username || user.email.split("@")[0];
};

/**
 * Gera iniciais do usuário
 */
const getUserInitials = (user: User): string => {
  return user.username.slice(0, 2).toUpperCase();
};

// ===========================
// AUTH CONTEXT
// ===========================

const AuthContext = createContext<AuthContextType | null>(null);

// ===========================
// USE AUTH HOOK
// ===========================

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Verifica se está autenticado
  const isAuthenticated = !!user && !!token;

  /**
   * Inicializa dados de autenticação do localStorage
   */
  useEffect(() => {
    const authData = getAuthData();
    if (authData) {
      setUser(authData.user);
      setToken(authData.token);
    }
    setLoading(false);
  }, []);

  /**
   * Função de login
   */
  const login = useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      setLoading(true);

      try {
        // Validações básicas
        if (!isValidEmail(credentials.email)) {
          throw new Error("Email inválido");
        }
        if (!credentials.password) {
          throw new Error("Senha é obrigatória");
        }

        // Chamada da API
        const response = await authAPI.login(credentials);

        // Salvar dados
        setUser(response.user);
        setToken(response.token);
        saveAuthData(response.token, response.user);
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Função de registro
   */
  const register = useCallback(
    async (userData: RegisterRequest): Promise<void> => {
      setLoading(true);

      try {
        // Validações básicas
        if (!isValidEmail(userData.email)) {
          throw new Error("Email inválido");
        }
        if (!isValidUsername(userData.username)) {
          throw new Error("Username deve ter pelo menos 3 caracteres");
        }
        if (!isValidPassword(userData.password)) {
          throw new Error("Senha deve ter pelo menos 6 caracteres");
        }

        // Chamada da API
        await authAPI.register(userData);

        // Após registro, fazer login automaticamente
        await login({
          email: userData.email,
          password: userData.password,
        });
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [login]
  );

  /**
   * Função de logout
   */
  const logout = useCallback((): void => {
    setUser(null);
    setToken(null);
    clearAuthData();
  }, []);

  /**
   * Recarrega dados do usuário
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    if (!user || !token) return;

    try {
      const response = await authAPI.getProfile(user.id, token);
      setUser(response.user);
      saveAuthData(token, response.user);
    } catch (error) {
      // Se falhar, fazer logout
      logout();
    }
  }, [user, token, logout]);

  return {
    // Estado
    user,
    token,
    loading,
    isAuthenticated,

    // Funções principais
    login,
    register,
    logout,
    refreshUser,

    // Funções utilitárias
    formatUserName: user ? () => formatUserName(user) : () => "",
    getUserInitials: user ? () => getUserInitials(user) : () => "",

    // Validações
    isValidEmail,
    isValidPassword,
    isValidUsername,
  };
};

// ===========================
// AUTH PROVIDER COMPONENT
// ===========================

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// ===========================
// USE AUTH CONTEXT HOOK
// ===========================

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext deve ser usado dentro de um AuthProvider");
  }
  return context;
};

// ===========================
// EXPORTS
// ===========================

export {
  isValidEmail,
  isValidPassword,
  isValidUsername,
  formatUserName,
  getUserInitials,
};

export default useAuth;
