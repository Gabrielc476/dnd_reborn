// components/character/creation/steps/Skills.tsx
'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    type AbilityScores,
    type DndClass,
    type DndBackground,
    type Skill,
    SKILLS,
    ABILITY_SCORE_ABBREVIATIONS
} from "@/types/characterCreation";
import { Search, CheckCircle, Circle, Info, Wand2, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SkillsProps {
    onValidationChange?: (isValid: boolean) => void;
}

const CLASS_SKILLS: Record<string, { skills: string[], choose: number }> = {
    'barbarian': { skills: ['animal-handling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'], choose: 2 },
    'bard': { skills: [], choose: 3 },
    'cleric': { skills: ['history', 'insight', 'medicine', 'persuasion', 'religion'], choose: 2 },
    'druid': { skills: ['arcana', 'animal-handling', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'], choose: 2 },
    'fighter': { skills: ['acrobatics', 'animal-handling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'], choose: 2 },
    'monk': { skills: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'], choose: 2 },
    'paladin': { skills: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'], choose: 2 },
    'ranger': { skills: ['animal-handling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'], choose: 3 },
    'rogue': { skills: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'performance', 'persuasion', 'sleight-of-hand', 'stealth'], choose: 4 },
    'sorcerer': { skills: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'], choose: 2 },
    'warlock': { skills: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'], choose: 2 },
    'wizard': { skills: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'], choose: 2 }
};

const BACKGROUND_SKILLS: Record<string, string[]> = {
    'acolyte': ['insight', 'religion'],
    'criminal': ['deception', 'stealth'],
    'folk-hero': ['animal-handling', 'survival'],
    'noble': ['history', 'persuasion'],
    'sage': ['arcana', 'history'],
    'soldier': ['athletics', 'intimidation'],
    'charlatan': ['deception', 'sleight-of-hand'],
    'entertainer': ['acrobatics', 'performance'],
    'guild-artisan': ['insight', 'persuasion'],
    'hermit': ['medicine', 'religion'],
    'outlander': ['athletics', 'survival'],
    'sailor': ['athletics', 'perception']
};

const STORAGE_KEYS = {
    SELECTED_SKILLS: 'character_creation_selected_skills',
    SELECTED_CLASS: 'character_creation_class',
    SELECTED_BACKGROUND: 'character_creation_background',
    FINAL_ABILITY_SCORES: 'character_creation_final_ability_scores'
};

const saveToStorage = (key: string, data: unknown) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Erro ao salvar:', error);
    }
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Erro ao carregar:', error);
        return defaultValue;
    }
};

const getModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
};

const getProficiencyBonus = (): number => 2;

export const SkillsComponent = ({ onValidationChange }: SkillsProps) => {
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isHydrated, setIsHydrated] = useState(false);
    const [selectedClass, setSelectedClass] = useState<DndClass | null>(null);
    const [selectedBackground, setSelectedBackground] = useState<DndBackground | null>(null);
    const [finalAbilityScores, setFinalAbilityScores] = useState<AbilityScores | null>(null);

    useEffect(() => {
        const loadedSelectedSkills = loadFromStorage(STORAGE_KEYS.SELECTED_SKILLS, []);
        const loadedClass = loadFromStorage<DndClass | null>(STORAGE_KEYS.SELECTED_CLASS, null);
        const loadedBackground = loadFromStorage<DndBackground | null>(STORAGE_KEYS.SELECTED_BACKGROUND, null);
        const loadedAbilityScores = loadFromStorage<AbilityScores | null>(STORAGE_KEYS.FINAL_ABILITY_SCORES, null);

        setSelectedSkills(loadedSelectedSkills);
        setSelectedClass(loadedClass);
        setSelectedBackground(loadedBackground);
        setFinalAbilityScores(loadedAbilityScores);
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (!isHydrated) return;

        const interval = setInterval(() => {
            const currentClass = loadFromStorage<DndClass | null>(STORAGE_KEYS.SELECTED_CLASS, null);
            const currentBackground = loadFromStorage<DndBackground | null>(STORAGE_KEYS.SELECTED_BACKGROUND, null);
            const currentAbilityScores = loadFromStorage<AbilityScores | null>(STORAGE_KEYS.FINAL_ABILITY_SCORES, null);

            if (JSON.stringify(currentClass) !== JSON.stringify(selectedClass)) {
                setSelectedClass(currentClass);
            }
            if (JSON.stringify(currentBackground) !== JSON.stringify(selectedBackground)) {
                setSelectedBackground(currentBackground);
            }
            if (JSON.stringify(currentAbilityScores) !== JSON.stringify(finalAbilityScores)) {
                setFinalAbilityScores(currentAbilityScores);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isHydrated, selectedClass, selectedBackground, finalAbilityScores]);

    const classKey = selectedClass?.index || '';
    const backgroundKey = selectedBackground?.index || '';
    
    const classConfig = CLASS_SKILLS[classKey] || { skills: [], choose: 0 };
    const backgroundSkills = BACKGROUND_SKILLS[backgroundKey] || [];
    
    const availableSkills = classConfig.skills.length > 0 ? classConfig.skills : SKILLS.map(s => s.key);
    const maxChoices = classConfig.choose;

    useEffect(() => {
        if (isHydrated) {
            saveToStorage(STORAGE_KEYS.SELECTED_SKILLS, selectedSkills);
        }
    }, [selectedSkills, isHydrated]);

    useEffect(() => {
        if (!isHydrated) return;

        if (!selectedClass) {
            onValidationChange?.(false);
            return;
        }
        
        const isValid = selectedSkills.length === maxChoices;
        onValidationChange?.(isValid);
    }, [selectedSkills.length, maxChoices, selectedClass, onValidationChange, isHydrated]);

    const toggleSkill = (skillKey: string) => {
        const isFromBackground = backgroundSkills.includes(skillKey);
        const isAvailable = availableSkills.includes(skillKey);
        
        if (isFromBackground) return;
        if (!isAvailable) return;
        
        setSelectedSkills(prev => {
            if (prev.includes(skillKey)) {
                return prev.filter(skill => skill !== skillKey);
            } else if (prev.length < maxChoices) {
                return [...prev, skillKey];
            }
            return prev;
        });
    };

    const clearAll = () => {
        setSelectedSkills([]);
        if (isHydrated) {
            localStorage.removeItem(STORAGE_KEYS.SELECTED_SKILLS);
        }
    };

    const processedSkills = SKILLS
        .filter(skill => {
            const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                skill.ability.toLowerCase().includes(searchTerm.toLowerCase());
            
            const isAvailable = availableSkills.includes(skill.key) || 
                              backgroundSkills.includes(skill.key) || 
                              selectedSkills.includes(skill.key);
            
            return matchesSearch && isAvailable;
        })
        .map(skill => {
            const isProficient = backgroundSkills.includes(skill.key) || selectedSkills.includes(skill.key);
            const isFromBackground = backgroundSkills.includes(skill.key);
            const isSelected = selectedSkills.includes(skill.key);
            const canSelect = !isFromBackground && 
                            availableSkills.includes(skill.key) && 
                            (selectedSkills.length < maxChoices || isSelected);
            const abilityScore = finalAbilityScores?.[skill.ability] || 10;
            const abilityModifier = getModifier(abilityScore);
            const proficiencyBonus = isProficient ? getProficiencyBonus() : 0;
            const modifier = abilityModifier + proficiencyBonus;
            
            return {
                ...skill,
                isProficient,
                isFromBackground,
                isSelected,
                canSelect,
                abilityScore,
                modifier
            };
        });

    if (!isHydrated) {
        return (
            <div className="space-y-6">
                <Card className="p-6 bg-slate-800 border-slate-700">
                    <div className="animate-pulse">
                        <div className="h-6 bg-slate-700 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-slate-700 rounded w-2/3 mb-4"></div>
                        <div className="h-10 bg-slate-700 rounded w-full"></div>
                    </div>
                </Card>
                <Card className="p-6 bg-slate-800 border-slate-700">
                    <div className="animate-pulse">
                        <div className="h-5 bg-slate-700 rounded w-1/4 mb-4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-20 bg-slate-700 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    if (!selectedClass) {
        return (
            <Card className="p-6 bg-slate-800 border-slate-700">
                <div className="flex items-center gap-2 text-yellow-400">
                    <Info className="w-5 h-5" />
                    <div>
                        <h4 className="font-semibold">Classe necessária</h4>
                        <p className="text-sm text-slate-300">
                            Selecione uma classe primeiro para ver as opções de perícias.
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
                <Card className="p-4 bg-slate-800 border-slate-700">
                    <h4 className="font-bold text-sm mb-2 text-slate-300">Debug:</h4>
                    <div className="text-xs space-y-1 text-slate-400">
                        <p>Classe: {selectedClass?.name || 'Nenhuma'} ({classKey})</p>
                        <p>Background: {selectedBackground?.name || 'Nenhum'} ({backgroundKey})</p>
                        <p>Perícias da classe: {availableSkills.length} (escolher {maxChoices})</p>
                        <p>Perícias do background: {backgroundSkills.join(', ') || 'Nenhuma'}</p>
                        <p>Selecionadas: {selectedSkills.length}/{maxChoices}</p>
                        <p>Válido: {selectedSkills.length === maxChoices ? 'Sim' : 'Não'}</p>
                        <p>Hydrated: {isHydrated ? 'Sim' : 'Não'}</p>
                        <Button size="sm" variant="outline" onClick={clearAll} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                            Limpar Tudo
                        </Button>
                    </div>
                </Card>
            )}

            {/* Header */}
            <Card className="p-6 bg-slate-800 border-slate-700">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <CardTitle className="text-lg font-bold text-white">Perícias do Personagem</CardTitle>
                        <p className="text-sm text-slate-400 mt-1">
                            Escolha {maxChoices} perícias para sua classe {selectedClass?.name || 'selecionada'}
                        </p>
                    </div>
                    
                    <div className="text-right">
                        <div className="text-lg font-semibold text-white">
                            {selectedSkills.length}/{maxChoices}
                        </div>
                        <div className="text-xs text-slate-400">Selecionadas</div>
                    </div>
                </div>

                {/* Background Skills Info */}
                {backgroundSkills.length > 0 && (
                    <div className="bg-green-900/20 p-3 rounded-lg mb-4 border border-green-800/50">
                        <h4 className="font-medium text-green-400 mb-1">
                            Perícias do Background ({selectedBackground?.name || 'Selecionado'})
                        </h4>
                        <p className="text-sm text-green-300">
                            {backgroundSkills.map(skillKey => {
                                const skill = SKILLS.find(s => s.key === skillKey);
                                return skill?.name;
                            }).filter(Boolean).join(', ')}
                        </p>
                    </div>
                )}

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar perícias..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </Card>

            {/* Skills List */}
            <Card className="p-6 bg-slate-800 border-slate-700">
                <h4 className="font-semibold mb-4 text-white">Perícias Disponíveis</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {processedSkills.map(skill => (
                        <button
                            key={skill.key}
                            onClick={() => toggleSkill(skill.key)}
                            disabled={!skill.canSelect && !skill.isSelected}
                            className={`p-4 rounded-lg border-2 text-left transition-all ${
                                skill.isProficient
                                    ? skill.isFromBackground
                                        ? 'border-green-500 bg-green-900/20'
                                        : 'border-blue-500 bg-blue-900/20'
                                    : skill.canSelect
                                        ? 'border-slate-600 bg-slate-700 hover:border-blue-400 hover:bg-slate-600'
                                        : 'border-slate-700 bg-slate-800 cursor-not-allowed opacity-60'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        {skill.isProficient ? (
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <Circle className="w-4 h-4 text-slate-500" />
                                        )}
                                        <span className="font-medium text-white">{skill.name}</span>
                                        
                                        {skill.isFromBackground && (
                                            <Badge variant="secondary" className="bg-green-900/50 text-green-300 hover:bg-green-800">
                                                Background
                                            </Badge>
                                        )}
                                        
                                        {skill.isSelected && (
                                            <Badge variant="default" className="bg-blue-900/50 text-blue-300 hover:bg-blue-800">
                                                Classe
                                            </Badge>
                                        )}
                                    </div>
                                    
                                    <div className="text-sm text-slate-400">
                                        {skill.ability.charAt(0).toUpperCase() + skill.ability.slice(1)} ({ABILITY_SCORE_ABBREVIATIONS[skill.ability]})
                                    </div>
                                    
                                    <div className="text-xs text-slate-500 mt-1">
                                        Atributo: {skill.abilityScore} | Bônus: {skill.modifier >= 0 ? '+' : ''}{skill.modifier}
                                        {skill.isProficient && (
                                            <span className="text-green-400 font-medium ml-1">
                                                (proficiente)
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="text-right">
                                    <div className={`text-lg font-bold ${
                                        skill.isProficient ? 'text-green-400' : 'text-slate-400'
                                    }`}>
                                        {skill.modifier >= 0 ? '+' : ''}{skill.modifier}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </Card>

            {/* Summary */}
            {(selectedSkills.length > 0 || backgroundSkills.length > 0) && (
                <Card className="p-6 bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-slate-700">
                    <h3 className="text-lg font-bold mb-4 text-white">📋 Resumo das Perícias</h3>
                    
                    <div className="space-y-2">
                        {backgroundSkills.length > 0 && (
                            <div className="text-sm text-slate-300">
                                <strong className="text-green-400">Background:</strong>{' '}
                                {backgroundSkills.map(skillKey => {
                                    const skill = SKILLS.find(s => s.key === skillKey);
                                    return skill?.name;
                                }).filter(Boolean).join(', ')}
                            </div>
                        )}
                        
                        {selectedSkills.length > 0 && (
                            <div className="text-sm text-slate-300">
                                <strong className="text-blue-400">Classe:</strong>{' '}
                                {selectedSkills.map(skillKey => {
                                    const skill = SKILLS.find(s => s.key === skillKey);
                                    return skill?.name;
                                }).filter(Boolean).join(', ')}
                            </div>
                        )}
                        
                        <div className="text-sm text-slate-400 mt-3">
                            <strong>Total de perícias proficientes:</strong> {selectedSkills.length + backgroundSkills.length}
                        </div>
                    </div>
                    
                    {selectedSkills.length === maxChoices && (
                        <div className="mt-4 flex items-center gap-2 text-green-400">
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