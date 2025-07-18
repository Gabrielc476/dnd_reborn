// components/character/creation/steps/Skills.tsx
// ✅ COMPONENTE DE PERÍCIAS COMPLETO
'use client';

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    type AbilityScores,
    type DndClass,
    type DndBackground,
    type Skill,
    SKILLS,
    ABILITY_SCORE_ABBREVIATIONS
} from "@/types/characterCreation";
import { Search, CheckCircle, Circle, Info, Star, Zap } from "lucide-react";

interface SkillsProps {
    onValidationChange?: (isValid: boolean) => void;
}

// ===========================
// STORAGE KEYS
// ===========================

const STORAGE_KEYS = {
    SELECTED_SKILLS: 'character_creation_selected_skills',
    AVAILABLE_SKILL_CHOICES: 'character_creation_available_skill_choices',
    CLASS_SKILL_OPTIONS: 'character_creation_class_skill_options',
    BACKGROUND_SKILLS: 'character_creation_background_skills'
};

const CROSS_STEP_KEYS = {
    SELECTED_CLASS: 'character_creation_class',
    SELECTED_BACKGROUND: 'character_creation_background',
    FINAL_ABILITY_SCORES: 'character_creation_final_ability_scores'
};

// ===========================
// UTILITY FUNCTIONS
// ===========================

const saveToStorage = (key: string, data: unknown) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        console.log(`💾 Salvou ${key}`);
    } catch (error) {
        console.error('Erro ao salvar:', error);
    }
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        if (item) {
            return JSON.parse(item);
        }
    } catch (error) {
        console.error('Erro ao carregar:', error);
    }
    return defaultValue;
};

const getModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
};

const getProficiencyBonus = (level: number = 1): number => {
    return Math.ceil(level / 4) + 1;
};

// ===========================
// SKILLS MAPPING
// ===========================

// Mapeamento de perícias da API D&D para nosso sistema
const SKILL_INDEX_MAP: Record<string, string> = {
    'acrobatics': 'acrobatics',
    'animal-handling': 'animal-handling',
    'arcana': 'arcana',
    'athletics': 'athletics',
    'deception': 'deception',
    'history': 'history',
    'insight': 'insight',
    'intimidation': 'intimidation',
    'investigation': 'investigation',
    'medicine': 'medicine',
    'nature': 'nature',
    'perception': 'perception',
    'performance': 'performance',
    'persuasion': 'persuasion',
    'religion': 'religion',
    'sleight-of-hand': 'sleight-of-hand',
    'stealth': 'stealth',
    'survival': 'survival'
};

export const SkillsComponent = ({ onValidationChange }: SkillsProps) => {
    // ===========================
    // STATES
    // ===========================
    
    const [selectedSkills, setSelectedSkills] = useState<string[]>(() =>
        loadFromStorage<string[]>(STORAGE_KEYS.SELECTED_SKILLS, [])
    );
    
    const [availableSkillChoices, setAvailableSkillChoices] = useState<number>(() =>
        loadFromStorage<number>(STORAGE_KEYS.AVAILABLE_SKILL_CHOICES, 0)
    );
    
    const [classSkillOptions, setClassSkillOptions] = useState<string[]>(() =>
        loadFromStorage<string[]>(STORAGE_KEYS.CLASS_SKILL_OPTIONS, [])
    );
    
    const [backgroundSkills, setBackgroundSkills] = useState<string[]>(() =>
        loadFromStorage<string[]>(STORAGE_KEYS.BACKGROUND_SKILLS, [])
    );
    
    const [searchTerm, setSearchTerm] = useState('');
    
    // Cross-step data
    const [crossStepData, setCrossStepData] = useState({
        selectedClass: loadFromStorage<DndClass | null>(CROSS_STEP_KEYS.SELECTED_CLASS, null),
        selectedBackground: loadFromStorage<DndBackground | null>(CROSS_STEP_KEYS.SELECTED_BACKGROUND, null),
        finalAbilityScores: loadFromStorage<AbilityScores | null>(CROSS_STEP_KEYS.FINAL_ABILITY_SCORES, null)
    });

    // ===========================
    // EFEITOS DE STORAGE
    // ===========================

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.SELECTED_SKILLS, selectedSkills);
    }, [selectedSkills]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.AVAILABLE_SKILL_CHOICES, availableSkillChoices);
    }, [availableSkillChoices]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.CLASS_SKILL_OPTIONS, classSkillOptions);
    }, [classSkillOptions]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.BACKGROUND_SKILLS, backgroundSkills);
    }, [backgroundSkills]);

    // ===========================
    // CROSS-STEP DATA UPDATE
    // ===========================

    useEffect(() => {
        const interval = setInterval(() => {
            const newClass = loadFromStorage<DndClass | null>(CROSS_STEP_KEYS.SELECTED_CLASS, null);
            const newBackground = loadFromStorage<DndBackground | null>(CROSS_STEP_KEYS.SELECTED_BACKGROUND, null);
            const newAbilityScores = loadFromStorage<AbilityScores | null>(CROSS_STEP_KEYS.FINAL_ABILITY_SCORES, null);

            setCrossStepData(prev => {
                const hasChanges = 
                    JSON.stringify(prev.selectedClass) !== JSON.stringify(newClass) ||
                    JSON.stringify(prev.selectedBackground) !== JSON.stringify(newBackground) ||
                    JSON.stringify(prev.finalAbilityScores) !== JSON.stringify(newAbilityScores);

                if (hasChanges) {
                    console.log('🔄 Dados de outros steps atualizados no componente de perícias');
                    return {
                        selectedClass: newClass,
                        selectedBackground: newBackground,
                        finalAbilityScores: newAbilityScores
                    };
                }
                return prev;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // ===========================
    // PROCESSAR OPÇÕES DE PERÍCIAS
    // ===========================

    useEffect(() => {
        if (crossStepData.selectedClass) {
            console.log('🔍 Processando classe:', crossStepData.selectedClass.name);
            console.log('📝 Proficiency choices:', crossStepData.selectedClass.proficiency_choices);
            
            const classSkills: string[] = [];
            let skillChoices = 0;

            // Processar escolhas de proficiência da classe
            crossStepData.selectedClass.proficiency_choices?.forEach((choice, index) => {
                console.log(`📋 Choice ${index}:`, choice);
                
                // Verificar se é escolha de perícias
                if (choice.desc?.toLowerCase().includes('skill') || 
                    choice.desc?.toLowerCase().includes('perícia') ||
                    choice.from?.options?.some(opt => opt.item.index.includes('skill') || SKILLS.some(skill => skill.key === opt.item.index))) {
                    
                    if (choice.from?.options) {
                        choice.from.options.forEach(option => {
                            console.log('🎯 Option:', option.item.index, option.item.name);
                            
                            // Mapear skill index ou verificar se está na lista de skills
                            let skillKey = option.item.index;
                            
                            // Se o item.index está no nosso mapeamento, usar direto
                            if (SKILL_INDEX_MAP[option.item.index]) {
                                classSkills.push(option.item.index);
                            }
                            // Se é um skill que conhecemos pela key
                            else if (SKILLS.some(skill => skill.key === option.item.index)) {
                                classSkills.push(option.item.index);
                            }
                            // Fallback: verificar por nome (caso API use nomes diferentes)
                            else {
                                const foundSkill = SKILLS.find(skill => 
                                    skill.name.toLowerCase() === option.item.name.toLowerCase() ||
                                    skill.key === option.item.index
                                );
                                if (foundSkill) {
                                    classSkills.push(foundSkill.key);
                                }
                            }
                        });
                        skillChoices = Math.max(skillChoices, choice.choose || 0);
                    }
                }
            });

            // Fallback: Se não encontrou perícias específicas, assumir que todas são disponíveis
            if (classSkills.length === 0 && crossStepData.selectedClass.proficiency_choices?.length > 0) {
                console.log('⚠️ Não encontrou perícias específicas, usando fallback');
                // Para Fighter, por exemplo, adicionar perícias típicas
                const commonSkills = ['acrobatics', 'animal-handling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'];
                classSkills.push(...commonSkills);
                skillChoices = 2; // Valor padrão para Fighter
            }

            console.log(`✅ Resultado - Skills disponíveis:`, classSkills);
            console.log(`✅ Número de escolhas:`, skillChoices);

            setClassSkillOptions(classSkills);
            setAvailableSkillChoices(skillChoices);
        }

        if (crossStepData.selectedBackground) {
            console.log('🔍 Processando background:', crossStepData.selectedBackground.name);
            console.log('📝 Starting proficiencies:', crossStepData.selectedBackground.starting_proficiencies);
            
            const bgSkills: string[] = [];
            
            crossStepData.selectedBackground.starting_proficiencies?.forEach(prof => {
                console.log('🎯 Proficiency:', prof.index, prof.name);
                
                if (SKILL_INDEX_MAP[prof.index]) {
                    bgSkills.push(prof.index);
                } else if (SKILLS.some(skill => skill.key === prof.index)) {
                    bgSkills.push(prof.index);
                } else {
                    // Buscar por nome
                    const foundSkill = SKILLS.find(skill => 
                        skill.name.toLowerCase() === prof.name.toLowerCase()
                    );
                    if (foundSkill) {
                        bgSkills.push(foundSkill.key);
                    }
                }
            });
            
            console.log(`✅ Background skills:`, bgSkills);
            setBackgroundSkills(bgSkills);
        }
    }, [crossStepData.selectedClass, crossStepData.selectedBackground]);

    // ===========================
    // FUNCTIONS
    // ===========================

    const getSkillModifier = (skill: Skill, isProficient: boolean = false): number => {
        if (!crossStepData.finalAbilityScores) return 0;
        
        const abilityScore = crossStepData.finalAbilityScores[skill.ability];
        const abilityModifier = getModifier(abilityScore);
        const proficiencyBonus = isProficient ? getProficiencyBonus(1) : 0;
        
        return abilityModifier + proficiencyBonus;
    };

    const isSkillSelectable = (skillKey: string): boolean => {
        // Perícias do background são automáticas - não selecionáveis
        if (backgroundSkills.includes(skillKey)) return false;
        
        // Se não tem dados da classe ainda, não é selecionável
        if (!crossStepData.selectedClass) return false;
        
        // Se não há opções de perícias da classe, não é selecionável  
        if (classSkillOptions.length === 0) return false;
        
        // Perícias da classe podem ser selecionadas se estiverem nas opções
        return classSkillOptions.includes(skillKey);
    };

    const getSkillStatus = (skillKey: string): { 
        isProficient: boolean; 
        isSelectable: boolean; 
        isFromBackground: boolean; 
        isSelected: boolean;
        reason?: string;
    } => {
        const isFromBackground = backgroundSkills.includes(skillKey);
        const isSelected = selectedSkills.includes(skillKey);
        const isProficient = isSelected || isFromBackground;
        const isSelectable = isSkillSelectable(skillKey);
        
        let reason = '';
        if (!crossStepData.selectedClass) {
            reason = 'Selecione uma classe primeiro';
        } else if (classSkillOptions.length === 0) {
            reason = 'Nenhuma opção de perícia da classe encontrada';
        } else if (isFromBackground) {
            reason = 'Perícia automática do background';
        } else if (!classSkillOptions.includes(skillKey)) {
            reason = 'Não disponível para esta classe';
        } else if (isSelected) {
            reason = 'Selecionada pela classe';
        } else if (selectedSkills.length >= availableSkillChoices) {
            reason = 'Limite de seleções atingido';
        } else {
            reason = 'Clique para selecionar';
        }
        
        return {
            isProficient,
            isSelectable,
            isFromBackground,
            isSelected,
            reason
        };
    };

    const toggleSkill = (skillKey: string) => {
        const status = getSkillStatus(skillKey);
        
        if (!status.isSelectable) {
            console.log(`❌ Perícia ${skillKey} não é selecionável: ${status.reason}`);
            return;
        }
        
        setSelectedSkills(prev => {
            const isCurrentlySelected = prev.includes(skillKey);
            
            if (isCurrentlySelected) {
                // Remover perícia
                console.log(`➖ Removendo perícia: ${skillKey}`);
                return prev.filter(skill => skill !== skillKey);
            } else {
                // Adicionar perícia se ainda há slots disponíveis
                const currentSelections = prev.length;
                
                if (currentSelections < availableSkillChoices) {
                    console.log(`➕ Adicionando perícia: ${skillKey} (${currentSelections + 1}/${availableSkillChoices})`);
                    return [...prev, skillKey];
                } else {
                    console.log(`⚠️ Limite de perícias atingido: ${currentSelections}/${availableSkillChoices}`);
                    return prev;
                }
            }
        });
    };

    const validateSkills = useCallback((): boolean => {
        // Se não tem classe selecionada, não é válido
        if (!crossStepData.selectedClass) {
            console.log('❌ Validação falhou: classe não selecionada');
            return false;
        }
        
        // Se a classe não oferece escolhas de perícias, é válido automaticamente
        if (availableSkillChoices === 0) {
            console.log('✅ Validação passou: classe sem escolhas de perícias');
            return true;
        }
        
        // Se oferece escolhas, deve ter selecionado o número correto
        const selectedCount = selectedSkills.length;
        const isValid = selectedCount === availableSkillChoices;
        
        console.log(`🔍 Validação: ${selectedCount}/${availableSkillChoices} selecionadas - ${isValid ? 'VÁLIDO' : 'INVÁLIDO'}`);
        return isValid;
    }, [selectedSkills.length, availableSkillChoices, crossStepData.selectedClass]);

    useEffect(() => {
        const isValid = validateSkills();
        onValidationChange?.(isValid);
    }, [validateSkills, onValidationChange]);

    // ===========================
    // FILTERING
    // ===========================

    const filteredSkills = SKILLS.filter(skill =>
        skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.ability.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ===========================
    // CLEAR STORAGE
    // ===========================

    const clearStorageData = () => {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        
        setSelectedSkills([]);
        setAvailableSkillChoices(0);
        setClassSkillOptions([]);
        setBackgroundSkills([]);
        
        console.log('🧹 Dados de perícias limpos');
    };

    // Debug function para testar perícias
    const enableTestMode = () => {
        console.log('🧪 Ativando modo de teste para perícias');
        const testSkills = ['acrobatics', 'athletics', 'history', 'insight', 'intimidation', 'perception'];
        setClassSkillOptions(testSkills);
        setAvailableSkillChoices(2);
        console.log('✅ Modo teste ativo - 2 perícias de 6 opções disponíveis');
    };

    const forceReloadData = () => {
        console.log('🔄 Forçando reload dos dados...');
        const newClass = loadFromStorage<DndClass | null>(CROSS_STEP_KEYS.SELECTED_CLASS, null);
        const newBackground = loadFromStorage<DndBackground | null>(CROSS_STEP_KEYS.SELECTED_BACKGROUND, null);
        const newAbilityScores = loadFromStorage<AbilityScores | null>(CROSS_STEP_KEYS.FINAL_ABILITY_SCORES, null);
        
        console.log('Dados carregados:', { 
            class: newClass?.name, 
            background: newBackground?.name,
            hasAbilityScores: !!newAbilityScores 
        });
        
        setCrossStepData({
            selectedClass: newClass,
            selectedBackground: newBackground,
            finalAbilityScores: newAbilityScores
        });
    };

    // ===========================
    // RENDER
    // ===========================

    const currentSelections = selectedSkills.length;
    const backgroundCount = backgroundSkills.length;
    const totalProficient = currentSelections + backgroundCount;

    return (
        <div className="space-y-6">
            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
                <Card className="p-4 bg-blue-50">
                    <h4 className="font-bold text-sm mb-2">Debug - Skills Status:</h4>
                    <div className="text-xs space-y-1">
                        <p>Classe: {crossStepData.selectedClass?.name || 'Não selecionada'}</p>
                        <p>Background: {crossStepData.selectedBackground?.name || 'Não selecionado'}</p>
                        <p>Perícias selecionáveis: {availableSkillChoices}</p>
                        <p>Perícias selecionadas: {currentSelections}/{availableSkillChoices}</p>
                        <p>Perícias do background: {backgroundCount} ({backgroundSkills.join(', ')})</p>
                        <p>Total proficiente: {totalProficient}</p>
                        <p>Opções da classe: {classSkillOptions.length} ({classSkillOptions.join(', ')})</p>
                        
                        {/* Debug detalhado da classe */}
                        {crossStepData.selectedClass && (
                            <div className="mt-2 p-2 bg-white rounded">
                                <strong>Dados da Classe:</strong>
                                <div className="ml-2">
                                    <p>Proficiency choices: {crossStepData.selectedClass.proficiency_choices?.length || 0}</p>
                                    {crossStepData.selectedClass.proficiency_choices?.map((choice, index) => (
                                        <div key={index} className="text-purple-600 text-xs">
                                            Choice {index}: {choice.desc} (choose: {choice.choose})
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2 mt-2">
                            <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={clearStorageData}
                            >
                                Limpar Storage
                            </Button>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={forceReloadData}
                                className="bg-green-100"
                            >
                                🔄 Recarregar Dados
                            </Button>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={enableTestMode}
                                className="bg-yellow-100"
                            >
                                🧪 Modo Teste
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Avisos e mensagens de estado */}
            {!crossStepData.selectedClass && (
                <Card className="p-6 bg-yellow-50">
                    <div className="flex items-center gap-2 text-yellow-800">
                        <Info className="w-5 h-5" />
                        <div>
                            <h4 className="font-semibold">Classe necessária</h4>
                            <p className="text-sm">
                                Você precisa selecionar uma classe antes de escolher as perícias.
                                Volte ao passo anterior para selecionar sua classe.
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {crossStepData.selectedClass && classSkillOptions.length === 0 && (
                <Card className="p-6 bg-orange-50">
                    <div className="flex items-center gap-2 text-orange-800">
                        <Info className="w-5 h-5" />
                        <div>
                            <h4 className="font-semibold">Processando opções de perícias</h4>
                            <p className="text-sm">
                                Carregando as opções de perícias para {crossStepData.selectedClass.name}...
                                Se o problema persistir, use o botão "🧪 Modo Teste" no debug.
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Header com informações */}
            <Card className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-bold">Perícias do Personagem</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Selecione as perícias em que seu personagem é proficiente
                        </p>
                    </div>
                    
                    <div className="text-right">
                        <div className="text-lg font-semibold">
                            {currentSelections}/{availableSkillChoices}
                        </div>
                        <div className="text-xs text-gray-600">Selecionadas</div>
                    </div>
                </div>

                {/* Resumo das fontes de perícias */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {crossStepData.selectedClass && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Star className="w-4 h-4 text-blue-600" />
                                <span className="font-medium text-blue-800">
                                    {crossStepData.selectedClass.name}
                                </span>
                            </div>
                            <p className="text-sm text-blue-700">
                                Escolha {availableSkillChoices} perícias das opções disponíveis
                            </p>
                        </div>
                    )}

                    {crossStepData.selectedBackground && backgroundCount > 0 && (
                        <div className="bg-green-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-4 h-4 text-green-600" />
                                <span className="font-medium text-green-800">
                                    {crossStepData.selectedBackground.name}
                                </span>
                            </div>
                            <p className="text-sm text-green-700">
                                +{backgroundCount} perícias automáticas
                            </p>
                        </div>
                    )}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar perícias..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </Card>

            {/* Lista de Perícias */}
            <Card className="p-6">
                <h4 className="font-semibold mb-4">Perícias Disponíveis</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredSkills.map(skill => {
                        const status = getSkillStatus(skill.key);
                        const modifier = getSkillModifier(skill, status.isProficient);
                        const abilityScore = crossStepData.finalAbilityScores?.[skill.ability] || 10;
                        
                        return (
                            <button
                                key={skill.key}
                                onClick={() => toggleSkill(skill.key)}
                                disabled={!status.isSelectable}
                                className={`p-4 rounded-lg border-2 text-left transition-all ${
                                    status.isProficient
                                        ? status.isFromBackground
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-blue-500 bg-blue-50'
                                        : status.isSelectable
                                            ? 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                                            : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                                }`}
                                title={status.reason}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {status.isProficient ? (
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                            ) : status.isSelectable ? (
                                                <Circle className="w-4 h-4 text-blue-400" />
                                            ) : (
                                                <Circle className="w-4 h-4 text-gray-400" />
                                            )}
                                            <span className="font-medium">{skill.name}</span>
                                            
                                            {status.isFromBackground && (
                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                                    Background
                                                </span>
                                            )}
                                            
                                            {status.isSelected && !status.isFromBackground && (
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                                    Classe
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="text-sm text-gray-600">
                                            {skill.ability.charAt(0).toUpperCase() + skill.ability.slice(1)} ({ABILITY_SCORE_ABBREVIATIONS[skill.ability]})
                                        </div>
                                        
                                        <div className="text-xs text-gray-500 mt-1">
                                            Atributo: {abilityScore} | 
                                            Modificador: {modifier >= 0 ? '+' : ''}{modifier}
                                            {status.isProficient && (
                                                <span className="text-green-600 font-medium ml-1">
                                                    (com proficiência)
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* Status/Reason */}
                                        <div className={`text-xs mt-1 ${
                                            status.isSelectable ? 'text-blue-600' : 'text-gray-500'
                                        }`}>
                                            {status.reason}
                                        </div>
                                    </div>
                                    
                                    <div className="text-right">
                                        <div className={`text-lg font-bold ${
                                            status.isProficient ? 'text-green-600' : 'text-gray-600'
                                        }`}>
                                            {modifier >= 0 ? '+' : ''}{modifier}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </Card>

            {/* Resumo Final */}
            {totalProficient > 0 && (
                <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
                    <h3 className="text-lg font-bold mb-4">📋 Resumo das Perícias</h3>
                    
                    <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                            <strong>Total de perícias proficientes:</strong> {totalProficient}
                        </div>
                        
                        {backgroundSkills.length > 0 && (
                            <div className="text-sm">
                                <strong className="text-green-700">Background ({backgroundCount}):</strong>{' '}
                                {backgroundSkills.map(skillKey => {
                                    const skill = SKILLS.find(s => s.key === skillKey);
                                    return skill?.name;
                                }).join(', ')}
                            </div>
                        )}
                        
                        {selectedSkills.length > 0 && (
                            <div className="text-sm">
                                <strong className="text-blue-700">Classe ({currentSelections}):</strong>{' '}
                                {selectedSkills.map(skillKey => {
                                    const skill = SKILLS.find(s => s.key === skillKey);
                                    return skill?.name;
                                }).join(', ')}
                            </div>
                        )}
                    </div>
                    
                    {validateSkills() && (
                        <div className="mt-4 flex items-center gap-2 text-green-700">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                ✅ Seleção de perícias completa!
                            </span>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
};