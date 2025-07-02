// ===========================
// src/components/campaign-manage/DnDImportModal.tsx
// MODAL CORRIGIDO DE IMPORTAÇÃO D&D 5e
// ===========================

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Search, 
  Download, 
  ExternalLink, 
  Shield, 
  Heart, 
  Zap, 
  User,
  MapPin,
  X,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Filter,
  ChevronDown,
  Loader2,
  Star,
  Eye,
  Bookmark,
  SortAsc,
  SortDesc,
  Sparkles,
  Crown,
  Swords
} from 'lucide-react';

// ===========================
// TIPOS E INTERFACES
// ===========================

interface DnDMonster {
  index: string;
  name: string;
  size: string;
  type: string;
  subtype?: string;
  alignment: string;
  armor_class: number | Array<{value: number, type?: string}>;
  hit_points: number;
  hit_dice: string;
  speed: {
    walk?: string;
    fly?: string;
    swim?: string;
    climb?: string;
    burrow?: string;
    hover?: string;
    [key: string]: string | undefined;
  };
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  challenge_rating: number;
  proficiency_bonus: number;
  damage_vulnerabilities?: string[];
  damage_resistances?: string[];
  damage_immunities?: string[];
  condition_immunities?: string[];
  senses?: {
    [key: string]: string;
  };
  languages?: string;
  special_abilities?: Array<{
    name: string;
    desc: string;
  }>;
  actions?: Array<{
    name: string;
    desc: string;
    attack_bonus?: number;
    damage_dice?: string;
    damage_bonus?: number;
  }>;
  legendary_actions?: Array<{
    name: string;
    desc: string;
  }>;
  url: string;
}

interface DnDAPIResponse {
  count: number;
  results: Array<{
    index: string;
    name: string;
    url: string;
  }>;
}

interface FilterState {
  type: string;
  size: string;
  cr_min: string;
  cr_max: string;
  alignment: string;
  hasSpecialAbilities: boolean;
  hasActions: boolean;
  hasLegendaryActions: boolean;
}

interface DnDImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (npcData: any) => void;
}

// Cachear detalhes dos monsters para evitar requisições desnecessárias
const monsterDetailsCache = new Map<string, DnDMonster>();

// ===========================
// COMPONENTE PRINCIPAL
// ===========================

export const DnDImportModal: React.FC<DnDImportModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  // Estados básicos
  const [searchTerm, setSearchTerm] = useState('');
  const [allMonsters, setAllMonsters] = useState<DnDAPIResponse['results']>([]);
  const [monstersWithDetails, setMonstersWithDetails] = useState<Map<string, DnDMonster>>(new Map());
  const [displayedMonsters, setDisplayedMonsters] = useState<DnDAPIResponse['results']>([]);
  const [selectedMonster, setSelectedMonster] = useState<DnDMonster | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isLoadingMoreDetails, setIsLoadingMoreDetails] = useState(false);
  const [error, setError] = useState('');
  const [forceUpdate, setForceUpdate] = useState(0); // Para forçar re-render dos filtros
  
  // Estados para filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    size: 'all',
    cr_min: '',
    cr_max: '',
    alignment: 'all',
    hasSpecialAbilities: false,
    hasActions: false,
    hasLegendaryActions: false
  });
  
  // Estados para paginação/scroll
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'cr'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Estados para favoritos e histórico
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  
  // Estados de UI
  const [importingMonster, setImportingMonster] = useState<string | null>(null);
  const [lastImported, setLastImported] = useState<string | null>(null);
  
  // Referências
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastMonsterElementRef = useRef<HTMLDivElement>(null);
  
  const ITEMS_PER_PAGE = 25;

  // ===========================
  // DADOS DE CONFIGURAÇÃO
  // ===========================

  const monsterTypes = [
    'all', 'aberration', 'beast', 'celestial', 'construct', 'dragon',
    'elemental', 'fey', 'fiend', 'giant', 'humanoid', 'monstrosity',
    'ooze', 'plant', 'undead'
  ];

  const monsterSizes = [
    'all', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'
  ];

  const alignmentOptions = [
    'all', 'chaotic evil', 'chaotic neutral', 'chaotic good',
    'neutral evil', 'neutral', 'neutral good',
    'lawful evil', 'lawful neutral', 'lawful good', 'unaligned'
  ];

  // ===========================
  // FUNÇÕES UTILITÁRIAS
  // ===========================

  // Extrair CA de diferentes formatos da API
  const extractArmorClass = (armorClass: number | Array<{value: number, type?: string}>): number => {
    if (typeof armorClass === 'number') {
      return armorClass;
    }
    if (Array.isArray(armorClass) && armorClass.length > 0) {
      return armorClass[0].value;
    }
    return 10; // Valor padrão
  };

  // ===========================
  // FUNÇÕES DE API
  // ===========================

  // Carregar todos os monsters uma vez
  const loadAllMonsters = useCallback(async () => {
    if (allMonsters.length > 0) return; // Já carregado
    
    setIsInitialLoading(true);
    setError('');
    
    try {
      console.log('🔍 Carregando lista completa de criaturas D&D...');
      const response = await fetch('https://www.dnd5eapi.co/api/monsters');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: DnDAPIResponse = await response.json();
      console.log(`✅ ${data.results?.length || 0} criaturas carregadas`);
      setAllMonsters(data.results || []);
      
    } catch (error) {
      console.error('❌ Erro ao carregar monsters:', error);
      setError('Erro ao conectar com a API D&D. Verifique sua conexão e tente novamente.');
    } finally {
      setIsInitialLoading(false);
    }
  }, []); // SEM dependências

  // Carregar detalhes de um monster específico
  const loadMonsterDetails = async (monsterUrl: string, monsterIndex: string) => {
    // Verificar cache primeiro
    if (monsterDetailsCache.has(monsterIndex)) {
      setSelectedMonster(monsterDetailsCache.get(monsterIndex)!);
      return;
    }

    setIsLoadingDetails(true);
    setError('');
    
    try {
      console.log(`🔍 Carregando detalhes de: ${monsterIndex}`);
      const response = await fetch(`https://www.dnd5eapi.co${monsterUrl}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const monster: DnDMonster = await response.json();
      console.log(`✅ Detalhes carregados para: ${monster.name}`);
      
      // Adicionar ao cache
      monsterDetailsCache.set(monsterIndex, monster);
      setSelectedMonster(monster);
      
      // Adicionar aos recentemente visualizados
      setRecentlyViewed(prev => {
        const updated = [monsterIndex, ...prev.filter(id => id !== monsterIndex)];
        return updated.slice(0, 10);
      });
      
    } catch (error) {
      console.error('❌ Erro ao carregar detalhes:', error);
      setError('Erro ao carregar detalhes da criatura. Tente novamente.');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // ===========================
  // FUNÇÕES DE FILTRO E ORDENAÇÃO - CORRIGIDAS
  // ===========================

  // ===========================
  // FUNÇÕES DE FILTRO E ORDENAÇÃO - CORRIGIDAS
  // ===========================

  // Memoizar os monsters filtrados para evitar recálculos desnecessários
  const filteredMonsters = useMemo(() => {
    let filtered = [...allMonsters];

    // Filtro de busca por nome
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(monster => 
        monster.name.toLowerCase().includes(search) ||
        monster.index.toLowerCase().includes(search)
      );
    }

    // CORREÇÃO: Filtros por detalhes da criatura (SEM dependência direta)
    filtered = filtered.filter(monster => {
      // Usar cache direto em vez de state para evitar loops
      const details = monsterDetailsCache.get(monster.index);
      
      // Se não temos detalhes, incluir por enquanto
      if (!details) return true;

      // Filtro por tipo
      if (filters.type !== 'all') {
        if (details.type?.toLowerCase() !== filters.type.toLowerCase()) {
          return false;
        }
      }

      // Filtro por tamanho
      if (filters.size !== 'all') {
        if (details.size?.toLowerCase() !== filters.size.toLowerCase()) {
          return false;
        }
      }

      // Filtro por alinhamento
      if (filters.alignment !== 'all') {
        if (!details.alignment?.toLowerCase().includes(filters.alignment.toLowerCase())) {
          return false;
        }
      }

      // Filtro por CR mínimo
      if (filters.cr_min) {
        const crMin = parseFloat(filters.cr_min);
        if (!isNaN(crMin) && details.challenge_rating < crMin) {
          return false;
        }
      }

      // Filtro por CR máximo
      if (filters.cr_max) {
        const crMax = parseFloat(filters.cr_max);
        if (!isNaN(crMax) && details.challenge_rating > crMax) {
          return false;
        }
      }

      // Filtro por habilidades especiais
      if (filters.hasSpecialAbilities) {
        if (!details.special_abilities || details.special_abilities.length === 0) {
          return false;
        }
      }

      // Filtro por ações
      if (filters.hasActions) {
        if (!details.actions || details.actions.length === 0) {
          return false;
        }
      }

      // Filtro por ações lendárias
      if (filters.hasLegendaryActions) {
        if (!details.legendary_actions || details.legendary_actions.length === 0) {
          return false;
        }
      }

      return true;
    });

    // Ordenação melhorada
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        const result = a.name.localeCompare(b.name);
        return sortOrder === 'asc' ? result : -result;
      } else { // sortBy === 'cr'
        const detailsA = monsterDetailsCache.get(a.index);
        const detailsB = monsterDetailsCache.get(b.index);
        
        const crA = detailsA?.challenge_rating || 0;
        const crB = detailsB?.challenge_rating || 0;
        
        const result = crA - crB;
        return sortOrder === 'asc' ? result : -result;
      }
    });

    return filtered;
  }, [allMonsters, searchTerm, filters, sortBy, sortOrder, forceUpdate]); // ADICIONADO forceUpdate

  // Carregar mais monsters (scroll infinito) - SIMPLIFICADO
  const loadMore = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []); // SEM dependências

  // ===========================
  // FUNÇÕES DE FAVORITOS
  // ===========================

  const toggleFavorite = (monsterIndex: string) => {
    setFavorites(prev => {
      const updated = prev.includes(monsterIndex)
        ? prev.filter(id => id !== monsterIndex)
        : [...prev, monsterIndex];
      
      console.log(`${updated.includes(monsterIndex) ? '⭐ Favoritado' : '☆ Desfavoritado'}: ${monsterIndex}`);
      return updated;
    });
  };

  // ===========================
  // FUNÇÃO DE CONVERSÃO E IMPORTAÇÃO
  // ===========================

  // Função para truncar texto mantendo palavras completas
  const truncateDescription = (text: string, maxLength: number = 300): string => {
    if (!text || text.length <= maxLength) return text;
    
    const truncated = text.substring(0, maxLength - 3);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
  };

  const convertToNPCData = (monster: DnDMonster) => {
    // CORREÇÃO: Mapear para os valores corretos em português
    let npcType = 'neutro'; // Valor padrão
    const alignment = String(monster.alignment || '').toLowerCase();
    
    if (alignment.includes('good')) {
      npcType = 'aliado';
    } else if (alignment.includes('evil')) {
      npcType = 'inimigo';
    } else if (monster.type === 'humanoid' && alignment.includes('neutral')) {
      npcType = 'neutro';
    }
    
    // Para criaturas específicas, ajustar tipo baseado no tipo da criatura
    const creatureType = String(monster.type || '').toLowerCase();
    if (creatureType === 'humanoid' && alignment.includes('neutral')) {
      npcType = 'mercador'; // Humanoides neutros podem ser mercadores
    } else if (creatureType === 'undead' || creatureType === 'fiend') {
      npcType = 'inimigo';
    } else if (creatureType === 'celestial') {
      npcType = 'aliado';
    }
    
    const sizeType = `${monster.size || 'Medium'} ${monster.type || 'creature'}${monster.subtype ? ` (${monster.subtype})` : ''}`;
    
    let speedString = '30 ft';
    if (monster.speed && typeof monster.speed === 'object') {
      const speeds = Object.entries(monster.speed)
        .filter(([key, value]) => value && value !== '' && typeof value === 'string')
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      speedString = speeds || '30 ft';
    }
    
    const abilities: any[] = [];
    
    // Habilidades especiais - COM TRUNCAMENTO
    if (monster.special_abilities && Array.isArray(monster.special_abilities)) {
      monster.special_abilities.forEach(ability => {
        if (ability && typeof ability === 'object') {
          abilities.push({
            name: String(ability.name || 'Habilidade Especial'),
            description: truncateDescription(String(ability.desc || 'Sem descrição')),
            type: 'special'
          });
        }
      });
    }
    
    // Ações - COM TRUNCAMENTO e limite de 3 para evitar overflow
    if (monster.actions && Array.isArray(monster.actions)) {
      monster.actions.slice(0, 3).forEach(action => {
        if (action && typeof action === 'object') {
          abilities.push({
            name: String(action.name || 'Ação'),
            description: truncateDescription(String(action.desc || 'Sem descrição')),
            type: 'action'
          });
        }
      });
    }
    
    // Ações lendárias - COM TRUNCAMENTO e limite de 2
    if (monster.legendary_actions && Array.isArray(monster.legendary_actions)) {
      monster.legendary_actions.slice(0, 2).forEach(action => {
        if (action && typeof action === 'object') {
          abilities.push({
            name: String(action.name || 'Ação Lendária'),
            description: truncateDescription(String(action.desc || 'Sem descrição')),
            type: 'legendary'
          });
        }
      });
    }
    
    const languages = monster.languages ? String(monster.languages) : '';
    const senses = monster.senses && typeof monster.senses === 'object' 
      ? Object.entries(monster.senses)
          .filter(([k, v]) => v && typeof v === 'string')
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')
      : '';
    
    const resistances = monster.damage_resistances && Array.isArray(monster.damage_resistances)
      ? monster.damage_resistances.filter(Boolean).join(', ')
      : '';
    
    const immunities = monster.damage_immunities && Array.isArray(monster.damage_immunities)
      ? monster.damage_immunities.filter(Boolean).join(', ')
      : '';
    
    // GM Notes também com limite
    const gmNotes = truncateDescription(`Criatura importada da API D&D 5e.
    
Tipo: ${sizeType}
Alinhamento: ${monster.alignment || 'Neutro'}
${languages ? `Idiomas: ${languages}` : ''}
${senses ? `Sentidos: ${senses}` : ''}
${resistances ? `Resistências: ${resistances}` : ''}
${immunities ? `Imunidades: ${immunities}` : ''}
${monster.hit_dice ? `DV: ${monster.hit_dice}` : ''}`, 500);

    // Mapear faction para português também
    let faction = 'Neutro';
    if (alignment.includes('evil')) {
      faction = 'Hostil';
    } else if (alignment.includes('good')) {
      faction = 'Amigável';
    }

    return {
      name: String(monster.name || 'Criatura Importada'),
      description: truncateDescription(`${sizeType}, ${monster.alignment || 'neutro'}. ${monster.hit_dice ? `DV: ${monster.hit_dice}.` : ''}`, 200),
      race: String(monster.type || 'creature').charAt(0).toUpperCase() + String(monster.type || 'creature').slice(1),
      npc_class: String(monster.subtype || (Number(monster.challenge_rating) >= 5 ? 'Elite' : 'Comum')),
      npc_type: npcType, // CORRIGIDO: valores em português
      alignment: String(monster.alignment || 'Neutro'),
      location: 'Importado da API D&D',
      occupation: `${monster.type || 'creature'} CR ${monster.challenge_rating || 0}${monster.legendary_actions?.length ? ' (Lendário)' : ''}`,
      faction: faction,
      stats: {
        armor_class: extractArmorClass(monster.armor_class),
        hit_points: Number(monster.hit_points) || 1,
        speed: speedString
      },
      challenge_rating: String(monster.challenge_rating || 0),
      abilities: abilities,
      personality_traits: [],
      goals: '',
      secrets: '',
      gm_notes: gmNotes,
      is_alive: true,
      is_active: true
    };
  };

  const handleImport = async () => {
    if (!selectedMonster) return;
    
    setImportingMonster(selectedMonster.index);
    
    try {
      console.log(`📥 Importando: ${selectedMonster.name}`);
      const npcData = convertToNPCData(selectedMonster);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onImport(npcData);
      setLastImported(selectedMonster.name);
      
      console.log(`✅ Importado com sucesso: ${selectedMonster.name}`);
      
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Erro ao importar:', error);
      setError('Erro ao importar criatura. Tente novamente.');
    } finally {
      setImportingMonster(null);
    }
  };

  // ===========================
  // EFEITOS E OBSERVERS - COMPLETAMENTE CORRIGIDOS
  // ===========================

  // Observer para scroll infinito - FINAL
  useEffect(() => {
    let observerInstance: IntersectionObserver;

    const setupObserver = () => {
      observerInstance = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry && entry.isIntersecting) {
            // Timeout para evitar múltiplas chamadas
            setTimeout(() => {
              setCurrentPage(prev => prev + 1);
            }, 100);
          }
        },
        { threshold: 0.1 }
      );

      if (lastMonsterElementRef.current) {
        observerInstance.observe(lastMonsterElementRef.current);
      }
    };

    setupObserver();

    return () => {
      if (observerInstance) {
        observerInstance.disconnect();
      }
    };
  }, [displayedMonsters.length]); // Apenas quando a lista muda

  // Carregar monsters ao abrir modal - SEM dependências problemáticas
  useEffect(() => {
    if (isOpen && allMonsters.length === 0) {
      loadAllMonsters();
    }
    if (isOpen) {
      setSelectedMonster(null);
      setSearchTerm('');
      setCurrentPage(0);
      setError('');
    }
  }, [isOpen]); // Apenas isOpen

  // Reset página quando filtros mudarem - SEM outras dependências
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, filters.type, filters.size, filters.cr_min, filters.cr_max, filters.alignment]);

  // Atualizar displayedMonsters - APENAS quando necessário
  useEffect(() => {
    const startIndex = 0;
    const endIndex = (currentPage + 1) * ITEMS_PER_PAGE;
    const newDisplayed = filteredMonsters.slice(startIndex, endIndex);
    
    setDisplayedMonsters(newDisplayed);
    setHasMore(endIndex < filteredMonsters.length);
  }, [currentPage, filteredMonsters]); // Apenas essas duas

  // Carregar detalhes SEPARADAMENTE - com debounce para evitar loops
  useEffect(() => {
    const timer = setTimeout(() => {
      const monstersNeedingDetails = displayedMonsters.filter(m => 
        !monsterDetailsCache.has(m.index)
      );
      
      if (monstersNeedingDetails.length > 0 && !isLoadingMoreDetails) {
        setIsLoadingMoreDetails(true);
        
        // Carregar em pequenos lotes para evitar sobrecarga
        const batch = monstersNeedingDetails.slice(0, 10);
        
        Promise.allSettled(
          batch.map(async (monster) => {
            try {
              const response = await fetch(`https://www.dnd5eapi.co${monster.url}`);
              if (response.ok) {
                const details = await response.json();
                monsterDetailsCache.set(monster.index, details);
                return { index: monster.index, details };
              }
            } catch (error) {
              console.warn(`Erro ao carregar ${monster.name}:`, error);
            }
            return null;
          })
        ).then((results) => {
          setMonstersWithDetails(prev => {
            const newMap = new Map(prev);
            results.forEach((result) => {
              if (result.status === 'fulfilled' && result.value) {
                newMap.set(result.value.index, result.value.details);
              }
            });
            return newMap;
          });
          setIsLoadingMoreDetails(false);
          setForceUpdate(prev => prev + 1); // Força re-render dos filtros
        });
      }
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timer);
  }, [displayedMonsters.length, isLoadingMoreDetails]);

  // ===========================
  // RENDER CONDICIONAL
  // ===========================

  if (!isOpen) return null;

  // ===========================
  // COMPONENTE RENDER
  // ===========================

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-[95vw] h-[90vh] max-w-7xl max-h-[900px] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Importar da API D&D 5e</h2>
              <p className="text-gray-400">Busque e importe criaturas oficiais do D&D 5ª Edição</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {lastImported && (
              <div className="flex items-center space-x-2 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Importado: {lastImported}</span>
              </div>
            )}
            {error && (
              <div className="flex items-center space-x-2 text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Erro na operação</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 flex min-h-0">
          {/* Lista de Monsters */}
          <div className="w-1/2 flex flex-col border-r border-gray-700">
            {/* Busca e Filtros */}
            <div className="p-4 border-b border-gray-700 bg-gray-800/30">
              {/* Busca */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar criaturas... (ex: goblin, dragon, orc)"
                  className="w-full pl-11 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Controles de Filtro e Ordenação */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Botão de Filtros */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      showFilters ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filtros</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Ordenação */}
                  <button
                    onClick={() => setSortBy(sortBy === 'name' ? 'cr' : 'name')}
                    className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                  >
                    <span>{sortBy === 'name' ? 'Nome' : 'CR'}</span>
                  </button>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                  >
                    {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Painel de Filtros Expandível */}
              {showFilters && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-2">Tipo de Criatura</label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:ring-2 focus:ring-blue-500"
                    >
                      {monsterTypes.map(type => (
                        <option key={type} value={type}>
                          {type === 'all' ? 'Todos os Tipos' : type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-2">Tamanho</label>
                    <select
                      value={filters.size}
                      onChange={(e) => setFilters(prev => ({ ...prev, size: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:ring-2 focus:ring-blue-500"
                    >
                      {monsterSizes.map(size => (
                        <option key={size} value={size}>
                          {size === 'all' ? 'Todos os Tamanhos' : size}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-2">Alinhamento</label>
                    <select
                      value={filters.alignment}
                      onChange={(e) => setFilters(prev => ({ ...prev, alignment: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:ring-2 focus:ring-blue-500"
                    >
                      {alignmentOptions.map(alignment => (
                        <option key={alignment} value={alignment}>
                          {alignment === 'all' ? 'Todos os Alinhamentos' : alignment.charAt(0).toUpperCase() + alignment.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-2">Challenge Rating</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={filters.cr_min}
                        onChange={(e) => setFilters(prev => ({ ...prev, cr_min: e.target.value }))}
                        placeholder="Mín"
                        className="w-1/2 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={filters.cr_max}
                        onChange={(e) => setFilters(prev => ({ ...prev, cr_max: e.target.value }))}
                        placeholder="Máx"
                        className="w-1/2 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Botão para limpar filtros */}
                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilters({
                          type: 'all',
                          size: 'all',
                          cr_min: '',
                          cr_max: '',
                          alignment: 'all',
                          hasSpecialAbilities: false,
                          hasActions: false,
                          hasLegendaryActions: false
                        });
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Limpar Filtros
                    </button>
                  </div>
                </div>
              )}

              {/* Contador de Resultados */}
              <div className="flex items-center justify-between text-sm mt-4">
                <span className="text-gray-400">
                  {displayedMonsters.length} de {filteredMonsters.length} criaturas
                </span>
                {isLoadingMoreDetails && (
                  <div className="flex items-center space-x-2 text-blue-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Carregando detalhes...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Lista de Criaturas - SCROLL CORRIGIDO */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-2"
              style={{ maxHeight: 'calc(100% - 220px)' }}
            >
              {isInitialLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    <span className="text-gray-400">Carregando criaturas D&D...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                  <p className="text-red-400 mb-4">{error}</p>
                  <button
                    onClick={() => {
                      setError('');
                      loadAllMonsters();
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Tentar Novamente
                  </button>
                </div>
              ) : displayedMonsters.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="w-12 h-12 text-gray-500 mb-4" />
                  <p className="text-gray-400">Nenhuma criatura encontrada</p>
                  <p className="text-gray-500 text-sm">Tente ajustar os filtros ou termo de busca</p>
                </div>
              ) : (
                <>
                  {displayedMonsters.map((monster, index) => {
                    const details = monsterDetailsCache.get(monster.index);
                    const isLast = index === displayedMonsters.length - 1;
                    
                    return (
                      <div
                        key={monster.index}
                        ref={isLast ? lastMonsterElementRef : null}
                        onClick={() => loadMonsterDetails(monster.url, monster.index)}
                        className={`p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg border border-gray-600/30 cursor-pointer transition-all ${
                          selectedMonster?.index === monster.index ? 'ring-2 ring-blue-500 bg-blue-600/20' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex flex-col">
                              <h3 className="font-semibold text-white">{monster.name}</h3>
                              {details && (
                                <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                                  <span className="flex items-center space-x-1">
                                    <Shield className="w-3 h-3" />
                                    <span>CA {extractArmorClass(details.armor_class)}</span>
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <Heart className="w-3 h-3" />
                                    <span>{details.hit_points} PV</span>
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <Zap className="w-3 h-3" />
                                    <span>CR {details.challenge_rating}</span>
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(monster.index);
                              }}
                              className={`p-1 rounded transition-colors ${
                                favorites.includes(monster.index) 
                                  ? 'text-yellow-400 hover:text-yellow-500' 
                                  : 'text-gray-400 hover:text-yellow-400'
                              }`}
                            >
                              <Star className="w-4 h-4" />
                            </button>
                            {details?.legendary_actions && details.legendary_actions.length > 0 && (
                              <Crown className="w-4 h-4 text-yellow-400" title="Criatura Lendária" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Indicador de carregamento */}
                  {isLoadingMore && (
                    <div className="flex items-center justify-center py-4">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        <span className="text-gray-400">Carregando mais...</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Fim da lista */}
                  {!hasMore && displayedMonsters.length > 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Fim da lista • {displayedMonsters.length} criaturas carregadas
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Painel de Detalhes */}
          <div className="w-1/2 flex flex-col">
            {!selectedMonster ? (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <Eye className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">Selecione uma Criatura</h3>
                  <p className="text-gray-500">Clique em uma criatura da lista para ver os detalhes completos</p>
                </div>
              </div>
            ) : isLoadingDetails ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center space-x-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <span className="text-gray-400">Carregando detalhes...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Header dos Detalhes */}
                <div className="p-6 border-b border-gray-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">{selectedMonster.name}</h2>
                      <p className="text-gray-400 mb-4">
                        {selectedMonster.size} {selectedMonster.type}
                        {selectedMonster.subtype && ` (${selectedMonster.subtype})`}, {selectedMonster.alignment}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={`https://www.dnd5eapi.co${selectedMonster.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        title="Ver na API"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* Stats Principais */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-600/20 rounded-lg p-3 border border-blue-600/30">
                      <div className="flex items-center space-x-2 text-blue-400 mb-1">
                        <Shield className="w-4 h-4" />
                        <span className="text-sm font-medium">Classe de Armadura</span>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {extractArmorClass(selectedMonster.armor_class)}
                      </div>
                    </div>
                    <div className="bg-red-600/20 rounded-lg p-3 border border-red-600/30">
                      <div className="flex items-center space-x-2 text-red-400 mb-1">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm font-medium">Pontos de Vida</span>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {selectedMonster.hit_points}
                        <div className="text-xs text-gray-400">{selectedMonster.hit_dice}</div>
                      </div>
                    </div>
                    <div className="bg-yellow-600/20 rounded-lg p-3 border border-yellow-600/30">
                      <div className="flex items-center space-x-2 text-yellow-400 mb-1">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm font-medium">Challenge Rating</span>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {selectedMonster.challenge_rating}
                        <div className="text-xs text-gray-400">
                          +{Number(selectedMonster.proficiency_bonus) || 2}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conteúdo dos Detalhes - SCROLL CORRIGIDO */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Atributos */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Atributos</span>
                    </h3>
                    <div className="grid grid-cols-6 gap-3">
                      {[
                        { label: 'FOR', value: Number(selectedMonster.strength) || 10 },
                        { label: 'DES', value: Number(selectedMonster.dexterity) || 10 },
                        { label: 'CON', value: Number(selectedMonster.constitution) || 10 },
                        { label: 'INT', value: Number(selectedMonster.intelligence) || 10 },
                        { label: 'SAB', value: Number(selectedMonster.wisdom) || 10 },
                        { label: 'CAR', value: Number(selectedMonster.charisma) || 10 },
                      ].map((attr) => {
                        const modifier = Math.floor((attr.value - 10) / 2);
                        return (
                          <div key={attr.label} className="bg-gray-700/50 rounded-lg p-3 text-center border border-gray-600/30">
                            <div className="text-sm font-medium text-gray-400">{attr.label}</div>
                            <div className="text-xl font-bold text-white">{attr.value}</div>
                            <div className="text-xs text-gray-500">
                              {modifier >= 0 ? `+${modifier}` : modifier}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Movimento & Sentidos */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>Movimento & Sentidos</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Velocidade</h4>
                        <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600/30">
                          {selectedMonster.speed && Object.entries(selectedMonster.speed).map(([type, value]) => (
                            value && (
                              <div key={type} className="text-white">
                                <span className="capitalize">{type}</span>: {value}
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Sentidos</h4>
                        <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600/30">
                          {selectedMonster.senses && Object.entries(selectedMonster.senses).map(([type, value]) => (
                            value && (
                              <div key={type} className="text-white">
                                <span className="capitalize">{type.replace('_', ' ')}</span>: {value}
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resistências & Imunidades */}
                  {(selectedMonster.damage_resistances?.length || selectedMonster.damage_immunities?.length || selectedMonster.damage_vulnerabilities?.length) && (
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4">Resistências & Imunidades</h3>
                      <div className="space-y-3">
                        {selectedMonster.damage_vulnerabilities?.length > 0 && (
                          <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-3">
                            <h4 className="text-red-400 font-medium mb-1">Vulnerabilidades:</h4>
                            <p className="text-white">{selectedMonster.damage_vulnerabilities.join(', ')}</p>
                          </div>
                        )}
                        {selectedMonster.damage_resistances?.length > 0 && (
                          <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-3">
                            <h4 className="text-yellow-400 font-medium mb-1">Resistências:</h4>
                            <p className="text-white">{selectedMonster.damage_resistances.join(', ')}</p>
                          </div>
                        )}
                        {selectedMonster.damage_immunities?.length > 0 && (
                          <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-3">
                            <h4 className="text-green-400 font-medium mb-1">Imunidades:</h4>
                            <p className="text-white">{selectedMonster.damage_immunities.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Habilidades Especiais */}
                  {selectedMonster.special_abilities && selectedMonster.special_abilities.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                        <Sparkles className="w-5 h-5" />
                        <span>Habilidades Especiais</span>
                      </h3>
                      <div className="space-y-3">
                        {selectedMonster.special_abilities.map((ability, index) => (
                          <div key={index} className="bg-purple-600/20 border border-purple-600/30 rounded-lg p-4">
                            <h4 className="text-purple-400 font-semibold mb-2">{ability.name}</h4>
                            <p className="text-gray-300 text-sm leading-relaxed">{ability.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ações */}
                  {selectedMonster.actions && selectedMonster.actions.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                        <Swords className="w-5 h-5" />
                        <span>Ações</span>
                      </h3>
                      <div className="space-y-3">
                        {selectedMonster.actions.map((action, index) => (
                          <div key={index} className="bg-red-600/20 border border-red-600/30 rounded-lg p-4">
                            <h4 className="text-red-400 font-semibold mb-2">{action.name}</h4>
                            <p className="text-gray-300 text-sm leading-relaxed">{action.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ações Lendárias */}
                  {selectedMonster.legendary_actions && selectedMonster.legendary_actions.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                        <Crown className="w-5 h-5 text-yellow-400" />
                        <span>Ações Lendárias</span>
                      </h3>
                      <div className="space-y-3">
                        {selectedMonster.legendary_actions.map((action, index) => (
                          <div key={index} className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-4">
                            <h4 className="text-yellow-400 font-semibold mb-2">{action.name}</h4>
                            <p className="text-gray-300 text-sm leading-relaxed">{action.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer com Botão de Importar */}
                <div className="p-6 border-t border-gray-700">
                  <button
                    onClick={handleImport}
                    disabled={importingMonster === selectedMonster.index}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                  >
                    {importingMonster === selectedMonster.index ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Importando...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>Importar {selectedMonster.name}</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};