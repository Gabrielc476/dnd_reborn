// components/character/creation/steps/Classes.tsx
// ✅ RESTAURADO: Agora usando mockSubclasses e mockBackgrounds
'use client';

import { useState, useEffect } from "react";
import { DndClass, DndSubclass, DndBackground, DndReference } from "@/types/characterCreation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockSubclasses } from "@/data/mockSubClasses"; // ✅ RESTAURADO: Import das subclasses mock
import { mockBackgrounds } from "@/data/mockBackgrounds"; // ✅ RESTAURADO: Import dos backgrounds mock

interface ApiClassesResponse {
    count: number;
    results: DndReference[];
}

interface ClassesCreationProps {
    onValidationChange?: (isValid: boolean) => void;
}

// ===========================
// STORAGE - SIMPLES E DIRETO
// ===========================

const STORAGE_KEYS = {
    SELECTED_CLASS: 'character_creation_class',
    SELECTED_SUBCLASS: 'character_creation_subclass',
    SELECTED_BACKGROUND: 'character_creation_background',
    CLASSES_DATA: 'character_creation_classes_cache',
    SUBCLASSES_DATA: 'character_creation_subclasses_cache',
    BACKGROUNDS_DATA: 'character_creation_backgrounds_cache'
};

// Keys de outros steps
const CROSS_STEP_KEYS = {
    SELECTED_RACE: 'character_creation_race',
    SELECTED_SUBRACE: 'character_creation_subrace'
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

// ===========================
// MOCK DATA - Backgrounds D&D 5e (REMOVIDO - usando import)
// ===========================

// ✅ RESTAURADO: Agora usando mockBackgrounds importado em vez de dados hardcoded

const ClassesCreation = ({ onValidationChange }: ClassesCreationProps) => {
    // ===========================
    // STATES COM STORAGE
    // ===========================
    
    const [selectedClass, setSelectedClass] = useState<DndClass | null>(() => 
        loadFromStorage<DndClass | null>(STORAGE_KEYS.SELECTED_CLASS, null)
    );
    
    const [selectedSubclass, setSelectedSubclass] = useState<DndSubclass | null>(() => 
        loadFromStorage<DndSubclass | null>(STORAGE_KEYS.SELECTED_SUBCLASS, null)
    );
    
    const [selectedBackground, setSelectedBackground] = useState<DndBackground | null>(() => 
        loadFromStorage<DndBackground | null>(STORAGE_KEYS.SELECTED_BACKGROUND, null)
    );
    
    const [apiClasses, setApiClasses] = useState<DndReference[]>(() => 
        loadFromStorage<DndReference[]>(STORAGE_KEYS.CLASSES_DATA, [])
    );

    const [classDetails, setClassDetails] = useState<Record<string, DndClass>>({});
    const [availableSubclasses, setAvailableSubclasses] = useState<DndSubclass[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState({
        classes: false,
        details: false,
        subclasses: false
    });

    // ===========================
    // DADOS DE OUTROS STEPS
    // ===========================
    
    const [crossStepData, setCrossStepData] = useState({
        selectedRace: loadFromStorage(CROSS_STEP_KEYS.SELECTED_RACE, null),
        selectedSubrace: loadFromStorage(CROSS_STEP_KEYS.SELECTED_SUBRACE, null)
    });

    // ===========================
    // STORAGE EFFECTS
    // ===========================

    // Salvar dados selecionados
    useEffect(() => {
        if (selectedClass) {
            saveToStorage(STORAGE_KEYS.SELECTED_CLASS, selectedClass);
        }
    }, [selectedClass]);

    useEffect(() => {
        if (selectedSubclass) {
            saveToStorage(STORAGE_KEYS.SELECTED_SUBCLASS, selectedSubclass);
        }
    }, [selectedSubclass]);

    useEffect(() => {
        if (selectedBackground) {
            saveToStorage(STORAGE_KEYS.SELECTED_BACKGROUND, selectedBackground);
        }
    }, [selectedBackground]);

    // Salvar cache de dados da API
    useEffect(() => {
        if (apiClasses.length > 0) {
            saveToStorage(STORAGE_KEYS.CLASSES_DATA, apiClasses);
        }
    }, [apiClasses]);

    // Validação
    useEffect(() => {
        const isValid = !!selectedClass && !!selectedBackground;
        onValidationChange?.(isValid);
    }, [selectedClass, selectedBackground, onValidationChange]);

    // Atualizar dados de outros steps
    useEffect(() => {
        const interval = setInterval(() => {
            const newRace = loadFromStorage(CROSS_STEP_KEYS.SELECTED_RACE, null);
            const newSubrace = loadFromStorage(CROSS_STEP_KEYS.SELECTED_SUBRACE, null);

            setCrossStepData(prev => {
                const hasChanges = 
                    JSON.stringify(prev.selectedRace) !== JSON.stringify(newRace) ||
                    JSON.stringify(prev.selectedSubrace) !== JSON.stringify(newSubrace);

                if (hasChanges) {
                    console.log('🔄 Dados de raça atualizados no step de classes');
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

    // ===========================
    // API FUNCTIONS
    // ===========================

    const pullClasses = async () => {
        if (apiClasses.length > 0) {
            console.log('📦 Usando classes do cache');
            return;
        }

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
            console.error("Erro ao requisitar classes:", err);
        } finally {
            setIsLoading(prev => ({ ...prev, classes: false }));
        }
    };

    const pullClassDetails = async (classIndex: string) => {
        if (classDetails[classIndex]) {
            console.log(`📦 Usando detalhes da classe ${classIndex} do cache`);
            return classDetails[classIndex];
        }

        setIsLoading(prev => ({ ...prev, details: true }));
        
        try {
            const response = await fetch(`https://www.dnd5eapi.co/api/classes/${classIndex}`);
            
            if (!response.ok) {
                throw new Error(`Falha na requisição: Status ${response.status}`);
            }
            
            const classData: DndClass = await response.json();
            
            setClassDetails(prev => ({
                ...prev,
                [classIndex]: classData
            }));
            
            return classData;
        } catch (err) {
            console.error(`Erro ao carregar detalhes da classe ${classIndex}:`, err);
            return null;
        } finally {
            setIsLoading(prev => ({ ...prev, details: false }));
        }
    };

    const pullSubclasses = async (classIndex: string) => {
        setIsLoading(prev => ({ ...prev, subclasses: true }));
        
        try {
            // ✅ RESTAURADO: Usar dados mock em vez da API
            const subclassesForClass = mockSubclasses.filter(subclass => 
                subclass.class.index === classIndex
            );
            setAvailableSubclasses(subclassesForClass);
            
            console.log(`📦 Carregadas ${subclassesForClass.length} subclasses para ${classIndex} dos dados mock`);
        } catch (err) {
            console.error(`Erro ao carregar subclasses da classe ${classIndex}:`, err);
            setAvailableSubclasses([]);
        } finally {
            setIsLoading(prev => ({ ...prev, subclasses: false }));
        }
    };

    // ===========================
    // HANDLERS
    // ===========================

    const handleClassSelection = async (classRef: DndReference) => {
        console.log("🎯 Selecionando classe:", classRef.name);
        
        const classData = await pullClassDetails(classRef.index);
        
        if (classData) {
            setSelectedClass(classData);
            setSelectedSubclass(null); // Reset subclasse ao mudar classe
            
            // Carregar subclasses disponíveis
            await pullSubclasses(classRef.index);
            
            console.log(`✅ Classe ${classRef.name} selecionada com sucesso`);
        }
    };

    const handleSubclassSelection = (subclass: DndSubclass) => {
        console.log("🎯 Selecionando subclasse:", subclass.name);
        
        // ✅ RESTAURADO: Usar o objeto completo dos dados mock
        setSelectedSubclass(subclass);
        console.log(`✅ Subclasse ${subclass.name} selecionada com sucesso`);
    };

    const handleBackgroundSelection = (background: DndBackground) => {
        console.log("🎯 Selecionando background:", background.name);
        console.log("📋 Dados do background:", background); // Debug para verificar estrutura
        setSelectedBackground(background);
        console.log(`✅ Background ${background.name} selecionado com sucesso`);
    };

    // ===========================
    // CLEAR STORAGE
    // ===========================

    const clearStorageData = () => {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        
        setSelectedClass(null);
        setSelectedSubclass(null);
        setSelectedBackground(null);
        setApiClasses([]);
        setClassDetails({});
        setAvailableSubclasses([]);
        
        console.log('🧹 Dados de classes limpos do storage');
        console.log('📋 Dados mock ainda disponíveis:', {
            subclasses: mockSubclasses.length,
            backgrounds: mockBackgrounds.length
        });
    };

    // ===========================
    // INITIALIZE
    // ===========================

    useEffect(() => {
        pullClasses();
    }, []);

    // Se tem classe selecionada mas não tem subclasses carregadas, carregar
    useEffect(() => {
        if (selectedClass && availableSubclasses.length === 0) {
            pullSubclasses(selectedClass.index);
        }
    }, [selectedClass]);

    // ===========================
    // RENDER
    // ===========================

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 p-6">
                <Card className="p-6 bg-slate-800/80 border-slate-700">
                    <div className="text-center text-red-400">
                        <h3 className="font-bold mb-2 text-white">Erro ao carregar classes</h3>
                        <p className="mb-4">{error}</p>
                        <Button
                            onClick={pullClasses}
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
                        <h4 className="font-bold text-sm mb-2 text-slate-200">Debug - Classes Storage (Usando Dados Mock):</h4>
                        <div className="text-xs space-y-1 text-slate-400">
                            <p>Classe: {selectedClass?.name || 'Não selecionada'}</p>
                            <p>Subclasse: {selectedSubclass?.name || 'Não selecionada'}</p>
                            <p>Background: {selectedBackground?.name || 'Não selecionado'}</p>
                            <p>Raça (de outro step): {crossStepData.selectedRace?.name || 'N/A'}</p>
                            <p>Cache de classes: {apiClasses.length} itens</p>
                            <p>Subclasses disponíveis: {availableSubclasses.length} (mock data)</p>
                            <p>Backgrounds disponíveis: {mockBackgrounds.length} (mock data)</p>
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

                {/* Context Info */}
                {crossStepData.selectedRace && (
                    <Card className="p-4 bg-green-500/10 border-green-500/30">
                        <h4 className="font-semibold mb-2 text-green-300">Raça Selecionada (do step anterior)</h4>
                        <p className="text-sm text-slate-300">
                            <strong>{crossStepData.selectedRace.name}</strong>
                            {crossStepData.selectedSubrace && (
                                <span> - {crossStepData.selectedSubrace.name}</span>
                            )}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            Algumas combinações de raça e classe podem ter sinergias especiais!
                        </p>
                    </Card>
                )}

                {/* Seleção de Classe */}
                <Card className="p-6 bg-slate-800/80 border-slate-700">
                    <h3 className="text-lg font-bold mb-4 text-white">Escolha uma Classe</h3>
                    
                    {isLoading.classes ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                            <p className="text-slate-400">Carregando classes...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {apiClasses.map((classRef) => (
                                <button
                                    key={classRef.index}
                                    onClick={() => handleClassSelection(classRef)}
                                    className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                                        selectedClass?.index === classRef.index
                                            ? 'border-blue-400 bg-blue-500/20 text-blue-300'
                                            : 'border-slate-600 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-700 text-slate-300'
                                    }`}
                                    disabled={isLoading.details}
                                >
                                    <h4 className="font-semibold capitalize">{classRef.name}</h4>
                                    {selectedClass?.index === classRef.index && (
                                        <div className="mt-2 text-xs text-blue-400">
                                            ✓ Selecionada
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Detalhes da Classe */}
                {selectedClass && (
                    <Card className="p-6 bg-slate-800/80 border-slate-700">
                        <h3 className="text-lg font-bold mb-4 text-white">Detalhes: {selectedClass.name}</h3>
                        
                        <div className="space-y-4">
                            {/* Hit Die */}
                            {selectedClass.hit_die && (
                                <div>
                                    <h4 className="font-semibold mb-2 text-slate-200">Dado de Vida</h4>
                                    <p className="text-slate-300">d{selectedClass.hit_die}</p>
                                </div>
                            )}

                            {/* Proficiências */}
                            {selectedClass.proficiencies && selectedClass.proficiencies.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2 text-slate-200">Proficiências</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedClass.proficiencies.map((prof, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-sm border border-blue-500/30"
                                            >
                                                {prof.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Saving Throws */}
                            {selectedClass.saving_throws && selectedClass.saving_throws.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2 text-slate-200">Testes de Resistência</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedClass.saving_throws.map((save) => (
                                            <span
                                                key={save.index}
                                                className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-sm border border-green-500/30"
                                            >
                                                {save.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Spellcasting */}
                            {selectedClass.spellcasting && (
                                <div>
                                    <h4 className="font-semibold mb-2 text-slate-200">Conjuração</h4>
                                    <p className="text-slate-300">
                                        Esta classe pode conjurar magias usando {selectedClass.spellcasting.spellcasting_ability?.name}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                )}

                {/* Seleção de Subclasse */}
                {selectedClass && availableSubclasses.length > 0 && (
                    <Card className="p-6 bg-slate-800/80 border-slate-700">
                        <h3 className="text-lg font-bold mb-4 text-white">Escolha uma Subclasse</h3>
                        
                        {isLoading.subclasses ? (
                            <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 mx-auto mb-2"></div>
                                <p className="text-slate-400">Carregando subclasses...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {availableSubclasses.map((subclass) => (
                                    <button
                                        key={subclass.index}
                                        onClick={() => handleSubclassSelection(subclass)}
                                        className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                                            selectedSubclass?.index === subclass.index
                                                ? 'border-purple-400 bg-purple-500/20 text-purple-300'
                                                : 'border-slate-600 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-700 text-slate-300'
                                        }`}
                                    >
                                        <h4 className="font-semibold">{subclass.name}</h4>
                                        
                                        {/* Descrição da subclasse se disponível */}
                                        {subclass.desc && subclass.desc.length > 0 && (
                                            <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                                                {Array.isArray(subclass.desc) ? subclass.desc[0] : subclass.desc}
                                            </p>
                                        )}
                                        
                                        {selectedSubclass?.index === subclass.index && (
                                            <div className="mt-2 text-xs text-purple-400">
                                                ✓ Selecionada
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </Card>
                )}

                {/* Seleção de Background */}
                <Card className="p-6 bg-slate-800/80 border-slate-700">
                    <h3 className="text-lg font-bold mb-4 text-white">Escolha um Background</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mockBackgrounds.map((background) => (
                            <button
                                key={background.index}
                                onClick={() => handleBackgroundSelection(background)}
                                className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                                    selectedBackground?.index === background.index
                                        ? 'border-orange-400 bg-orange-500/20 text-orange-300'
                                        : 'border-slate-600 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-700 text-slate-300'
                                }`}
                            >
                                <h4 className="font-semibold">{background.name}</h4>
                                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{background.desc}</p>
                                
                                {/* Skills do background */}
                                <div className="mt-2">
                                    <div className="flex flex-wrap gap-1">
                                        {background.starting_proficiencies?.map((prof, index) => (
                                            <span
                                                key={index}
                                                className="px-1 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs border border-orange-500/30"
                                            >
                                                {prof.name}
                                            </span>
                                        )) || (
                                            <span className="text-xs text-slate-500">Sem proficiências</span>
                                        )}
                                    </div>
                                </div>
                                
                                {selectedBackground?.index === background.index && (
                                    <div className="mt-2 text-xs text-orange-400">
                                        ✓ Selecionado
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Background Selecionado - Detalhes */}
                {selectedBackground && (
                    <Card className="p-6 bg-slate-800/80 border-slate-700">
                        <h3 className="text-lg font-bold mb-4 text-white">Background: {selectedBackground.name}</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2 text-slate-200">Descrição</h4>
                                <p className="text-slate-300">{selectedBackground.desc}</p>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2 text-slate-200">Proficiências em Perícias</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedBackground.starting_proficiencies?.map((prof, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded text-sm border border-orange-500/30"
                                        >
                                            {prof.name}
                                        </span>
                                    )) || (
                                        <span className="text-slate-500">Nenhuma proficiência específica</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2 text-slate-200">Característica: {selectedBackground.feature.name}</h4>
                                <div className="text-slate-300">
                                    {Array.isArray(selectedBackground.feature.desc) 
                                        ? selectedBackground.feature.desc.map((paragraph, index) => (
                                            <p key={index} className="mb-2">{paragraph}</p>
                                          ))
                                        : <p>{selectedBackground.feature.desc}</p>
                                    }
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2 text-slate-200">Equipamento Inicial</h4>
                                <ul className="list-disc list-inside text-slate-300 space-y-1">
                                    {selectedBackground.starting_equipment?.map((equipment, index) => (
                                        <li key={index}>
                                            {typeof equipment === 'string' 
                                                ? equipment 
                                                : `${equipment.quantity}x ${equipment.equipment.name}`
                                            }
                                        </li>
                                    )) || (
                                        <li className="text-slate-500">Equipamento não especificado</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default ClassesCreation;