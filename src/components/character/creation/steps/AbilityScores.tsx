// components/character/creation/steps/AbilityScores.tsx
'use client';

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    AbilityScores, 
    ABILITY_SCORE_NAMES, 
    ABILITY_SCORE_ABBREVIATIONS 
} from "@/types/characterCreation";

interface AbilityScoresProps {
    onValidationChange?: (isValid: boolean) => void;
}

type AbilityMethod = "point-buy" | "standard" | "rolled";

const INITIAL_SCORES: AbilityScores = {
    strength: 8,
    dexterity: 8,
    constitution: 8,
    intelligence: 8,
    wisdom: 8,
    charisma: 8
};

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

// Custos do point-buy system do D&D 5e
const POINT_BUY_COSTS: Record<number, number> = {
    8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
};

const AbilityScores = ({ onValidationChange }: AbilityScoresProps) => {
    const [selectedMethod, setSelectedMethod] = useState<AbilityMethod | null>(null);
    const [abilityScores, setAbilityScores] = useState<AbilityScores>(INITIAL_SCORES);
    const [pointsRemaining, setPointsRemaining] = useState(27);
    const [standardArrayValues, setStandardArrayValues] = useState<number[]>([...STANDARD_ARRAY]);
    const [rolledArrays, setRolledArrays] = useState<number[][]>([]);
    const [selectedRolledArray, setSelectedRolledArray] = useState<number | null>(null);
    const [assignedValues, setAssignedValues] = useState<(number | null)[]>([null, null, null, null, null, null]);

    // Calcula o modificador de atributo
    const getModifier = (score: number): number => {
        return Math.floor((score - 10) / 2);
    };

    // Valida se todos os atributos foram definidos
    const validateScores = (): boolean => {
        if (!selectedMethod) return false;
        
        switch (selectedMethod) {
            case "point-buy":
                return Object.values(abilityScores).every(score => score >= 8 && score <= 15);
            case "standard":
                return assignedValues.every(val => val !== null);
            case "rolled":
                return selectedRolledArray !== null && assignedValues.every(val => val !== null);
            default:
                return false;
        }
    };

    // Point-buy: Ajusta um atributo
    const adjustPointBuyScore = (ability: keyof AbilityScores, newValue: number) => {
        const currentValue = abilityScores[ability];
        const currentCost = POINT_BUY_COSTS[currentValue] || 0;
        const newCost = POINT_BUY_COSTS[newValue] || 0;
        const costDifference = newCost - currentCost;
        
        if (pointsRemaining - costDifference >= 0 && newValue >= 8 && newValue <= 15) {
            setAbilityScores(prev => ({ ...prev, [ability]: newValue }));
            setPointsRemaining(prev => prev - costDifference);
        }
    };

    // Rolling: Rola 4d6 drop lowest
    const rollAbility = (): number => {
        const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
        rolls.sort((a, b) => b - a);
        return rolls[0] + rolls[1] + rolls[2]; // Soma os 3 maiores
    };

    // Rolling: Gera arrays de atributos
    const generateRolledArrays = () => {
        const arrays: number[][] = [];
        for (let i = 0; i < 3; i++) {
            const array: number[] = [];
            for (let j = 0; j < 6; j++) {
                array.push(rollAbility());
            }
            arrays.push(array.sort((a, b) => b - a));
        }
        setRolledArrays(arrays);
        setSelectedRolledArray(null);
        setAssignedValues([null, null, null, null, null, null]);
    };

    // Standard Array/Rolling: Atribui valor a um atributo
    const assignValue = (abilityIndex: number, value: number) => {
        const newAssigned = [...assignedValues];
        
        // Remove o valor anterior se existir
        const oldValue = newAssigned[abilityIndex];
        if (oldValue !== null) {
            if (selectedMethod === "standard-array") {
                setStandardArrayValues(prev => [...prev, oldValue].sort((a, b) => b - a));
            }
        }
        
        // Atribui novo valor
        newAssigned[abilityIndex] = value;
        setAssignedValues(newAssigned);
        
        // Remove valor da lista disponível
        if (selectedMethod === "standard") {
            setStandardArrayValues(prev => {
                const index = prev.indexOf(value);
                if (index > -1) {
                    const newArray = [...prev];
                    newArray.splice(index, 1);
                    return newArray;
                }
                return prev;
            });
        }
    };

    // Remove valor atribuído
    const removeAssignedValue = (abilityIndex: number) => {
        const value = assignedValues[abilityIndex];
        if (value !== null) {
            const newAssigned = [...assignedValues];
            newAssigned[abilityIndex] = null;
            setAssignedValues(newAssigned);
            
            if (selectedMethod === "standard") {
                setStandardArrayValues(prev => [...prev, value].sort((a, b) => b - a));
            }
        }
    };

    // Reset method
    const resetMethod = () => {
        setSelectedMethod(null);
        setAbilityScores(INITIAL_SCORES);
        setPointsRemaining(27);
        setStandardArrayValues([...STANDARD_ARRAY]);
        setRolledArrays([]);
        setSelectedRolledArray(null);
        setAssignedValues([null, null, null, null, null, null]);
    };

    // Validação
    useEffect(() => {
        const isValid = validateScores();
        onValidationChange?.(isValid);
    }, [selectedMethod, abilityScores, assignedValues, selectedRolledArray]);

    if (!selectedMethod) {
        return (
            <div className="p-4 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Geração de Atributos</h2>
                <p className="text-gray-600 mb-6">Escolha como você quer determinar os atributos do seu personagem:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Point Buy */}
                    <Card 
                        className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-300"
                        onClick={() => setSelectedMethod("point-buy")}
                    >
                        <div className="text-center">
                            <div className="text-3xl mb-3">📊</div>
                            <h3 className="text-xl font-bold mb-3 text-blue-700">Point Buy</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Distribua 27 pontos entre os atributos. Valores mais altos custam mais pontos.
                            </p>
                            <div className="bg-blue-50 p-3 rounded">
                                <p className="text-xs text-blue-700">
                                    <strong>Recomendado:</strong> Máximo controle e balanceamento
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Standard Array */}
                    <Card 
                        className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-green-300"
                        onClick={() => setSelectedMethod("standard")}
                    >
                        <div className="text-center">
                            <div className="text-3xl mb-3">📋</div>
                            <h3 className="text-xl font-bold mb-3 text-green-700">Array Padrão</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Use valores predefinidos: 15, 14, 13, 12, 10, 8. Atribua cada um a um atributo.
                            </p>
                            <div className="bg-green-50 p-3 rounded">
                                <p className="text-xs text-green-700">
                                    <strong>Recomendado:</strong> Rápido e equilibrado
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Rolling */}
                    <Card 
                        className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-300"
                        onClick={() => setSelectedMethod("rolled")}
                    >
                        <div className="text-center">
                            <div className="text-3xl mb-3">🎲</div>
                            <h3 className="text-xl font-bold mb-3 text-purple-700">Rolagem</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Role 4d6 (descarte o menor) seis vezes. Escolha um dos arrays gerados.
                            </p>
                            <div className="bg-purple-50 p-3 rounded">
                                <p className="text-xs text-purple-700">
                                    <strong>Clássico:</strong> Imprevisível e emocionante
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <Button 
                    variant="ghost"
                    onClick={resetMethod}
                    className="text-blue-600 hover:text-blue-800"
                >
                    ← Voltar para métodos
                </Button>
                <h2 className="text-2xl font-bold">
                    Atributos - {selectedMethod === "point-buy" ? "Point Buy" : 
                                 selectedMethod === "standard-array" ? "Array Padrão" : "Rolagem"}
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Painel de configuração */}
                <div className="space-y-6">
                    {/* Point Buy Controls */}
                    {selectedMethod === "point-buy" && (
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold">Point Buy System</h3>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-blue-600">{pointsRemaining}</div>
                                    <div className="text-sm text-gray-500">pontos restantes</div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                {(Object.keys(ABILITY_NAMES) as Array<keyof AbilityScores>).map((ability) => (
                                    <div key={ability} className="flex items-center justify-between">
                                        <label className="font-medium text-gray-700 min-w-[100px]">
                                            {ABILITY_NAMES[ability]}
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => adjustPointBuyScore(ability, abilityScores[ability] - 1)}
                                                disabled={abilityScores[ability] <= 8}
                                            >
                                                -
                                            </Button>
                                            <span className="w-8 text-center font-bold">
                                                {abilityScores[ability]}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => adjustPointBuyScore(ability, abilityScores[ability] + 1)}
                                                disabled={abilityScores[ability] >= 15 || 
                                                          pointsRemaining < (POINT_BUY_COSTS[abilityScores[ability] + 1] - POINT_BUY_COSTS[abilityScores[ability]])}
                                            >
                                                +
                                            </Button>
                                            <span className="text-sm text-gray-500 w-16 text-right">
                                                ({getModifier(abilityScores[ability]) >= 0 ? '+' : ''}{getModifier(abilityScores[ability])})
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
                                <strong>Custos:</strong> 8-13 (1 ponto cada), 14 (2 pontos), 15 (2 pontos)
                            </div>
                        </Card>
                    )}

                    {/* Standard Array Controls */}
                    {selectedMethod === "standard-array" && (
                        <Card className="p-6">
                            <h3 className="text-lg font-bold mb-4">Array Padrão</h3>
                            <p className="text-gray-600 mb-4">
                                Arraste valores para os atributos ou clique para atribuir:
                            </p>
                            
                            <div className="mb-6">
                                <h4 className="font-medium mb-2">Valores disponíveis:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {standardArrayValues.map((value, index) => (
                                        <Button
                                            key={`${value}-${index}`}
                                            variant="outline"
                                            className="w-12 h-12"
                                            onClick={() => {
                                                // Encontra o primeiro slot vazio
                                                const emptyIndex = assignedValues.findIndex(v => v === null);
                                                if (emptyIndex !== -1) {
                                                    assignValue(emptyIndex, value);
                                                }
                                            }}
                                        >
                                            {value}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Rolling Controls */}
                    {selectedMethod === "rolling" && (
                        <Card className="p-6">
                            <h3 className="text-lg font-bold mb-4">Rolagem de Dados</h3>
                            
                            {rolledArrays.length === 0 ? (
                                <div className="text-center">
                                    <p className="text-gray-600 mb-4">
                                        Clique para gerar 3 arrays de atributos aleatórios:
                                    </p>
                                    <Button onClick={generateRolledArrays} className="bg-purple-600 hover:bg-purple-700">
                                        🎲 Rolar Atributos
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium">Escolha um array:</h4>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={generateRolledArrays}
                                        >
                                            🎲 Rolar novamente
                                        </Button>
                                    </div>
                                    
                                    {rolledArrays.map((array, index) => {
                                        const total = array.reduce((sum, val) => sum + val, 0);
                                        const modifierSum = array.reduce((sum, val) => sum + getModifier(val), 0);
                                        
                                        return (
                                            <Card 
                                                key={index}
                                                className={`p-4 cursor-pointer transition-all ${
                                                    selectedRolledArray === index 
                                                        ? 'border-purple-500 bg-purple-50' 
                                                        : 'hover:border-purple-300'
                                                }`}
                                                onClick={() => {
                                                    setSelectedRolledArray(index);
                                                    setAssignedValues([null, null, null, null, null, null]);
                                                }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex gap-2">
                                                        {array.map((value, valIndex) => (
                                                            <span 
                                                                key={valIndex}
                                                                className="w-10 h-10 bg-white border rounded flex items-center justify-center font-bold"
                                                            >
                                                                {value}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="text-right text-sm">
                                                        <div>Total: {total}</div>
                                                        <div>Mod: {modifierSum >= 0 ? '+' : ''}{modifierSum}</div>
                                                    </div>
                                                </div>
                                            </Card>
                                        );
                                    })}

                                    {selectedRolledArray !== null && (
                                        <div className="mt-4">
                                            <h4 className="font-medium mb-2">Valores selecionados:</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {rolledArrays[selectedRolledArray].map((value, index) => (
                                                    <Button
                                                        key={`${value}-${index}`}
                                                        variant="outline"
                                                        className="w-12 h-12"
                                                        onClick={() => {
                                                            const emptyIndex = assignedValues.findIndex(v => v === null);
                                                            if (emptyIndex !== -1) {
                                                                assignValue(emptyIndex, value);
                                                            }
                                                        }}
                                                        disabled={!rolledArrays[selectedRolledArray].includes(value) || 
                                                                 assignedValues.includes(value)}
                                                    >
                                                        {value}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    )}
                </div>

                {/* Painel de atributos finais */}
                <div>
                    <Card className="p-6">
                        <h3 className="text-lg font-bold mb-4">Atributos do Personagem</h3>
                        
                        <div className="space-y-3">
                            {(Object.keys(ABILITY_NAMES) as Array<keyof AbilityScores>).map((ability, index) => {
                                const finalScore = selectedMethod === "point-buy" 
                                    ? abilityScores[ability]
                                    : assignedValues[index] || 0;
                                const modifier = getModifier(finalScore);
                                
                                return (
                                    <div key={ability} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-gray-600 w-8">
                                                {ABILITY_ABBREVIATIONS[ability]}
                                            </span>
                                            <span className="font-medium min-w-[100px]">
                                                {ABILITY_NAMES[ability]}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            {(selectedMethod === "standard-array" || selectedMethod === "rolling") && (
                                                <div className="flex items-center gap-2">
                                                    {assignedValues[index] ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeAssignedValue(index)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            ✕
                                                        </Button>
                                                    ) : (
                                                        <div className="w-8"></div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            <div className="text-right">
                                                <div className="text-2xl font-bold">
                                                    {finalScore}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {modifier >= 0 ? '+' : ''}{modifier}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Resumo */}
                        <div className="mt-6 p-4 bg-blue-50 rounded">
                            <h4 className="font-bold text-blue-800 mb-2">Resumo</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium">Total:</span>{' '}
                                    {selectedMethod === "point-buy" 
                                        ? Object.values(abilityScores).reduce((sum, val) => sum + val, 0)
                                        : assignedValues.reduce((sum, val) => sum + (val || 0), 0)
                                    }
                                </div>
                                <div>
                                    <span className="font-medium">Modificadores:</span>{' '}
                                    {selectedMethod === "point-buy"
                                        ? Object.values(abilityScores).reduce((sum, val) => sum + getModifier(val), 0)
                                        : assignedValues.reduce((sum, val) => sum + getModifier(val || 0), 0)
                                    }
                                </div>
                                {selectedMethod === "point-buy" && (
                                    <div>
                                        <span className="font-medium">Pontos usados:</span> {27 - pointsRemaining}/27
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Debug */}
            <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
                <h3 className="font-bold mb-2">Informações de Debug:</h3>
                <p>Método selecionado: {selectedMethod}</p>
                <p>Validação: {validateScores() ? '✅ Válido' : '❌ Incompleto'}</p>
                {selectedMethod === "point-buy" && <p>Pontos restantes: {pointsRemaining}</p>}
                {selectedMethod === "standard-array" && (
                    <p>Valores atribuídos: {assignedValues.filter(v => v !== null).length}/6</p>
                )}
                {selectedMethod === "rolling" && (
                    <p>Array selecionado: {selectedRolledArray !== null ? selectedRolledArray + 1 : 'Nenhum'}, 
                       Atribuições: {assignedValues.filter(v => v !== null).length}/6</p>
                )}
            </div>
        </div>
    );
};

export default AbilityScores;