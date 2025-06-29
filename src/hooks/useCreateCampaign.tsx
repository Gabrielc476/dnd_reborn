// ===========================
// USE CREATE CAMPAIGN HOOK - VERSÃO COMPLETA COM AUTENTICAÇÃO
// src/hooks/useCreateCampaign.tsx
// ===========================
"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  createContext,
  useContext,
} from "react";
import { campaignAPI } from "@/api/campaignAPI";
import { useAuthContext } from "@/hooks/useAuth";
import {
  CampaignFormData,
  CampaignFormErrors,
  CampaignFormStep,
  CreateCampaignRequest,
  CreateCampaignResponse,
  CampaignResponse,
  CampaignCreationContextType,
  CampaignTag,
  CAMPAIGN_TAGS
} from "@/types/createCampaign";

// ===========================
// CONSTANTS & UTILITIES
// ===========================

const INITIAL_FORM_DATA: CampaignFormData = {
  name: "",
  description: "",
  setting: "",
  world_name: "",
  max_players: 6,
  tags: [],
  is_public: false,
  recruitment_message: "",
  gm_notes: "",
};

const CAMPAIGN_STEPS: CampaignFormStep[] = [
  {
    id: "basic-info",
    title: "Informações Básicas",
    description: "Nome, descrição e configurações iniciais",
    isValid: false,
    isCompleted: false,
  },
  {
    id: "world-setting",
    title: "Mundo e Ambientação",
    description: "Cenário, mundo e estilo da campanha",
    isValid: false,
    isCompleted: false,
  },
  {
    id: "players-config",
    title: "Configuração de Jogadores",
    description: "Limite de jogadores e recrutamento",
    isValid: false,
    isCompleted: false,
  },
  {
    id: "additional-notes",
    title: "Notas Adicionais",
    description: "Notas do mestre e observações",
    isValid: false,
    isCompleted: false,
  },
  {
    id: "review",
    title: "Revisão Final",
    description: "Confirme as informações antes de criar",
    isValid: false,
    isCompleted: false,
  },
];

/**
 * Valida campo específico do formulário
 */
const validateField = (field: keyof CampaignFormData, value: any): string | null => {
  switch (field) {
    case "name":
      if (!value || value.trim().length < 2) {
        return "Nome deve ter pelo menos 2 caracteres";
      }
      if (value.length > 100) {
        return "Nome deve ter no máximo 100 caracteres";
      }
      return null;

    case "description":
      if (value && value.length > 1000) {
        return "Descrição deve ter no máximo 1000 caracteres";
      }
      return null;

    case "setting":
      // Campo opcional, sem validação específica
      return null;

    case "world_name":
      if (value && value.length > 100) {
        return "Nome do mundo deve ter no máximo 100 caracteres";
      }
      return null;

    case "max_players":
      if (!value || value < 1) {
        return "Deve ter pelo menos 1 jogador";
      }
      if (value > 10) {
        return "Máximo de 10 jogadores";
      }
      return null;

    case "tags":
      if (value && value.length > 5) {
        return "Máximo de 5 tags";
      }
      return null;

    case "recruitment_message":
      if (value && value.length > 500) {
        return "Mensagem deve ter no máximo 500 caracteres";
      }
      return null;

    case "gm_notes":
      if (value && value.length > 2000) {
        return "Notas devem ter no máximo 2000 caracteres";
      }
      return null;

    default:
      return null;
  }
};

/**
 * Valida step específico
 */
const validateStep = (stepId: string, formData: CampaignFormData): boolean => {
  switch (stepId) {
    case "basic-info":
      return !validateField("name", formData.name) && 
             formData.name.length >= 3;

    case "world-setting":
      return !!formData.setting;

    case "players-config":
      return formData.max_players >= 1 && 
             formData.max_players <= 10 &&
             (!formData.is_public || !validateField("recruitment_message", formData.recruitment_message));

    case "additional-notes":
      return !validateField("gm_notes", formData.gm_notes);

    case "review":
      return validateStep("basic-info", formData) &&
             validateStep("world-setting", formData) &&
             validateStep("players-config", formData) &&
             validateStep("additional-notes", formData);

    default:
      return false;
  }
};

/**
 * Salva rascunho no localStorage
 */
const saveDraft = (formData: CampaignFormData): void => {
  try {
    localStorage.setItem("campaign_draft", JSON.stringify({
      formData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  } catch (error) {
    console.warn("Não foi possível salvar o rascunho:", error);
  }
};

/**
 * Carrega rascunho do localStorage
 */
const loadDraft = (): CampaignFormData | null => {
  try {
    const draft = localStorage.getItem("campaign_draft");
    if (!draft) return null;

    const parsed = JSON.parse(draft);
    return parsed.formData || null;
  } catch (error) {
    console.warn("Não foi possível carregar o rascunho:", error);
    return null;
  }
};

/**
 * Remove rascunho do localStorage
 */
const clearDraft = (): void => {
  try {
    localStorage.removeItem("campaign_draft");
  } catch (error) {
    console.warn("Não foi possível limpar o rascunho:", error);
  }
};

// ===========================
// CREATE CAMPAIGN CONTEXT
// ===========================

const CreateCampaignContext = createContext<CampaignCreationContextType | null>(null);

// ===========================
// USE CREATE CAMPAIGN HOOK
// ===========================

export const useCreateCampaign = (): CampaignCreationContextType => {
  // ===========================
  // AUTHENTICATION INTEGRATION
  // ===========================
  const { user, isAuthenticated, token } = useAuthContext();

  // ===========================
  // STATE MANAGEMENT
  // ===========================
  const [formData, setFormDataState] = useState<CampaignFormData>(INITIAL_FORM_DATA);
  const [errors, setErrorsState] = useState<CampaignFormErrors>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<CampaignFormStep[]>(CAMPAIGN_STEPS);
  const [isLoading, setIsLoading] = useState(false);

  // ===========================
  // FORM DATA MANAGEMENT - MELHORADO
  // ===========================

  const setFormData = useCallback((data: Partial<CampaignFormData>) => {
    setFormDataState(prev => {
      const newData = { ...prev, ...data };
      
      // Auto-save apenas se há mudanças significativas
      if (newData.name || newData.description || newData.setting) {
        try {
          saveDraft(newData);
        } catch (error) {
          console.warn("Erro ao salvar rascunho:", error);
        }
      }
      
      return newData;
    });
  }, []);

  const setErrors = useCallback((newErrors: Partial<CampaignFormErrors>) => {
    setErrorsState(prev => ({ ...prev, ...newErrors }));
  }, []);

  // ===========================
  // VALIDATION - MELHORADO
  // ===========================

  const validateFormField = useCallback((field: keyof CampaignFormData, value: any): string | null => {
    return validateField(field, value);
  }, []);

  // ✨ NOVA FUNÇÃO: Validação em tempo real
  const validateFieldRealTime = useCallback((field: keyof CampaignFormData, value: any): string | null => {
    const error = validateField(field, value);
    
    // Atualizar erros em tempo real
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
    
    return error;
  }, [setErrors]);

  // ✨ NOVA FUNÇÃO: Limpar erros específicos
  const clearFieldError = useCallback((field: keyof CampaignFormData) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, [setErrors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: CampaignFormErrors = {};
    let isValid = true;

    // Validar todos os campos obrigatórios
    Object.keys(formData).forEach(key => {
      const field = key as keyof CampaignFormData;
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    // Validações especiais para usuário autenticado
    if (!isAuthenticated || !user) {
      newErrors.general = "Usuário não autenticado";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [formData, setErrors, isAuthenticated, user]);

  // ===========================
  // STEPS MANAGEMENT - MELHORADO
  // ===========================

  const updateSteps = useCallback(() => {
    const updatedSteps = steps.map(step => ({
      ...step,
      isValid: validateStep(step.id, formData),
      isCompleted: validateStep(step.id, formData),
    }));
    setSteps(updatedSteps);
  }, [formData, steps]);

  // ✨ MELHORADO: Agora são computed values em vez de funções
  const canProceedToNext = useMemo((): boolean => {
    if (currentStep >= steps.length - 1) {
      // No último step (review), verificar se TODOS os steps estão válidos
      return steps.every(step => step.isValid);
    }
    // Nos outros steps, verificar apenas o atual
    return steps[currentStep]?.isValid || false;
  }, [currentStep, steps]);

  const canGoBack = useMemo((): boolean => {
    return currentStep > 0;
  }, [currentStep]);

  // ===========================
  // API OPERATIONS COM AUTENTICAÇÃO
  // ===========================

  const createCampaign = useCallback(async (): Promise<CreateCampaignResponse> => {
    setIsLoading(true);
    setErrors({});

    try {
      // ===========================
      // AUTHENTICATION CHECKS
      // ===========================
      if (!isAuthenticated || !user || !token) {
        throw new Error("Usuário não autenticado");
      }

      // Validação final
      if (!validateForm()) {
        throw new Error("Formulário contém erros");
      }

      // ===========================
      // PREPARAR DADOS PARA API COM AUTENTICAÇÃO
      // ===========================
      const requestData: CreateCampaignRequest = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        max_players: formData.max_players,
        setting: formData.setting.trim() || undefined,
        world_name: formData.world_name.trim() || undefined,
        tags: formData.tags,
        is_public: formData.is_public,
        recruitment_message: formData.recruitment_message.trim() || undefined,
        gm_notes: formData.gm_notes.trim() || undefined,
        // ✨ AUTOMATICAMENTE ADICIONAR DADOS DO USUÁRIO
        game_master_id: user.id,
      };

      console.log("🎯 Criando campanha com dados:", {
        ...requestData,
        created_by: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        timestamp: new Date().toISOString(),
      });

      // ===========================
      // CHAMAR API COM TOKEN DE AUTENTICAÇÃO
      // ===========================
      const response = await campaignAPI.createCampaign(requestData);

      // Limpar rascunho se sucesso
      if (response.success) {
        clearDraft();
        
        console.log("✅ Campanha criada com sucesso:", {
          campaignId: response.campaign?.id,
          campaignName: response.campaign?.name,
          gamemaster: user.username,
          timestamp: new Date().toISOString(),
        });
      }

      return response;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      
      console.error("❌ Erro ao criar campanha:", {
        error: errorMessage,
        user: user?.username,
        timestamp: new Date().toISOString(),
      });
      
      setErrors({ general: errorMessage });
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, setErrors, isAuthenticated, user, token]);

  // ===========================
  // UTILITIES
  // ===========================

  const resetForm = useCallback(() => {
    setFormDataState(INITIAL_FORM_DATA);
    setErrorsState({});
    setCurrentStep(0);
    setSteps(CAMPAIGN_STEPS);
    clearDraft();
  }, []);

  const loadDraftData = useCallback(() => {
    const draft = loadDraft();
    if (draft) {
      setFormDataState(draft);
      console.log("📥 Rascunho carregado:", {
        campaignName: draft.name,
        user: user?.username,
        timestamp: new Date().toISOString(),
      });
    }
  }, [user]);

  const saveDraftData = useCallback(() => {
    try {
      saveDraft(formData);
      console.log("💾 Rascunho salvo:", {
        campaignName: formData.name,
        user: user?.username,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ Erro ao salvar rascunho:", error);
    }
  }, [formData, user]);

  const previewCampaign = useCallback((): CampaignResponse => {
    return {
      id: "preview",
      name: formData.name,
      description: formData.description,
      game_master_id: user?.id || "unknown",
      players: [],
      max_players: formData.max_players,
      status: "recruiting",
      setting: formData.setting,
      world_name: formData.world_name,
      npcs: [],
      encounters: [],
      loot: [],
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
      tags: formData.tags,
      is_public: formData.is_public,
      recruitment_message: formData.recruitment_message,
      gm_notes: formData.gm_notes,
    };
  }, [formData, user]);

  // ===========================
  // USER INFO HELPERS
  // ===========================

  const getUserInfo = useCallback(() => {
    if (!user) return null;
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      isAuthenticated,
      hasValidToken: !!token,
    };
  }, [user, isAuthenticated, token]);

  const isUserReady = useMemo(() => {
    return isAuthenticated && !!user && !!token;
  }, [isAuthenticated, user, token]);

  // ===========================
  // EFFECTS
  // ===========================

  // Atualizar steps quando formData mudar
  useEffect(() => {
    updateSteps();
  }, [formData]);

  // Carregar rascunho na inicialização (apenas se usuário estiver autenticado)
  useEffect(() => {
    if (isUserReady) {
      loadDraftData();
    }
  }, [loadDraftData, isUserReady]);

  // Log de mudanças de autenticação
  useEffect(() => {
    console.log("🔐 Estado de autenticação mudou:", {
      isAuthenticated,
      hasUser: !!user,
      hasToken: !!token,
      username: user?.username,
      timestamp: new Date().toISOString(),
    });
  }, [isAuthenticated, user, token]);

  // ===========================
  // RETURN CONTEXT VALUE - ATUALIZADO COM AUTENTICAÇÃO
  // ===========================

  return {
    // Form Data
    formData,
    setFormData,

    // Form Validation
    errors,
    setErrors,
    validateField: validateFormField,
    validateFieldRealTime,
    validateForm,
    clearFieldError,

    // Steps Management
    currentStep,
    setCurrentStep,
    steps,
    canProceedToNext,
    canGoBack,

    // API Operations
    isLoading,
    createCampaign,

    // Utilities
    resetForm,
    loadDraft: loadDraftData,
    saveDraft: saveDraftData,
    previewCampaign,

    // ✨ NOVOS: Authentication Helpers
    getUserInfo,
    isUserReady,
    user,
    isAuthenticated,
  };
};

// ===========================
// CREATE CAMPAIGN PROVIDER
// ===========================

interface CreateCampaignProviderProps {
  children: React.ReactNode;
}

export const CreateCampaignProvider: React.FC<CreateCampaignProviderProps> = ({ children }) => {
  const campaignCreation = useCreateCampaign();

  return (
    <CreateCampaignContext.Provider value={campaignCreation}>
      {children}
    </CreateCampaignContext.Provider>
  );
};

// ===========================
// USE CREATE CAMPAIGN CONTEXT HOOK
// ===========================

export const useCreateCampaignContext = (): CampaignCreationContextType => {
  const context = useContext(CreateCampaignContext);
  if (!context) {
    throw new Error("useCreateCampaignContext deve ser usado dentro de um CreateCampaignProvider");
  }
  return context;
};

// ===========================
// EXPORTS
// ===========================

export {
  CAMPAIGN_TAGS,
  validateField,
  validateStep,
  saveDraft,
  loadDraft,
  clearDraft,
};

export default useCreateCampaign;