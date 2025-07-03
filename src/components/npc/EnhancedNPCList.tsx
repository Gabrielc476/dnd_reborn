import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Heart, 
  Skull, 
  MapPin, 
  Search,
  RefreshCw,
  Filter,
  Download,
  Upload,
  Settings,
  Zap,
  Shield,
  Swords,
  Wand2,
  Star,
  Target,
  TrendingUp,
  BarChart3,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  MoreHorizontal
} from 'lucide-react';

// Assumindo que já temos estes componentes criados
import { DiceRoller, AttackCard, SpellCard } from '../DiceComponents';
import { useEnhancedNPCs } from '@/hooks/useEnhancedNPCs';

// ===========================
// TIPOS E INTERFACES
// ===========================

interface EnhancedNPC {
  id: string;
  name: string;
  description?: string;
  race?: string;
  npc_class?: string;
  npc_type: 'aliado' | 'inimigo' | 'neutro' | 'mercador' | 'missões' | 'cenário';
  alignment?: string;
  location?: string;
  occupation?: string;
  faction?: string;
  challenge_rating?: string;
  is_alive: boolean;
  is_active: boolean;
  is_important: boolean;
  stats: {
    armor_class: number;
    hit_points: number;
    current_hit_points?: number;
    speed: string;
    attributes: {
      strength: number;
      dexterity: number;
      constitution: number;
      intelligence: number;
      wisdom: number;
      charisma: number;
    };
  };
  attacks: Array<{
    id: string;
    name: string;
    attack_bonus: number;
    damage: { dice_count: number; dice_sides: number; modifier: number };
    damage_type: string;
    range: string;
    description?: string;
  }>;
  spellcasting: {
    is_spellcaster: boolean;
    spellcasting_ability?: string;
    spell_save_dc?: number;
    spells_known: Array<{
      id: string;
      name: string;
      level: number;
      school: string;
      is_attack_spell: boolean;
      damage?: { dice_count: number; dice_sides: number; modifier: number };
      damage_type?: string;
    }>;
  };
  abilities: Array<{
    id: string;
    name: string;
    description: string;
    usage?: string;
  }>;
  tags: string[];
  created_date: string;
  updated_date: string;
}

interface NPCFilters {
  search: string;
  npc_type: string[];
  location: string[];
  faction: string[];
  is_alive?: boolean;
  is_active?: boolean;
  is_spellcaster?: boolean;
  has_attacks?: boolean;
  is_important?: boolean;
  challenge_rating_min?: number;
  challenge_rating_max?: number;
}

// ===========================
// COMPONENTE PRINCIPAL
// ===========================

interface EnhancedNPCsListProps {
  campaignId: string;
  isGM: boolean;
  onCreateNPC?: () => void;
  onEditNPC?: (npc: EnhancedNPC) => void;
}

export const EnhancedNPCsList: React.FC<EnhancedNPCsListProps> = ({
  campaignId,
  isGM,
  onCreateNPC,
  onEditNPC
}) => {
  // Estados do hook personalizado
  const {
    npcs,
    filteredNPCs,
    isLoading,
    error,
    stats,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    createNPC,
    updateNPC,
    deleteNPC,
    killNPC,
    reviveNPC,
    rollAttack,
    rollDamage,
    castSpell,
    exportNPCs
  } = useEnhancedNPCs({ campaignId, autoLoad: true });

  // Estados locais
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNPCs, setSelectedNPCs] = useState<string[]>([]);
  const [expandedNPC, setExpandedNPC] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // ===========================
  // HANDLERS DE FILTROS
  // ===========================

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setFilters({ ...filters, search: value });
  };

  const handleFilterChange = (filterKey: keyof NPCFilters, value: any) => {
    setFilters({ ...filters, [filterKey]: value });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      npc_type: [],
      location: [],
      faction: [],
      is_alive: undefined,
      is_active: undefined,
      is_spellcaster: undefined,
      has_attacks: undefined,
      is_important: undefined,
      challenge_rating_min: undefined,
      challenge_rating_max: undefined
    });
    setSearchTerm('');
  };

  // ===========================
  // HANDLERS DE AÇÕES
  // ===========================

  const handleToggleNPCSelection = (npcId: string) => {
    setSelectedNPCs(prev => 
      prev.includes(npcId) 
        ? prev.filter(id => id !== npcId)
        : [...prev, npcId]
    );
  };

  const handleSelectAllNPCs = () => {
    if (selectedNPCs.length === filteredNPCs.length) {
      setSelectedNPCs([]);
    } else {
      setSelectedNPCs(filteredNPCs.map(npc => npc.id));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedNPCs.length === 0) return;

    try {
      switch (action) {
        case 'kill':
          await Promise.all(selectedNPCs.map(id => killNPC(id)));
          break;
        case 'revive':
          await Promise.all(selectedNPCs.map(id => reviveNPC(id)));
          break;
        case 'delete':
          if (window.confirm(`Tem certeza que deseja deletar ${selectedNPCs.length} NPCs?`)) {
            await Promise.all(selectedNPCs.map(id => deleteNPC(id)));
          }
          break;
        case 'activate':
          await Promise.all(selectedNPCs.map(id => 
            updateNPC(id, { id, is_active: true })
          ));
          break;
        case 'deactivate':
          await Promise.all(selectedNPCs.map(id => 
            updateNPC(id, { id, is_active: false })
          ));
          break;
      }
      setSelectedNPCs([]);
    } catch (error) {
      console.error('Erro em ação em lote:', error);
    }
  };

  const handleExport = (format: 'json' | 'csv') => {
    const data = exportNPCs(format);
    const blob = new Blob([data], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `npcs_${campaignId}_${new Date().toISOString().split('T')[0]}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ===========================
  // HANDLERS DE DADOS
  // ===========================

  const handleAttackRoll = async (npcId: string, attackId: string, type: 'attack' | 'damage') => {
    try {
      const result = type === 'attack' 
        ? await rollAttack(npcId, attackId)
        : await rollDamage(npcId, attackId);
      
      // Aqui você pode adicionar notificações ou logs
      console.log(`${type} roll for NPC ${npcId}:`, result);
    } catch (error) {
      console.error('Erro ao rolar dados:', error);
    }
  };

  const handleSpellCast = async (npcId: string, spellId: string, level?: number) => {
    try {
      const result = await castSpell(npcId, spellId, level);
      console.log(`Spell cast for NPC ${npcId}:`, result);
    } catch (error) {
      console.error('Erro ao conjurar magia:', error);
    }
  };

  // ===========================
  // COMPONENTES AUXILIARES
  // ===========================

  const NPCTypeIcon = ({ type }: { type: string }) => {
    const icons = {
      aliado: <Heart className="w-4 h-4 text-green-400" />,
      inimigo: <Skull className="w-4 h-4 text-red-400" />,
      neutro: <Users className="w-4 h-4 text-gray-400" />,
      mercador: <Users className="w-4 h-4 text-yellow-400" />,
      missões: <Star className="w-4 h-4 text-blue-400" />,
      cenário: <MapPin className="w-4 h-4 text-purple-400" />
    };
    return icons[type as keyof typeof icons] || icons.neutro;
  };

  const NPCCard = ({ npc, isExpanded }: { npc: EnhancedNPC; isExpanded: boolean }) => {
    const isSelected = selectedNPCs.includes(npc.id);
    const currentHP = npc.stats.current_hit_points ?? npc.stats.hit_points;
    const hpPercentage = (currentHP / npc.stats.hit_points) * 100;

    return (
      <div className={`
        bg-gray-800 rounded-lg border transition-all duration-200 hover:shadow-lg
        ${isSelected ? 'border-purple-500 bg-purple-500/5' : 'border-gray-700 hover:border-gray-600'}
        ${!npc.is_alive ? 'opacity-60' : ''}
        ${!npc.is_active ? 'opacity-40' : ''}
      `}>
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggleNPCSelection(npc.id)}
                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
              />
              
              <div className="flex items-center space-x-2">
                <NPCTypeIcon type={npc.npc_type} />
                <h3 className="font-medium text-white">{npc.name}</h3>
                {npc.is_important && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Status indicators */}
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">{npc.stats.armor_class}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-sm text-gray-300">
                  {currentHP}/{npc.stats.hit_points}
                </span>
              </div>

              {npc.challenge_rating && (
                <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                  CR {npc.challenge_rating}
                </span>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setExpandedNPC(isExpanded ? null : npc.id)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                  title={isExpanded ? 'Recolher' : 'Expandir'}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                
                {isGM && (
                  <>
                    <button
                      onClick={() => onEditNPC?.(npc)}
                      className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => npc.is_alive ? killNPC(npc.id) : reviveNPC(npc.id)}
                      className={`p-1 transition-colors ${
                        npc.is_alive 
                          ? 'text-gray-400 hover:text-red-400' 
                          : 'text-gray-400 hover:text-green-400'
                      }`}
                      title={npc.is_alive ? 'Matar' : 'Reviver'}
                    >
                      {npc.is_alive ? <Skull className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* HP Bar */}
          <div className="mb-3">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  hpPercentage > 75 ? 'bg-green-500' :
                  hpPercentage > 50 ? 'bg-yellow-500' :
                  hpPercentage > 25 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.max(0, hpPercentage)}%` }}
              />
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-2 text-sm text-gray-300">
            {npc.race && (
              <div><span className="text-gray-400">Raça:</span> {npc.race}</div>
            )}
            {npc.npc_class && (
              <div><span className="text-gray-400">Classe:</span> {npc.npc_class}</div>
            )}
            {npc.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span>{npc.location}</span>
              </div>
            )}
          </div>

          {/* Abilities/Spells summary */}
          <div className="flex items-center space-x-4 mt-3 text-xs text-gray-400">
            {npc.attacks.length > 0 && (
              <div className="flex items-center space-x-1">
                <Swords className="w-3 h-3" />
                <span>{npc.attacks.length} ataques</span>
              </div>
            )}
            
            {npc.spellcasting.is_spellcaster && (
              <div className="flex items-center space-x-1">
                <Wand2 className="w-3 h-3" />
                <span>{npc.spellcasting.spells_known.length} magias</span>
              </div>
            )}
            
            {npc.abilities.length > 0 && (
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3" />
                <span>{npc.abilities.length} habilidades</span>
              </div>
            )}
          </div>

          {/* Expanded content */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-700 space-y-4">
              {/* Description */}
              {npc.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Descrição</h4>
                  <p className="text-sm text-gray-400">{npc.description}</p>
                </div>
              )}

              {/* Attacks */}
              {npc.attacks.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                    <Swords className="w-4 h-4" />
                    <span>Ataques</span>
                  </h4>
                  <div className="space-y-2">
                    {npc.attacks.map(attack => (
                      <AttackCard
                        key={attack.id}
                        attack={attack}
                        npcName={npc.name}
                        onRoll={(type, result) => handleAttackRoll(npc.id, attack.id, type)}
                        readOnly={!isGM}
                        compact={true}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Spells */}
              {npc.spellcasting.is_spellcaster && npc.spellcasting.spells_known.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                    <Wand2 className="w-4 h-4" />
                    <span>Magias</span>
                    {npc.spellcasting.spell_save_dc && (
                      <span className="text-xs bg-blue-500/20 px-2 py-1 rounded text-blue-400">
                        CD {npc.spellcasting.spell_save_dc}
                      </span>
                    )}
                  </h4>
                  <div className="space-y-2">
                    {npc.spellcasting.spells_known.map(spell => (
                      <SpellCard
                        key={spell.id}
                        spell={spell}
                        npcName={npc.name}
                        onRoll={(type, result) => console.log('Spell roll:', result)}
                        onCast={(spell, level) => handleSpellCast(npc.id, spell.id, level)}
                        readOnly={!isGM}
                        compact={true}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Abilities */}
              {npc.abilities.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                    <Star className="w-4 h-4" />
                    <span>Habilidades Especiais</span>
                  </h4>
                  <div className="space-y-2">
                    {npc.abilities.map(ability => (
                      <div key={ability.id} className="bg-gray-700/30 rounded p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-white text-sm">{ability.name}</span>
                          {ability.usage && (
                            <span className="text-xs bg-gray-600 px-2 py-1 rounded text-gray-300">
                              {ability.usage}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{ability.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ===========================
  // RENDER PRINCIPAL
  // ===========================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-2" />
          <p className="text-gray-400">Carregando NPCs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
        <p className="text-red-400">Erro ao carregar NPCs: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">NPCs da Campanha</h2>
          <div className="flex items-center space-x-6 mt-2 text-sm text-gray-400">
            <span>{stats.total} total</span>
            <span className="text-green-400">{stats.alive} vivos</span>
            <span className="text-red-400">{stats.dead} mortos</span>
            <span className="text-blue-400">{stats.spellcasters} conjuradores</span>
            <span className="text-orange-400">{stats.with_attacks} com ataques</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {isGM && (
            <>
              <button
                onClick={() => handleExport('json')}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors flex items-center space-x-2"
                title="Exportar JSON"
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>

              <button
                onClick={onCreateNPC}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Novo NPC</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filtros e busca */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar NPCs..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg border transition-colors flex items-center space-x-2 ${
            showFilters
              ? 'bg-purple-600 border-purple-500 text-white'
              : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Filtros</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Painel de filtros expandido */}
      {showFilters && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro por tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
              <select
                multiple
                value={filters.npc_type}
                onChange={(e) => handleFilterChange('npc_type', Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="aliado">Aliado</option>
                <option value="inimigo">Inimigo</option>
                <option value="neutro">Neutro</option>
                <option value="mercador">Mercador</option>
                <option value="missões">Quest Giver</option>
                <option value="cenário">Background</option>
              </select>
            </div>

            {/* Status filters */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.is_alive === true}
                    onChange={(e) => handleFilterChange('is_alive', e.target.checked ? true : undefined)}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-300">Apenas vivos</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.is_spellcaster === true}
                    onChange={(e) => handleFilterChange('is_spellcaster', e.target.checked ? true : undefined)}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-300">Conjuradores</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.has_attacks === true}
                    onChange={(e) => handleFilterChange('has_attacks', e.target.checked ? true : undefined)}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-300">Com ataques</span>
                </label>
              </div>
            </div>

            {/* Challenge Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Challenge Rating</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.challenge_rating_min || ''}
                  onChange={(e) => handleFilterChange('challenge_rating_min', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.challenge_rating_max || ''}
                  onChange={(e) => handleFilterChange('challenge_rating_max', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Clear filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ações em lote */}
      {selectedNPCs.length > 0 && isGM && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-purple-300">
              {selectedNPCs.length} NPC{selectedNPCs.length > 1 ? 's' : ''} selecionado{selectedNPCs.length > 1 ? 's' : ''}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
              >
                Ativar
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors"
              >
                Desativar
              </button>
              <button
                onClick={() => handleBulkAction('kill')}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
              >
                Matar
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-800 hover:bg-red-900 text-white rounded text-sm transition-colors"
              >
                Deletar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de NPCs */}
      {filteredNPCs.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">Nenhum NPC encontrado</h3>
          <p className="text-gray-400 mb-6">
            {npcs.length === 0 
              ? 'Não há NPCs nesta campanha ainda.'
              : 'Nenhum NPC corresponde aos filtros aplicados.'
            }
          </p>
          {isGM && npcs.length === 0 && (
            <button
              onClick={onCreateNPC}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors"
            >
              Criar Primeiro NPC
            </button>
          )}
        </div>
      ) : (
        <div className={`
          ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
        `}>
          {filteredNPCs.map(npc => (
            <NPCCard
              key={npc.id}
              npc={npc}
              isExpanded={expandedNPC === npc.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};