// components/character/creation/steps/AbilityScores.tsx
// ✅ CORRIGIDO: Todos os erros de TypeScript e ESLint resolvidos
'use client';

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
    type AbilityScores, 
    type DndRace,
    type DndSubrace,
    type DndAbilityBonus,
    ABILITY_SCORE_ABBREVIATIONS 
} from "@/types/characterCreation";

interface AbilityScoresProps {
    onValidationChange?: (isValid: boolean) => void;
}

type AbilityMethod = "point-buy" | "standard" | "rolled";

// ===========================
// STORAGE - SIMPLES E DIRETO + CROSS-STEP
// ===========================

const STORAGE_KEYS = {
    ABILITY_METHOD: 'character_creation_ability_method',
    ABILITY_SCORES: 'character_creation_ability_scores',
    POINTS_REMAINING: 'character_creation_points_remaining',
    STANDARD_ASSIGNMENTS: 'character_creation_standard_assignments',
    ROLLED_ARRAYS: 'character_creation_rolled_arrays',
    SELECTED_ROLLED_ARRAY: 'character_creation_selected_rolled'
};

// Keys de outros steps para acessar dados raciais
const CROSS_STEP_KEYS = {
    SELECTED_RACE: 'character_creation_race',
    SELECTED_SUBRACE: 'character_creation_subrace'
};

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

// ===========================
// CONSTANTS
// ===========================

const INITIAL_SCORES: AbilityScores = {
    strength: 8,
    dexterity: 8,
    constitution: 8,
    intelligence: 8,
    wisdom: 8,
    charisma: 8
};

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

const POINT_BUY_COSTS: Record<number, number> = {
    8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
};

export const AbilityScoresComponent = ({ onValidationChange }: AbilityScoresProps) => {
    // ===========================
    // STATES COM STORAGE
    // ===========================
    
    const [selectedMethod, setSelectedMethod] = useState<AbilityMethod | null>(() => 
        loadFromStorage<AbilityMethod | null>(STORAGE_KEYS.ABILITY_METHOD, null)
    );
    
    const [abilityScores, setAbilityScores] = useState<AbilityScores>(() => 
        loadFromStorage<AbilityScores>(STORAGE_KEYS.ABILITY_SCORES, INITIAL_SCORES)
    );
    
    const [pointsRemaining, setPointsRemaining] = useState(() => 
        loadFromStorage<number>(STORAGE_KEYS.POINTS_REMAINING, 27)
    );
    
    const [standardArrayValues, setStandardArrayValues] = useState<number[]>(() => 
        loadFromStorage<number[]>('standard_array_values', [...STANDARD_ARRAY])
    );
    
    const [assignedValues, setAssignedValues] = useState<(number | null)[]>(() => 
        loadFromStorage<(number | null)[]>(STORAGE_KEYS.STANDARD_ASSIGNMENTS, [null, null, null, null, null, null])
    );
    
    const [rolledArrays, setRolledArrays] = useState<number[][]>(() => 
        loadFromStorage<number[][]>(STORAGE_KEYS.ROLLED_ARRAYS, [])
    );
    
    const [selectedRolledArray, setSelectedRolledArray] = useState<number | null>(() => 
        loadFromStorage<number | null>(STORAGE_KEYS.SELECTED_ROLLED_ARRAY, null)
    );

    // ===========================
    // DADOS DE OUTROS STEPS (RACIAL BONUSES)
    // ===========================
    
    const [crossStepData, setCrossStepData] = useState<{
        selectedRace: DndRace | null;
        selectedSubrace: DndSubrace | null;
    }>({
        selectedRace: loadFromStorage<DndRace | null>(CROSS_STEP_KEYS.SELECTED_RACE, null),
        selectedSubrace: loadFromStorage<DndSubrace | null>(CROSS_STEP_KEYS.SELECTED_SUBRACE, null)
    });

    // ===========================
    // UTILITY FUNCTIONS + RACIAL BONUSES
    // ===========================

    const getModifier = (score: number): number => {
        return Math.floor((score - 10) / 2);
    };

    // Calcular bônus raciais
    const getRacialBonuses = useCallback((): Record<keyof AbilityScores, number> => {
        const bonuses: Record<keyof AbilityScores, number> = {
            strength: 0,
            dexterity: 0,
            constitution: 0,
            intelligence: 0,
            wisdom: 0,
            charisma: 0
        };

        // Mapeamento correto dos índices da API D&D para nossas chaves
        const indexToAbilityMap: Record<string, keyof AbilityScores> = {
            'str': 'strength',
            'dex': 'dexterity', 
            'con': 'constitution',
            'int': 'intelligence',
            'wis': 'wisdom',
            'cha': 'charisma'
        };

        // Bônus da raça principal
        if (crossStepData.selectedRace?.ability_bonuses) {
            crossStepData.selectedRace.ability_bonuses.forEach((bonus: DndAbilityBonus) => {
                const abilityKey = indexToAbilityMap[bonus.ability_score.index];
                if (abilityKey && abilityKey in bonuses) {
                    bonuses[abilityKey] += bonus.bonus;
                    console.log(`🎯 Aplicando bônus racial - ${bonus.ability_score.index} (${abilityKey}): +${bonus.bonus}`);
                }
            });
        }

        // Bônus da sub-raça
        if (crossStepData.selectedSubrace?.ability_bonuses) {
            crossStepData.selectedSubrace.ability_bonuses.forEach((bonus: DndAbilityBonus) => {
                const abilityKey = indexToAbilityMap[bonus.ability_score.index];
                if (abilityKey && abilityKey in bonuses) {
                    bonuses[abilityKey] += bonus.bonus;
                    console.log(`🎯 Aplicando bônus sub-racial - ${bonus.ability_score.index} (${abilityKey}): +${bonus.bonus}`);
                }
            });
        }

        console.log('📊 Bônus raciais calculados:', bonuses);
        return bonuses;
    }, [crossStepData.selectedRace, crossStepData.selectedSubrace]);

    // Calcular scores finais (base + racial)
    const getFinalAbilityScores = useCallback((): Record<keyof AbilityScores, number> => {
        const racialBonuses = getRacialBonuses();
        const finalScores: Record<keyof AbilityScores, number> = {} as Record<keyof AbilityScores, number>;

        Object.keys(abilityScores).forEach(ability => {
            const abilityKey = ability as keyof AbilityScores;
            finalScores[abilityKey] = abilityScores[abilityKey] + racialBonuses[abilityKey];
        });

        return finalScores;
    }, [abilityScores, getRacialBonuses]);

    const validateScores = useCallback((): boolean => {
        if (!selectedMethod) return false;
        
        switch (selectedMethod) {
            case "point-buy":
                return Object.values(abilityScores).every(score => score >= 8 && score <= 15);
            case "standard":
                return assignedValues.every(val => val !== null);
            case "rolled":
                return selectedRolledArray !== null && Object.values(abilityScores).every(score => score > 0);
            default:
                return false;
        }
    }, [selectedMethod, abilityScores, assignedValues, selectedRolledArray]);

    // ===========================
    // EFEITOS DE STORAGE
    // ===========================

    // Salvar método selecionado
    useEffect(() => {
        if (selectedMethod) {
            saveToStorage(STORAGE_KEYS.ABILITY_METHOD, selectedMethod);
        }
    }, [selectedMethod]);

    // Salvar pontuações de atributos (incluindo finais com bônus)
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.ABILITY_SCORES, abilityScores);
        
        // ✅ NOVO: Também salvar scores finais com bônus raciais
        const finalScores = getFinalAbilityScores();
        saveToStorage('character_creation_final_ability_scores', finalScores);
    }, [abilityScores, getFinalAbilityScores]);

    // Salvar pontos restantes
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.POINTS_REMAINING, pointsRemaining);
    }, [pointsRemaining]);

    // Salvar atribuições do standard array
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.STANDARD_ASSIGNMENTS, assignedValues);
    }, [assignedValues]);

    // Salvar arrays rolados
    useEffect(() => {
        if (rolledArrays.length > 0) {
            saveToStorage(STORAGE_KEYS.ROLLED_ARRAYS, rolledArrays);
        }
    }, [rolledArrays]);

    // Salvar array rolado selecionado
    useEffect(() => {
        if (selectedRolledArray !== null) {
            saveToStorage(STORAGE_KEYS.SELECTED_ROLLED_ARRAY, selectedRolledArray);
        }
    }, [selectedRolledArray]);

    // Notificar validação
    useEffect(() => {
        const isValid = validateScores();
        onValidationChange?.(isValid);
    }, [validateScores, onValidationChange]);

    // Atualizar dados de outros steps (polling simples)
    useEffect(() => {
        const interval = setInterval(() => {
            const newRace = loadFromStorage<DndRace | null>(CROSS_STEP_KEYS.SELECTED_RACE, null);
            const newSubrace = loadFromStorage<DndSubrace | null>(CROSS_STEP_KEYS.SELECTED_SUBRACE, null);

            setCrossStepData(prev => {
                const hasChanges = 
                    JSON.stringify(prev.selectedRace) !== JSON.stringify(newRace) ||
                    JSON.stringify(prev.selectedSubrace) !== JSON.stringify(newSubrace);

                if (hasChanges) {
                    console.log('🔄 Dados raciais atualizados no step de atributos');
                    console.log('Nova raça:', newRace?.name);
                    console.log('Nova sub-raça:', newSubrace?.name);
                    
                    return {
                        selectedRace: newRace,
                        selectedSubrace: newSubrace
                    };
                }
                return prev;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Forçar recálculo quando dados raciais mudarem
    useEffect(() => {
        if (crossStepData.selectedRace || crossStepData.selectedSubrace) {
            console.log('🎯 Recalculando scores finais devido a mudança racial');
            const finalScores = getFinalAbilityScores();
            saveToStorage('character_creation_final_ability_scores', finalScores);
        }
    }, [crossStepData.selectedRace, crossStepData.selectedSubrace, getFinalAbilityScores]);

    // ===========================
    // POINT BUY FUNCTIONS
    // ===========================

    const getPointCost = (currentScore: number, newScore: number): number => {
        if (newScore < currentScore) {
            // Retornando pontos
            let cost = 0;
            for (let score = newScore + 1; score <= currentScore; score++) {
                cost -= (POINT_BUY_COSTS[score] - POINT_BUY_COSTS[score - 1]);
            }
            return cost;
        } else {
            // Gastando pontos
            let cost = 0;
            for (let score = currentScore + 1; score <= newScore; score++) {
                cost += (POINT_BUY_COSTS[score] - POINT_BUY_COSTS[score - 1]);
            }
            return cost;
        }
    };

    const updatePointBuyScore = (ability: keyof AbilityScores, newValue: number) => {
        const currentValue = abilityScores[ability];
        const cost = getPointCost(currentValue, newValue);
        
        if (pointsRemaining - cost >= 0 && newValue >= 8 && newValue <= 15) {
            setAbilityScores(prev => ({ ...prev, [ability]: newValue }));
            setPointsRemaining(prev => prev - cost);
        }
    };

    // ===========================
    // STANDARD ARRAY FUNCTIONS
    // ===========================

    const assignStandardValue = (abilityIndex: number, value: number) => {
        // Remover valor da atribuição anterior se existir
        const previousValue = assignedValues[abilityIndex];
        if (previousValue !== null) {
            setStandardArrayValues(prev => [...prev, previousValue].sort((a, b) => b - a));
        }

        // Atribuir novo valor
        const newAssignedValues = [...assignedValues];
        newAssignedValues[abilityIndex] = value;
        setAssignedValues(newAssignedValues);

        // Remover valor da lista disponível
        setStandardArrayValues(prev => {
            const index = prev.indexOf(value);
            if (index > -1) {
                const newArray = [...prev];
                newArray.splice(index, 1);
                return newArray;
            }
            return prev;
        });

        // Atualizar scores
        const abilities: (keyof AbilityScores)[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        setAbilityScores(prev => ({
            ...prev,
            [abilities[abilityIndex]]: value
        }));
    };

    // ===========================
    // ROLLED STATS FUNCTIONS
    // ===========================

    const rollStats = () => {
        const newArrays: number[][] = [];
        
        for (let arrayIndex = 0; arrayIndex < 6; arrayIndex++) {
            const array: number[] = [];
            for (let statIndex = 0; statIndex < 6; statIndex++) {
                // Rolar 4d6, descartar o menor
                const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
                rolls.sort((a, b) => b - a);
                const total = rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
                array.push(total);
            }
            newArrays.push(array);
        }
        
        setRolledArrays(newArrays);
        setSelectedRolledArray(null);
    };

    const selectRolledArray = (arrayIndex: number) => {
        const selectedArray = rolledArrays[arrayIndex];
        setSelectedRolledArray(arrayIndex);
        
        const abilities: (keyof AbilityScores)[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        const newScores: AbilityScores = abilities.reduce((scores, ability, index) => {
            scores[ability] = selectedArray[index] || 8;
            return scores;
        }, {} as AbilityScores);
        
        setAbilityScores(newScores);
    };

    // ===========================
    // MÉTODO SELECTION
    // ===========================

    const selectMethod = (method: AbilityMethod) => {
        setSelectedMethod(method);
        
        // Reset apropriado para cada método
        switch (method) {
            case "point-buy":
                setAbilityScores(INITIAL_SCORES);
                setPointsRemaining(27);
                break;
            case "standard":
                setAbilityScores(INITIAL_SCORES);
                setStandardArrayValues([...STANDARD_ARRAY]);
                setAssignedValues([null, null, null, null, null, null]);
                break;
            case "rolled":
                setAbilityScores(INITIAL_SCORES);
                if (rolledArrays.length === 0) {
                    rollStats();
                }
                break;
        }
    };

    // ===========================
    // CLEAR STORAGE + DEBUG FUNCTIONS
    // ===========================

    const clearStorageData = () => {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        localStorage.removeItem('standard_array_values');
        localStorage.removeItem('character_creation_final_ability_scores'); // ✅ NOVO: Limpar scores finais
        
        // Reset states
        setSelectedMethod(null);
        setAbilityScores(INITIAL_SCORES);
        setPointsRemaining(27);
        setStandardArrayValues([...STANDARD_ARRAY]);
        setAssignedValues([null, null, null, null, null, null]);
        setRolledArrays([]);
        setSelectedRolledArray(null);
        
        console.log('🧹 Dados de atributos limpos (incluindo scores finais com bônus)');
    };

    const forceReloadRacialData = () => {
        console.log('🔄 Forçando reload dos dados raciais...');
        const newRace = loadFromStorage<DndRace | null>(CROSS_STEP_KEYS.SELECTED_RACE, null);
        const newSubrace = loadFromStorage<DndSubrace | null>(CROSS_STEP_KEYS.SELECTED_SUBRACE, null);
        
        console.log('Dados carregados:', { race: newRace?.name, subrace: newSubrace?.name });
        
        setCrossStepData({
            selectedRace: newRace,
            selectedSubrace: newSubrace
        });
    };

    // ===========================
    // RENDER
    // ===========================

    return (
        <div className="space-y-6 bg-slate-900 min-h-screen p-6">
            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
                <Card className="border border-blue-500/30 bg-slate-800/50 backdrop-blur">
                    <CardContent className="p-4">
                        <h4 className="font-bold text-sm mb-2 text-blue-300">Debug - Storage Status + Racial Bonuses:</h4>
                        <div className="text-xs space-y-1 text-slate-300">
                            <p>Método: {selectedMethod || 'Não selecionado'}</p>
                            <p>Pontos restantes: {pointsRemaining}</p>
                            <p>Arrays rolados: {rolledArrays.length}</p>
                            <p>Raça: {crossStepData.selectedRace?.name || 'Não selecionada'}</p>
                            <p>Sub-raça: {crossStepData.selectedSubrace?.name || 'Não selecionada'}</p>
                            
                            {/* Debug detalhado dos bônus */}
                            {crossStepData.selectedRace && (
                                <div className="mt-2 p-2 bg-slate-700/50 rounded border border-slate-600/40">
                                    <strong className="text-blue-300">Dados da Raça ({crossStepData.selectedRace.name}):</strong>
                                    <div className="ml-2">
                                        {crossStepData.selectedRace.ability_bonuses?.map((bonus, index) => (
                                            <p key={index} className="text-green-400">
                                                {bonus.ability_score.index} ({bonus.ability_score.name}): +{bonus.bonus}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {crossStepData.selectedSubrace && (
                                <div className="mt-2 p-2 bg-slate-700/50 rounded border border-slate-600/40">
                                    <strong className="text-blue-300">Dados da Sub-raça ({crossStepData.selectedSubrace.name}):</strong>
                                    <div className="ml-2">
                                        {crossStepData.selectedSubrace.ability_bonuses?.map((bonus, index) => (
                                            <p key={index} className="text-green-400">
                                                {bonus.ability_score.index} ({bonus.ability_score.name}): +{bonus.bonus}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-2 p-2 bg-slate-700/50 rounded border border-slate-600/40">
                                <strong className="text-blue-300">Bônus Calculados:</strong>
                                <div className="ml-2">
                                    {Object.entries(getRacialBonuses()).map(([ability, bonus]) => (
                                        <p key={ability} className={bonus > 0 ? 'text-green-400' : 'text-slate-400'}>
                                            {ability}: +{bonus}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-2 p-2 bg-slate-700/50 rounded border border-slate-600/40">
                                <strong className="text-blue-300">Scores Finais:</strong>
                                <div className="ml-2">
                                    {Object.entries(getFinalAbilityScores()).map(([ability, finalScore]) => {
                                        const baseScore = abilityScores[ability as keyof AbilityScores];
                                        const racialBonus = getRacialBonuses()[ability as keyof AbilityScores];
                                        return (
                                            <p key={ability} className="text-purple-400">
                                                {ability}: {baseScore} + {racialBonus} = {finalScore}
                                            </p>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            <div className="flex gap-2 mt-2">
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={clearStorageData}
                                    className="border-slate-600 bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                                >
                                    Limpar Storage
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={forceReloadRacialData}
                                    className="border-green-600 bg-green-900/20 text-green-400 hover:bg-green-800/30"
                                >
                                    🔄 Recarregar Dados Raciais
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Informações Raciais */}
            {(crossStepData.selectedRace || crossStepData.selectedSubrace) && (
                <Card className="border border-green-500/30 bg-slate-800/80 backdrop-blur shadow-xl">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold mb-4 text-green-400">Bônus Raciais Aplicados</h3>
                        
                        <div className="space-y-3">
                            {crossStepData.selectedRace && (
                                <div>
                                    <h4 className="font-semibold text-green-300 mb-2">
                                        {crossStepData.selectedRace.name}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {crossStepData.selectedRace.ability_bonuses?.map((bonus: DndAbilityBonus, index: number) => (
                                            <Badge
                                                key={index}
                                                className="bg-green-500/20 text-green-300 border border-green-500/40 hover:bg-green-500/30"
                                            >
                                                {bonus.ability_score.name}: +{bonus.bonus}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {crossStepData.selectedSubrace && (
                                <div>
                                    <h4 className="font-semibold text-green-300 mb-2">
                                        {crossStepData.selectedSubrace.name}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {crossStepData.selectedSubrace.ability_bonuses?.map((bonus: DndAbilityBonus, index: number) => (
                                            <Badge
                                                key={index}
                                                className="bg-green-500/20 text-green-300 border border-green-500/40 hover:bg-green-500/30"
                                            >
                                                {bonus.ability_score.name}: +{bonus.bonus}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Mostrar o resultado final dos bônus */}
                            <div className="mt-4 pt-4 border-t border-green-500/20">
                                <h5 className="font-medium text-green-300 mb-3">Bônus Totais:</h5>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(getRacialBonuses()).map(([ability, bonus]) => 
                                        bonus > 0 && (
                                            <Badge
                                                key={ability}
                                                className="bg-green-400/20 text-green-200 border border-green-400/50 px-3 py-1"
                                            >
                                                {ability.charAt(0).toUpperCase() + ability.slice(1)}: +{bonus}
                                            </Badge>
                                        )
                                    )}
                                </div>
                            </div>

                            <p className="text-sm text-green-300 mt-4 font-medium flex items-center gap-2">
                                <span className="text-yellow-400">✨</span>
                                Estes bônus serão automaticamente aplicados aos seus atributos finais!
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Seleção de Método */}
            <Card className="border border-slate-600/50 bg-slate-800/80 backdrop-blur shadow-xl">
                <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4 text-slate-100">Escolha o Método de Determinação de Atributos</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button
                            onClick={() => selectMethod("point-buy")}
                            variant="ghost"
                            className={`h-auto p-6 justify-start text-left transition-all duration-200 ${
                                selectedMethod === "point-buy"
                                    ? 'border-2 border-blue-400 bg-blue-500/20 text-blue-200 shadow-lg shadow-blue-500/20'
                                    : 'border-2 border-slate-600/50 bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:border-slate-500'
                            }`}
                        >
                            <div>
                                <h4 className="font-semibold text-lg mb-2">Point Buy</h4>
                                <p className="text-sm opacity-80">
                                    Distribua 27 pontos entre os atributos (8-15)
                                </p>
                            </div>
                        </Button>

                        <Button
                            onClick={() => selectMethod("standard")}
                            variant="ghost"
                            className={`h-auto p-6 justify-start text-left transition-all duration-200 ${
                                selectedMethod === "standard"
                                    ? 'border-2 border-green-400 bg-green-500/20 text-green-200 shadow-lg shadow-green-500/20'
                                    : 'border-2 border-slate-600/50 bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:border-slate-500'
                            }`}
                        >
                            <div>
                                <h4 className="font-semibold text-lg mb-2">Standard Array</h4>
                                <p className="text-sm opacity-80">
                                    Atribua os valores: 15, 14, 13, 12, 10, 8
                                </p>
                            </div>
                        </Button>

                        <Button
                            onClick={() => selectMethod("rolled")}
                            variant="ghost"
                            className={`h-auto p-6 justify-start text-left transition-all duration-200 ${
                                selectedMethod === "rolled"
                                    ? 'border-2 border-purple-400 bg-purple-500/20 text-purple-200 shadow-lg shadow-purple-500/20'
                                    : 'border-2 border-slate-600/50 bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:border-slate-500'
                            }`}
                        >
                            <div>
                                <h4 className="font-semibold text-lg mb-2">Rolled Stats</h4>
                                <p className="text-sm opacity-80">
                                    Role 4d6, descarte o menor (6 arrays)
                                </p>
                            </div>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Point Buy */}
            {selectedMethod === "point-buy" && (
                <Card className="border border-slate-600/50 bg-slate-800/80 backdrop-blur shadow-xl">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-100">Point Buy</h3>
                            <div className="text-lg font-semibold bg-blue-500/20 px-4 py-2 rounded-lg border border-blue-500/30">
                                <span className="text-slate-300">Pontos restantes: </span>
                                <span className="text-blue-300 text-xl">{pointsRemaining}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.entries(abilityScores).map(([ability, score]) => {
                                const racialBonuses = getRacialBonuses();
                                const racialBonus = racialBonuses[ability as keyof AbilityScores];
                                const finalScore = score + racialBonus;
                                const finalModifier = getModifier(finalScore);
                                
                                return (
                                    <div key={ability} className="bg-slate-700/50 p-5 rounded-xl border border-slate-600/50 shadow-lg backdrop-blur">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="font-semibold capitalize text-slate-200 text-lg">{ability}</span>
                                            <span className="text-sm font-mono bg-slate-600/50 px-2 py-1 rounded text-slate-300">
                                                {ABILITY_SCORE_ABBREVIATIONS[ability as keyof AbilityScores]}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between mb-4">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => updatePointBuyScore(ability as keyof AbilityScores, score - 1)}
                                                disabled={score <= 8}
                                                className="w-10 h-10 border-slate-500 bg-slate-600/50 text-slate-300 hover:bg-slate-500/50 disabled:opacity-30"
                                            >
                                                -
                                            </Button>
                                            
                                            <div className="mx-4 text-center">
                                                <div className="text-3xl font-bold text-blue-300 mb-1">{score}</div>
                                                <div className="text-xs text-slate-400 uppercase tracking-wide">Base</div>
                                            </div>
                                            
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => updatePointBuyScore(ability as keyof AbilityScores, score + 1)}
                                                disabled={score >= 15 || pointsRemaining <= 0}
                                                className="w-10 h-10 border-slate-500 bg-slate-600/50 text-slate-300 hover:bg-slate-500/50 disabled:opacity-30"
                                            >
                                                +
                                            </Button>
                                        </div>

                                        {/* Score Final com Bônus Racial */}
                                        <Separator className="my-3 bg-slate-600/50" />
                                        <div className="text-center space-y-2">
                                            <div className="text-sm text-slate-400">
                                                <span className="text-blue-300">{score}</span>
                                                {racialBonus > 0 && (
                                                    <>
                                                        <span className="text-slate-500 mx-1">+</span>
                                                        <span className="text-green-400">{racialBonus}</span>
                                                    </>
                                                )}
                                                <span className="text-slate-500 mx-1">=</span>
                                                <span className="font-bold text-green-300 text-lg">{finalScore}</span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-slate-400">Modificador: </span>
                                                <Badge
                                                    className={`${
                                                        finalModifier >= 0
                                                            ? 'bg-green-500/20 text-green-300 border-green-500/40'
                                                            : 'bg-red-500/20 text-red-300 border-red-500/40'
                                                    }`}
                                                >
                                                    {finalModifier >= 0 ? '+' : ''}{finalModifier}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Standard Array */}
            {selectedMethod === "standard" && (
                <Card className="border border-slate-600/50 bg-slate-800/80 backdrop-blur shadow-xl">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold mb-4 text-slate-100">Standard Array</h3>
                        
                        <div className="mb-6">
                            <h4 className="font-medium mb-3 text-slate-200">Valores disponíveis:</h4>
                            <div className="flex flex-wrap gap-2">
                                {standardArrayValues.map((value, index) => (
                                    <Badge
                                        key={`${value}-${index}`}
                                        className="bg-blue-500/20 text-blue-300 border border-blue-500/40 px-3 py-1 text-sm"
                                    >
                                        {value}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.entries(abilityScores).map(([ability], index) => {
                                const racialBonuses = getRacialBonuses();
                                const racialBonus = racialBonuses[ability as keyof AbilityScores];
                                const assignedValue = assignedValues[index];
                                const finalScore = (assignedValue || 8) + racialBonus;
                                const finalModifier = getModifier(finalScore);
                                
                                return (
                                    <div key={ability} className="bg-slate-700/50 p-5 rounded-xl border border-slate-600/50 shadow-lg backdrop-blur">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="font-semibold capitalize text-slate-200 text-lg">{ability}</span>
                                            <span className="text-sm font-mono bg-slate-600/50 px-2 py-1 rounded text-slate-300">
                                                {ABILITY_SCORE_ABBREVIATIONS[ability as keyof AbilityScores]}
                                            </span>
                                        </div>
                                        
                                        <Select
                                            value={assignedValues[index]?.toString() || '0'}
                                            onValueChange={(value) => {
                                                const numValue = parseInt(value);
                                                if (!isNaN(numValue)) {
                                                    assignStandardValue(index, numValue);
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="w-full mb-4 bg-slate-600/50 border-slate-500 text-slate-200">
                                                <SelectValue placeholder="Selecione um valor" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-700 border-slate-600">
                                                <SelectItem value="0" className="text-slate-400">Selecione um valor</SelectItem>
                                                {[...standardArrayValues, assignedValues[index]].filter(v => v !== null).sort((a, b) => b! - a!).map((value, idx) => (
                                                    <SelectItem key={idx} value={value!.toString()} className="text-slate-200">
                                                        {value} ({getModifier(value!) >= 0 ? '+' : ''}{getModifier(value!)})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        
                                        {assignedValues[index] && (
                                            <div className="text-center space-y-2">
                                                <div className="text-3xl font-bold text-blue-300 mb-1">{assignedValues[index]}</div>
                                                <div className="text-xs text-slate-400 uppercase tracking-wide mb-3">Base</div>
                                                
                                                <Separator className="my-3 bg-slate-600/50" />
                                                <div className="space-y-2">
                                                    <div className="text-sm text-slate-400">
                                                        <span className="text-blue-300">{assignedValues[index]}</span>
                                                        {racialBonus > 0 && (
                                                            <>
                                                                <span className="text-slate-500 mx-1">+</span>
                                                                <span className="text-green-400">{racialBonus}</span>
                                                            </>
                                                        )}
                                                        <span className="text-slate-500 mx-1">=</span>
                                                        <span className="font-bold text-green-300 text-lg">{finalScore}</span>
                                                    </div>
                                                    <div className="text-sm">
                                                        <Badge
                                                            className={`${
                                                                finalModifier >= 0
                                                                    ? 'bg-green-500/20 text-green-300 border-green-500/40'
                                                                    : 'bg-red-500/20 text-red-300 border-red-500/40'
                                                            }`}
                                                        >
                                                            {finalModifier >= 0 ? '+' : ''}{finalModifier}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Rolled Stats */}
            {selectedMethod === "rolled" && (
                <Card className="border border-slate-600/50 bg-slate-800/80 backdrop-blur shadow-xl">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-100">Rolled Stats</h3>
                            <Button 
                                onClick={rollStats} 
                                variant="outline"
                                className="border-purple-500 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                            >
                                🎲 Rolar Novamente
                            </Button>
                        </div>

                        {rolledArrays.length > 0 && (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-400">Escolha um dos arrays abaixo:</p>
                                
                                {rolledArrays.map((array, arrayIndex) => (
                                    <Button
                                        key={arrayIndex}
                                        onClick={() => selectRolledArray(arrayIndex)}
                                        variant="ghost"
                                        className={`w-full h-auto p-4 justify-between transition-all duration-200 ${
                                            selectedRolledArray === arrayIndex
                                                ? 'border-2 border-purple-400 bg-purple-500/20 text-purple-200 shadow-lg'
                                                : 'border-2 border-slate-600/50 bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                                        }`}
                                    >
                                        <span className="font-medium">Array {arrayIndex + 1}:</span>
                                        <div className="flex gap-2">
                                            {array.map((value, index) => (
                                                <Badge key={index} className="bg-slate-600/50 text-slate-200 border-slate-500">
                                                    {value}
                                                </Badge>
                                            ))}
                                        </div>
                                        <span className="text-sm text-slate-400">
                                            Total: {array.reduce((sum, val) => sum + val, 0)}
                                        </span>
                                    </Button>
                                ))}

                                {selectedRolledArray !== null && (
                                    <div className="mt-8">
                                        <h4 className="font-medium mb-4 text-slate-200">Atributos finais com bônus raciais:</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {Object.entries(getFinalAbilityScores()).map(([ability, finalScore]) => {
                                                const baseScore = abilityScores[ability as keyof AbilityScores];
                                                const racialBonuses = getRacialBonuses();
                                                const racialBonus = racialBonuses[ability as keyof AbilityScores];
                                                const modifier = getModifier(finalScore);
                                                
                                                return (
                                                    <div key={ability} className="bg-slate-700/50 p-4 rounded-lg shadow-sm border border-slate-600/50 text-center">
                                                        <div className="font-semibold capitalize text-slate-200 mb-1">{ability}</div>
                                                        <div className="text-sm font-mono text-slate-400 mb-2">
                                                            {ABILITY_SCORE_ABBREVIATIONS[ability as keyof AbilityScores]}
                                                        </div>
                                                        
                                                        <div className="text-3xl font-bold text-green-300 mb-1">{finalScore}</div>
                                                        
                                                        <div className="text-sm text-slate-400 mb-2">
                                                            {baseScore} {racialBonus > 0 && `+ ${racialBonus}`}
                                                        </div>
                                                        
                                                        <Badge
                                                            className={`${
                                                                modifier >= 0
                                                                    ? 'bg-green-500/20 text-green-300 border-green-500/40'
                                                                    : 'bg-red-500/20 text-red-300 border-red-500/40'
                                                            }`}
                                                        >
                                                            {modifier >= 0 ? '+' : ''}{modifier}
                                                        </Badge>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Resumo Final dos Atributos */}
            {selectedMethod && (crossStepData.selectedRace || crossStepData.selectedSubrace) && (
                <Card className="border border-indigo-500/30 bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur shadow-2xl">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold mb-6 text-slate-100 flex items-center gap-2">
                            <span className="text-2xl">📊</span>
                            Resumo Final dos Atributos
                        </h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {Object.entries(getFinalAbilityScores()).map(([ability, finalScore]) => {
                                const baseScore = abilityScores[ability as keyof AbilityScores];
                                const racialBonuses = getRacialBonuses();
                                const racialBonus = racialBonuses[ability as keyof AbilityScores];
                                const modifier = getModifier(finalScore);
                                
                                return (
                                    <div key={ability} className="bg-slate-700/60 p-5 rounded-xl shadow-lg border border-slate-600/50 backdrop-blur">
                                        <div className="text-center space-y-3">
                                            <div className="font-semibold capitalize text-slate-200 text-lg">
                                                {ability}
                                            </div>
                                            <div className="text-sm font-mono text-slate-400 bg-slate-600/50 px-2 py-1 rounded">
                                                {ABILITY_SCORE_ABBREVIATIONS[ability as keyof AbilityScores]}
                                            </div>
                                            
                                            <div className="text-4xl font-bold text-green-300 mb-2">
                                                {finalScore}
                                            </div>
                                            
                                            <div className="text-sm text-slate-400">
                                                <span className="text-blue-300">{baseScore}</span>
                                                {racialBonus > 0 && (
                                                    <>
                                                        <span className="text-slate-500 mx-1">+</span>
                                                        <span className="text-green-400">{racialBonus}</span>
                                                    </>
                                                )}
                                            </div>
                                            
                                            <Badge
                                                className={`text-lg px-3 py-1 ${
                                                    modifier >= 0
                                                        ? 'bg-green-500/20 text-green-300 border-green-500/40'
                                                        : 'bg-red-500/20 text-red-300 border-red-500/40'
                                                }`}
                                            >
                                                {modifier >= 0 ? '+' : ''}{modifier}
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="mt-6 text-center text-sm text-slate-400 bg-slate-700/30 p-4 rounded-lg border border-slate-600/30">
                            <span className="text-yellow-400 mr-2">✨</span>
                            Estes são seus atributos finais que serão utilizados no jogo!
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};