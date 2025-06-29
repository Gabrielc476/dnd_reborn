// ===========================
// USE CREATE CAMPAIGN HOOK - VERSÃO COMPLETA ATUALIZADA
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
        return "Nome não pode ter mais de 100 caracteres";
      }
      return null;

    case "description":
      if (value && value.length > 1000) {
        return "Descrição não pode ter mais de 1000 caracteres";
      }
      return null;

    case "setting":
      if (value && value.length > 100) {
        return "Cenário não pode ter mais de 100 caracteres";
      }
      return null;

    case "world_name":
      if (value && value.length > 100) {
        return "Nome do mundo não pode ter mais de 100 caracteres";
      }
      return null;

    case "max_players":
      if (!value || value < 1 || value > 10) {
        return "Número de jogadores deve estar entre 1 e 10";
      }
      return null;

    case "tags":
      if (!Array.isArray(value)) {
        return "Tags devem ser uma lista";
      }
      if (value.length > 10) {
        return "Máximo de 10 tags permitidas";
      }
      const invalidTags = value.filter(tag => !CAMPAIGN_TAGS.includes(tag as CampaignTag));
      if (invalidTags.length > 0) {
        return `Tags inválidas: ${invalidTags.join(", ")}`;
      }
      return null;

    case "recruitment_message":
      if (value && value.length > 500) {
        return "Mensagem de recrutamento não pode ter mais de 500 caracteres";
      }
      return null;

    case "gm_notes":
      if (value && value.length > 2000) {
        return "Notas do GM não podem ter mais de 2000 caracteres";
      }
      return null;

    default:
      return null;
  }
};

/**
 * Valida se um step específico está válido
 */
const validateStep = (stepId: string, formData: CampaignFormData): boolean => {
  switch (stepId) {
    case "basic-info":
      return !validateField("name", formData.name) && 
             formData.name.length >= 2;

    case "world-setting":
      return !validateField("setting", formData.setting) && 
             formData.setting.length > 0;

    case "players-config":
      return !validateField("max_players", formData.max_players) &&
             formData.max_players >= 1 && formData.max_players <= 10 &&
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

    setErrors(newErrors);
    return isValid;
  }, [formData, setErrors]);

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
    if (currentStep >= steps.length - 1) return false;
    return steps[currentStep]?.isValid || false;
  }, [currentStep, steps]);

  const canGoBack = useMemo((): boolean => {
    return currentStep > 0;
  }, [currentStep]);

  // ===========================
  // API OPERATIONS
  // ===========================

  const createCampaign = useCallback(async (): Promise<CreateCampaignResponse> => {
    setIsLoading(true);
    setErrors({});

    try {
      // Validação final
      if (!validateForm()) {
        throw new Error("Formulário contém erros");
      }

      // Preparar dados para API
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
      };

      // Chamar API
      const response = await campaignAPI.createCampaign(requestData);

      // Limpar rascunho se sucesso
      if (response.success) {
        clearDraft();
      }

      return response;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setErrors({ general: errorMessage });
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, setErrors]);

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
    }
  }, []);

  const saveDraftData = useCallback(() => {
    saveDraft(formData);
  }, [formData]);

  const previewCampaign = useCallback((): CampaignResponse => {
    return {
      id: "preview",
      name: formData.name,
      description: formData.description,
      game_master_id: "current_user",
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
  }, [formData]);

  // ===========================
  // EFFECTS
  // ===========================

  // Atualizar steps quando formData mudar
  useEffect(() => {
    updateSteps();
  }, [formData]);

  // Carregar rascunho na inicialização
  useEffect(() => {
    loadDraftData();
  }, [loadDraftData]);

  // ===========================
  // RETURN CONTEXT VALUE - ATUALIZADO
  // ===========================

  return {
    // Form Data
    formData,
    setFormData,

    // Form Validation
    errors,
    setErrors,
    validateField: validateFormField,
    validateFieldRealTime, // ✨ NOVO
    validateForm,
    clearFieldError, // ✨ NOVO

    // Steps Management
    currentStep,
    setCurrentStep,
    steps,
    canProceedToNext, // ✨ Agora é computed value
    canGoBack, // ✨ Agora é computed value

    // API Operations
    isLoading,
    createCampaign,

    // Utilities
    resetForm,
    loadDraft: loadDraftData,
    saveDraft: saveDraftData,
    previewCampaign,
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