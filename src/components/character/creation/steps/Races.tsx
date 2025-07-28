// components/character/creation/steps/Races.tsx
'use client';

import { useState, useEffect } from "react";
import { DndRace, DndSubrace, DndReference } from "@/types/characterCreation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    } catch (error) {
        console.error('Erro ao salvar no storage:', error);
    }
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        if (item) {
            return JSON.parse(item);
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
        loadFromStorage<DndRace | null>(STORAGE_KEYS.SELECTED_RACE, null));
    
    const [selectedSubRace, setSelectedSubRace] = useState<DndSubrace | null>(() => 
        loadFromStorage<DndSubrace | null>(STORAGE_KEYS.SELECTED_SUBRACE, null));
    
    const [apiRaces, setApiRaces] = useState<DndReference[]>(() => 
        loadFromStorage<DndReference[]>(STORAGE_KEYS.RACES_DATA, []));

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
    useEffect(() => {
        if (selectedRace) {
            saveToStorage(STORAGE_KEYS.SELECTED_RACE, selectedRace);
        }
    }, [selectedRace]);

    useEffect(() => {
        if (selectedSubRace) {
            saveToStorage(STORAGE_KEYS.SELECTED_SUBRACE, selectedSubRace);
        }
    }, [selectedSubRace]);

    useEffect(() => {
        if (apiRaces.length > 0) {
            saveToStorage(STORAGE_KEYS.RACES_DATA, apiRaces);
        }
    }, [apiRaces]);

    useEffect(() => {
        onValidationChange?.(!!selectedRace);
    }, [selectedRace, onValidationChange]);

    // ===========================
    // FUNÇÕES ORIGINAIS
    // ===========================
    const pullRaces = async () => {
        if (apiRaces.length > 0) return;
        
        setIsLoading(prev => ({ ...prev, races: true }));
        setError(null);
        
        try {
            const response = await fetch("https://www.dnd5eapi.co/api/races");
            if (!response.ok) throw new Error(`Falha na requisição: Status ${response.status}`);
            
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
        if (raceDetails[raceIndex]) return raceDetails[raceIndex];
        
        setIsLoading(prev => ({ ...prev, details: true }));
        
        try {
            const response = await fetch(`https://www.dnd5eapi.co/api/races/${raceIndex}`);
            if (!response.ok) throw new Error(`Falha na requisição: Status ${response.status}`);
            
            const raceData: DndRace = await response.json();
            setRaceDetails(prev => ({ ...prev, [raceIndex]: raceData }));
            return raceData;
        } catch (err) {
            console.error(`Erro ao carregar detalhes da raça ${raceIndex}:`, err);
            return null;
        } finally {
            setIsLoading(prev => ({ ...prev, details: false }));
        }
    };

    const handleRaceSelection = async (race: DndReference) => {
        const raceData = await pullRaceDetails(race.index);
        if (raceData) {
            setSelectedRace(raceData);
            setSelectedSubRace(null);
            const subraces = mockSubraces.filter(subrace => 
                subrace.race.index === race.index
            );
            setAvailableSubraces(subraces);
        }
    };

    const handleSubraceSelection = (subrace: DndSubrace) => {
        setSelectedSubRace(subrace);
    };

    const clearStorageData = () => {
        localStorage.removeItem(STORAGE_KEYS.SELECTED_RACE);
        localStorage.removeItem(STORAGE_KEYS.SELECTED_SUBRACE);
        localStorage.removeItem(STORAGE_KEYS.RACES_DATA);
        setSelectedRace(null);
        setSelectedSubRace(null);
        setApiRaces([]);
        setAvailableSubraces([]);
    };

    useEffect(() => {
        pullRaces();
    }, []);

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
            <div className="min-h-screen bg-slate-900 p-6">
                <Card className="p-6 bg-slate-800/80 border-slate-700">
                    <div className="text-center text-red-400">
                        <h3 className="font-bold mb-2 text-white">Erro ao carregar raças</h3>
                        <p className="mb-4">{error}</p>
                        <Button
                            onClick={pullRaces}
                            variant="outline"
                            className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                        >
                            Tentar novamente
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 p-6">
            <div className="space-y-6">
                {/* Debug Info */}
                {process.env.NODE_ENV === 'development' && (
                    <Card className="p-4 bg-slate-800/60 border-slate-700">
                        <h4 className="font-bold text-sm mb-2 text-slate-200">Debug - Storage Status:</h4>
                        <div className="text-xs space-y-1 text-slate-400">
                            <p>Raça: {selectedRace?.name || "Não selecionada"}</p>
                            <p>Sub-raça: {selectedSubRace?.name || "Não selecionada"}</p>
                            <p>Cache de raças: {apiRaces.length} itens</p>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={clearStorageData}
                                className="mt-2 border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                            >
                                Limpar Storage
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Seleção de Raça */}
                <Card className="p-6 bg-slate-800/80 border-slate-700">
                    <h3 className="text-lg font-bold mb-4 text-white">Escolha uma Raça</h3>
                    
                    {isLoading.races ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                            <p className="text-slate-400">Carregando raças...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {apiRaces.map((race) => (
                                <button
                                    key={race.index}
                                    onClick={() => handleRaceSelection(race)}
                                    className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                                        selectedRace?.index === race.index
                                            ? "border-blue-400 bg-blue-500/20 text-blue-300"
                                            : "border-slate-600 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-700 text-slate-300"
                                    }`}
                                    disabled={isLoading.details}
                                >
                                    <h4 className="font-semibold">{race.name}</h4>
                                    {selectedRace?.index === race.index && (
                                        <div className="mt-2 text-xs text-blue-400">✓ Selecionada</div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Detalhes da Raça Selecionada */}
                {selectedRace && (
                    <Card className="p-6 bg-slate-800/80 border-slate-700">
                        <h3 className="text-lg font-bold mb-4 text-white">Detalhes: {selectedRace.name}</h3>
                        
                        <div className="space-y-4">
                            {/* Bônus de Atributos */}
                            {selectedRace.ability_bonuses && selectedRace.ability_bonuses.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2 text-slate-200">Bônus de Atributos</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedRace.ability_bonuses.map((bonus, index) => (
                                            <Badge
                                                key={index}
                                                className="bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-1 text-sm"
                                            >
                                                {bonus.ability_score.name}: +{bonus.bonus}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Velocidade */}
                            {selectedRace.speed && (
                                <div>
                                    <h4 className="font-semibold mb-2 text-slate-200">Velocidade</h4>
                                    <p className="text-slate-300">{selectedRace.speed} pés</p>
                                </div>
                            )}

                            {/* Idiomas */}
                            {selectedRace.languages && selectedRace.languages.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2 text-slate-200">Idiomas</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedRace.languages.map((language) => (
                                            <Badge
                                                key={language.index}
                                                className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-1 text-sm"
                                            >
                                                {language.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                )}

                {/* Seleção de Sub-raça */}
                {availableSubraces.length > 0 && (
                    <Card className="p-6 bg-slate-800/80 border-slate-700">
                        <h3 className="text-lg font-bold mb-4 text-white">Escolha uma Sub-raça</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availableSubraces.map((subrace) => (
                                <button
                                    key={subrace.index}
                                    onClick={() => handleSubraceSelection(subrace)}
                                    className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                                        selectedSubRace?.index === subrace.index
                                            ? "border-purple-400 bg-purple-500/20 text-purple-300"
                                            : "border-slate-600 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-700 text-slate-300"
                                    }`}
                                >
                                    <h4 className="font-semibold">{subrace.name}</h4>
                                    <p className="text-sm text-slate-400 mt-1">{subrace.desc}</p>
                                    
                                    {/* Bônus adicionais da sub-raça */}
                                    {subrace.ability_bonuses && subrace.ability_bonuses.length > 0 && (
                                        <div className="mt-2">
                                            <div className="flex flex-wrap gap-1">
                                                {subrace.ability_bonuses.map((bonus, index) => (
                                                    <Badge
                                                        key={index}
                                                        className="bg-green-500/20 text-green-400 border border-green-500/30 px-1 py-0.5 text-xs"
                                                    >
                                                        {bonus.ability_score.name}: +{bonus.bonus}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {selectedSubRace?.index === subrace.index && (
                                        <div className="mt-2 text-xs text-purple-400">✓ Selecionada</div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default RacesCreation;