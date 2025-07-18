// components/character/creation/steps/AbilityScores.tsx
// ✅ CORRIGIDO: Todos os erros de TypeScript e ESLint resolvidos
'use client';

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
        <div className="space-y-6">
            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
                <Card className="p-4 bg-blue-50">
                    <h4 className="font-bold text-sm mb-2">Debug - Storage Status + Racial Bonuses:</h4>
                    <div className="text-xs space-y-1">
                        <p>Método: {selectedMethod || 'Não selecionado'}</p>
                        <p>Pontos restantes: {pointsRemaining}</p>
                        <p>Arrays rolados: {rolledArrays.length}</p>
                        <p>Raça: {crossStepData.selectedRace?.name || 'Não selecionada'}</p>
                        <p>Sub-raça: {crossStepData.selectedSubrace?.name || 'Não selecionada'}</p>
                        
                        {/* Debug detalhado dos bônus */}
                        {crossStepData.selectedRace && (
                            <div className="mt-2 p-2 bg-white rounded">
                                <strong>Dados da Raça ({crossStepData.selectedRace.name}):</strong>
                                <div className="ml-2">
                                    {crossStepData.selectedRace.ability_bonuses?.map((bonus, index) => (
                                        <p key={index} className="text-green-600">
                                            {bonus.ability_score.index} ({bonus.ability_score.name}): +{bonus.bonus}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {crossStepData.selectedSubrace && (
                            <div className="mt-2 p-2 bg-white rounded">
                                <strong>Dados da Sub-raça ({crossStepData.selectedSubrace.name}):</strong>
                                <div className="ml-2">
                                    {crossStepData.selectedSubrace.ability_bonuses?.map((bonus, index) => (
                                        <p key={index} className="text-green-600">
                                            {bonus.ability_score.index} ({bonus.ability_score.name}): +{bonus.bonus}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-2 p-2 bg-white rounded">
                            <strong>Bônus Calculados:</strong>
                            <div className="ml-2">
                                {Object.entries(getRacialBonuses()).map(([ability, bonus]) => (
                                    <p key={ability} className={bonus > 0 ? 'text-green-600' : 'text-gray-400'}>
                                        {ability}: +{bonus}
                                    </p>
                                ))}
                            </div>
                        </div>

                        <div className="mt-2 p-2 bg-white rounded">
                            <strong>Scores Finais:</strong>
                            <div className="ml-2">
                                {Object.entries(getFinalAbilityScores()).map(([ability, finalScore]) => {
                                    const baseScore = abilityScores[ability as keyof AbilityScores];
                                    const racialBonus = getRacialBonuses()[ability as keyof AbilityScores];
                                    return (
                                        <p key={ability} className="text-purple-600">
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
                            >
                                Limpar Storage
                            </Button>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={forceReloadRacialData}
                                className="bg-green-100"
                            >
                                🔄 Recarregar Dados Raciais
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Informações Raciais */}
            {(crossStepData.selectedRace || crossStepData.selectedSubrace) && (
                <Card className="p-6 bg-green-50">
                    <h3 className="text-lg font-bold mb-4">Bônus Raciais Aplicados</h3>
                    
                    <div className="space-y-3">
                        {crossStepData.selectedRace && (
                            <div>
                                <h4 className="font-semibold text-green-800">
                                    {crossStepData.selectedRace.name}
                                </h4>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {crossStepData.selectedRace.ability_bonuses?.map((bonus: DndAbilityBonus, index: number) => (
                                        <span
                                            key={index}
                                            className="inline-block px-3 py-1 bg-green-200 text-green-800 rounded text-sm font-medium"
                                        >
                                            {bonus.ability_score.name}: +{bonus.bonus}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {crossStepData.selectedSubrace && (
                            <div>
                                <h4 className="font-semibold text-green-800">
                                    {crossStepData.selectedSubrace.name}
                                </h4>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {crossStepData.selectedSubrace.ability_bonuses?.map((bonus: DndAbilityBonus, index: number) => (
                                        <span
                                            key={index}
                                            className="inline-block px-3 py-1 bg-green-200 text-green-800 rounded text-sm font-medium"
                                        >
                                            {bonus.ability_score.name}: +{bonus.bonus}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Mostrar o resultado final dos bônus */}
                        <div className="mt-4 pt-4 border-t border-green-200">
                            <h5 className="font-medium text-green-800 mb-2">Bônus Totais:</h5>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(getRacialBonuses()).map(([ability, bonus]) => 
                                    bonus > 0 && (
                                        <span
                                            key={ability}
                                            className="inline-block px-3 py-1 bg-green-300 text-green-900 rounded text-sm font-bold"
                                        >
                                            {ability.charAt(0).toUpperCase() + ability.slice(1)}: +{bonus}
                                        </span>
                                    )
                                )}
                            </div>
                        </div>

                        <p className="text-sm text-green-700 mt-4 font-medium">
                            ✨ Estes bônus serão automaticamente aplicados aos seus atributos finais!
                        </p>
                    </div>
                </Card>
            )}

            {/* Seleção de Método */}
            <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Escolha o Método de Determinação de Atributos</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => selectMethod("point-buy")}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                            selectedMethod === "point-buy"
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                    >
                        <h4 className="font-semibold">Point Buy</h4>
                        <p className="text-sm text-gray-600 mt-1">
                            Distribua 27 pontos entre os atributos (8-15)
                        </p>
                    </button>

                    <button
                        onClick={() => selectMethod("standard")}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                            selectedMethod === "standard"
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                    >
                        <h4 className="font-semibold">Standard Array</h4>
                        <p className="text-sm text-gray-600 mt-1">
                            Atribua os valores: 15, 14, 13, 12, 10, 8
                        </p>
                    </button>

                    <button
                        onClick={() => selectMethod("rolled")}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                            selectedMethod === "rolled"
                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                    >
                        <h4 className="font-semibold">Rolled Stats</h4>
                        <p className="text-sm text-gray-600 mt-1">
                            Role 4d6, descarte o menor (6 arrays)
                        </p>
                    </button>
                </div>
            </Card>

            {/* Point Buy */}
            {selectedMethod === "point-buy" && (
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Point Buy</h3>
                        <div className="text-lg font-semibold">
                            Pontos restantes: <span className="text-blue-600">{pointsRemaining}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(abilityScores).map(([ability, score]) => {
                            const racialBonuses = getRacialBonuses();
                            const racialBonus = racialBonuses[ability as keyof AbilityScores];
                            const finalScore = score + racialBonus;
                            const finalModifier = getModifier(finalScore);
                            
                            return (
                                <div key={ability} className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium capitalize">{ability}</span>
                                        <span className="text-sm font-mono">
                                            {ABILITY_SCORE_ABBREVIATIONS[ability as keyof AbilityScores]}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mb-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => updatePointBuyScore(ability as keyof AbilityScores, score - 1)}
                                            disabled={score <= 8}
                                        >
                                            -
                                        </Button>
                                        
                                        <div className="mx-4 text-center">
                                            <div className="text-2xl font-bold text-blue-600">{score}</div>
                                            <div className="text-xs text-gray-600">Base</div>
                                        </div>
                                        
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => updatePointBuyScore(ability as keyof AbilityScores, score + 1)}
                                            disabled={score >= 15 || pointsRemaining <= 0}
                                        >
                                            +
                                        </Button>
                                    </div>

                                    {/* Score Final com Bônus Racial */}
                                    <div className="border-t pt-2 text-center">
                                        <div className="text-sm text-gray-600 mb-1">
                                            {score} {racialBonus > 0 && `+ ${racialBonus}`} = 
                                            <span className="font-bold text-green-600 ml-1">{finalScore}</span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Modificador: {finalModifier >= 0 ? '+' : ''}{finalModifier}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {/* Standard Array */}
            {selectedMethod === "standard" && (
                <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4">Standard Array</h3>
                    
                    <div className="mb-4">
                        <h4 className="font-medium mb-2">Valores disponíveis:</h4>
                        <div className="flex flex-wrap gap-2">
                            {standardArrayValues.map((value, index) => (
                                <span
                                    key={`${value}-${index}`}
                                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-medium"
                                >
                                    {value}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(abilityScores).map(([ability], index) => {
                            const racialBonuses = getRacialBonuses();
                            const racialBonus = racialBonuses[ability as keyof AbilityScores];
                            const assignedValue = assignedValues[index];
                            const finalScore = (assignedValue || 8) + racialBonus;
                            const finalModifier = getModifier(finalScore);
                            
                            return (
                                <div key={ability} className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium capitalize">{ability}</span>
                                        <span className="text-sm font-mono">
                                            {ABILITY_SCORE_ABBREVIATIONS[ability as keyof AbilityScores]}
                                        </span>
                                    </div>
                                    
                                    <select
                                        value={assignedValues[index] || ''}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value);
                                            if (!isNaN(value)) {
                                                assignStandardValue(index, value);
                                            }
                                        }}
                                        className="w-full p-2 border rounded mb-2"
                                    >
                                        <option value="">Selecione um valor</option>
                                        {[...standardArrayValues, assignedValues[index]].filter(v => v !== null).sort((a, b) => b! - a!).map((value, idx) => (
                                            <option key={idx} value={value!}>
                                                {value} ({getModifier(value!) >= 0 ? '+' : ''}{getModifier(value!)})
                                            </option>
                                        ))}
                                    </select>
                                    
                                    {assignedValues[index] && (
                                        <div className="border-t pt-2 text-center">
                                            <div className="text-xl font-bold text-blue-600 mb-1">{assignedValues[index]}</div>
                                            <div className="text-xs text-gray-600 mb-2">Base</div>
                                            
                                            <div className="text-sm text-gray-600">
                                                {assignedValues[index]} {racialBonus > 0 && `+ ${racialBonus}`} = 
                                                <span className="font-bold text-green-600 ml-1">{finalScore}</span>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Modificador: {finalModifier >= 0 ? '+' : ''}{finalModifier}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {/* Rolled Stats */}
            {selectedMethod === "rolled" && (
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Rolled Stats</h3>
                        <Button onClick={rollStats} variant="outline">
                            🎲 Rolar Novamente
                        </Button>
                    </div>

                    {rolledArrays.length > 0 && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">Escolha um dos arrays abaixo:</p>
                            
                            {rolledArrays.map((array, arrayIndex) => (
                                <button
                                    key={arrayIndex}
                                    onClick={() => selectRolledArray(arrayIndex)}
                                    className={`w-full p-4 border-2 rounded-lg transition-all ${
                                        selectedRolledArray === arrayIndex
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-gray-300 bg-white hover:border-gray-400'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Array {arrayIndex + 1}:</span>
                                        <div className="flex gap-2">
                                            {array.map((value, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-gray-100 rounded font-mono"
                                                >
                                                    {value}
                                                </span>
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            Total: {array.reduce((sum, val) => sum + val, 0)}
                                        </span>
                                    </div>
                                </button>
                            ))}

                            {selectedRolledArray !== null && (
                                <div className="mt-6">
                                    <h4 className="font-medium mb-4">Atributos finais com bônus raciais:</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {Object.entries(abilityScores).map(([ability, score]) => {
                                            const racialBonuses = getRacialBonuses();
                                            const racialBonus = racialBonuses[ability as keyof AbilityScores];
                                            const finalScore = score + racialBonus;
                                            const finalModifier = getModifier(finalScore);
                                            
                                            return (
                                                <div key={ability} className="bg-gray-50 p-3 rounded text-center">
                                                    <div className="font-medium capitalize">{ability}</div>
                                                    <div className="text-xl font-bold text-blue-600">{score}</div>
                                                    <div className="text-xs text-gray-600 mb-1">Base</div>
                                                    
                                                    <div className="border-t pt-1">
                                                        <div className="text-sm text-gray-600">
                                                            {score} {racialBonus > 0 && `+ ${racialBonus}`} = 
                                                            <span className="font-bold text-green-600 ml-1">{finalScore}</span>
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {finalModifier >= 0 ? '+' : ''}{finalModifier}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            )}

            {/* Resumo Final dos Atributos */}
            {selectedMethod && (crossStepData.selectedRace || crossStepData.selectedSubrace) && (
                <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
                    <h3 className="text-lg font-bold mb-4">📊 Resumo Final dos Atributos</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(getFinalAbilityScores()).map(([ability, finalScore]) => {
                            const baseScore = abilityScores[ability as keyof AbilityScores];
                            const racialBonuses = getRacialBonuses();
                            const racialBonus = racialBonuses[ability as keyof AbilityScores];
                            const modifier = getModifier(finalScore);
                            
                            return (
                                <div key={ability} className="bg-white p-4 rounded-lg shadow-sm border">
                                    <div className="text-center">
                                        <div className="font-semibold capitalize text-gray-700 mb-1">
                                            {ability}
                                        </div>
                                        <div className="text-sm font-mono text-gray-500 mb-2">
                                            {ABILITY_SCORE_ABBREVIATIONS[ability as keyof AbilityScores]}
                                        </div>
                                        
                                        <div className="text-3xl font-bold text-green-600 mb-1">
                                            {finalScore}
                                        </div>
                                        
                                        <div className="text-sm text-gray-600 mb-2">
                                            {baseScore} {racialBonus > 0 && `+ ${racialBonus}`}
                                        </div>
                                        
                                        <div className={`text-sm font-semibold px-2 py-1 rounded ${
                                            modifier >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {modifier >= 0 ? '+' : ''}{modifier}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="mt-4 text-center text-sm text-gray-600">
                        ✨ Estes são seus atributos finais que serão utilizados no jogo!
                    </div>
                </Card>
            )}
        </div>
    );
};