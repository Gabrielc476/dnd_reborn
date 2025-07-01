import React, { useState, useEffect } from 'react';
import { X, Users, Dice6, Heart, Shield, Swords, Brain, Eye, Target, Plus, Trash2, AlertTriangle } from 'lucide-react';

// Importar tipos corrigidos
import {
  NPCType,
  NPCStats,
  NPCAbility,
  NPCFormData,
  NPCTypeLabels,
  NPCTypeColors,
  ALIGNMENT_OPTIONS,
  CHALLENGE_RATING_OPTIONS,
  validateNPCData,
  getNPCTypeColor,
  getNPCTypeLabel
} from '@/types/manageCampaign';

interface NPCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (npcData: NPCFormData) => Promise<void>;
  npc?: NPCFormData | null; // Para edição
  campaignId: string;
}

export const NPCModal: React.FC<NPCModalProps> = ({
  isOpen,
  onClose,
  onSave,
  npc,
  campaignId
}) => {
  const [currentTab, setCurrentTab] = useState<'basic' | 'stats' | 'abilities' | 'roleplay'>('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formData, setFormData] = useState<NPCFormData>({
    name: '',
    description: '',
    race: '',
    npc_class: '',
    npc_type: NPCType.NEUTRAL,
    alignment: '',
    location: '',
    occupation: '',
    faction: '',
    stats: {
      armor_class: 10,
      hit_points: 1,
      speed: '30 ft'
    },
    challenge_rating: '',
    abilities: [],
    personality_traits: [],
    goals: '',
    secrets: '',
    gm_notes: '',
    is_alive: true,
    is_active: true
  });

  // Carregar dados do NPC para edição
  useEffect(() => {
    if (npc) {
      setFormData(npc);
    } else {
      // Reset para novo NPC
      setFormData({
        name: '',
        description: '',
        race: '',
        npc_class: '',
        npc_type: NPCType.NEUTRAL,
        alignment: '',
        location: '',
        occupation: '',
        faction: '',
        stats: {
          armor_class: 10,
          hit_points: 1,
          speed: '30 ft'
        },
        challenge_rating: '',
        abilities: [],
        personality_traits: [],
        goals: '',
        secrets: '',
        gm_notes: '',
        is_alive: true,
        is_active: true
      });
    }
  }, [npc, isOpen]);

  const handleInputChange = (field: keyof NPCFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
    
    // Limpar erros de validação quando usuário começa a digitar
    if (validationErrors.length > 0) {
      const errors = validateNPCData({ ...formData, [field]: value });
      setValidationErrors(errors);
    }
  };

  const handleStatsChange = (statField: keyof NPCStats, value: any) => {
    setFormData(prev => ({
      ...prev,
      stats: {
        ...prev.stats!,
        [statField]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const addAbility = () => {
    setFormData(prev => ({
      ...prev,
      abilities: [...prev.abilities, { name: '', description: '', usage: '' }]
    }));
    setHasUnsavedChanges(true);
  };

  const updateAbility = (index: number, field: keyof NPCAbility, value: string) => {
    setFormData(prev => ({
      ...prev,
      abilities: prev.abilities.map((ability, i) => 
        i === index ? { ...ability, [field]: value } : ability
      )
    }));
    setHasUnsavedChanges(true);
  };

  const removeAbility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      abilities: prev.abilities.filter((_, i) => i !== index)
    }));
    setHasUnsavedChanges(true);
  };

  const addPersonalityTrait = () => {
    setFormData(prev => ({
      ...prev,
      personality_traits: [...prev.personality_traits, '']
    }));
    setHasUnsavedChanges(true);
  };

  const updatePersonalityTrait = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      personality_traits: prev.personality_traits.map((trait, i) => 
        i === index ? value : trait
      )
    }));
    setHasUnsavedChanges(true);
  };

  const removePersonalityTrait = (index: number) => {
    setFormData(prev => ({
      ...prev,
      personality_traits: prev.personality_traits.filter((_, i) => i !== index)
    }));
    setHasUnsavedChanges(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar NPC:', error);
      alert('Erro ao salvar NPC. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const npcTypeOptions = [
    { value: NPCType.ALLY, label: getNPCTypeLabel(NPCType.ALLY), color: 'text-green-400' },
    { value: NPCType.ENEMY, label: getNPCTypeLabel(NPCType.ENEMY), color: 'text-red-400' },
    { value: NPCType.NEUTRAL, label: getNPCTypeLabel(NPCType.NEUTRAL), color: 'text-gray-400' },
    { value: NPCType.MERCHANT, label: getNPCTypeLabel(NPCType.MERCHANT), color: 'text-yellow-400' },
    { value: NPCType.QUEST_GIVER, label: getNPCTypeLabel(NPCType.QUEST_GIVER), color: 'text-blue-400' },
    { value: NPCType.BACKGROUND, label: getNPCTypeLabel(NPCType.BACKGROUND), color: 'text-purple-400' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden border border-gray-700">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {npc ? 'Editar NPC' : 'Criar Novo NPC'}
                  </h3>
                  <p className="text-gray-400">
                    {npc ? 'Modificar informações do personagem' : 'Adicionar um novo personagem não-jogável'}
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Erros de Validação */}
            {validationErrors.length > 0 && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <h4 className="text-red-400 font-medium">Erros de Validação</h4>
                </div>
                <ul className="space-y-1 text-sm text-red-300">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tabs */}
            <div className="flex space-x-1 mt-6 bg-gray-700 rounded-lg p-1">
              {[
                { id: 'basic', label: 'Básico', icon: Users },
                { id: 'stats', label: 'Atributos', icon: Dice6 },
                { id: 'abilities', label: 'Habilidades', icon: Swords },
                { id: 'roleplay', label: 'Roleplay', icon: Brain }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCurrentTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded transition-colors ${
                    currentTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Tab: Básico */}
            {currentTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nome */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nome do NPC *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Elara, a Sábia"
                      required
                    />
                  </div>

                  {/* Tipo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo de NPC
                    </label>
                    <select
                      value={formData.npc_type}
                      onChange={(e) => handleInputChange('npc_type', e.target.value as NPCType)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    >
                      {npcTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Raça */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Raça
                    </label>
                    <input
                      type="text"
                      value={formData.race || ''}
                      onChange={(e) => handleInputChange('race', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Elfo, Humano, Anão"
                    />
                  </div>

                  {/* Classe */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Classe
                    </label>
                    <input
                      type="text"
                      value={formData.npc_class || ''}
                      onChange={(e) => handleInputChange('npc_class', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Guerreiro, Mago, Ladino"
                    />
                  </div>

                  {/* Tendência */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tendência
                    </label>
                    <select
                      value={formData.alignment || ''}
                      onChange={(e) => handleInputChange('alignment', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecionar tendência</option>
                      {ALIGNMENT_OPTIONS.map(alignment => (
                        <option key={alignment} value={alignment}>
                          {alignment}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Localização */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Localização
                    </label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Taverna do Javali Dourado"
                    />
                  </div>

                  {/* Ocupação */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ocupação
                    </label>
                    <input
                      type="text"
                      value={formData.occupation || ''}
                      onChange={(e) => handleInputChange('occupation', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Taverneiro, Guarda, Mercador"
                    />
                  </div>

                  {/* Facção */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Facção
                    </label>
                    <input
                      type="text"
                      value={formData.faction || ''}
                      onChange={(e) => handleInputChange('faction', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Guarda da Cidade, Thieves Guild"
                    />
                  </div>

                  {/* Descrição */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Descreva a aparência e características básicas do NPC..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Atributos */}
            {currentTab === 'stats' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Estatísticas Básicas */}
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Defesas
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Classe de Armadura
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={formData.stats?.armor_class || 10}
                          onChange={(e) => handleStatsChange('armor_class', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Pontos de Vida
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.stats?.hit_points || 1}
                          onChange={(e) => handleStatsChange('hit_points', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Velocidade
                        </label>
                        <input
                          type="text"
                          value={formData.stats?.speed || '30 ft'}
                          onChange={(e) => handleStatsChange('speed', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: 30 ft, 40 ft"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Atributos */}
                  <div className="md:col-span-2 bg-gray-700/30 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Dice6 className="w-5 h-5 mr-2" />
                      Atributos (Opcional)
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { key: 'strength', label: 'Força' },
                        { key: 'dexterity', label: 'Destreza' },
                        { key: 'constitution', label: 'Constituição' },
                        { key: 'intelligence', label: 'Inteligência' },
                        { key: 'wisdom', label: 'Sabedoria' },
                        { key: 'charisma', label: 'Carisma' }
                      ].map(attr => (
                        <div key={attr.key}>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            {attr.label}
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="30"
                            value={formData.stats?.[attr.key as keyof NPCStats] || ''}
                            onChange={(e) => handleStatsChange(attr.key as keyof NPCStats, 
                              e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="3-18"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nível de Desafio */}
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nível de Desafio (CR)
                    </label>
                    <select
                      value={formData.challenge_rating || ''}
                      onChange={(e) => handleInputChange('challenge_rating', e.target.value)}
                      className="w-full max-w-xs px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecionar CR</option>
                      {CHALLENGE_RATING_OPTIONS.map(cr => (
                        <option key={cr} value={cr}>CR {cr}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Habilidades */}
            {currentTab === 'abilities' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-white flex items-center">
                    <Swords className="w-5 h-5 mr-2" />
                    Habilidades Especiais
                  </h4>
                  <button
                    type="button"
                    onClick={addAbility}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar</span>
                  </button>
                </div>

                {formData.abilities.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Swords className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma habilidade especial adicionada</p>
                    <p className="text-sm">Clique em "Adicionar" para criar habilidades</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.abilities.map((ability, index) => (
                      <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="text-white font-medium">Habilidade #{index + 1}</h5>
                          <button
                            type="button"
                            onClick={() => removeAbility(index)}
                            className="p-1 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Nome da Habilidade
                            </label>
                            <input
                              type="text"
                              value={ability.name}
                              onChange={(e) => updateAbility(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-blue-500"
                              placeholder="Ex: Ataque Furtivo"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Uso/Recarga
                            </label>
                            <input
                              type="text"
                              value={ability.usage || ''}
                              onChange={(e) => updateAbility(index, 'usage', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-blue-500"
                              placeholder="Ex: 1/dia, Recarga 5-6"
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Descrição
                            </label>
                            <textarea
                              value={ability.description}
                              onChange={(e) => updateAbility(index, 'description', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-blue-500 resize-none"
                              placeholder="Descreva o efeito da habilidade..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Roleplay */}
            {currentTab === 'roleplay' && (
              <div className="space-y-6">
                {/* Traços de Personalidade */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-white flex items-center">
                      <Brain className="w-5 h-5 mr-2" />
                      Traços de Personalidade
                    </h4>
                    <button
                      type="button"
                      onClick={addPersonalityTrait}
                      className="flex items-center space-x-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Adicionar</span>
                    </button>
                  </div>

                  {formData.personality_traits.length === 0 ? (
                    <div className="text-center py-4 text-gray-400 bg-gray-700/20 rounded-lg">
                      <p>Nenhum traço de personalidade</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {formData.personality_traits.map((trait, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={trait}
                            onChange={(e) => updatePersonalityTrait(index, e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="Ex: Sempre conta piadas ruins"
                          />
                          <button
                            type="button"
                            onClick={() => removePersonalityTrait(index)}
                            className="p-2 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Objetivos */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Objetivos e Motivações
                  </label>
                  <textarea
                    value={formData.goals || ''}
                    onChange={(e) => handleInputChange('goals', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="O que este NPC quer alcançar? Quais são suas motivações?"
                  />
                </div>

                {/* Segredos */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4" />
                      <span>Segredos (Apenas GM)</span>
                    </div>
                  </label>
                  <textarea
                    value={formData.secrets || ''}
                    onChange={(e) => handleInputChange('secrets', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Informações secretas sobre o NPC que apenas o GM deve saber..."
                  />
                </div>

                {/* Notas do GM */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notas do Mestre
                  </label>
                  <textarea
                    value={formData.gm_notes || ''}
                    onChange={(e) => handleInputChange('gm_notes', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Notas pessoais sobre como interpretar este NPC, ganchos de história, etc..."
                  />
                </div>

                {/* Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="is_alive"
                      checked={formData.is_alive}
                      onChange={(e) => handleInputChange('is_alive', e.target.checked)}
                      className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="is_alive" className="text-sm font-medium text-gray-300 flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>Vivo</span>
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                      className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-gray-300 flex items-center space-x-1">
                      <Target className="w-4 h-4" />
                      <span>Ativo na Campanha</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700 bg-gray-800/50">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || !formData.name.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <span>{npc ? 'Atualizar NPC' : 'Criar NPC'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};