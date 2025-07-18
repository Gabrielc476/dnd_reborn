// components/character/creation/steps/Equipment.tsx
// VERSÃO MELHORADA - Visual aprimorado e collapse para descrições
'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { 
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
    Search, 
    Shield, 
    Heart, 
    Package, 
    Filter,
    Plus,
    Minus,
    ChevronUp,
    ChevronDown,
    Loader2,
    Sword,
    ShieldIcon,
    Backpack,
    Info,
    Star,
    Weight,
    Coins,
    ArrowUpDown
} from "lucide-react";
import { DndClass, DndBackground, DndRace } from "@/types/characterCreation";

interface EquipmentProps {
    onValidationChange?: (isValid: boolean) => void;
}

// ===========================
// EQUIPAMENTOS ESSENCIAIS
// ===========================

const ESSENTIAL_EQUIPMENT_INDEXES = [
    // Armaduras Leves
    "padded", "leather", "studded-leather",
    // Armaduras Médias  
    "hide", "chain-shirt", "scale-mail", "breastplate", "half-plate",
    // Armaduras Pesadas
    "ring-mail", "chain-mail", "splint", "plate",
    // Escudos
    "shield",
    // Armas Simples
    "club", "dagger", "dart", "handaxe", "javelin", "light-hammer", "mace", 
    "quarterstaff", "sickle", "spear", "unarmed-strike", "light-crossbow", 
    "dart", "shortbow", "sling",
    // Armas Marciais
    "battleaxe", "flail", "glaive", "greataxe", "greatsword", "halberd", 
    "lance", "longsword", "maul", "morningstar", "pike", "rapier", "scimitar", 
    "shortsword", "trident", "war-pick", "warhammer", "whip", "blowgun", 
    "hand-crossbow", "heavy-crossbow", "longbow", "net"
];

// ===========================
// TYPES
// ===========================

interface Equipment {
    index: string;
    name: string;
    equipment_category: {
        index: string;
        name: string;
        url: string;
    };
    cost?: {
        quantity: number;
        unit: string;
    };
    weight?: number;
    desc?: string[];
    armor_class?: {
        base: number;
        dex_bonus?: boolean;
        max_bonus?: number;
    };
    armor_category?: string;
    damage?: {
        damage_dice: string;
        damage_type: {
            index: string;
            name: string;
        };
    };
    weapon_category?: string;
    weapon_range?: string;
    properties?: Array<{
        index: string;
        name: string;
        url: string;
    }>;
    url: string;
}

interface SelectedEquipment {
    equipment: Equipment;
    quantity: number;
}

type SortField = 'name' | 'category' | 'cost' | 'weight' | 'ac' | 'damage';
type SortDirection = 'asc' | 'desc';

// ===========================
// STORAGE KEYS
// ===========================

const STORAGE_KEYS = {
    SELECTED_EQUIPMENT: 'character_creation_selected_equipment',
    EQUIPMENT_CACHE: 'character_creation_equipment_cache_v2',
    EQUIPMENT_SEARCH: 'character_creation_equipment_search'
};

// ===========================
// UTILITY FUNCTIONS
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
        if (item) {
            return JSON.parse(item);
        }
    } catch (error) {
        console.error('Erro ao carregar do storage:', { key, error });
    }
    return defaultValue;
};

const getConsolidatedCharacterData = () => {
    try {
        const selectedRace = JSON.parse(localStorage.getItem('character_creation_race') || 'null');
        const selectedClass = JSON.parse(localStorage.getItem('character_creation_class') || 'null');
        const selectedBackground = JSON.parse(localStorage.getItem('character_creation_background') || 'null');
        const finalAbilityScores = JSON.parse(localStorage.getItem('character_creation_final_ability_scores') || '{}');
        
        return {
            selectedRace,
            selectedClass,
            selectedBackground,
            finalAbilityScores
        };
    } catch (error) {
        console.error('Erro ao buscar dados consolidados:', error);
        return null;
    }
};

const calculateModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
};

const calculateBaseArmorClass = (dexScore: number): number => {
    const dexModifier = calculateModifier(dexScore);
    return 10 + dexModifier;
};

const calculateHitPoints = (classData: DndClass, conScore: number): number => {
    const conModifier = calculateModifier(conScore);
    const baseHP = classData?.hit_die || 8;
    return baseHP + conModifier;
};

const getEquipmentProficiencies = (classData: DndClass | null, backgroundData: DndBackground | null, raceData: DndRace | null) => {
    const proficiencies = new Set<string>();
    
    if (classData?.proficiencies) {
        classData.proficiencies.forEach(prof => {
            proficiencies.add(prof.index);
        });
    }
    
    if (backgroundData?.starting_proficiencies) {
        backgroundData.starting_proficiencies.forEach(prof => {
            proficiencies.add(prof.index);
        });
    }
    
    if (raceData?.starting_proficiencies) {
        raceData.starting_proficiencies.forEach(prof => {
            proficiencies.add(prof.index);
        });
    }
    
    return Array.from(proficiencies);
};

const isProficientWith = (equipment: Equipment, proficiencies: string[]) => {
    const categoryIndex = equipment.equipment_category?.index;
    const armorCategory = equipment.armor_category?.toLowerCase();
    const weaponCategory = equipment.weapon_category?.toLowerCase();
    
    if (proficiencies.includes(equipment.index)) {
        return true;
    }
    
    if (proficiencies.includes(categoryIndex)) {
        return true;
    }
    
    if (armorCategory) {
        const armorProficiencies = [
            `${armorCategory}-armor`,
            'all-armor',
            'armor'
        ];
        
        if (armorProficiencies.some(prof => proficiencies.includes(prof))) {
            return true;
        }
    }
    
    if (weaponCategory) {
        const weaponProficiencies = [
            `${weaponCategory}-weapons`,
            'all-weapons',
            'weapon'
        ];
        
        if (weaponProficiencies.some(prof => proficiencies.includes(prof))) {
            return true;
        }
    }
    
    if (equipment.index === 'shield' && proficiencies.includes('shields')) {
        return true;
    }
    
    return false;
};

const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'armor':
            return <ShieldIcon className="h-4 w-4" />;
        case 'weapon':
            return <Sword className="h-4 w-4" />;
        default:
            return <Backpack className="h-4 w-4" />;
    }
};

// ===========================
// MAIN COMPONENT
// ===========================

const EquipmentComponent = ({ onValidationChange }: EquipmentProps) => {
    // States
    const [selectedEquipment, setSelectedEquipment] = useState<SelectedEquipment[]>(() => {
        return loadFromStorage<SelectedEquipment[]>(STORAGE_KEYS.SELECTED_EQUIPMENT, []);
    });
    const [equipmentList, setEquipmentList] = useState<Equipment[]>(() => {
        return loadFromStorage<Equipment[]>(STORAGE_KEYS.EQUIPMENT_CACHE, []);
    });
    const [searchTerm, setSearchTerm] = useState<string>(() => {
        return loadFromStorage<string>(STORAGE_KEYS.EQUIPMENT_SEARCH, '');
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showOnlyProficient, setShowOnlyProficient] = useState(false);
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
    const [loadingProgress, setLoadingProgress] = useState(0);
    
    // Character data
    const characterData = getConsolidatedCharacterData();
    const { selectedRace, selectedClass, selectedBackground, finalAbilityScores } = characterData || {};
    
    // Calculate character stats
    const dexScore = finalAbilityScores?.dexterity || 10;
    const conScore = finalAbilityScores?.constitution || 10;
    const baseArmorClass = calculateBaseArmorClass(dexScore);
    const hitPoints = calculateHitPoints(selectedClass, conScore);
    
    // Get proficiencies
    const proficiencies = getEquipmentProficiencies(selectedClass, selectedBackground, selectedRace);
    
    // Equipment categories
    const categories = [
        { value: 'all', label: 'Todos', icon: <Package className="h-4 w-4" /> },
        { value: 'armor', label: 'Armaduras', icon: <ShieldIcon className="h-4 w-4" /> },
        { value: 'weapon', label: 'Armas', icon: <Sword className="h-4 w-4" /> },
        { value: 'adventuring-gear', label: 'Equipamentos', icon: <Backpack className="h-4 w-4" /> },
        { value: 'tools', label: 'Ferramentas', icon: <Package className="h-4 w-4" /> }
    ];
    
    // ===========================
    // EFFECTS
    // ===========================
    
    useEffect(() => {
        const fetchEquipment = async () => {
            if (equipmentList.length > 0) {
                return;
            }
            
            setIsLoading(true);
            setError(null);
            setLoadingProgress(0);
            
            try {
                const equipmentPromises = ESSENTIAL_EQUIPMENT_INDEXES.map(async (index, i) => {
                    try {
                        const url = `https://www.dnd5eapi.co/api/equipment/${index}`;
                        const response = await fetch(url);
                        
                        setLoadingProgress(Math.round(((i + 1) / ESSENTIAL_EQUIPMENT_INDEXES.length) * 100));
                        
                        if (response.ok) {
                            const data = await response.json();
                            return data;
                        } else {
                            return null;
                        }
                    } catch (err) {
                        return null;
                    }
                });
                
                const equipments = await Promise.all(equipmentPromises);
                const validEquipments = equipments.filter(eq => eq !== null);
                
                if (validEquipments.length > 0) {
                    setEquipmentList(validEquipments);
                    saveToStorage(STORAGE_KEYS.EQUIPMENT_CACHE, validEquipments);
                } else {
                    setError('Nenhum equipamento foi carregado da API');
                }
                
            } catch (error) {
                setError(`Erro ao carregar equipamentos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
            } finally {
                setIsLoading(false);
                setLoadingProgress(100);
            }
        };
        
        fetchEquipment();
    }, [equipmentList.length]);
    
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.SELECTED_EQUIPMENT, selectedEquipment);
    }, [selectedEquipment]);
    
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.EQUIPMENT_SEARCH, searchTerm);
    }, [searchTerm]);
    
    useEffect(() => {
        const isValid = selectedEquipment.length > 0;
        onValidationChange?.(isValid);
    }, [selectedEquipment, onValidationChange]);
    
    // ===========================
    // HANDLERS
    // ===========================
    
    const handleEquipmentAdd = (equipment: Equipment) => {
        setSelectedEquipment(prev => {
            const existing = prev.find(item => item.equipment.index === equipment.index);
            if (existing) {
                return prev.map(item => 
                    item.equipment.index === equipment.index 
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...prev, { equipment, quantity: 1 }];
            }
        });
    };
    
    const handleEquipmentRemove = (equipmentIndex: string) => {
        setSelectedEquipment(prev => {
            const existing = prev.find(item => item.equipment.index === equipmentIndex);
            if (existing && existing.quantity > 1) {
                return prev.map(item => 
                    item.equipment.index === equipmentIndex 
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                );
            } else {
                return prev.filter(item => item.equipment.index !== equipmentIndex);
            }
        });
    };
    
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };
    
    const toggleDescription = (equipmentIndex: string) => {
        setExpandedDescriptions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(equipmentIndex)) {
                newSet.delete(equipmentIndex);
            } else {
                newSet.add(equipmentIndex);
            }
            return newSet;
        });
    };
    
    // Filter and sort equipment
    const filteredAndSortedEquipment = equipmentList
        .filter(equipment => {
            const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || equipment.equipment_category?.index === selectedCategory;
            const matchesProficiency = !showOnlyProficient || isProficientWith(equipment, proficiencies);
            
            return matchesSearch && matchesCategory && matchesProficiency;
        })
        .sort((a, b) => {
            let aValue: any;
            let bValue: any;
            
            switch (sortField) {
                case 'name':
                    aValue = a.name;
                    bValue = b.name;
                    break;
                case 'category':
                    aValue = a.equipment_category?.name || '';
                    bValue = b.equipment_category?.name || '';
                    break;
                case 'cost':
                    aValue = a.cost?.quantity || 0;
                    bValue = b.cost?.quantity || 0;
                    break;
                case 'weight':
                    aValue = a.weight || 0;
                    bValue = b.weight || 0;
                    break;
                case 'ac':
                    aValue = a.armor_class?.base || 0;
                    bValue = b.armor_class?.base || 0;
                    break;
                case 'damage':
                    aValue = a.damage?.damage_dice || '';
                    bValue = b.damage?.damage_dice || '';
                    break;
                default:
                    aValue = a.name;
                    bValue = b.name;
            }
            
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                const comparison = aValue.localeCompare(bValue);
                return sortDirection === 'asc' ? comparison : -comparison;
            } else {
                const comparison = aValue - bValue;
                return sortDirection === 'asc' ? comparison : -comparison;
            }
        });
    
    // Calculate total AC from armor
    const calculateTotalArmorClass = () => {
        const armorItem = selectedEquipment.find(item => 
            item.equipment.equipment_category?.index === 'armor' && item.equipment.armor_class
        );
        
        if (armorItem?.equipment.armor_class) {
            const armorAC = armorItem.equipment.armor_class.base;
            const dexModifier = calculateModifier(dexScore);
            
            if (armorItem.equipment.armor_class.dex_bonus) {
                const maxBonus = armorItem.equipment.armor_class.max_bonus;
                const dexBonus = maxBonus !== undefined ? Math.min(dexModifier, maxBonus) : dexModifier;
                return armorAC + dexBonus;
            } else {
                return armorAC;
            }
        }
        
        return baseArmorClass;
    };
    
    const totalArmorClass = calculateTotalArmorClass();
    
    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-gray-400" />;
        return sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
    };
    
    // ===========================
    // RENDER
    // ===========================
    
    return (
        <div className="space-y-8">
            {/* Character Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                                <Shield className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-blue-700">Classe de Armadura</p>
                                <p className="text-3xl font-bold text-blue-900">{totalArmorClass}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-500 rounded-xl shadow-lg">
                                <Heart className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-red-700">Pontos de Vida</p>
                                <p className="text-3xl font-bold text-red-900">{hitPoints}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            {/* Character Info */}
            {characterData && (
                <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-green-800">
                            <Info className="h-5 w-5" />
                            Dados do Personagem
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p className="font-medium text-green-700">Raça</p>
                                <p className="text-green-600">{selectedRace?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="font-medium text-green-700">Classe</p>
                                <p className="text-green-600">{selectedClass?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="font-medium text-green-700">Background</p>
                                <p className="text-green-600">{selectedBackground?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="font-medium text-green-700">Proficiências</p>
                                <p className="text-green-600">{proficiencies.length} itens</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
            
            {/* Selected Equipment */}
            {selectedEquipment.length > 0 && (
                <Card className="border-purple-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-800">
                            <Package className="h-5 w-5" />
                            Equipamentos Selecionados ({selectedEquipment.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedEquipment.map((item) => (
                                <div key={item.equipment.index} className="group relative bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100 hover:shadow-md transition-all">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                {getCategoryIcon(item.equipment.equipment_category?.index)}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-purple-900">{item.equipment.name}</h4>
                                                <p className="text-sm text-purple-600 mb-2">
                                                    {item.equipment.equipment_category?.name}
                                                </p>
                                                
                                                <div className="flex flex-wrap gap-2 text-xs">
                                                    <span className="bg-purple-200 text-purple-800 px-2 py-1 rounded">
                                                        Qtd: {item.quantity}
                                                    </span>
                                                    
                                                    {item.equipment.armor_class && (
                                                        <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded">
                                                            CA: {item.equipment.armor_class.base}
                                                        </span>
                                                    )}
                                                    
                                                    {item.equipment.damage && (
                                                        <span className="bg-red-200 text-red-800 px-2 py-1 rounded">
                                                            {item.equipment.damage.damage_dice} {item.equipment.damage.damage_type.name}
                                                        </span>
                                                    )}
                                                    
                                                    {isProficientWith(item.equipment, proficiencies) && (
                                                        <span className="bg-green-200 text-green-800 px-2 py-1 rounded flex items-center gap-1">
                                                            <Star className="h-3 w-3" />
                                                            Proficiente
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={() => handleEquipmentRemove(item.equipment.index)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
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
            
            {/* Equipment Search and Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Equipamentos Disponíveis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col lg:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar equipamentos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                            <select 
                                value={selectedCategory} 
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                            
                            <Button
                                variant={showOnlyProficient ? "default" : "outline"}
                                size="sm"
                                onClick={() => setShowOnlyProficient(!showOnlyProficient)}
                                className="whitespace-nowrap"
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Apenas Proficientes
                            </Button>
                        </div>
                    </div>
                    
                    {/* Equipment Table */}
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Carregando equipamentos...</h3>
                                    <div className="w-80 bg-gray-200 rounded-full h-3 mb-2">
                                        <div 
                                            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                                            style={{ width: `${loadingProgress}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {loadingProgress}% completo ({ESSENTIAL_EQUIPMENT_INDEXES.length} equipamentos essenciais)
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                                <p className="text-red-800 mb-4">{error}</p>
                                <Button 
                                    onClick={() => {
                                        setEquipmentList([]);
                                        localStorage.removeItem(STORAGE_KEYS.EQUIPMENT_CACHE);
                                    }}
                                    variant="outline"
                                >
                                    Tentar Novamente
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead 
                                            className="cursor-pointer hover:bg-gray-100 font-semibold"
                                            onClick={() => handleSort('name')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Nome
                                                <SortIcon field="name" />
                                            </div>
                                        </TableHead>
                                        <TableHead 
                                            className="cursor-pointer hover:bg-gray-100 font-semibold"
                                            onClick={() => handleSort('category')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Categoria
                                                <SortIcon field="category" />
                                            </div>
                                        </TableHead>
                                        <TableHead 
                                            className="cursor-pointer hover:bg-gray-100 font-semibold text-center"
                                            onClick={() => handleSort('ac')}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <Shield className="h-4 w-4" />
                                                CA
                                                <SortIcon field="ac" />
                                            </div>
                                        </TableHead>
                                        <TableHead 
                                            className="cursor-pointer hover:bg-gray-100 font-semibold text-center"
                                            onClick={() => handleSort('damage')}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <Sword className="h-4 w-4" />
                                                Dano
                                                <SortIcon field="damage" />
                                            </div>
                                        </TableHead>
                                        <TableHead 
                                            className="cursor-pointer hover:bg-gray-100 font-semibold text-center"
                                            onClick={() => handleSort('cost')}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <Coins className="h-4 w-4" />
                                                Custo
                                                <SortIcon field="cost" />
                                            </div>
                                        </TableHead>
                                        <TableHead 
                                            className="cursor-pointer hover:bg-gray-100 font-semibold text-center"
                                            onClick={() => handleSort('weight')}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <Weight className="h-4 w-4" />
                                                Peso
                                                <SortIcon field="weight" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-center font-semibold">Prof.</TableHead>
                                        <TableHead className="text-center font-semibold">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAndSortedEquipment.map((equipment) => (
                                        <>
                                            <TableRow 
                                                key={equipment.index}
                                                className={`transition-colors ${
                                                    isProficientWith(equipment, proficiencies) 
                                                        ? 'bg-green-50 hover:bg-green-100' 
                                                        : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        {equipment.desc && equipment.desc.length > 0 && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleDescription(equipment.index)}
                                                                className="p-1 h-6 w-6"
                                                            >
                                                                {expandedDescriptions.has(equipment.index) ? (
                                                                    <ChevronUp className="h-3 w-3" />
                                                                ) : (
                                                                    <ChevronDown className="h-3 w-3" />
                                                                )}
                                                            </Button>
                                                        )}
                                                        <div className="flex items-center gap-2">
                                                            {getCategoryIcon(equipment.equipment_category?.index)}
                                                            <span>{equipment.name}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-xs">
                                                        {equipment.equipment_category?.name}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {equipment.armor_class ? (
                                                        <span className="text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
                                                            {equipment.armor_class.base}
                                                            {equipment.armor_class.dex_bonus && ' + Des'}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {equipment.damage ? (
                                                        <span className="text-red-600 font-medium bg-red-50 px-2 py-1 rounded text-xs">
                                                            {equipment.damage.damage_dice}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {equipment.cost ? (
                                                        <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs">
                                                            {equipment.cost.quantity} {equipment.cost.unit}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {equipment.weight ? (
                                                        <span className="text-gray-600">{equipment.weight} lb</span>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {isProficientWith(equipment, proficiencies) ? (
                                                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                                            <Star className="h-3 w-3 mr-1" />
                                                            Sim
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Button 
                                                        size="sm" 
                                                        onClick={() => handleEquipmentAdd(equipment)}
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                    >
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Adicionar
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                            
                                            {/* Collapse for description */}
                                            {equipment.desc && equipment.desc.length > 0 && expandedDescriptions.has(equipment.index) && (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="bg-gray-50 border-t-0">
                                                        <Collapsible open={expandedDescriptions.has(equipment.index)}>
                                                            <CollapsibleContent>
                                                                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 m-2">
                                                                    <h4 className="font-semibold text-lg mb-3 text-gray-800 flex items-center gap-2">
                                                                        <Info className="h-5 w-5" />
                                                                        {equipment.name} - Detalhes
                                                                    </h4>
                                                                    
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                                                        <div className="space-y-2">
                                                                            <p className="text-sm">
                                                                                <strong className="text-gray-700">Categoria:</strong> 
                                                                                <span className="ml-2">{equipment.equipment_category?.name}</span>
                                                                            </p>
                                                                            {equipment.armor_category && (
                                                                                <p className="text-sm">
                                                                                    <strong className="text-gray-700">Tipo de Armadura:</strong> 
                                                                                    <span className="ml-2">{equipment.armor_category}</span>
                                                                                </p>
                                                                            )}
                                                                            {equipment.weapon_category && (
                                                                                <p className="text-sm">
                                                                                    <strong className="text-gray-700">Tipo de Arma:</strong> 
                                                                                    <span className="ml-2">{equipment.weapon_category}</span>
                                                                                </p>
                                                                            )}
                                                                            {equipment.weapon_range && (
                                                                                <p className="text-sm">
                                                                                    <strong className="text-gray-700">Alcance:</strong> 
                                                                                    <span className="ml-2">{equipment.weapon_range}</span>
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        
                                                                        <div className="space-y-2">
                                                                            {equipment.cost && (
                                                                                <p className="text-sm">
                                                                                    <strong className="text-gray-700">Custo:</strong> 
                                                                                    <span className="ml-2">{equipment.cost.quantity} {equipment.cost.unit}</span>
                                                                                </p>
                                                                            )}
                                                                            {equipment.weight && (
                                                                                <p className="text-sm">
                                                                                    <strong className="text-gray-700">Peso:</strong> 
                                                                                    <span className="ml-2">{equipment.weight} lb</span>
                                                                                </p>
                                                                            )}
                                                                            {equipment.armor_class && (
                                                                                <p className="text-sm">
                                                                                    <strong className="text-gray-700">CA:</strong> 
                                                                                    <span className="ml-2">
                                                                                        {equipment.armor_class.base}
                                                                                        {equipment.armor_class.dex_bonus && ' + Mod Des'}
                                                                                        {equipment.armor_class.max_bonus !== undefined && ` (máx ${equipment.armor_class.max_bonus})`}
                                                                                    </span>
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {equipment.properties && equipment.properties.length > 0 && (
                                                                        <div className="mb-4">
                                                                            <p className="font-semibold text-gray-700 mb-2">Propriedades:</p>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {equipment.properties.map(prop => (
                                                                                    <Badge key={prop.index} variant="outline" className="text-xs">
                                                                                        {prop.name}
                                                                                    </Badge>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    <div>
                                                                        <p className="font-semibold text-gray-700 mb-2">Descrição:</p>
                                                                        <div className="text-sm text-gray-700 space-y-2 bg-gray-50 p-3 rounded-lg">
                                                                            {equipment.desc.map((desc, index) => (
                                                                                <p key={index} className="leading-relaxed">{desc}</p>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </CollapsibleContent>
                                                        </Collapsible>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </>
                                    ))}
                                </TableBody>
                            </Table>
                            
                            {filteredAndSortedEquipment.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="text-gray-500">
                                        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg font-medium mb-2">Nenhum equipamento encontrado</p>
                                        <p className="text-sm">Tente ajustar os filtros ou o termo de busca.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default EquipmentComponent;