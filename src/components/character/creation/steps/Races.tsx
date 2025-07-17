// components/character/creation/steps/Races.tsx
'use client';

import { useState, useEffect } from "react";
import { DndRace, DndSubrace, DndReference } from "@/types/characterCreation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockSubraces } from "@/data/mockSubraces";

interface ApiRacesResponse {
    count: number;
    results: DndReference[];
}

interface RacesCreationProps {
    onValidationChange?: (isValid: boolean) => void;
}

// ===========================
// STORAGE UTILITIES - SIMPLES E DIRETO
// ===========================

const STORAGE_KEYS = {
    SELECTED_RACE: 'character_creation_race',
    SELECTED_SUBRACE: 'character_creation_subrace',
    RACES_DATA: 'character_creation_races_cache'
};

const saveToStorage = (key: string, data: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        console.log(`💾 Salvou ${key} no localStorage`);
    } catch (error) {
        console.error('Erro ao salvar no storage:', error);
    }
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        if (item) {
            const parsed = JSON.parse(item);
            console.log(`📥 Carregou ${key} do localStorage`);
            return parsed;
        }
    } catch (error) {
        console.error('Erro ao carregar do storage:', error);
    }
    return defaultValue;
};

const RacesCreation = ({ onValidationChange }: RacesCreationProps) => {
    // ===========================
    // STATES COM VALORES DO STORAGE
    // ===========================
    
    const [selectedRace, setSelectedRace] = useState<DndRace | null>(() => 
        loadFromStorage<DndRace | null>(STORAGE_KEYS.SELECTED_RACE, null)
    );
    
    const [selectedSubRace, setSelectedSubRace] = useState<DndSubrace | null>(() => 
        loadFromStorage<DndSubrace | null>(STORAGE_KEYS.SELECTED_SUBRACE, null)
    );
    
    const [apiRaces, setApiRaces] = useState<DndReference[]>(() => 
        loadFromStorage<DndReference[]>(STORAGE_KEYS.RACES_DATA, [])
    );

    const [raceDetails, setRaceDetails] = useState<Record<string, DndRace>>({});
    const [availableSubraces, setAvailableSubraces] = useState<DndSubrace[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState({
        races: false,
        details: false
    });

    // ===========================
    // EFEITOS DE STORAGE
    // ===========================

    // Salvar raça selecionada sempre que mudar
    useEffect(() => {
        if (selectedRace) {
            saveToStorage(STORAGE_KEYS.SELECTED_RACE, selectedRace);
        }
    }, [selectedRace]);

    // Salvar sub-raça selecionada sempre que mudar
    useEffect(() => {
        if (selectedSubRace) {
            saveToStorage(STORAGE_KEYS.SELECTED_SUBRACE, selectedSubRace);
        }
    }, [selectedSubRace]);

    // Salvar dados das raças em cache
    useEffect(() => {
        if (apiRaces.length > 0) {
            saveToStorage(STORAGE_KEYS.RACES_DATA, apiRaces);
        }
    }, [apiRaces]);

    // Validação - notificar componente pai
    useEffect(() => {
        const isValid = !!selectedRace;
        onValidationChange?.(isValid);
    }, [selectedRace, onValidationChange]);

    // ===========================
    // FUNÇÕES ORIGINAIS (MANTIDAS)
    // ===========================

    const pullRaces = async () => {
        // Se já tem dados no cache, não precisa buscar novamente
        if (apiRaces.length > 0) {
            console.log('📦 Usando raças do cache');
            return;
        }

        setIsLoading(prev => ({ ...prev, races: true }));
        setError(null);
        
        try {
            const response = await fetch("https://www.dnd5eapi.co/api/races");
            
            if (!response.ok) {
                throw new Error(`Falha na requisição: Status ${response.status}`);
            }
            
            const data: ApiRacesResponse = await response.json();
            setApiRaces(data.results);
        } catch (err) {
            setError("Falha ao requisitar as raças. Por favor, tente novamente mais tarde.");
            console.error("Erro ao requisitar raças:", err);
        } finally {
            setIsLoading(prev => ({ ...prev, races: false }));
        }
    };

    const pullRaceDetails = async (raceIndex: string) => {
        if (raceDetails[raceIndex]) {
            console.log(`📦 Usando detalhes da raça ${raceIndex} do cache`);
            return raceDetails[raceIndex];
        }

        setIsLoading(prev => ({ ...prev, details: true }));
        
        try {
            const response = await fetch(`https://www.dnd5eapi.co/api/races/${raceIndex}`);
            
            if (!response.ok) {
                throw new Error(`Falha na requisição: Status ${response.status}`);
            }
            
            const raceData: DndRace = await response.json();
            
            setRaceDetails(prev => ({
                ...prev,
                [raceIndex]: raceData
            }));
            
            return raceData;
        } catch (err) {
            console.error(`Erro ao carregar detalhes da raça ${raceIndex}:`, err);
            return null;
        } finally {
            setIsLoading(prev => ({ ...prev, details: false }));
        }
    };

    const handleRaceSelection = async (race: DndReference) => {
        console.log("🎯 Selecionando raça:", race.name);
        
        const raceData = await pullRaceDetails(race.index);
        
        if (raceData) {
            setSelectedRace(raceData);
            setSelectedSubRace(null); // Reset sub-raça ao mudar raça
            
            // Filtrar sub-raças disponíveis
            const subraces = mockSubraces.filter(subrace => 
                subrace.race.index === race.index
            );
            setAvailableSubraces(subraces);
            
            console.log(`✅ Raça ${race.name} selecionada com sucesso`);
        }
    };

    const handleSubraceSelection = (subrace: DndSubrace) => {
        console.log("🎯 Selecionando sub-raça:", subrace.name);
        setSelectedSubRace(subrace);
        console.log(`✅ Sub-raça ${subrace.name} selecionada com sucesso`);
    };

    // ===========================
    // FUNÇÃO DE LIMPEZA DO STORAGE
    // ===========================

    const clearStorageData = () => {
        localStorage.removeItem(STORAGE_KEYS.SELECTED_RACE);
        localStorage.removeItem(STORAGE_KEYS.SELECTED_SUBRACE);
        localStorage.removeItem(STORAGE_KEYS.RACES_DATA);
        
        setSelectedRace(null);
        setSelectedSubRace(null);
        setApiRaces([]);
        setAvailableSubraces([]);
        
        console.log('🧹 Dados de raça limpos do storage');
    };

    // Carregar raças na inicialização
    useEffect(() => {
        pullRaces();
    }, []);

    // Se tem raça selecionada, carregar sub-raças disponíveis
    useEffect(() => {
        if (selectedRace) {
            const subraces = mockSubraces.filter(subrace => 
                subrace.race.index === selectedRace.index
            );
            setAvailableSubraces(subraces);
        }
    }, [selectedRace]);

    if (error) {
        return (
            <Card className="p-6">
                <div className="text-center text-red-600">
                    <h3 className="font-bold mb-2">Erro ao carregar raças</h3>
                    <p className="mb-4">{error}</p>
                    <Button onClick={pullRaces} variant="outline">
                        Tentar novamente
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
                <Card className="p-4 bg-blue-50">
                    <h4 className="font-bold text-sm mb-2">Debug - Storage Status:</h4>
                    <div className="text-xs space-y-1">
                        <p>Raça: {selectedRace?.name || 'Não selecionada'}</p>
                        <p>Sub-raça: {selectedSubRace?.name || 'Não selecionada'}</p>
                        <p>Cache de raças: {apiRaces.length} itens</p>
                        <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={clearStorageData}
                            className="mt-2"
                        >
                            Limpar Storage
                        </Button>
                    </div>
                </Card>
            )}

            {/* Seleção de Raça */}
            <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Escolha uma Raça</h3>
                
                {isLoading.races ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-600">Carregando raças...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {apiRaces.map((race) => (
                            <button
                                key={race.index}
                                onClick={() => handleRaceSelection(race)}
                                className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                                    selectedRace?.index === race.index
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                                }`}
                                disabled={isLoading.details}
                            >
                                <h4 className="font-semibold">{race.name}</h4>
                                {selectedRace?.index === race.index && (
                                    <div className="mt-2 text-xs text-blue-600">
                                        ✓ Selecionada
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </Card>

            {/* Detalhes da Raça Selecionada */}
            {selectedRace && (
                <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4">Detalhes: {selectedRace.name}</h3>
                    
                    <div className="space-y-4">
                        {/* Bônus de Atributos */}
                        {selectedRace.ability_bonuses && selectedRace.ability_bonuses.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2">Bônus de Atributos</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedRace.ability_bonuses.map((bonus, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm"
                                        >
                                            {bonus.ability_score.name}: +{bonus.bonus}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Velocidade */}
                        {selectedRace.speed && (
                            <div>
                                <h4 className="font-semibold mb-2">Velocidade</h4>
                                <p className="text-gray-700">{selectedRace.speed} pés</p>
                            </div>
                        )}

                        {/* Idiomas */}
                        {selectedRace.languages && selectedRace.languages.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2">Idiomas</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedRace.languages.map((language) => (
                                        <span
                                            key={language.index}
                                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                                        >
                                            {language.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* Seleção de Sub-raça */}
            {availableSubraces.length > 0 && (
                <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4">Escolha uma Sub-raça</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableSubraces.map((subrace) => (
                            <button
                                key={subrace.index}
                                onClick={() => handleSubraceSelection(subrace)}
                                className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                                    selectedSubRace?.index === subrace.index
                                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                                        : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                                }`}
                            >
                                <h4 className="font-semibold">{subrace.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">{subrace.desc}</p>
                                
                                {/* Bônus adicionais da sub-raça */}
                                {subrace.ability_bonuses && subrace.ability_bonuses.length > 0 && (
                                    <div className="mt-2">
                                        <div className="flex flex-wrap gap-1">
                                            {subrace.ability_bonuses.map((bonus, index) => (
                                                <span
                                                    key={index}
                                                    className="px-1 py-0.5 bg-green-100 text-green-700 rounded text-xs"
                                                >
                                                    {bonus.ability_score.name}: +{bonus.bonus}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {selectedSubRace?.index === subrace.index && (
                                    <div className="mt-2 text-xs text-purple-600">
                                        ✓ Selecionada
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default RacesCreation;