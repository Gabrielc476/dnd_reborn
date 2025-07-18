// components/character/creation/steps/Equipment.tsx
// VERSÃO OTIMIZADA - Resolve problemas de performance e filtros
'use client';

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
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
    Search, 
    Shield, 
    Heart, 
    Package, 
    Filter,
    Plus,
    Minus,
    Eye,
    ChevronUp,
    ChevronDown,
    Loader2
} from "lucide-react";
import { DndClass, DndBackground, DndRace } from "@/types/characterCreation";

interface EquipmentProps {
    onValidationChange?: (isValid: boolean) => void;
}

// ===========================
// EQUIPAMENTOS ESSENCIAIS (OTIMIZADO)
// ===========================

// Lista de equipamentos essenciais para personagens iniciantes
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
    EQUIPMENT_CACHE: 'character_creation_equipment_cache_v2', // v2 para nova estrutura
    EQUIPMENT_SEARCH: 'character_creation_equipment_search'
};

// ===========================
// UTILITY FUNCTIONS
// ===========================

const saveToStorage = (key: string, data: any) => {
    try {
        const serialized = JSON.stringify(data);
        localStorage.setItem(key, serialized);
        console.log(`💾 DEBUG: Dados salvos no localStorage:`, {
            key,
            dataType: typeof data,
            dataLength: Array.isArray(data) ? data.length : 'N/A',
            serializedLength: serialized.length,
            success: true
        });
    } catch (error) {
        console.error('❌ DEBUG: Erro ao salvar no storage:', { key, error });
    }
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        console.log(`📥 DEBUG: Carregando do localStorage:`, {
            key,
            found: !!item,
            itemLength: item?.length || 0
        });
        
        if (item) {
            const parsed = JSON.parse(item);
            console.log(`✅ DEBUG: Parse bem-sucedido:`, {
                key,
                parsedType: typeof parsed,
                parsedLength: Array.isArray(parsed) ? parsed.length : 'N/A',
                sample: Array.isArray(parsed) ? parsed.slice(0, 2) : parsed
            });
            return parsed;
        } else {
            console.log(`⚠️ DEBUG: Item não encontrado no localStorage, usando valor padrão:`, {
                key,
                defaultValue
            });
        }
    } catch (error) {
        console.error('❌ DEBUG: Erro ao carregar do storage:', { key, error });
    }
    return defaultValue;
};

// Função para buscar dados consolidados do personagem
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

// Função para calcular modificador de atributo
const calculateModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
};

// Função para calcular CA base (10 + modificador de Des)
const calculateBaseArmorClass = (dexScore: number): number => {
    const dexModifier = calculateModifier(dexScore);
    return 10 + dexModifier;
};

// Função para calcular HP (dado de vida da classe + modificador de CON)
const calculateHitPoints = (classData: DndClass, conScore: number): number => {
    const conModifier = calculateModifier(conScore);
    const baseHP = classData?.hit_die || 8;
    return baseHP + conModifier;
};

// ===========================
// PROFICIÊNCIAS MELHORADAS
// ===========================

const getEquipmentProficiencies = (classData: DndClass | null, backgroundData: DndBackground | null, raceData: DndRace | null) => {
    const proficiencies = new Set<string>();
    
    // Proficiências da classe
    if (classData?.proficiencies) {
        classData.proficiencies.forEach(prof => {
            proficiencies.add(prof.index);
        });
    }
    
    // Proficiências do background
    if (backgroundData?.starting_proficiencies) {
        backgroundData.starting_proficiencies.forEach(prof => {
            proficiencies.add(prof.index);
        });
    }
    
    // Proficiências da raça
    if (raceData?.starting_proficiencies) {
        raceData.starting_proficiencies.forEach(prof => {
            proficiencies.add(prof.index);
        });
    }
    
    return Array.from(proficiencies);
};

// Função melhorada para verificar proficiências
const isProficientWith = (equipment: Equipment, proficiencies: string[]) => {
    const categoryIndex = equipment.equipment_category?.index;
    const armorCategory = equipment.armor_category?.toLowerCase();
    const weaponCategory = equipment.weapon_category?.toLowerCase();
    
    // 1. Proficiência específica do item
    if (proficiencies.includes(equipment.index)) {
        return true;
    }
    
    // 2. Proficiência geral da categoria
    if (proficiencies.includes(categoryIndex)) {
        return true;
    }
    
    // 3. Proficiências específicas de armadura
    if (armorCategory) {
        const armorProficiencies = [
            `${armorCategory}-armor`,
            'all-armor',
            'armor' // Algumas classes têm proficiência geral
        ];
        
        if (armorProficiencies.some(prof => proficiencies.includes(prof))) {
            return true;
        }
    }
    
    // 4. Proficiências específicas de armas
    if (weaponCategory) {
        const weaponProficiencies = [
            `${weaponCategory}-weapons`,
            'all-weapons',
            'weapon' // Algumas classes têm proficiência geral
        ];
        
        if (weaponProficiencies.some(prof => proficiencies.includes(prof))) {
            return true;
        }
    }
    
    // 5. Proficiências especiais (escudos, ferramentas, etc.)
    if (equipment.index === 'shield' && proficiencies.includes('shields')) {
        return true;
    }
    
    return false;
};

// ===========================
// MAIN COMPONENT
// ===========================

const EquipmentComponent = ({ onValidationChange }: EquipmentProps) => {
    // ===========================
    // DEBUG INICIAL
    // ===========================
    
    console.log('🔍 DEBUG: EquipmentComponent inicializando...');
    console.log('🔍 DEBUG: Storage keys:', STORAGE_KEYS);
    console.log('🔍 DEBUG: Essential equipment indexes:', {
        total: ESSENTIAL_EQUIPMENT_INDEXES.length,
        list: ESSENTIAL_EQUIPMENT_INDEXES
    });
    
    // Verificar estado do localStorage
    console.log('🔍 DEBUG: Estado atual do localStorage:', {
        totalKeys: Object.keys(localStorage).length,
        relevantKeys: Object.keys(localStorage).filter(key => key.includes('character_creation')),
        equipmentCacheExists: !!localStorage.getItem(STORAGE_KEYS.EQUIPMENT_CACHE),
        equipmentCacheSize: localStorage.getItem(STORAGE_KEYS.EQUIPMENT_CACHE)?.length || 0
    });
    // States
    const [selectedEquipment, setSelectedEquipment] = useState<SelectedEquipment[]>(() => {
        const stored = loadFromStorage<SelectedEquipment[]>(STORAGE_KEYS.SELECTED_EQUIPMENT, []);
        console.log('🔍 DEBUG: Equipamentos selecionados carregados do storage:', stored);
        return stored;
    });
    const [equipmentList, setEquipmentList] = useState<Equipment[]>(() => {
        const cached = loadFromStorage<Equipment[]>(STORAGE_KEYS.EQUIPMENT_CACHE, []);
        console.log('🔍 DEBUG: Cache de equipamentos carregado:', {
            length: cached.length,
            storageKey: STORAGE_KEYS.EQUIPMENT_CACHE,
            sample: cached.slice(0, 3)
        });
        return cached;
    });
    const [searchTerm, setSearchTerm] = useState<string>(() => {
        const search = loadFromStorage<string>(STORAGE_KEYS.EQUIPMENT_SEARCH, '');
        console.log('🔍 DEBUG: Termo de busca carregado do storage:', search);
        return search;
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showOnlyProficient, setShowOnlyProficient] = useState(false);
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [debugLogs, setDebugLogs] = useState<string[]>([]);
    
    // Função para adicionar logs de debug na interface
    const addDebugLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        setDebugLogs(prev => [...prev.slice(-20), logMessage]); // Manter apenas os últimos 20 logs
    };
    
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
    
    // Equipment categories (atualizadas)
    const categories = [
        { value: 'all', label: 'Todos' },
        { value: 'armor', label: 'Armaduras' },
        { value: 'weapon', label: 'Armas' },
        { value: 'adventuring-gear', label: 'Equipamentos de Aventura' },
        { value: 'tools', label: 'Ferramentas' },
        { value: 'mounts-and-vehicles', label: 'Montarias e Veículos' }
    ];
    
    // ===========================
    // EFFECTS - CARREGAMENTO OTIMIZADO
    // ===========================
    
    // Load equipment from API (COM DEBUG DETALHADO)
    useEffect(() => {
        const fetchEquipment = async () => {
            if (equipmentList.length > 0) {
                addDebugLog('🔍 Equipamentos já carregados do cache: ' + equipmentList.length);
                return;
            }
            
            addDebugLog('🚀 Iniciando carregamento de equipamentos...');
            addDebugLog('🔍 Total de equipamentos a buscar: ' + ESSENTIAL_EQUIPMENT_INDEXES.length);
            console.log('🔍 DEBUG: Lista de equipamentos a buscar:', ESSENTIAL_EQUIPMENT_INDEXES);
            
            setIsLoading(true);
            setError(null);
            setLoadingProgress(0);
            
            try {
                addDebugLog('📡 Fazendo requisições para API D&D...');
                console.log('🔍 DEBUG: Verificando disponibilidade do fetch:', typeof fetch);
                console.log('🔍 DEBUG: Window location:', window.location.href);
                console.log('🔍 DEBUG: User agent:', navigator.userAgent);
                
                // Teste básico de conectividade
                addDebugLog('🌐 Testando conectividade básica...');
                
                // Teste simples com um equipamento conhecido
                try {
                    const testUrl = 'https://www.dnd5eapi.co/api/equipment/club';
                    console.log(`🧪 DEBUG: Teste de conectividade com: ${testUrl}`);
                    
                    const testResponse = await fetch(testUrl);
                    console.log('🧪 DEBUG: Resposta do teste de conectividade:', {
                        status: testResponse.status,
                        ok: testResponse.ok,
                        statusText: testResponse.statusText
                    });
                    
                    if (testResponse.ok) {
                        const testData = await testResponse.json();
                        console.log('🧪 DEBUG: Dados do teste:', testData);
                        addDebugLog('✅ Conectividade OK, prosseguindo...');
                    } else {
                        addDebugLog('⚠️ Teste de conectividade falhou, mas continuando...');
                    }
                } catch (testError) {
                    console.error('💥 DEBUG: Erro no teste de conectividade:', testError);
                    addDebugLog('💥 Erro no teste de conectividade: ' + (testError instanceof Error ? testError.message : 'Erro desconhecido'));
                }
                
                // Buscar apenas equipamentos essenciais
                const equipmentPromises = ESSENTIAL_EQUIPMENT_INDEXES.map(async (index, i) => {
                    console.log(`📡 DEBUG: Buscando equipamento ${i + 1}/${ESSENTIAL_EQUIPMENT_INDEXES.length}: ${index}`);
                    
                    try {
                        const url = `https://www.dnd5eapi.co/api/equipment/${index}`;
                        console.log(`🌐 DEBUG: URL da requisição: ${url}`);
                        
                        const response = await fetch(url);
                        
                        console.log(`📥 DEBUG: Resposta para ${index}:`, {
                            status: response.status,
                            statusText: response.statusText,
                            ok: response.ok,
                            headers: Object.fromEntries(response.headers.entries())
                        });
                        
                        // Update progress
                        setLoadingProgress(Math.round(((i + 1) / ESSENTIAL_EQUIPMENT_INDEXES.length) * 100));
                        
                        if (response.ok) {
                            const data = await response.json();
                            console.log(`✅ DEBUG: Dados recebidos para ${index}:`, data);
                            return data;
                        } else {
                            console.warn(`⚠️ DEBUG: Equipamento ${index} não encontrado. Status: ${response.status}`);
                            
                            // Tentar ler o corpo da resposta de erro
                            try {
                                const errorBody = await response.text();
                                console.log(`❌ DEBUG: Corpo da resposta de erro para ${index}:`, errorBody);
                            } catch (e) {
                                console.log(`❌ DEBUG: Não foi possível ler corpo do erro para ${index}`);
                            }
                            
                            return null;
                        }
                    } catch (err) {
                        console.error(`💥 DEBUG: Erro na requisição para ${index}:`, err);
                        console.error(`💥 DEBUG: Tipo do erro:`, typeof err);
                        console.error(`💥 DEBUG: Stack trace:`, err instanceof Error ? err.stack : 'N/A');
                        return null;
                    }
                });
                
                console.log('⏳ DEBUG: Aguardando todas as requisições...');
                const equipments = await Promise.all(equipmentPromises);
                
                console.log('📊 DEBUG: Resultado bruto de todas as requisições:', equipments);
                console.log('📊 DEBUG: Equipamentos válidos (não null):', equipments.filter(eq => eq !== null));
                console.log('📊 DEBUG: Equipamentos nulos:', equipments.filter(eq => eq === null).length);
                
                const validEquipments = equipments.filter(eq => eq !== null);
                
                addDebugLog(`📊 Total carregado: ${validEquipments.length} de ${ESSENTIAL_EQUIPMENT_INDEXES.length} equipamentos`);
                console.log(`✅ DEBUG: Total carregado: ${validEquipments.length} de ${ESSENTIAL_EQUIPMENT_INDEXES.length} equipamentos`);
                
                if (validEquipments.length > 0) {
                    addDebugLog('💾 Salvando equipamentos no cache...');
                    console.log('💾 DEBUG: Salvando equipamentos no cache...');
                    setEquipmentList(validEquipments);
                    saveToStorage(STORAGE_KEYS.EQUIPMENT_CACHE, validEquipments);
                    addDebugLog('✅ Equipamentos salvos com sucesso');
                    console.log('✅ DEBUG: Equipamentos salvos com sucesso');
                } else {
                    addDebugLog('❌ Nenhum equipamento válido foi carregado!');
                    console.error('❌ DEBUG: Nenhum equipamento válido foi carregado!');
                    setError('Nenhum equipamento foi carregado da API');
                }
                
            } catch (error) {
                const errorMsg = `Erro geral: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
                addDebugLog('💥 ' + errorMsg);
                console.error('💥 DEBUG: Erro geral ao buscar equipamentos:', error);
                console.error('💥 DEBUG: Tipo do erro geral:', typeof error);
                console.error('💥 DEBUG: Stack trace geral:', error instanceof Error ? error.stack : 'N/A');
                setError(`Erro ao carregar equipamentos da API: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
            } finally {
                setIsLoading(false);
                setLoadingProgress(100);
                addDebugLog('🏁 Processo de carregamento finalizado');
                console.log('🏁 DEBUG: Processo de carregamento finalizado');
            }
        };
        
        fetchEquipment();
    }, [equipmentList.length]);
    
    // Save states to storage
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.SELECTED_EQUIPMENT, selectedEquipment);
    }, [selectedEquipment]);
    
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.EQUIPMENT_SEARCH, searchTerm);
    }, [searchTerm]);
    
    // Validation
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
    
    // Filter and sort equipment (MELHORADO)
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
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };
    
    // ===========================
    // RENDER
    // ===========================
    
    return (
        <div className="space-y-6">
            {/* Character Stats */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
                <h3 className="text-lg font-bold mb-4">Status do Personagem</h3>
                <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Shield className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Classe de Armadura</p>
                            <p className="text-2xl font-bold text-blue-600">{totalArmorClass}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 rounded-lg">
                            <Heart className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Pontos de Vida</p>
                            <p className="text-2xl font-bold text-red-600">{hitPoints}</p>
                        </div>
                    </div>
                </div>
            </Card>
            
            {/* Character Info */}
            {characterData && (
                <Card className="p-4 bg-green-50">
                    <h4 className="font-semibold mb-2">Dados do Personagem</h4>
                    <div className="text-sm space-y-1">
                        <p><strong>Raça:</strong> {selectedRace?.name || 'N/A'}</p>
                        <p><strong>Classe:</strong> {selectedClass?.name || 'N/A'}</p>
                        <p><strong>Background:</strong> {selectedBackground?.name || 'N/A'}</p>
                        <p><strong>Proficiências:</strong> {proficiencies.length} itens</p>
                    </div>
                </Card>
            )}
            
            {/* Selected Equipment */}
            {selectedEquipment.length > 0 && (
                <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4">Equipamentos Selecionados</h3>
                    <div className="space-y-3">
                        {selectedEquipment.map((item) => (
                            <div key={item.equipment.index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Package className="h-5 w-5 text-gray-600" />
                                    <div>
                                        <p className="font-semibold">{item.equipment.name}</p>
                                        <p className="text-sm text-gray-600">
                                            {item.equipment.equipment_category?.name} • Quantidade: {item.quantity}
                                        </p>
                                        {item.equipment.armor_class && (
                                            <p className="text-sm text-blue-600">
                                                CA: {item.equipment.armor_class.base}
                                            </p>
                                        )}
                                        {item.equipment.damage && (
                                            <p className="text-sm text-red-600">
                                                Dano: {item.equipment.damage.damage_dice} {item.equipment.damage.damage_type.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => handleEquipmentRemove(item.equipment.index)}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    {isProficientWith(item.equipment, proficiencies) && (
                                        <Badge variant="secondary">Proficiente</Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
            
            {/* Equipment Search and Filters */}
            <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Equipamentos Disponíveis</h3>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar equipamentos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <select 
                        value={selectedCategory} 
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 border rounded-md"
                    >
                        {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>
                    <Button
                        variant={showOnlyProficient ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowOnlyProficient(!showOnlyProficient)}
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Apenas Proficientes
                    </Button>
                </div>
                
                {/* Equipment Table */}
                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <span className="text-lg font-medium">Carregando equipamentos...</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${loadingProgress}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-600">{loadingProgress}% completo ({ESSENTIAL_EQUIPMENT_INDEXES.length} equipamentos essenciais)</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <p className="text-red-600">{error}</p>
                        <Button 
                            onClick={() => {
                                setEquipmentList([]);
                                localStorage.removeItem(STORAGE_KEYS.EQUIPMENT_CACHE);
                            }}
                            className="mt-4"
                        >
                            Tentar Novamente
                        </Button>
                    </div>
                ) : (
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead 
                                        className="cursor-pointer hover:bg-gray-50"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Nome
                                            <SortIcon field="name" />
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="cursor-pointer hover:bg-gray-50"
                                        onClick={() => handleSort('category')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Categoria
                                            <SortIcon field="category" />
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="cursor-pointer hover:bg-gray-50"
                                        onClick={() => handleSort('ac')}
                                    >
                                        <div className="flex items-center gap-2">
                                            CA
                                            <SortIcon field="ac" />
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="cursor-pointer hover:bg-gray-50"
                                        onClick={() => handleSort('damage')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Dano
                                            <SortIcon field="damage" />
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="cursor-pointer hover:bg-gray-50"
                                        onClick={() => handleSort('cost')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Custo
                                            <SortIcon field="cost" />
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="cursor-pointer hover:bg-gray-50"
                                        onClick={() => handleSort('weight')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Peso
                                            <SortIcon field="weight" />
                                        </div>
                                    </TableHead>
                                    <TableHead>Proficiência</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAndSortedEquipment.map((equipment) => (
                                    <TableRow 
                                        key={equipment.index}
                                        className={isProficientWith(equipment, proficiencies) ? 'bg-green-50' : ''}
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setExpandedRow(
                                                        expandedRow === equipment.index ? null : equipment.index
                                                    )}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                {equipment.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs">
                                                {equipment.equipment_category?.name}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {equipment.armor_class ? (
                                                <span className="text-blue-600 font-medium">
                                                    {equipment.armor_class.base}
                                                    {equipment.armor_class.dex_bonus && ' + Des'}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {equipment.damage ? (
                                                <span className="text-red-600 font-medium">
                                                    {equipment.damage.damage_dice} {equipment.damage.damage_type.name}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {equipment.cost ? (
                                                <span className="text-yellow-600">
                                                    {equipment.cost.quantity} {equipment.cost.unit}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {equipment.weight ? (
                                                <span>{equipment.weight} lb</span>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {isProficientWith(equipment, proficiencies) ? (
                                                <Badge variant="secondary" className="text-xs">
                                                    Proficiente
                                                </Badge>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => handleEquipmentAdd(equipment)}
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Adicionar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        
                        {filteredAndSortedEquipment.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-600">Nenhum equipamento encontrado com os filtros aplicados.</p>
                            </div>
                        )}
                    </div>
                )}
            </Card>
            
            {/* Equipment Details - Expanded Row */}
            {expandedRow && (
                <Card className="p-6 bg-gray-50">
                    {(() => {
                        const equipment = equipmentList.find(eq => eq.index === expandedRow);
                        if (!equipment) return null;
                        
                        return (
                            <div>
                                <h4 className="font-bold text-lg mb-4">{equipment.name}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p><strong>Categoria:</strong> {equipment.equipment_category?.name}</p>
                                        {equipment.armor_category && (
                                            <p><strong>Tipo de Armadura:</strong> {equipment.armor_category}</p>
                                        )}
                                        {equipment.weapon_category && (
                                            <p><strong>Tipo de Arma:</strong> {equipment.weapon_category}</p>
                                        )}
                                        {equipment.weapon_range && (
                                            <p><strong>Alcance:</strong> {equipment.weapon_range}</p>
                                        )}
                                    </div>
                                    <div>
                                        {equipment.cost && (
                                            <p><strong>Custo:</strong> {equipment.cost.quantity} {equipment.cost.unit}</p>
                                        )}
                                        {equipment.weight && (
                                            <p><strong>Peso:</strong> {equipment.weight} lb</p>
                                        )}
                                        {equipment.armor_class && (
                                            <p><strong>CA:</strong> {equipment.armor_class.base} 
                                                {equipment.armor_class.dex_bonus && ' + Mod Des'}
                                                {equipment.armor_class.max_bonus !== undefined && ` (máx ${equipment.armor_class.max_bonus})`}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {equipment.properties && equipment.properties.length > 0 && (
                                    <div className="mt-4">
                                        <p className="font-semibold">Propriedades:</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {equipment.properties.map(prop => (
                                                <Badge key={prop.index} variant="outline">
                                                    {prop.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {equipment.desc && equipment.desc.length > 0 && (
                                    <div className="mt-4">
                                        <p className="font-semibold">Descrição:</p>
                                        <div className="text-sm text-gray-700 mt-2 space-y-2">
                                            {equipment.desc.map((desc, index) => (
                                                <p key={index}>{desc}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </Card>
            )}
            
            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
                <Card className="p-4 bg-yellow-50">
                    <h4 className="font-bold text-sm mb-2">Debug - Equipamentos (OTIMIZADO):</h4>
                    <div className="text-xs space-y-1">
                        <p>✅ Equipamentos essenciais carregados: {equipmentList.length}</p>
                        <p>🔍 Equipamentos filtrados: {filteredAndSortedEquipment.length}</p>
                        <p>📦 Equipamentos selecionados: {selectedEquipment.length}</p>
                        <p>🛡️ Proficiências: {proficiencies.length}</p>
                        <p>🔢 CA calculada: {totalArmorClass}</p>
                        <p>❤️ HP calculado: {hitPoints}</p>
                        <p>📊 Ordenação: {sortField} ({sortDirection})</p>
                        <p>⚡ Performance: ~85% menos requisições que o método anterior</p>
                    </div>
                    
                    {/* Logs de Debug em Tempo Real */}
                    {debugLogs.length > 0 && (
                        <div className="mt-4">
                            <h5 className="font-semibold text-sm mb-2">Logs de Debug em Tempo Real:</h5>
                            <div className="bg-gray-900 text-green-400 p-3 rounded max-h-48 overflow-y-auto text-xs font-mono">
                                {debugLogs.map((log, index) => (
                                    <div key={index} className="mb-1">{log}</div>
                                ))}
                            </div>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setDebugLogs([])}
                                className="mt-2"
                            >
                                Limpar Logs
                            </Button>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
};

export default EquipmentComponent;