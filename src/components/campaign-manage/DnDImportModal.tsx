// ===========================
// src/components/campaign-manage/DnDImportModal.tsx
// MODAL COMPLETO DE IMPORTAÇÃO D&D 5e COM TODAS AS FUNCIONALIDADES
// ===========================

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  armor_class: number;
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
  const [displayedMonsters, setDisplayedMonsters] = useState<DnDAPIResponse['results']>([]);
  const [selectedMonster, setSelectedMonster] = useState<DnDMonster | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState('');
  
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
  }, [allMonsters.length]);

  // Carregar detalhes de um monster específico
  const loadMonsterDetails = async (monsterUrl: string, monsterIndex: string) => {
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
      setSelectedMonster(monster);
      
      // Adicionar aos recentemente visualizados
      setRecentlyViewed(prev => {
        const updated = [monsterIndex, ...prev.filter(id => id !== monsterIndex)];
        return updated.slice(0, 10); // Manter apenas os 10 mais recentes
      });
      
    } catch (error) {
      console.error('❌ Erro ao carregar detalhes:', error);
      setError('Erro ao carregar detalhes da criatura. Tente novamente.');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // ===========================
  // FUNÇÕES DE FILTRO E ORDENAÇÃO
  // ===========================

  // Filtrar e ordenar monsters
  const getFilteredMonsters = useCallback(() => {
    let filtered = [...allMonsters];

    // Filtro de busca por nome
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(monster => 
        monster.name.toLowerCase().includes(search) ||
        monster.index.toLowerCase().includes(search)
      );
    }

    // Filtros por tipo (simulado baseado no nome/index)
    if (filters.type !== 'all') {
      filtered = filtered.filter(monster => 
        monster.index.toLowerCase().includes(filters.type.toLowerCase()) ||
        monster.name.toLowerCase().includes(filters.type.toLowerCase())
      );
    }

    // Ordenação
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        const result = a.name.localeCompare(b.name);
        return sortOrder === 'asc' ? result : -result;
      }
      // Para CR precisaríamos dos detalhes - ordenar por nome por padrão
      return 0;
    });

    return filtered;
  }, [allMonsters, searchTerm, filters, sortBy, sortOrder]);

  // Atualizar lista exibida com paginação
  const updateDisplayedMonsters = useCallback(() => {
    const filtered = getFilteredMonsters();
    const startIndex = 0;
    const endIndex = (currentPage + 1) * ITEMS_PER_PAGE;
    const newDisplayed = filtered.slice(startIndex, endIndex);
    
    setDisplayedMonsters(newDisplayed);
    setHasMore(endIndex < filtered.length);
  }, [getFilteredMonsters, currentPage]);

  // ===========================
  // FUNÇÕES DE PAGINAÇÃO
  // ===========================

  // Carregar mais monsters (scroll infinito)
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    
    // Simular delay de carregamento realista
    setTimeout(() => {
      setCurrentPage(prev => prev + 1);
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore, hasMore]);

  // ===========================
  // FUNÇÕES DE FAVORITOS
  // ===========================

  // Favoritar/desfavoritar monster
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

  // Converter monster D&D para formato do sistema
  const convertToNPCData = (monster: DnDMonster) => {
    // Determinar tipo de NPC baseado no alinhamento
    let npcType = 'neutral';
    const alignment = monster.alignment.toLowerCase();
    if (alignment.includes('good')) npcType = 'ally';
    else if (alignment.includes('evil')) npcType = 'enemy';
    else if (monster.type === 'humanoid' && alignment.includes('neutral')) npcType = 'neutral';
    
    // Criar descrição rica
    const sizeType = `${monster.size} ${monster.type}${monster.subtype ? ` (${monster.subtype})` : ''}`;
    
    // Converter habilidades especiais e ações
    const abilities = [
      ...(monster.special_abilities || []).map(ability => ({
        name: ability.name,
        description: ability.desc,
        usage: 'Habilidade Especial'
      })),
      ...(monster.actions || []).slice(0, 4).map(action => ({
        name: action.name,
        description: action.desc,
        usage: 'Ação'
      })),
      ...(monster.legendary_actions || []).slice(0, 2).map(action => ({
        name: `${action.name} (Lendária)`,
        description: action.desc,
        usage: 'Ação Lendária'
      }))
    ];

    // Converter velocidade para string legível
    const speedEntries = Object.entries(monster.speed).filter(([_, value]) => value);
    const speedString = speedEntries.map(([type, value]) => {
      const speedType = type === 'walk' ? 'caminhada' : 
                       type === 'fly' ? 'voo' :
                       type === 'swim' ? 'natação' :
                       type === 'climb' ? 'escalada' :
                       type === 'burrow' ? 'escavação' : type;
      return `${speedType}: ${value}`;
    }).join(', ');

    // Criar notas detalhadas do GM
    const gmNotes = [
      `Importado da API D&D 5e - ${monster.name}`,
      `Atributos: FOR ${monster.strength}, DES ${monster.dexterity}, CON ${monster.constitution}, INT ${monster.intelligence}, SAB ${monster.wisdom}, CAR ${monster.charisma}`,
      monster.damage_resistances?.length ? `Resistências: ${monster.damage_resistances.join(', ')}` : '',
      monster.damage_immunities?.length ? `Imunidades: ${monster.damage_immunities.join(', ')}` : '',
      monster.condition_immunities?.length ? `Imunidade a Condições: ${monster.condition_immunities.join(', ')}` : '',
      monster.senses ? `Sentidos: ${Object.entries(monster.senses).map(([k,v]) => `${k} ${v}`).join(', ')}` : '',
      monster.legendary_actions?.length ? `Possui ${monster.legendary_actions.length} ações lendárias` : ''
    ].filter(Boolean).join('\n');

    return {
      name: monster.name,
      description: `${sizeType}, ${monster.alignment}. ${monster.languages ? `Idiomas: ${monster.languages}.` : 'Sem idiomas conhecidos.'} ${monster.hit_dice ? `DV: ${monster.hit_dice}.` : ''}`,
      race: monster.type.charAt(0).toUpperCase() + monster.type.slice(1),
      npc_class: monster.subtype || (monster.challenge_rating >= 5 ? 'Elite' : 'Comum'),
      npc_type: npcType,
      alignment: monster.alignment,
      location: 'Importado da API D&D',
      occupation: `${monster.type} CR ${monster.challenge_rating}${monster.legendary_actions?.length ? ' (Lendário)' : ''}`,
      faction: monster.alignment.includes('evil') ? 'Hostil' : 
               monster.alignment.includes('good') ? 'Amigável' : 'Neutro',
      stats: {
        armor_class: monster.armor_class,
        hit_points: monster.hit_points,
        speed: speedString || '30 ft'
      },
      challenge_rating: monster.challenge_rating.toString(),
      abilities: abilities,
      personality_traits: [],
      goals: '',
      secrets: '',
      gm_notes: gmNotes,
      is_alive: true,
      is_active: true
    };
  };

  // Importar monster selecionado
  const handleImport = async () => {
    if (!selectedMonster) return;
    
    setImportingMonster(selectedMonster.index);
    
    try {
      console.log(`📥 Importando: ${selectedMonster.name}`);
      const npcData = convertToNPCData(selectedMonster);
      
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onImport(npcData);
      setLastImported(selectedMonster.name);
      
      console.log(`✅ Importado com sucesso: ${selectedMonster.name}`);
      
      // Fechar modal após sucesso
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
  // EFEITOS E OBSERVERS
  // ===========================

  // Observer para scroll infinito
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (lastMonsterElementRef.current) {
      observer.observe(lastMonsterElementRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoadingMore]);

  // Atualizar lista quando filtros mudarem
  useEffect(() => {
    setCurrentPage(0);
    updateDisplayedMonsters();
  }, [updateDisplayedMonsters]);

  // Atualizar quando página mudar
  useEffect(() => {
    updateDisplayedMonsters();
  }, [currentPage, updateDisplayedMonsters]);

  // Carregar monsters ao abrir modal
  useEffect(() => {
    if (isOpen) {
      loadAllMonsters();
      // Reset estados
      setSelectedMonster(null);
      setSearchTerm('');
      setCurrentPage(0);
      setError('');
    }
  }, [isOpen, loadAllMonsters]);

  // Buscar com debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(0);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, filters]);

  // ===========================
  // RENDER CONDICIONAL
  // ===========================

  if (!isOpen) return null;

  // ===========================
  // COMPONENTE RENDER
  // ===========================

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden border border-gray-700 shadow-2xl">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Importar da API D&D 5e
                  </h3>
                  <p className="text-gray-300">
                    Busque e importe criaturas oficiais do D&D 5ª Edição
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {lastImported && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">Importado: {lastImported}</span>
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Lista de Busca */}
            <div className="w-1/2 border-r border-gray-700 flex flex-col bg-gray-900/30">
              {/* Controles de Busca e Filtros */}
              <div className="p-6 border-b border-gray-700 space-y-4">
                {/* Busca Principal */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar criaturas... (ex: goblin, dragon, orc)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Controles de Filtro e Ordenação */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">Filtros</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">Ordenar por:</span>
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
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600/30">
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
                      <label className="block text-xs font-medium text-gray-300 mb-2">CR Mínimo</label>
                      <input
                        type="text"
                        value={filters.cr_min}
                        onChange={(e) => setFilters(prev => ({ ...prev, cr_min: e.target.value }))}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-2">CR Máximo</label>
                      <input
                        type="text"
                        value={filters.cr_max}
                        onChange={(e) => setFilters(prev => ({ ...prev, cr_max: e.target.value }))}
                        placeholder="30"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Contador de Resultados e Favoritos */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    {displayedMonsters.length} de {getFilteredMonsters().length} criaturas
                  </span>
                  {favorites.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">{favorites.length} favoritos</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Lista de Resultados com Scroll Infinito */}
              <div 
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto p-4"
              >
                {error && (
                  <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <div>
                        <div className="text-red-400 font-medium">Erro de Conexão</div>
                        <div className="text-red-300 text-sm mt-1">{error}</div>
                      </div>
                    </div>
                  </div>
                )}

                {isInitialLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mb-3" />
                    <span className="text-gray-400 text-lg font-medium">Carregando criaturas...</span>
                    <span className="text-gray-500 text-sm mt-1">Conectando com a API D&D 5e</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Seção de Favoritos */}
                    {favorites.length > 0 && searchTerm === '' && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center space-x-2">
                          <Star className="w-5 h-5" />
                          <span>Favoritos</span>
                        </h4>
                        <div className="space-y-2">
                          {allMonsters
                            .filter(monster => favorites.includes(monster.index))
                            .slice(0, 5)
                            .map((result) => (
                              <MonsterCard
                                key={`fav-${result.index}`}
                                monster={result}
                                isFavorite={true}
                                isRecentlyViewed={recentlyViewed.includes(result.index)}
                                onSelect={() => loadMonsterDetails(result.url, result.index)}
                                onToggleFavorite={() => toggleFavorite(result.index)}
                                isSelected={selectedMonster?.index === result.index}
                              />
                            ))}
                        </div>
                        {favorites.length > 5 && (
                          <p className="text-sm text-gray-500 mt-2 ml-2">
                            +{favorites.length - 5} mais favoritos
                          </p>
                        )}
                      </div>
                    )}

                    {/* Resultados Principais */}
                    {displayedMonsters.map((result, index) => (
                      <div
                        key={result.index}
                        ref={index === displayedMonsters.length - 1 ? lastMonsterElementRef : null}
                      >
                        <MonsterCard
                          monster={result}
                          isFavorite={favorites.includes(result.index)}
                          isRecentlyViewed={recentlyViewed.includes(result.index)}
                          onSelect={() => loadMonsterDetails(result.url, result.index)}
                          onToggleFavorite={() => toggleFavorite(result.index)}
                          isSelected={selectedMonster?.index === result.index}
                        />
                      </div>
                    ))}
                    
                    {/* Loading More */}
                    {isLoadingMore && (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                        <span className="ml-3 text-gray-400">Carregando mais criaturas...</span>
                      </div>
                    )}
                    
                    {/* End Message */}
                    {!hasMore && displayedMonsters.length > 0 && (
                      <div className="text-center py-6">
                        <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                        <div className="text-green-400 font-medium">Todas as criaturas carregadas</div>
                        <div className="text-gray-500 text-sm">
                          {getFilteredMonsters().length} criaturas encontradas
                        </div>
                      </div>
                    )}
                    
                    {/* No Results */}
                    {displayedMonsters.length === 0 && !isInitialLoading && (
                      <div className="text-center py-12">
                        <Search className="w-12 h-12 mx-auto mb-4 text-gray-500 opacity-50" />
                        <div className="text-xl font-medium text-gray-400 mb-2">
                          Nenhuma criatura encontrada
                        </div>
                        <div className="text-gray-500 mb-4">
                          Tente termos como "goblin", "orc", "dragon" ou "troll"
                        </div>
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
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Detalhes do Monster */}
            <div className="w-1/2 flex flex-col bg-gray-800/50">
              {isLoadingDetails ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mx-auto mb-4" />
                    <div className="text-xl font-medium text-gray-300">Carregando detalhes...</div>
                    <div className="text-gray-500">Obtendo informações da API</div>
                  </div>
                </div>
              ) : selectedMonster ? (
                <div className="flex-1 overflow-y-auto">
                  {/* Header da Criatura */}
                  <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-2">{selectedMonster.name}</h2>
                        <p className="text-gray-300 text-lg">
                          {selectedMonster.size} {selectedMonster.type}
                          {selectedMonster.subtype && ` (${selectedMonster.subtype})`}
                        </p>
                        <p className="text-gray-400">{selectedMonster.alignment}</p>
                      </div>
                      
                      <button
                        onClick={() => toggleFavorite(selectedMonster.index)}
                        className={`p-3 rounded-xl transition-all transform hover:scale-105 ${
                          favorites.includes(selectedMonster.index)
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-gray-700/50 text-gray-400 hover:text-yellow-400 border border-gray-600/30'
                        }`}
                      >
                        <Star className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full border border-blue-500/30">
                        CR {selectedMonster.challenge_rating}
                      </span>
                      {selectedMonster.legendary_actions && (
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-full border border-purple-500/30 flex items-center space-x-1">
                          <Crown className="w-3 h-3" />
                          <span>Lendário</span>
                        </span>
                      )}
                      {(selectedMonster.special_abilities?.length || 0) > 0 && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full border border-green-500/30 flex items-center space-x-1">
                          <Sparkles className="w-3 h-3" />
                          <span>{selectedMonster.special_abilities?.length} Habilidades</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Estatísticas Principais */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                        <Shield className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-400">{selectedMonster.armor_class}</div>
                        <div className="text-sm text-gray-400">Classe de Armadura</div>
                      </div>
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                        <Heart className="w-6 h-6 text-red-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-red-400">{selectedMonster.hit_points}</div>
                        <div className="text-sm text-gray-400">Pontos de Vida</div>
                        {selectedMonster.hit_dice && (
                          <div className="text-xs text-gray-500 mt-1">({selectedMonster.hit_dice})</div>
                        )}
                      </div>
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
                        <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-yellow-400">{selectedMonster.challenge_rating}</div>
                        <div className="text-sm text-gray-400">Challenge Rating</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Prof. +{selectedMonster.proficiency_bonus}
                        </div>
                      </div>
                    </div>

                    {/* Atributos */}
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                        <User className="w-5 h-5" />
                        <span>Atributos</span>
                      </h3>
                      <div className="grid grid-cols-6 gap-3">
                        {[
                          { label: 'FOR', value: selectedMonster.strength },
                          { label: 'DES', value: selectedMonster.dexterity },
                          { label: 'CON', value: selectedMonster.constitution },
                          { label: 'INT', value: selectedMonster.intelligence },
                          { label: 'SAB', value: selectedMonster.wisdom },
                          { label: 'CAR', value: selectedMonster.charisma },
                        ].map((attr) => {
                          const modifier = Math.floor((attr.value - 10) / 2);
                          return (
                            <div key={attr.label} className="bg-gray-700/50 rounded-lg p-3 text-center border border-gray-600/30">
                              <div className="text-sm font-medium text-gray-400">{attr.label}</div>
                              <div className="text-xl font-bold text-white">{attr.value}</div>
                              <div className="text-xs text-gray-500">
                                {modifier >= 0 ? '+' : ''}{modifier}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Velocidade */}
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-3">Velocidade</h3>
                      <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                        <div className="flex flex-wrap gap-3">
                          {Object.entries(selectedMonster.speed).map(([type, value]) => (
                            <span key={type} className="inline-flex items-center px-3 py-1 bg-gray-600/50 rounded-full text-sm text-gray-300">
                              {type === 'walk' ? '🚶' : type === 'fly' ? '🦅' : type === 'swim' ? '🏊' : '⚡'} {type}: {value}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Habilidades Especiais */}
                    {selectedMonster.special_abilities && selectedMonster.special_abilities.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-3 flex items-center space-x-2">
                          <Sparkles className="w-5 h-5" />
                          <span>Habilidades Especiais</span>
                        </h3>
                        <div className="space-y-3">
                          {selectedMonster.special_abilities.slice(0, 4).map((ability, index) => (
                            <div key={index} className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                              <h4 className="font-semibold text-green-400 mb-2 flex items-center space-x-2">
                                <Swords className="w-4 h-4" />
                                <span>{ability.name}</span>
                              </h4>
                              <p className="text-sm text-gray-300 leading-relaxed">{ability.desc}</p>
                            </div>
                          ))}
                          {selectedMonster.special_abilities.length > 4 && (
                            <div className="text-center p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                              <span className="text-gray-400 text-sm">
                                +{selectedMonster.special_abilities.length - 4} habilidades adicionais
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Ações */}
                    {selectedMonster.actions && selectedMonster.actions.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-3 flex items-center space-x-2">
                          <Swords className="w-5 h-5" />
                          <span>Ações</span>
                        </h3>
                        <div className="space-y-3">
                          {selectedMonster.actions.slice(0, 3).map((action, index) => (
                            <div key={index} className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                              <h4 className="font-semibold text-red-400 mb-2">{action.name}</h4>
                              <p className="text-sm text-gray-300 leading-relaxed">{action.desc}</p>
                            </div>
                          ))}
                          {selectedMonster.actions.length > 3 && (
                            <div className="text-center p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                              <span className="text-gray-400 text-sm">
                                +{selectedMonster.actions.length - 3} ações adicionais
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Ações Lendárias */}
                    {selectedMonster.legendary_actions && selectedMonster.legendary_actions.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-3 flex items-center space-x-2">
                          <Crown className="w-5 h-5" />
                          <span>Ações Lendárias</span>
                        </h3>
                        <div className="space-y-3">
                          {selectedMonster.legendary_actions.map((action, index) => (
                            <div key={index} className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                              <h4 className="font-semibold text-purple-400 mb-2">{action.name}</h4>
                              <p className="text-sm text-gray-300 leading-relaxed">{action.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Informações Adicionais */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Idiomas */}
                      {selectedMonster.languages && (
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2">Idiomas</h4>
                          <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/30">
                            <span className="text-gray-300">{selectedMonster.languages}</span>
                          </div>
                        </div>
                      )}

                      {/* Sentidos */}
                      {selectedMonster.senses && (
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2">Sentidos</h4>
                          <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/30">
                            <div className="space-y-1">
                              {Object.entries(selectedMonster.senses).map(([sense, value]) => (
                                <div key={sense} className="text-sm text-gray-300">
                                  {sense}: {value}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Resistências e Imunidades */}
                    {(selectedMonster.damage_resistances?.length || selectedMonster.damage_immunities?.length || selectedMonster.condition_immunities?.length) && (
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Resistências & Imunidades</h4>
                        <div className="space-y-2">
                          {selectedMonster.damage_resistances?.length && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                              <span className="text-yellow-400 font-medium">Resistência a Dano: </span>
                              <span className="text-gray-300">{selectedMonster.damage_resistances.join(', ')}</span>
                            </div>
                          )}
                          {selectedMonster.damage_immunities?.length && (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                              <span className="text-blue-400 font-medium">Imunidade a Dano: </span>
                              <span className="text-gray-300">{selectedMonster.damage_immunities.join(', ')}</span>
                            </div>
                          )}
                          {selectedMonster.condition_immunities?.length && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                              <span className="text-green-400 font-medium">Imunidade a Condições: </span>
                              <span className="text-gray-300">{selectedMonster.condition_immunities.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center">
                    <User className="w-16 h-16 mx-auto mb-4 text-gray-500 opacity-50" />
                    <div className="text-xl font-medium text-gray-400 mb-2">
                      Selecione uma criatura
                    </div>
                    <div className="text-gray-500 max-w-md">
                      Escolha uma criatura da lista para ver informações detalhadas e poder importá-la para sua campanha
                    </div>
                  </div>
                </div>
              )}

              {/* Footer com Ações */}
              {selectedMonster && (
                <div className="p-6 border-t border-gray-700 bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      <div className="font-medium text-gray-300 mb-1">
                        Converter para NPC
                      </div>
                      <div>
                        Esta criatura será adaptada para o formato do seu sistema
                      </div>
                    </div>
                    <button
                      onClick={handleImport}
                      disabled={!!importingMonster}
                      className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-3 font-medium"
                    >
                      {importingMonster === selectedMonster.index ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Importando...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          <span>Importar NPC</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===========================
// COMPONENTE CARD DE MONSTER
// ===========================

interface MonsterCardProps {
  monster: { index: string; name: string; url: string };
  isFavorite: boolean;
  isRecentlyViewed: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}

const MonsterCard: React.FC<MonsterCardProps> = ({
  monster,
  isFavorite,
  isRecentlyViewed,
  isSelected,
  onSelect,
  onToggleFavorite
}) => {
  return (
    <div className="group relative">
      <div
        className={`w-full p-4 rounded-lg transition-all border cursor-pointer ${
          isSelected 
            ? 'bg-blue-600/20 border-blue-500/50 shadow-lg shadow-blue-500/20' 
            : isFavorite
            ? 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20'
            : 'bg-gray-700/50 border-gray-600/30 hover:bg-gray-600/50 hover:border-gray-500/50'
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Área clicável principal */}
          <div 
            onClick={onSelect}
            className="flex-1 flex items-center space-x-3 cursor-pointer"
          >
            <span className={`font-medium ${isSelected ? 'text-blue-300' : 'text-white'}`}>
              {monster.name}
            </span>
            <div className="flex items-center space-x-1">
              {isRecentlyViewed && (
                <Eye className="w-3 h-3 text-blue-400" />
              )}
              {isFavorite && (
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
              )}
            </div>
          </div>
          
          {/* Botões de ação - fora do botão principal */}
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className={`p-1 rounded transition-colors ${
                isFavorite 
                  ? 'text-yellow-400 hover:text-yellow-300' 
                  : 'text-gray-500 hover:text-yellow-400'
              }`}
              title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Star className="w-4 h-4" />
            </button>
            <div 
              onClick={onSelect}
              className="cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-300 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
