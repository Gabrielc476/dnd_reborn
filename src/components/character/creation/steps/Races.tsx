'use client';

import { useState, useEffect } from "react";
import { DndRace, DndSubrace, DndReference } from "@/types/characterCreation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockSubraces } from "@/data/mockSubraces"; // Importe suas subraças mockadas

interface ApiRacesResponse {
    count: number;
    results: DndReference[];
}

interface RacesCreationProps {
    onValidationChange?: (isValid: boolean) => void;
}

const RacesCreation = ({ onValidationChange }: RacesCreationProps) => {
    const [selectedRace, setSelectedRace] = useState<DndRace | null>(null);
    const [selectedSubRace, setSelectedSubRace] = useState<DndSubrace | null>(null);
    const [apiRaces, setApiRaces] = useState<DndReference[]>([]);
    const [raceDetails, setRaceDetails] = useState<Record<string, DndRace>>({});
    const [availableSubraces, setAvailableSubraces] = useState<DndSubrace[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState({
        races: true,
        details: false
    });

    const pullRaces = async () => {
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
            console.error("Erro na requisição de raças:", err);
        } finally {
            setIsLoading(prev => ({ ...prev, races: false }));
        }
    };

    const fetchRaceDetails = async (raceIndex: string) => {
        setIsLoading(prev => ({ ...prev, details: true }));
        setError(null);
        setSelectedSubRace(null);
        
        try {
            // Usa cache se disponível
            if (raceDetails[raceIndex]) {
                setSelectedRace(raceDetails[raceIndex]);
                // Carrega subraças diretamente do mock
                loadSubraces(raceDetails[raceIndex].index);
                setIsLoading(prev => ({ ...prev, details: false }));
                return;
            }
            
            const response = await fetch(`https://www.dnd5eapi.co/api/races/${raceIndex}`);
            
            if (!response.ok) {
                throw new Error(`Falha ao buscar detalhes da raça: Status ${response.status}`);
            }
            
            const data: DndRace = await response.json();
            
            // Atualiza cache
            setRaceDetails(prev => ({
                ...prev,
                [raceIndex]: data
            }));
            
            setSelectedRace(data);
            // Carrega subraças diretamente do mock
            loadSubraces(data.index);
        } catch (err) {
            setError("Falha ao carregar detalhes da raça. Tente novamente.");
            console.error("Erro ao buscar detalhes da raça:", err);
        } finally {
            setIsLoading(prev => ({ ...prev, details: false }));
        }
    };

    // Carrega subraças apenas do arquivo mockado
    const loadSubraces = (raceIndex: string) => {
        const subracesForRace = mockSubraces.filter(
            subrace => subrace.race.index === raceIndex
        );
        setAvailableSubraces(subracesForRace);
    };

    useEffect(() => {
        pullRaces();
    }, []);

    // Validação do step - chamada sempre que as seleções mudam
    useEffect(() => {
        // Se não há subraças disponíveis, só a raça é suficiente
        // Se há subraças disponíveis, precisa selecionar uma
        const isValid = selectedRace !== null && (
            availableSubraces.length === 0 || selectedSubRace !== null
        );
        onValidationChange?.(isValid);
    }, [selectedRace, selectedSubRace, availableSubraces.length]); // Incluído availableSubraces.length

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Seleção de Raça</h2>
            
            {/* Mensagem de erro */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    <p>{error}</p>
                    <Button 
                        variant="destructive"
                        size="sm"
                        onClick={pullRaces}
                        className="mt-2"
                    >
                        Tentar novamente
                    </Button>
                </div>
            )}
            
            {/* Carregando lista de raças */}
            {isLoading.races && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="p-4 animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </Card>
                    ))}
                </div>
            )}
            
            {/* Lista de raças */}
            {!isLoading.races && !selectedRace && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {apiRaces.map(race => (
                        <Card 
                            key={race.index} 
                            className="cursor-pointer hover:shadow-md transition-shadow p-4"
                            onClick={() => fetchRaceDetails(race.index)}
                        >
                            <h3 className="font-bold text-lg mb-2">{race.name}</h3>
                            {isLoading.details && raceDetails[race.index] === undefined && (
                                <div className="mt-2 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
            
            {/* Detalhes da raça e seleção de subraça */}
            {selectedRace && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Button 
                            variant="ghost"
                            onClick={() => setSelectedRace(null)}
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                            &larr; Voltar para lista
                        </Button>
                        <h3 className="text-xl font-bold">Raça: {selectedRace.name}</h3>
                    </div>
                    
                    <Card className="p-6 bg-blue-50 border border-blue-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-lg font-semibold text-blue-800 mb-3">Informações Básicas</h4>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Velocidade:</span> {selectedRace.speed} ft</p>
                                    <p><span className="font-medium">Tamanho:</span> {selectedRace.size}</p>
                                    <p><span className="font-medium">Idade:</span> {selectedRace.age}</p>
                                    <p><span className="font-medium">Alinhamento:</span> {selectedRace.alignment}</p>
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="text-lg font-semibold text-blue-800 mb-3">Bônus de Habilidade</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedRace.ability_bonuses.map((bonus, i) => (
                                        <span 
                                            key={i} 
                                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                                        >
                                            {bonus.ability_score.name}: +{bonus.bonus}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-blue-200">
                            <h4 className="text-lg font-semibold text-blue-800 mb-3">Descrição</h4>
                            <p className="text-gray-700">{selectedRace.size_description}</p>
                        </div>
                    </Card>
                    
                    {/* Seleção de Subraças */}
                    {availableSubraces.length > 0 && !selectedSubRace && (
                        <div className="mt-6">
                            <h3 className="text-xl font-bold mb-4">Sub-raças Disponíveis</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {availableSubraces.map(subrace => (
                                    <Card
                                        key={subrace.index}
                                        className="cursor-pointer hover:shadow-md p-4 transition-all"
                                        onClick={() => setSelectedSubRace(subrace)}
                                    >
                                        <h4 className="font-bold text-lg mb-2">{subrace.name}</h4>
                                        <p className="text-gray-600 text-sm">{subrace.desc}</p>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Mensagem quando não há subraças */}
                    {availableSubraces.length === 0 && (
                        <div className="mt-6">
                            <Card className="p-4 bg-green-50 border border-green-200">
                                <div className="flex items-center gap-3">
                                    <span className="text-green-600 text-xl">✓</span>
                                    <div>
                                        <h4 className="font-bold text-green-800">Raça Selecionada</h4>
                                        <p className="text-green-700 text-sm">
                                            Esta raça não possui sub-raças disponíveis. Você pode prosseguir para o próximo step.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                    
                    {/* Detalhes da Subraça Selecionada */}
                    {selectedSubRace && (
                        <div className="mt-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Button 
                                    variant="ghost"
                                    onClick={() => setSelectedSubRace(null)}
                                    className="text-green-600 hover:text-green-800 flex items-center"
                                >
                                    &larr; Voltar para sub-raças
                                </Button>
                                <h3 className="text-xl font-bold">Sub-raça Selecionada: {selectedSubRace.name}</h3>
                            </div>
                            
                            <Card className="p-6 bg-green-50 border border-green-200">
                                <div className="mb-4">
                                    <h4 className="text-lg font-semibold text-green-800 mb-2">Descrição</h4>
                                    <p className="text-gray-700">{selectedSubRace.desc}</p>
                                </div>
                                
                                {selectedSubRace.ability_bonuses.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-lg font-semibold text-green-800 mb-2">Bônus de Habilidade</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedSubRace.ability_bonuses.map((bonus, i) => (
                                                <span 
                                                    key={i} 
                                                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full"
                                                >
                                                    {bonus.ability_score.name}: +{bonus.bonus}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {selectedSubRace.starting_proficiencies.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-lg font-semibold text-green-800 mb-2">Proficiências</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedSubRace.starting_proficiencies.map((prof, i) => (
                                                <span 
                                                    key={i} 
                                                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full"
                                                >
                                                    {prof.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {selectedSubRace.racial_traits.length > 0 && (
                                    <div>
                                        <h4 className="text-lg font-semibold text-green-800 mb-2">Traços Raciais</h4>
                                        <ul className="list-disc pl-5 space-y-1">
                                            {selectedSubRace.racial_traits.map((trait, i) => (
                                                <li key={i} className="text-gray-700">
                                                    <span className="font-medium">{trait.name}:</span> Descrição do traço
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </Card>
                        </div>
                    )}
                    
                    {/* Botões de ação */}
                    <div className="flex justify-end gap-4">
                        <Button 
                            variant="outline"
                            onClick={() => {
                                setSelectedRace(null);
                                setSelectedSubRace(null);
                            }}
                        >
                            Escolher outra raça
                        </Button>
                        
                        {/* Botão quando há subraça selecionada */}
                        {selectedSubRace && (
                            <Button 
                                variant="default"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => console.log("Raça e subraça selecionadas:", selectedRace, selectedSubRace)}
                            >
                                Confirmar Seleção
                            </Button>
                        )}

                        {/* Botão quando não há subraças disponíveis */}
                        {availableSubraces.length === 0 && !selectedSubRace && (
                            <Button 
                                variant="default"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => console.log("Raça selecionada (sem subraças):", selectedRace)}
                            >
                                Confirmar Seleção
                            </Button>
                        )}
                    </div>
                </div>
            )}
            
            {/* Mensagem de debug */}
            <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
                <h3 className="font-bold mb-2">Informações de Debug:</h3>
                <p>Raças carregadas: {apiRaces.length}</p>
                <p>Raça selecionada: {selectedRace ? selectedRace.name : 'Nenhuma'}</p>
                <p>Subraças disponíveis: {availableSubraces.length}</p>
                <p>Subraça selecionada: {selectedSubRace ? selectedSubRace.name : 'Nenhuma'}</p>
                <p>Estado de carregamento: {JSON.stringify(isLoading)}</p>
                {selectedRace && (
                    <p>Validação: {
                        availableSubraces.length === 0 
                            ? '✅ Válido (sem subraças disponíveis)' 
                            : selectedSubRace 
                                ? '✅ Válido (raça e subraça selecionadas)'
                                : '❌ Incompleto (selecione uma subraça)'
                    }</p>
                )}
                {!selectedRace && <p>Validação: ❌ Incompleto (selecione uma raça)</p>}
            </div>
        </div>
    );
};

export default RacesCreation;