'use client';

import { useState, useEffect } from "react";
import { DndClass, DndSubclass, DndBackground, DndReference } from "@/types/characterCreation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockSubclasses } from "@/data/mockSubClasses"; // Importe as subclasses mockadas
import { mockBackgrounds } from "@/data/mockBackgrounds"; // Importe os backgrounds mockados

interface ApiClassesResponse {
    count: number;
    results: DndReference[];
}

interface ClassesCreationProps {
    onValidationChange?: (isValid: boolean) => void;
}

// Styles for text truncation
const truncateClasses = {
    lineClamp2: {
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical' as const,
        overflow: 'hidden',
    },
    lineClamp3: {
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical' as const,
        overflow: 'hidden',
    }
};

const ClassesCreation = ({ onValidationChange }: ClassesCreationProps) => {
    const [selectedClass, setSelectedClass] = useState<DndClass | null>(null);
    const [selectedSubclass, setSelectedSubclass] = useState<DndSubclass | null>(null);
    const [selectedBackground, setSelectedBackground] = useState<DndBackground | null>(null);
    const [apiClasses, setApiClasses] = useState<DndReference[]>([]);
    const [classDetails, setClassDetails] = useState<Record<string, DndClass>>({});
    const [availableSubclasses, setAvailableSubclasses] = useState<DndSubclass[]>([]);
    const [availableBackgrounds, setAvailableBackgrounds] = useState<DndBackground[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState({
        classes: true,
        details: false
    });

    const pullClasses = async () => {
        setIsLoading(prev => ({ ...prev, classes: true }));
        setError(null);
        
        try {
            const response = await fetch("https://www.dnd5eapi.co/api/classes");
            
            if (!response.ok) {
                throw new Error(`Falha na requisição: Status ${response.status}`);
            }
            
            const data: ApiClassesResponse = await response.json();
            setApiClasses(data.results);
        } catch (err) {
            setError("Falha ao requisitar as classes. Por favor, tente novamente mais tarde.");
            console.error("Erro na requisição de classes:", err);
        } finally {
            setIsLoading(prev => ({ ...prev, classes: false }));
        }
    };

    const fetchClassDetails = async (classIndex: string) => {
        setIsLoading(prev => ({ ...prev, details: true }));
        setError(null);
        setSelectedSubclass(null);
        setSelectedBackground(null);
        
        try {
            // Usa cache se disponível
            if (classDetails[classIndex]) {
                setSelectedClass(classDetails[classIndex]);
                // Carrega subclasses diretamente do mock
                loadSubclasses(classDetails[classIndex].index);
                setIsLoading(prev => ({ ...prev, details: false }));
                return;
            }
            
            const response = await fetch(`https://www.dnd5eapi.co/api/classes/${classIndex}`);
            
            if (!response.ok) {
                throw new Error(`Falha ao buscar detalhes da classe: Status ${response.status}`);
            }
            
            const data: DndClass = await response.json();
            
            // Atualiza cache
            setClassDetails(prev => ({
                ...prev,
                [classIndex]: data
            }));
            
            setSelectedClass(data);
            // Carrega subclasses diretamente do mock
            loadSubclasses(data.index);
        } catch (err) {
            setError("Falha ao carregar detalhes da classe. Tente novamente.");
            console.error("Erro ao buscar detalhes da classe:", err);
        } finally {
            setIsLoading(prev => ({ ...prev, details: false }));
        }
    };

    // Carrega subclasses apenas do arquivo mockado
    const loadSubclasses = (classIndex: string) => {
        const subclassesForClass = mockSubclasses.filter(
            subclass => subclass.class.index === classIndex
        );
        setAvailableSubclasses(subclassesForClass);
        
        // Se não há subclasses, carrega backgrounds imediatamente
        if (subclassesForClass.length === 0) {
            loadBackgrounds();
        }
    };

    // Carrega backgrounds apenas do arquivo mockado
    const loadBackgrounds = () => {
        setAvailableBackgrounds(mockBackgrounds);
    };

    useEffect(() => {
        pullClasses();
    }, []);

    // Carrega backgrounds quando subclasse é selecionada
    useEffect(() => {
        if (selectedSubclass && availableBackgrounds.length === 0) {
            loadBackgrounds();
        }
    }, [selectedSubclass]);

    // Validação do step - chamada sempre que as seleções mudam
    useEffect(() => {
        // Se há classe selecionada
        if (selectedClass) {
            // Se não há subclasses disponíveis, só classe e background são suficientes
            // Se há subclasses disponíveis, precisa selecionar uma
            const hasValidSubclass = availableSubclasses.length === 0 || selectedSubclass !== null;
            // Background sempre é obrigatório pois sempre há backgrounds disponíveis
            const hasValidBackground = selectedBackground !== null;
            
            const isValid = hasValidSubclass && hasValidBackground;
            onValidationChange?.(isValid);
        } else {
            // Sem classe selecionada = inválido
            onValidationChange?.(false);
        }
    }, [selectedClass, selectedSubclass, selectedBackground, availableSubclasses.length, availableBackgrounds.length]);

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Seleção de Classe, Subclasse e Background</h2>
            
            {/* Mensagem de erro */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    <p>{error}</p>
                    <Button 
                        variant="destructive"
                        size="sm"
                        onClick={pullClasses}
                        className="mt-2"
                    >
                        Tentar novamente
                    </Button>
                </div>
            )}
            
            {/* Carregando lista de classes */}
            {isLoading.classes && (
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
            
            {/* Lista de classes */}
            {!isLoading.classes && !selectedClass && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {apiClasses.map(classe => (
                        <Card 
                            key={classe.index} 
                            className="cursor-pointer hover:shadow-md transition-shadow p-4"
                            onClick={() => fetchClassDetails(classe.index)}
                        >
                            <h3 className="font-bold text-lg mb-2">{classe.name}</h3>
                            {isLoading.details && classDetails[classe.index] === undefined && (
                                <div className="mt-2 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
            
            {/* Detalhes da classe e seleção de subclasse */}
            {selectedClass && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Button 
                            variant="ghost"
                            onClick={() => setSelectedClass(null)}
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                            &larr; Voltar para lista
                        </Button>
                        <h3 className="text-xl font-bold">Classe: {selectedClass.name}</h3>
                    </div>
                    
                    <Card className="p-6 bg-blue-50 border border-blue-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-lg font-semibold text-blue-800 mb-3">Informações Básicas</h4>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Dado de Vida:</span> d{selectedClass.hit_die}</p>
                                    <p><span className="font-medium">Testes de Resistência:</span> {
                                        selectedClass.saving_throws?.map(st => st.name).join(", ") || "N/A"
                                    }</p>
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="text-lg font-semibold text-blue-800 mb-3">Proficiências</h4>
                                <div className="space-y-2">
                                    {selectedClass.proficiencies && selectedClass.proficiencies.length > 0 && (
                                        <div>
                                            <p className="font-medium mb-1">Proficiências:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedClass.proficiencies.slice(0, 3).map((prof, i) => (
                                                    <span 
                                                        key={i} 
                                                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                                                    >
                                                        {prof.name}
                                                    </span>
                                                ))}
                                                {selectedClass.proficiencies.length > 3 && (
                                                    <span className="text-blue-600 text-sm">+{selectedClass.proficiencies.length - 3} mais</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {selectedClass.spellcasting && (
                            <div className="mt-6 pt-6 border-t border-blue-200">
                                <h4 className="text-lg font-semibold text-blue-800 mb-3">Conjuração</h4>
                                <p className="text-gray-700">
                                    <span className="font-medium">Habilidade de Conjuração:</span> {
                                        selectedClass.spellcasting.spellcasting_ability?.name || "N/A"
                                    }
                                </p>
                            </div>
                        )}
                    </Card>
                    
                    {/* Seleção de Subclasses */}
                    {availableSubclasses.length > 0 && !selectedSubclass && (
                        <div className="mt-6">
                            <h3 className="text-xl font-bold mb-4">Subclasses Disponíveis</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {availableSubclasses.map(subclass => (
                                    <Card
                                        key={subclass.index}
                                        className="cursor-pointer hover:shadow-md p-4 transition-all"
                                        onClick={() => setSelectedSubclass(subclass)}
                                    >
                                        <h4 className="font-bold text-lg mb-2">{subclass.name}</h4>
                                        <p className="text-gray-600 text-sm" style={truncateClasses.lineClamp2}>
                                            {subclass.subclass_flavor || 
                                             (subclass.desc?.[0] ? subclass.desc[0].substring(0, 100) + "..." : "") ||
                                             "Subclasse especializada desta classe."}
                                        </p>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Mensagem quando não há subclasses */}
                    {availableSubclasses.length === 0 && !selectedSubclass && (
                        <div className="mt-6">
                            <Card className="p-4 bg-purple-50 border border-purple-200">
                                <div className="flex items-center gap-3">
                                    <span className="text-purple-600 text-xl">✓</span>
                                    <div>
                                        <h4 className="font-bold text-purple-800">Classe Selecionada</h4>
                                        <p className="text-purple-700 text-sm">
                                            Esta classe não possui subclasses disponíveis. Escolha um background para prosseguir.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                    
                    {/* Detalhes da Subclasse Selecionada */}
                    {selectedSubclass && (
                        <div className="mt-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Button 
                                    variant="ghost"
                                    onClick={() => setSelectedSubclass(null)}
                                    className="text-purple-600 hover:text-purple-800 flex items-center"
                                >
                                    &larr; Voltar para subclasses
                                </Button>
                                <h3 className="text-xl font-bold">Subclasse: {selectedSubclass.name}</h3>
                            </div>
                            
                            <Card className="p-6 bg-purple-50 border border-purple-200">
                                <div className="mb-4">
                                    <h4 className="text-lg font-semibold text-purple-800 mb-2">Descrição</h4>
                                    <p className="text-gray-700 mb-2">{selectedSubclass.subclass_flavor || "Subclasse especializada com características únicas."}</p>
                                    {selectedSubclass.desc && selectedSubclass.desc.length > 0 && (
                                        <p className="text-gray-700 text-sm" style={truncateClasses.lineClamp2}>
                                            {selectedSubclass.desc[0]}
                                        </p>
                                    )}
                                </div>
                                
                                {selectedSubclass.subclass_levels && Array.isArray(selectedSubclass.subclass_levels) && selectedSubclass.subclass_levels.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-lg font-semibold text-purple-800 mb-3">Características por Nível</h4>
                                        <div className="space-y-3">
                                            {selectedSubclass.subclass_levels.map((levelData, i) => (
                                                <div key={i} className="bg-white rounded-lg p-4 border border-purple-100 shadow-sm">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-bold">
                                                            Nível {levelData.level}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {levelData.features && levelData.features.map((feature, j) => (
                                                            <div key={j} className="flex items-start gap-3 p-2 bg-purple-25 rounded">
                                                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                                                                <div>
                                                                    <span className="text-gray-800 font-medium text-sm">{feature.name}</span>
                                                                    <p className="text-gray-600 text-xs mt-1">
                                                                        Característica obtida no nível {levelData.level}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>
                            
                            {/* Seleção de Backgrounds - mostra quando há subclasse selecionada OU quando não há subclasses */}
                            {(selectedSubclass || availableSubclasses.length === 0) && availableBackgrounds.length > 0 && !selectedBackground && (
                                <div className="mt-6">
                                    <h3 className="text-xl font-bold mb-4">Backgrounds Disponíveis</h3>
                                    <p className="text-gray-600 mb-4">
                                        {selectedSubclass ? 
                                            "Agora escolha o background do seu personagem para completar a seleção." :
                                            "Escolha o background do seu personagem."
                                        }
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {availableBackgrounds.map(background => (
                                            <Card
                                                key={background.index}
                                                className="cursor-pointer hover:shadow-md p-4 transition-all"
                                                onClick={() => setSelectedBackground(background)}
                                            >
                                                <h4 className="font-bold text-lg mb-2">{background.name}</h4>
                                                <p className="text-gray-600 text-sm" style={truncateClasses.lineClamp2}>
                                                    {background.desc && background.desc.length > 100 ? background.desc.substring(0, 100) + "..." : background.desc || "Background especializado com características únicas."}
                                                </p>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Detalhes do Background Selecionado */}
                            {selectedBackground && (
                                <div className="mt-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Button 
                                            variant="ghost"
                                            onClick={() => setSelectedBackground(null)}
                                            className="text-green-600 hover:text-green-800 flex items-center"
                                        >
                                            &larr; Voltar para backgrounds
                                        </Button>
                                        <h3 className="text-xl font-bold">Background: {selectedBackground.name}</h3>
                                    </div>
                                    
                                    <Card className="p-6 bg-green-50 border border-green-200">
                                        <div className="mb-4">
                                            <h4 className="text-lg font-semibold text-green-800 mb-2">Descrição</h4>
                                            <p className="text-gray-700 text-sm" style={truncateClasses.lineClamp3}>{selectedBackground.desc || "Este background oferece características únicas para seu personagem."}</p>
                                        </div>
                                        
                                        {selectedBackground.starting_proficiencies && selectedBackground.starting_proficiencies.length > 0 && (
                                            <div className="mb-4">
                                                <h4 className="text-lg font-semibold text-green-800 mb-2">Proficiências Iniciais</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedBackground.starting_proficiencies.map((prof, i) => (
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

                                        {selectedBackground.language_options && (
                                            <div className="mb-4">
                                                <h4 className="text-lg font-semibold text-green-800 mb-2">Opções de Idiomas</h4>
                                                <p className="text-gray-700">
                                                    Escolha {selectedBackground.language_options.choose} idioma(s) adicional(is)
                                                </p>
                                            </div>
                                        )}
                                        
                                        {selectedBackground.starting_equipment && selectedBackground.starting_equipment.length > 0 && (
                                            <div className="mb-4">
                                                <h4 className="text-lg font-semibold text-green-800 mb-2">Equipamento Inicial</h4>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    {selectedBackground.starting_equipment.map((item, i) => (
                                                        <li key={i} className="text-gray-700">
                                                            {item.equipment.name} x{item.quantity}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        
                                        {selectedBackground.feature && (
                                            <div className="mb-4">
                                                <h4 className="text-lg font-semibold text-green-800 mb-2">Característica: {selectedBackground.feature.name}</h4>
                                                <div className="text-gray-700 space-y-2">
                                                    {Array.isArray(selectedBackground.feature.desc) ? (
                                                        selectedBackground.feature.desc.map((paragraph, i) => (
                                                            <p key={i}>{paragraph}</p>
                                                        ))
                                                    ) : (
                                                        <p>{selectedBackground.feature.desc}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {selectedBackground.personality_traits && (
                                            <div className="mb-4">
                                                <h4 className="text-lg font-semibold text-green-800 mb-2">Traços de Personalidade</h4>
                                                <p className="text-gray-700 text-sm mb-2">
                                                    Escolha {selectedBackground.personality_traits.choose} traço(s):
                                                </p>
                                                <ul className="list-disc pl-5 space-y-1 max-h-32 overflow-y-auto">
                                                    {selectedBackground.personality_traits.from.options.slice(0, 4).map((trait, i) => (
                                                        <li key={i} className="text-gray-600 text-sm">
                                                            {trait.string}
                                                        </li>
                                                    ))}
                                                    {selectedBackground.personality_traits.from.options.length > 4 && (
                                                        <li className="text-green-600 text-sm">
                                                            +{selectedBackground.personality_traits.from.options.length - 4} opções adicionais
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                    </Card>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Botões de ação */}
                    <div className="flex justify-end gap-4">
                        <Button 
                            variant="outline"
                            onClick={() => {
                                setSelectedClass(null);
                                setSelectedSubclass(null);
                                setSelectedBackground(null);
                            }}
                        >
                            Escolher outra classe
                        </Button>
                        
                        {/* Botão quando tudo está completo */}
                        {selectedBackground && (
                            <Button 
                                variant="default"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => console.log("Seleções completas:", {
                                    class: selectedClass,
                                    subclass: selectedSubclass,
                                    background: selectedBackground
                                })}
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
                <p>Classes carregadas: {apiClasses.length}</p>
                <p>Classe selecionada: {selectedClass ? selectedClass.name : 'Nenhuma'}</p>
                <p>Subclasses disponíveis: {availableSubclasses.length}</p>
                <p>Subclasse selecionada: {selectedSubclass ? selectedSubclass.name : 'Nenhuma'}</p>
                <p>Backgrounds disponíveis: {availableBackgrounds.length}</p>
                <p>Background selecionado: {selectedBackground ? selectedBackground.name : 'Nenhum'}</p>
                <p>Estado de carregamento: {JSON.stringify(isLoading)}</p>
                {selectedClass && (
                    <p>Validação: {(() => {
                        const hasValidSubclass = availableSubclasses.length === 0 || selectedSubclass !== null;
                        const hasValidBackground = selectedBackground !== null;
                        
                        if (!hasValidSubclass && !hasValidBackground) {
                            return availableSubclasses.length > 0 
                                ? '❌ Incompleto (selecione subclasse e background)'
                                : '❌ Incompleto (selecione background)';
                        } else if (!hasValidSubclass) {
                            return '❌ Incompleto (selecione uma subclasse)';
                        } else if (!hasValidBackground) {
                            return '❌ Incompleto (selecione um background)';
                        } else {
                            return availableSubclasses.length === 0 
                                ? '✅ Válido (classe sem subclasses + background)'
                                : '✅ Válido (classe + subclasse + background)';
                        }
                    })()}</p>
                )}
                {!selectedClass && <p>Validação: ❌ Incompleto (selecione uma classe)</p>}
            </div>
        </div>
    );
};

export default ClassesCreation;