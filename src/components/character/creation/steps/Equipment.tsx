// components/character/creation/steps/Equipment.tsx
'use client';

import { useState, useEffect, useMemo, Fragment } from "react";
import { 
    
    
    Collapsible, CollapsibleContent 
} from "@/components/ui/collapsible";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import { 
    Search, Shield, Heart, Package, Filter, Plus, Minus, 
    ChevronUp, ChevronDown, Loader2, Sword, Shield as ShieldIcon,
    Backpack, Info, Star, Weight, Coins, ArrowUpDown, ShoppingCart,
    Gift, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RefreshCw
} from "lucide-react";
import type { DndClass, DndBackground, DndRace } from "@/types/characterCreation";

interface EquipmentProps {
    onValidationChange?: (isValid: boolean) => void;
}

// ===========================
// TIPOS E CONSTANTES
// ===========================
interface Equipment {
    index: string;
    name: string;
    equipment_category: { index: string; name: string; url: string };
    cost?: { quantity: number; unit: string };
    weight?: number;
    desc?: string[];
    armor_class?: { base: number; dex_bonus?: boolean; max_bonus?: number };
    armor_category?: string;
    damage?: { damage_dice: string; damage_type: { index: string; name: string } };
    weapon_category?: string;
    weapon_range?: string;
    properties?: Array<{ index: string; name: string; url: string }>;
    url: string;
}

interface SelectedEquipment {
    equipment: Equipment;
    quantity: number;
    source: 'starting' | 'purchased';
}

interface StartingEquipmentChoice {
    desc: string;
    choose: number;
    type: string;
    from: {
        option_set_type: string;
        equipment_category?: { index: string; name: string };
        options?: Array<{
            option_type: string;
            count?: number;
            of?: { index: string; name: string; url: string };
            choice?: { desc: string; choose: number; type: string; from: any };
        }>;
    };
}

interface StartingEquipment {
    equipment: Array<{ equipment: { index: string; name: string; url: string }; quantity: number }>;
    starting_equipment_options: StartingEquipmentChoice[];
}

type SortField = 'name' | 'category' | 'cost' | 'weight' | 'ac' | 'damage';
type SortDirection = 'asc' | 'desc';
type EquipmentMode = 'starting' | 'purchase';

const STORAGE_KEYS = {
    SELECTED_EQUIPMENT: 'character_creation_selected_equipment',
    EQUIPMENT_CACHE: 'character_creation_equipment_cache_v3',
    EQUIPMENT_SEARCH: 'character_creation_equipment_search',
    EQUIPMENT_MODE: 'character_creation_equipment_mode',
    STARTING_CHOICES: 'character_creation_starting_choices',
    CURRENT_GOLD: 'character_creation_current_gold'
};

const TEXT = {
    ARMOR_CLASS: "Classe de Armadura",
    HIT_POINTS: "Pontos de Vida",
    EQUIPMENT_METHOD: "Método de Obtenção de Equipamentos",
    INITIAL_EQUIPMENT: "Equipamento Inicial",
    INITIAL_DESC: "Equipamentos padrão baseados na sua classe",
    PURCHASE_EQUIPMENT: "Comprar Equipamentos",
    PURCHASE_DESC: "Use ouro inicial para comprar o que quiser",
    GOLD_ROLL: "Rolar Novamente",
    CHARACTER_DATA: "Dados do Personagem",
    RACE: "Raça",
    CLASS: "Classe",
    BACKGROUND: "Background",
    PROFICIENCIES: "Proficiências",
    SELECTED_EQUIPMENT: "Equipamentos Selecionados",
    SHOP_TITLE: "Loja de Equipamentos",
    SEARCH_PLACEHOLDER: "Buscar equipamentos...",
    PROFICIENCY_FILTER: "Apenas Proficientes",
    NO_EQUIPMENT: "Nenhum equipamento encontrado",
    NO_EQUIPMENT_DESC: "Tente ajustar os filtros ou o termo de busca.",
    FIXED_EQUIPMENT: "Equipamentos Fixos:",
    CHOOSE_EQUIPMENT: "Escolha:",
    ITEM_DETAILS: "Detalhes",
    PROPERTIES: "Propriedades:",
    DESCRIPTION: "Descrição:",
    ADD: "Adicionar",
    BUY: "Comprar",
    NO_GOLD: "Sem Gold",
    SELECTED: "Selecionado",
    QUANTITY: "Quantidade:",
    PROFICIENT: "Proficiente",
    INITIAL: "Inicial",
    PURCHASED: "Comprado",
    LOADING_EQUIPMENT: "Carregando equipamentos...",
    LOADING_STARTING: "Carregando equipamento inicial...",
    ERROR_LOADING: "Erro ao carregar equipamentos",
    RETRY: "Tentar Novamente",
    GOLD_FORMULA: "Ouro Inicial:",
    AVERAGE: "Média:",
    CURRENT: "Atual:",
    NESTED_CHOICE_WARNING: "Escolhas aninhadas requerem seleção adicional"
};

const BASE_API_URL = "https://www.dnd5eapi.co/api";
const BASE_HP = 8;

// ===========================
// FUNÇÕES UTILITÁRIAS
// ===========================
const saveToStorage = (key: string, data: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Erro ao salvar no storage:', { key, error });
    }
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Erro ao carregar do storage:', { key, error });
        return defaultValue;
    }
};

const getConsolidatedCharacterData = () => {
    try {
        return {
            selectedRace: JSON.parse(localStorage.getItem('character_creation_race') || 'null'),
            selectedClass: JSON.parse(localStorage.getItem('character_creation_class') || 'null'),
            selectedBackground: JSON.parse(localStorage.getItem('character_creation_background') || 'null'),
            finalAbilityScores: JSON.parse(localStorage.getItem('character_creation_final_ability_scores') || '{}')
        };
    } catch (error) {
        console.error('Erro ao buscar dados consolidados:', error);
        return null;
    }
};

const calculateModifier = (score: number) => Math.floor((score - 10) / 2);
const calculateBaseArmorClass = (dexScore: number) => 10 + calculateModifier(dexScore);
const calculateHitPoints = (classData: DndClass | null, conScore: number) => 
    (classData?.hit_die || BASE_HP) + calculateModifier(conScore);

const getEquipmentProficiencies = (
    classData: DndClass | null, 
    backgroundData: DndBackground | null, 
    raceData: DndRace | null
) => {
    const proficiencies = new Set<string>();
    
    [classData, backgroundData, raceData].forEach(data => {
        data?.proficiencies?.forEach(prof => proficiencies.add(prof.index));
        data?.starting_proficiencies?.forEach(prof => proficiencies.add(prof.index));
    });
    
    return Array.from(proficiencies);
};

const isProficientWith = (equipment: Equipment, proficiencies: string[]) => {
    if (proficiencies.includes(equipment.index) || 
        proficiencies.includes(equipment.equipment_category.index)) return true;
    
    if (equipment.armor_category) {
        const armorTypes = [
            `${equipment.armor_category.toLowerCase()}-armor`,
            'all-armor',
            'armor'
        ];
        if (armorTypes.some(prof => proficiencies.includes(prof))) return true;
    }
    
    if (equipment.weapon_category) {
        const weaponTypes = [
            `${equipment.weapon_category.toLowerCase()}-weapons`,
            'all-weapons',
            'weapon'
        ];
        if (weaponTypes.some(prof => proficiencies.includes(prof))) return true;
    }
    
    return equipment.index === 'shield' && proficiencies.includes('shields');
};

const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'armor': return <ShieldIcon className="h-4 w-4" />;
        case 'weapon': return <Sword className="h-4 w-4" />;
        default: return <Backpack className="h-4 w-4" />;
    }
};

const rollDice = (sides: number, count = 1) => {
    let total = 0;
    for (let i = 0; i < count; i++) total += Math.floor(Math.random() * sides) + 1;
    return total;
};

const getStartingWealth = (classIndex: string) => {
    const wealthTable = {
        barbarian: { formula: '2d4 × 10', average: 50 },
        druid: { formula: '2d4 × 10', average: 50 },
        monk: { formula: '5d4', average: 12.5 },
        sorcerer: { formula: '3d4 × 10', average: 75 },
        rogue: { formula: '4d4 × 10', average: 100 },
        warlock: { formula: '4d4 × 10', average: 100 },
        wizard: { formula: '4d4 × 10', average: 100 },
        default: { formula: '5d4 × 10', average: 125 }
    };
    return wealthTable[classIndex as keyof typeof wealthTable] || wealthTable.default;
};

const rollStartingGold = (classIndex: string) => {
    const wealth = getStartingWealth(classIndex);
    const match = wealth.formula.match(/(\d+)d(\d+)\s*\×\s*(\d+)/i) || wealth.formula.match(/(\d+)d(\d+)/i);
    if (!match) return wealth.average;
    
    const diceCount = parseInt(match[1], 10);
    const diceSides = parseInt(match[2], 10);
    const multiplier = match[3] ? parseInt(match[3], 10) : 1;
    
    return rollDice(diceSides, diceCount) * multiplier;
};

const convertCostToGold = (cost: { quantity: number; unit: string }) => {
    const rates: Record<string, number> = {
        cp: 0.01,
        sp: 0.1,
        ep: 0.5,
        gp: 1,
        pp: 10
    };
    return cost.quantity * (rates[cost.unit.toLowerCase()] || 1);
};

// ===========================
// COMPONENTES AUXILIARES
// ===========================
const SortIcon = ({ field, currentField, direction }: { 
    field: SortField; 
    currentField: SortField; 
    direction: SortDirection 
}) => {
    if (field !== currentField) return <ArrowUpDown className="h-3 w-3 text-slate-500" />;
    return direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
};

const DiceIcon = ({ value }: { value: number }) => {
    const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
    const Icon = icons[Math.min(value - 1, 5)] || Dice6;
    return <Icon className="h-4 w-4" />;
};

// ===========================
// COMPONENTE PRINCIPAL
// ===========================
const EquipmentComponent = ({ onValidationChange }: EquipmentProps) => {
    // Estados
    const [selectedEquipment, setSelectedEquipment] = useState<SelectedEquipment[]>(() => 
        loadFromStorage(STORAGE_KEYS.SELECTED_EQUIPMENT, []));
    const [equipmentList, setEquipmentList] = useState<Equipment[]>(() => 
        loadFromStorage(STORAGE_KEYS.EQUIPMENT_CACHE, []));
    const [searchTerm, setSearchTerm] = useState(() => 
        loadFromStorage(STORAGE_KEYS.EQUIPMENT_SEARCH, ''));
    const [equipmentMode, setEquipmentMode] = useState<EquipmentMode>(() => 
        loadFromStorage(STORAGE_KEYS.EQUIPMENT_MODE, 'starting'));
    const [startingEquipment, setStartingEquipment] = useState<StartingEquipment | null>(null);
    const [startingChoices, setStartingChoices] = useState(() => 
        loadFromStorage(STORAGE_KEYS.STARTING_CHOICES, {}));
    const [currentGold, setCurrentGold] = useState(() => 
        loadFromStorage(STORAGE_KEYS.CURRENT_GOLD, 0));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showOnlyProficient, setShowOnlyProficient] = useState(false);
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingStartingEquipment, setLoadingStartingEquipment] = useState(false);
    
    // Dados do personagem
    const characterData = useMemo(getConsolidatedCharacterData, []);
    const { selectedRace, selectedClass, selectedBackground, finalAbilityScores } = characterData || {};
    const dexScore = finalAbilityScores?.dexterity || 10;
    const conScore = finalAbilityScores?.constitution || 10;
    
    // Valores calculados
    const baseArmorClass = useMemo(() => calculateBaseArmorClass(dexScore), [dexScore]);
    const hitPoints = useMemo(() => calculateHitPoints(selectedClass, conScore), [selectedClass, conScore]);
    const proficiencies = useMemo(() => 
        getEquipmentProficiencies(selectedClass, selectedBackground, selectedRace),
        [selectedClass, selectedBackground, selectedRace]
    );
    
    // Categorias de equipamentos
    const categories = useMemo(() => [
        { value: 'all', label: 'Todos', icon: <Package className="h-4 w-4" /> },
        { value: 'armor', label: 'Armaduras', icon: <ShieldIcon className="h-4 w-4" /> },
        { value: 'weapon', label: 'Armas', icon: <Sword className="h-4 w-4" /> },
        { value: 'adventuring-gear', label: 'Equipamentos', icon: <Backpack className="h-4 w-4" /> },
        { value: 'tools', label: 'Ferramentas', icon: <Package className="h-4 w-4" /> }
    ], []);

    // CA total
    const totalArmorClass = useMemo(() => {
        const armorItem = selectedEquipment.find(item => 
            item.equipment.equipment_category?.index === 'armor' && item.equipment.armor_class);
        
        if (!armorItem?.equipment.armor_class) return baseArmorClass;
        
        const armorAC = armorItem.equipment.armor_class.base;
        const dexModifier = calculateModifier(dexScore);
        
        if (!armorItem.equipment.armor_class.dex_bonus) return armorAC;
        
        const maxBonus = armorItem.equipment.armor_class.max_bonus;
        return armorAC + (maxBonus !== undefined ? 
            Math.min(dexModifier, maxBonus) : dexModifier);
    }, [selectedEquipment, dexScore, baseArmorClass]);

    // Effects
    useEffect(() => {
        const fetchAllEquipment = async () => {
            if (equipmentList.length > 0) return;
            
            setIsLoading(true);
            setError(null);
            setLoadingProgress(0);
            
            try {
                const response = await fetch(`${BASE_API_URL}/equipment`);
                if (!response.ok) throw new Error('Falha ao buscar lista de equipamentos');
                
                const data = await response.json();
                const equipmentIndexes = data.results.map((eq: any) => eq.index);
                setLoadingProgress(10);
                
                const equipmentPromises = equipmentIndexes.map(async (index: string, i: number) => {
                    try {
                        const response = await fetch(`${BASE_API_URL}/equipment/${index}`);
                        setLoadingProgress(10 + Math.round(((i + 1) / equipmentIndexes.length) * 90));
                        return response.ok ? response.json() : null;
                    } catch {
                        return null;
                    }
                });
                
                const equipments = await Promise.all(equipmentPromises);
                const validEquipments = equipments.filter(Boolean) as Equipment[];
                
                if (validEquipments.length > 0) {
                    setEquipmentList(validEquipments);
                    saveToStorage(STORAGE_KEYS.EQUIPMENT_CACHE, validEquipments);
                } else {
                    setError(TEXT.ERROR_LOADING);
                }
            } catch (error) {
                setError(`${TEXT.ERROR_LOADING}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchAllEquipment();
    }, [equipmentList.length]);

    useEffect(() => {
        const fetchStartingEquipment = async () => {
            if (!selectedClass?.index || equipmentMode !== 'starting') return;

            setLoadingStartingEquipment(true);
            setError(null);
            
            try {
                const response = await fetch(`${BASE_API_URL}/classes/${selectedClass.index}/starting-equipment`);
                if (!response.ok) throw new Error('Erro ao carregar equipamento inicial');
                
                const data = await response.json();
                setStartingEquipment({
                    equipment: Array.isArray(data.starting_equipment) ? data.starting_equipment : [],
                    starting_equipment_options: Array.isArray(data.starting_equipment_options) 
                        ? data.starting_equipment_options 
                        : []
                });
            } catch (error) {
                setError('Erro ao conectar com a API para equipamento inicial');
                setStartingEquipment(null);
            } finally {
                setLoadingStartingEquipment(false);
            }
        };
        
        fetchStartingEquipment();
    }, [selectedClass?.index, equipmentMode]);

    useEffect(() => {
        if (equipmentMode === 'purchase' && currentGold === 0 && selectedClass?.index) {
            const initialGold = rollStartingGold(selectedClass.index);
            setCurrentGold(initialGold);
            saveToStorage(STORAGE_KEYS.CURRENT_GOLD, initialGold);
        }
    }, [equipmentMode, currentGold, selectedClass?.index]);

    // Persistência
    useEffect(() => saveToStorage(STORAGE_KEYS.SELECTED_EQUIPMENT, selectedEquipment), [selectedEquipment]);
    useEffect(() => saveToStorage(STORAGE_KEYS.EQUIPMENT_SEARCH, searchTerm), [searchTerm]);
    useEffect(() => saveToStorage(STORAGE_KEYS.EQUIPMENT_MODE, equipmentMode), [equipmentMode]);
    useEffect(() => saveToStorage(STORAGE_KEYS.STARTING_CHOICES, startingChoices), [startingChoices]);
    useEffect(() => saveToStorage(STORAGE_KEYS.CURRENT_GOLD, currentGold), [currentGold]);
    useEffect(() => onValidationChange?.(selectedEquipment.length > 0), [selectedEquipment, onValidationChange]);

    // Handlers
    const handleEquipmentAdd = (equipment: Equipment, source: 'starting' | 'purchased' = 'purchased') => {
        if (source === 'purchased') {
            const cost = equipment.cost ? convertCostToGold(equipment.cost) : 0;
            if (cost > currentGold) return;
            setCurrentGold(prev => prev - cost);
        }
        
        setSelectedEquipment(prev => {
            const existingIndex = prev.findIndex(item => item.equipment.index === equipment.index);
            if (existingIndex >= 0) {
                const newItems = [...prev];
                newItems[existingIndex] = {
                    ...newItems[existingIndex],
                    quantity: newItems[existingIndex].quantity + 1
                };
                return newItems;
            }
            return [...prev, { equipment, quantity: 1, source }];
        });
    };

    const handleEquipmentRemove = (equipmentIndex: string) => {
        setSelectedEquipment(prev => {
            const existingIndex = prev.findIndex(item => item.equipment.index === equipmentIndex);
            if (existingIndex < 0) return prev;
            
            const existing = prev[existingIndex];
            if (existing.source === 'purchased' && existing.equipment.cost) {
                setCurrentGold(prev => prev + convertCostToGold(existing.equipment.cost));
            }
            
            return existing.quantity > 1
                ? prev.map((item, i) => 
                    i === existingIndex ? { ...item, quantity: item.quantity - 1 } : item)
                : prev.filter((_, i) => i !== existingIndex);
        });
    };

    const handleModeChange = (mode: EquipmentMode) => {
        setEquipmentMode(mode);
        setSelectedEquipment([]);
        if (mode === 'purchase' && selectedClass?.index) {
            setCurrentGold(rollStartingGold(selectedClass.index));
        }
    };

    const handleRerollGold = () => {
        if (selectedClass?.index) {
            setCurrentGold(rollStartingGold(selectedClass.index));
            setSelectedEquipment(prev => prev.filter(item => item.source === 'starting'));
        }
    };

    const handleSort = (field: SortField) => {
        setSortField(prev => field === prev ? prev : field);
        setSortDirection(prev => field === sortField ? (prev === 'asc' ? 'desc' : 'asc') : 'asc');
    };

    const toggleDescription = (equipmentIndex: string) => {
        setExpandedDescriptions(prev => {
            const newSet = new Set(prev);
            newSet.has(equipmentIndex) ? newSet.delete(equipmentIndex) : newSet.add(equipmentIndex);
            return newSet;
        });
    };

   const handleStartingEquipmentChoice = async (choiceIndex: number, optionIndex: number) => {
    if (!startingEquipment?.starting_equipment_options?.[choiceIndex]) return;
    const option = startingEquipment.starting_equipment_options[choiceIndex]?.from?.options?.[optionIndex];
    if (!option) return;

    if (option.of) {
        try {
            // Corrigido: não usar BASE_API_URL pois option.of.url já é completo
            const response = await fetch(`https://www.dnd5eapi.co${option.of.url}`);
            
            if (!response.ok) {
                // Mensagem mais informativa
                throw new Error(`Falha ao buscar item (${response.status}): ${option.of.name}`);
            }
            
            const equipmentData = await response.json();
            const quantity = option.count || 1;
            
            for (let i = 0; i < quantity; i++) {
                handleEquipmentAdd(equipmentData, 'starting');
            }
            
            setStartingChoices(prev => ({
                ...prev,
                [choiceIndex]: optionIndex
            }));
        } catch (error) {
            console.error('Erro ao buscar equipamento:', error);
            // Atualiza o estado de erro para mostrar na UI
            setError(`Erro ao carregar o item: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    } else if (option.choice) {
        setStartingChoices(prev => ({
            ...prev,
            [choiceIndex]: optionIndex
        }));
        // Melhor feedback para o usuário
        setError(TEXT.NESTED_CHOICE_WARNING);
    }
};

    // Equipamentos filtrados e ordenados
    const filteredAndSortedEquipment = useMemo(() => {
        return equipmentList
            .filter(equipment => {
                const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesCategory = selectedCategory === 'all' || equipment.equipment_category?.index === selectedCategory;
                const matchesProficiency = !showOnlyProficient || isProficientWith(equipment, proficiencies);
                return matchesSearch && matchesCategory && matchesProficiency;
            })
            .sort((a, b) => {
                const getValue = (eq: Equipment, field: SortField): any => {
                    switch (field) {
                        case 'name': return eq.name;
                        case 'category': return eq.equipment_category?.name || '';
                        case 'cost': return eq.cost ? convertCostToGold(eq.cost) : 0;
                        case 'weight': return eq.weight || 0;
                        case 'ac': return eq.armor_class?.base || 0;
                        case 'damage': return eq.damage?.damage_dice || '';
                        default: return eq.name;
                    }
                };
                
                const aValue = getValue(a, sortField);
                const bValue = getValue(b, sortField);
                const direction = sortDirection === 'asc' ? 1 : -1;
                
                return typeof aValue === 'string' 
                    ? direction * aValue.localeCompare(bValue)
                    : direction * (aValue - bValue);
            });
    }, [equipmentList, searchTerm, selectedCategory, showOnlyProficient, proficiencies, sortField, sortDirection]);

    // Renderização
    return (
        <div className="min-h-screen bg-slate-900 p-6">
            <div className="space-y-8">
                {/* Estatísticas do Personagem */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/20">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                                    <Shield className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-blue-300">{TEXT.ARMOR_CLASS}</p>
                                    <p className="text-3xl font-bold text-blue-100">{totalArmorClass}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-600/20">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-500 rounded-xl shadow-lg">
                                    <Heart className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-red-300">{TEXT.HIT_POINTS}</p>
                                    <p className="text-3xl font-bold text-red-100">{hitPoints}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Seleção de Modo */}
                <Card className="border-purple-500/30 bg-slate-800/80">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-300">
                            <Package className="h-5 w-5" />
                            {TEXT.EQUIPMENT_METHOD}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card 
                                className={`cursor-pointer transition-all ${
                                    equipmentMode === 'starting' 
                                        ? 'border-green-400 bg-green-500/20 shadow-md' 
                                        : 'border-slate-600 hover:border-green-400/50 bg-slate-700/50'
                                }`}
                                onClick={() => handleModeChange('starting')}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl shadow-lg ${equipmentMode === 'starting' ? 'bg-green-500' : 'bg-slate-600'}`}>
                                            <Gift className="h-8 w-8 text-white" />
                                        </div>
                                        <div>
                                            <h3 className={`text-lg font-bold ${equipmentMode === 'starting' ? 'text-green-300' : 'text-slate-300'}`}>
                                                {TEXT.INITIAL_EQUIPMENT}
                                            </h3>
                                            <p className="text-sm text-slate-400">{TEXT.INITIAL_DESC}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card 
                                className={`cursor-pointer transition-all ${
                                    equipmentMode === 'purchase' 
                                        ? 'border-yellow-400 bg-yellow-500/20 shadow-md' 
                                        : 'border-slate-600 hover:border-yellow-400/50 bg-slate-700/50'
                                }`}
                                onClick={() => handleModeChange('purchase')}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl shadow-lg ${equipmentMode === 'purchase' ? 'bg-yellow-500' : 'bg-slate-600'}`}>
                                            <ShoppingCart className="h-8 w-8 text-white" />
                                        </div>
                                        <div>
                                            <h3 className={`text-lg font-bold ${equipmentMode === 'purchase' ? 'text-yellow-300' : 'text-slate-300'}`}>
                                                {TEXT.PURCHASE_EQUIPMENT}
                                            </h3>
                                            <p className="text-sm text-slate-400">{TEXT.PURCHASE_DESC}</p>
                                            {equipmentMode === 'purchase' && selectedClass && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Coins className="h-4 w-4 text-yellow-400" />
                                                    <span className="text-lg font-bold text-yellow-300">
                                                        {currentGold} GO
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRerollGold();
                                                        }}
                                                        className="ml-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                                                    >
                                                        <RefreshCw className="h-3 w-3 mr-1" />
                                                        {TEXT.GOLD_ROLL}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        
                        {equipmentMode === 'purchase' && selectedClass && (
                            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <DiceIcon value={4} />
                                    <span className="font-semibold text-yellow-300">
                                        {TEXT.GOLD_FORMULA} {getStartingWealth(selectedClass.index).formula} GO
                                    </span>
                                </div>
                                <p className="text-sm text-yellow-400">
                                    {TEXT.AVERAGE} {getStartingWealth(selectedClass.index).average} GO | 
                                    {TEXT.CURRENT} <strong>{currentGold} GO</strong>
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                
                {/* Equipamento Inicial */}
                {equipmentMode === 'starting' && selectedClass && (
                    <Card className="border-green-500/30 bg-slate-800/80">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-300">
                                <Gift className="h-5 w-5" />
                                {TEXT.INITIAL_EQUIPMENT} {selectedClass?.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingStartingEquipment ? (
                                <div className="text-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-green-400 mx-auto mb-4" />
                                    <p className="text-green-300">{TEXT.LOADING_STARTING}</p>
                                </div>
                            ) : startingEquipment ? (
                                <div className="space-y-6">
                                    {startingEquipment.equipment.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-green-300 mb-3">{TEXT.FIXED_EQUIPMENT}</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {startingEquipment.equipment.map((item, index) => (
                                                    <div key={index} className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium text-green-300">
                                                                    {item.equipment?.name || 'Item desconhecido'}
                                                                </p>
                                                                <p className="text-sm text-green-400">
                                                                    {TEXT.QUANTITY} {item.quantity || 1}
                                                                </p>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                onClick={async () => {
                                                                    if (!item.equipment?.url) return;
                                                                    try {
                                                                        const response = await fetch(`${BASE_API_URL}${item.equipment.url}`);
                                                                        if (response.ok) {
                                                                            const equipmentData = await response.json();
                                                                            for (let i = 0; i < (item.quantity || 1); i++) {
                                                                                handleEquipmentAdd(equipmentData, 'starting');
                                                                            }
                                                                        }
                                                                    } catch (error) {
                                                                        console.error('Erro ao buscar equipamento:', error);
                                                                    }
                                                                }}
                                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                            >
                                                                <Plus className="h-4 w-4 mr-1" />
                                                                {TEXT.ADD}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {startingEquipment.starting_equipment_options.length > 0 && (
                                        startingEquipment.starting_equipment_options.map((choice, choiceIndex) => (
                                            <div key={choiceIndex} className="border border-green-500/30 rounded-lg p-4">
                                                <h4 className="font-semibold text-green-300 mb-3">
                                                    {choice.desc || `${TEXT.CHOOSE_EQUIPMENT} ${choice.choose}`}
                                                </h4>
                                                {choice.from?.options && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {choice.from.options.map((option, optionIndex) => (
                                                            <Card 
                                                                key={optionIndex}
                                                                className={`cursor-pointer transition-all ${
                                                                    startingChoices[choiceIndex] === optionIndex
                                                                        ? 'border-green-400 bg-green-500/20' 
                                                                        : 'border-slate-600 hover:border-green-400/50 bg-slate-700/50'
                                                                }`}
                                                                onClick={() => handleStartingEquipmentChoice(choiceIndex, optionIndex)}
                                                            >
                                                                <CardContent className="p-3">
                                                                    <div className="flex items-center justify-between">
                                                                        <div>
                                                                            <p className="font-medium text-slate-200">
                                                                                {option.of?.name || option.choice?.desc || 'Opção especial'}
                                                                            </p>
                                                                            {option.count > 1 && (
                                                                                <p className="text-sm text-green-400">
                                                                                    {TEXT.QUANTITY} {option.count}
                                                                                </p>
                                                                            )}
                                                                            {option.option_type === 'choice' && (
                                                                                <p className="text-xs text-slate-400">
                                                                                    Escolha de categoria
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        {startingChoices[choiceIndex] === optionIndex && (
                                                                            <Badge className="bg-green-500 text-white">
                                                                                {TEXT.SELECTED}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
                                        <p className="text-yellow-300 mb-2">
                                            Nenhum equipamento inicial encontrado para esta classe.
                                        </p>
                                        <p className="text-sm text-yellow-400">
                                            Você pode usar o modo de compra com gold inicial.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
                
                {/* Dados do Personagem */}
                {characterData && (
                    <Card className="border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-indigo-300">
                                <Info className="h-5 w-5" />
                                {TEXT.CHARACTER_DATA}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="font-medium text-indigo-300">{TEXT.RACE}</p>
                                    <p className="text-indigo-200">{selectedRace?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-indigo-300">{TEXT.CLASS}</p>
                                    <p className="text-indigo-200">{selectedClass?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-indigo-300">{TEXT.BACKGROUND}</p>
                                    <p className="text-indigo-200">{selectedBackground?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-indigo-300">{TEXT.PROFICIENCIES}</p>
                                    <p className="text-indigo-200">{proficiencies.length} itens</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
                
                {/* Equipamentos Selecionados */}
                {selectedEquipment.length > 0 && (
                    <Card className="border-purple-500/30 bg-slate-800/80">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-purple-300">
                                <Package className="h-5 w-5" />
                                {TEXT.SELECTED_EQUIPMENT} ({selectedEquipment.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedEquipment.map((item) => (
                                    <div key={item.equipment.index} className="group relative bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/30 hover:shadow-md transition-all">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                                    {getCategoryIcon(item.equipment.equipment_category?.index)}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-purple-200">{item.equipment.name}</h4>
                                                    <p className="text-sm text-purple-300 mb-2">
                                                        {item.equipment.equipment_category?.name}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2 text-xs">
                                                        <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded border border-purple-500/30">
                                                            {TEXT.QUANTITY} {item.quantity}
                                                        </span>
                                                        <span className={`px-2 py-1 rounded border ${
                                                            item.source === 'starting' 
                                                                ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                                                                : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                                                        }`}>
                                                            {item.source === 'starting' ? TEXT.INITIAL : TEXT.PURCHASED}
                                                        </span>
                                                        {item.equipment.armor_class && (
                                                            <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded border border-blue-500/30">
                                                                CA: {item.equipment.armor_class.base}
                                                            </span>
                                                        )}
                                                        {item.equipment.damage && (
                                                            <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded border border-red-500/30">
                                                                {item.equipment.damage.damage_dice} {item.equipment.damage.damage_type.name}
                                                            </span>
                                                        )}
                                                        {isProficientWith(item.equipment, proficiencies) && (
                                                            <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded flex items-center gap-1 border border-green-500/30">
                                                                <Star className="h-3 w-3" />
                                                                {TEXT.PROFICIENT}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                onClick={() => handleEquipmentRemove(item.equipment.index)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity border-slate-600 text-slate-300 hover:bg-slate-700"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
                
                {/* Loja de Equipamentos */}
                {equipmentMode === 'purchase' && (
                    <Card className="bg-slate-800/80 border-slate-700">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-white">
                                    <Search className="h-5 w-5" />
                                    {TEXT.SHOP_TITLE}
                                </div>
                                <div className="flex items-center gap-2 text-yellow-400">
                                    <Coins className="h-5 w-5" />
                                    <span className="text-xl font-bold">{currentGold} GO</span>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder={TEXT.SEARCH_PLACEHOLDER}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 bg-slate-700/50 border-slate-600 text-slate-200 placeholder-slate-400"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <select 
                                        value={selectedCategory} 
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="px-4 py-2 border border-slate-600 bg-slate-700 text-slate-200 rounded-lg hover:border-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                    <Button
                                        variant={showOnlyProficient ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setShowOnlyProficient(!showOnlyProficient)}
                                        className="whitespace-nowrap border-slate-600 text-slate-300 hover:bg-slate-700"
                                    >
                                        <Filter className="h-4 w-4 mr-2" />
                                        {TEXT.PROFICIENCY_FILTER}
                                    </Button>
                                </div>
                            </div>
                            
                            {isLoading ? (
                                <div className="text-center py-12">
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2 text-white">{TEXT.LOADING_EQUIPMENT}</h3>
                                            <div className="w-80 bg-slate-700 rounded-full h-3 mb-2">
                                                <div 
                                                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                                                    style={{ width: `${loadingProgress}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-sm text-slate-400">{loadingProgress}% completo</p>
                                        </div>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="text-center py-12">
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto">
                                        <p className="text-red-300 mb-4">{error}</p>
                                        <Button 
                                            onClick={() => {
                                                setEquipmentList([]);
                                                localStorage.removeItem(STORAGE_KEYS.EQUIPMENT_CACHE);
                                            }}
                                            variant="outline"
                                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                        >
                                            {TEXT.RETRY}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="border border-slate-700 rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-800/50 border-slate-700">
                                                <TableHead className="cursor-pointer hover:bg-slate-700/50 font-semibold text-slate-200" onClick={() => handleSort('name')}>
                                                    <div className="flex items-center gap-2">
                                                        Nome
                                                        <SortIcon field="name" currentField={sortField} direction={sortDirection} />
                                                    </div>
                                                </TableHead>
                                                <TableHead className="cursor-pointer hover:bg-slate-700/50 font-semibold text-slate-200" onClick={() => handleSort('category')}>
                                                    <div className="flex items-center gap-2">
                                                        Categoria
                                                        <SortIcon field="category" currentField={sortField} direction={sortDirection} />
                                                    </div>
                                                </TableHead>
                                                <TableHead className="cursor-pointer hover:bg-slate-700/50 font-semibold text-center text-slate-200" onClick={() => handleSort('ac')}>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Shield className="h-4 w-4" />
                                                        CA
                                                        <SortIcon field="ac" currentField={sortField} direction={sortDirection} />
                                                    </div>
                                                </TableHead>
                                                <TableHead className="cursor-pointer hover:bg-slate-700/50 font-semibold text-center text-slate-200" onClick={() => handleSort('damage')}>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Sword className="h-4 w-4" />
                                                        Dano
                                                        <SortIcon field="damage" currentField={sortField} direction={sortDirection} />
                                                    </div>
                                                </TableHead>
                                                <TableHead className="cursor-pointer hover:bg-slate-700/50 font-semibold text-center text-slate-200" onClick={() => handleSort('cost')}>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Coins className="h-4 w-4" />
                                                        Custo (GO)
                                                        <SortIcon field="cost" currentField={sortField} direction={sortDirection} />
                                                    </div>
                                                </TableHead>
                                                <TableHead className="cursor-pointer hover:bg-slate-700/50 font-semibold text-center text-slate-200" onClick={() => handleSort('weight')}>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Weight className="h-4 w-4" />
                                                        Peso
                                                        <SortIcon field="weight" currentField={sortField} direction={sortDirection} />
                                                    </div>
                                                </TableHead>
                                                <TableHead className="text-center font-semibold text-slate-200">Prof.</TableHead>
                                                <TableHead className="text-center font-semibold text-slate-200">Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredAndSortedEquipment.map((equipment) => {
                                                const cost = equipment.cost ? convertCostToGold(equipment.cost) : 0;
                                                const canAfford = cost <= currentGold;
                                                const isExpanded = expandedDescriptions.has(equipment.index);
                                                
                                                return (
                                                    <Fragment key={equipment.index}>
                                                        <TableRow className={`transition-colors border-slate-700 ${
                                                            !canAfford 
                                                                ? 'bg-red-500/10 opacity-60' 
                                                                : isProficientWith(equipment, proficiencies) 
                                                                    ? 'bg-green-500/10 hover:bg-green-500/20' 
                                                                    : 'hover:bg-slate-800/50'
                                                        }`}>
                                                            <TableCell className="font-medium text-slate-200">
                                                                <div className="flex items-center gap-2">
                                                                    {getCategoryIcon(equipment.equipment_category?.index)}
                                                                    <div>
                                                                        <div className="font-semibold">{equipment.name}</div>
                                                                        {equipment.desc && equipment.desc.length > 0 && (
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => toggleDescription(equipment.index)}
                                                                                className="text-xs text-slate-400 hover:text-slate-200 p-0 h-auto"
                                                                            >
                                                                                {isExpanded ? 'Ocultar' : TEXT.ITEM_DETAILS}
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-slate-300">{equipment.equipment_category?.name}</TableCell>
                                                            <TableCell className="text-center text-slate-300">
                                                                {equipment.armor_class ? (
                                                                    <Badge variant="outline" className="border-blue-500/30 text-blue-300">
                                                                        {equipment.armor_class.base}
                                                                        {equipment.armor_class.dex_bonus && '+Dex'}
                                                                    </Badge>
                                                                ) : '-'}
                                                            </TableCell>
                                                            <TableCell className="text-center text-slate-300">
                                                                {equipment.damage ? (
                                                                    <Badge variant="outline" className="border-red-500/30 text-red-300">
                                                                        {equipment.damage.damage_dice}
                                                                    </Badge>
                                                                ) : '-'}
                                                            </TableCell>
                                                            <TableCell className="text-center text-slate-300">
                                                                {equipment.cost ? (
                                                                    <span className={canAfford ? 'text-green-300' : 'text-red-300'}>
                                                                        {cost.toFixed(2)}
                                                                    </span>
                                                                ) : <span className="text-slate-500">-</span>}
                                                            </TableCell>
                                                            <TableCell className="text-center text-slate-300">
                                                                {equipment.weight ? `${equipment.weight} lb` : '-'}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                {isProficientWith(equipment, proficiencies) && (
                                                                    <Star className="h-4 w-4 text-green-400 mx-auto" />
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Button 
                                                                    size="sm" 
                                                                    onClick={() => handleEquipmentAdd(equipment, 'purchased')}
                                                                    disabled={!canAfford}
                                                                    className={`${canAfford 
                                                                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                                                        : 'bg-slate-600 text-slate-400 cursor-not-allowed'}`}
                                                                >
                                                                    <Plus className="h-4 w-4 mr-1" />
                                                                    {canAfford ? TEXT.BUY : TEXT.NO_GOLD}
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                        
                                                        {isExpanded && equipment.desc && (
                                                            <TableRow className="border-slate-700">
                                                                <TableCell colSpan={8} className="bg-slate-800/30">
                                                                    <Collapsible open={isExpanded}>
                                                                        <CollapsibleContent>
                                                                            <div className="p-4 space-y-3">
                                                                                <div>
                                                                                    <h4 className="font-semibold text-slate-200 mb-2">{TEXT.DESCRIPTION}</h4>
                                                                                    {equipment.desc.map((paragraph, index) => (
                                                                                        <p key={index} className="text-sm text-slate-300 mb-2">
                                                                                            {paragraph}
                                                                                        </p>
                                                                                    ))}
                                                                                </div>
                                                                                {equipment.properties && equipment.properties.length > 0 && (
                                                                                    <div>
                                                                                        <h4 className="font-semibold text-slate-200 mb-2">{TEXT.PROPERTIES}</h4>
                                                                                        <div className="flex flex-wrap gap-2">
                                                                                            {equipment.properties.map((prop, index) => (
                                                                                                <Badge
                                                                                                    key={index}
                                                                                                    variant="outline"
                                                                                                    className="border-slate-600 text-slate-300"
                                                                                                >
                                                                                                    {prop.name}
                                                                                                </Badge>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </CollapsibleContent>
                                                                    </Collapsible>
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </Fragment>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                    
                                    {filteredAndSortedEquipment.length === 0 && (
                                        <div className="text-center py-12">
                                            <Package className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-slate-300 mb-2">{TEXT.NO_EQUIPMENT}</h3>
                                            <p className="text-slate-400">{TEXT.NO_EQUIPMENT_DESC}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default EquipmentComponent;