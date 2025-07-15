// ===========================
// PERSONALITY STEP - ATUALIZADO PARA USAR NOVOS HOOKS
// src/components/character-creation/steps/PersonalityStep.tsx
// ===========================

"use client";

import { useState, useMemo } from "react";
import { useCharacterCreationContext } from "@/hooks/useCharacterCreation";
import { 
  Heart, 
  Star, 
  Link, 
  AlertTriangle, 
  Plus, 
  X, 
  Edit3,
  Lightbulb,
  Target,
  Users,
  Zap,
  Eye,
  Crown,
  Feather,
  Book,
  Smile,
  Frown,
  Meh,
  Sparkles
} from "lucide-react";

// ===========================
// PERSONALITY CATEGORIES
// ===========================

const PERSONALITY_CATEGORIES = [
  {
    id: 'traits',
    name: 'Traços de Personalidade',
    description: 'Características distintivas, maneirismos, hábitos ou peculiaridades',
    icon: Smile,
    color: 'from-green-500 to-emerald-600',
    placeholder: 'Ex: Sempre limpo minha espada após cada batalha...',
    examples: [
      'Tenho uma piada ou anedota para cada ocasião',
      'Sou educado e respeitoso com todos',
      'Nunca passo despercebido em uma multidão',
      'Sempre mantenho minha aparência impecável'
    ]
  },
  {
    id: 'ideals',
    name: 'Ideais',
    description: 'Princípios, valores ou objetivos que motivam e guiam suas ações',
    icon: Star,
    color: 'from-blue-500 to-indigo-600',
    placeholder: 'Ex: A honra é mais importante que a vida...',
    examples: [
      'Liberdade: Todos merecem viver sem correntes',
      'Honra: Minha palavra é meu vínculo',
      'Conhecimento: O caminho para o poder e auto-aperfeiçoamento',
      'Justiça: Todos são iguais perante a lei'
    ]
  },
  {
    id: 'bonds',
    name: 'Vínculos',
    description: 'Conexões com pessoas, lugares, objetos ou eventos importantes',
    icon: Link,
    color: 'from-purple-500 to-pink-600',
    placeholder: 'Ex: Devo proteger minha vila natal...',
    examples: [
      'Minha família é a coisa mais importante para mim',
      'Meu mentor me ensinou tudo que sei',
      'Carrego uma relíquia sagrada de meu templo',
      'Juro vingar a destruição de minha aldeia'
    ]
  },
  {
    id: 'flaws',
    name: 'Defeitos',
    description: 'Fraquezas, vícios, medos ou características negativas',
    icon: AlertTriangle,
    color: 'from-red-500 to-orange-600',
    placeholder: 'Ex: Não consigo resistir a um desafio...',
    examples: [
      'Tenho um vício terrível em jogos',
      'Sou muito teimoso e nunca mudo de ideia',
      'Tenho medo de altura',
      'Confio demais nas pessoas'
    ]
  }
];

// ===========================
// PERSONALITY ITEM COMPONENT
// ===========================

interface PersonalityItemProps {
  item: string;
  category: 'traits' | 'ideals' | 'bonds' | 'flaws';
  onEdit: (newValue: string) => void;
  onRemove: () => void;
  isEditing: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
}

function PersonalityItem({ 
  item, 
  category, 
  onEdit, 
  onRemove, 
  isEditing,
  onStartEdit,
  onStopEdit
}: PersonalityItemProps) {
  const [editValue, setEditValue] = useState(item);
  const categoryInfo = PERSONALITY_CATEGORIES.find(cat => cat.id === category);
  const CategoryIcon = categoryInfo?.icon || Heart;

  const handleSave = () => {
    if (editValue.trim()) {
      onEdit(editValue.trim());
    }
    onStopEdit();
  };

  const handleCancel = () => {
    setEditValue(item);
    onStopEdit();
  };

  return (
    <div className={`p-4 rounded-xl border bg-gradient-to-br ${categoryInfo?.color}/10 border-${categoryInfo?.color.split('-')[1]}-400/30`}>
      <div className="flex items-start space-x-3">
        {/* Category Icon */}
        <div className={`p-2 rounded-lg bg-gradient-to-br ${categoryInfo?.color} flex-shrink-0`}>
          <CategoryIcon className="w-4 h-4 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                rows={3}
                placeholder={categoryInfo?.placeholder}
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors text-sm"
                >
                  Salvar
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-lg transition-colors text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-300 leading-relaxed">{item}</p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={onStartEdit}
                  className="p-1 rounded hover:bg-gray-700/50 transition-colors"
                  title="Editar"
                >
                  <Edit3 className="w-4 h-4 text-gray-400 hover:text-gray-300" />
                </button>
                <button
                  onClick={onRemove}
                  className="p-1 rounded hover:bg-gray-700/50 transition-colors"
                  title="Remover"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-red-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===========================
// ADD PERSONALITY ITEM COMPONENT
// ===========================

interface AddPersonalityItemProps {
  category: 'traits' | 'ideals' | 'bonds' | 'flaws';
  onAdd: (value: string) => void;
  maxItems: number;
  currentCount: number;
}

function AddPersonalityItem({ category, onAdd, maxItems, currentCount }: AddPersonalityItemProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [value, setValue] = useState('');
  const [selectedExample, setSelectedExample] = useState<string | null>(null);

  const categoryInfo = PERSONALITY_CATEGORIES.find(cat => cat.id === category);
  const CategoryIcon = categoryInfo?.icon || Heart;
  const canAdd = currentCount < maxItems;

  const handleAdd = () => {
    if (value.trim()) {
      onAdd(value.trim());
      setValue('');
      setSelectedExample(null);
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setValue('');
    setSelectedExample(null);
    setIsAdding(false);
  };

  const handleSelectExample = (example: string) => {
    setValue(example);
    setSelectedExample(example);
  };

  if (!canAdd) {
    return (
      <div className="p-4 rounded-xl border border-gray-700/50 bg-gray-800/30">
        <div className="flex items-center justify-center space-x-2 text-gray-500">
          <CategoryIcon className="w-4 h-4" />
          <span className="text-sm">Máximo de {maxItems} itens alcançado</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isAdding 
        ? `bg-gradient-to-br ${categoryInfo?.color}/10 border-${categoryInfo?.color.split('-')[1]}-400/30` 
        : 'border-gray-700/50 bg-gray-800/30 hover:bg-gray-800/50'
    }`}>
      {isAdding ? (
        <div className="space-y-4">
          {/* Input */}
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${categoryInfo?.color} flex-shrink-0`}>
              <CategoryIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                rows={3}
                placeholder={categoryInfo?.placeholder}
                autoFocus
              />
            </div>
          </div>

          {/* Examples */}
          {categoryInfo?.examples && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-400">Exemplos:</h5>
              <div className="space-y-1">
                {categoryInfo.examples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectExample(example)}
                    className={`w-full text-left p-2 rounded-lg transition-all text-sm ${
                      selectedExample === example
                        ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
                        : 'bg-gray-700/30 hover:bg-gray-700/50 text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAdd}
              disabled={!value.trim()}
              className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-green-300 rounded-lg transition-colors text-sm"
            >
              Adicionar
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-lg transition-colors text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center space-x-2 py-3 text-gray-400 hover:text-gray-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar {categoryInfo?.name}</span>
        </button>
      )}
    </div>
  );
}

// ===========================
// COMPONENTE PRINCIPAL
// ===========================

export default function PersonalityStep() {
  const {
    characterData,
    updateCharacterField,
  } = useCharacterCreationContext();

  const [editingItem, setEditingItem] = useState<string | null>(null);

  // ===========================
  // PERSONALITY DATA
  // ===========================

  const personalityData = useMemo(() => ({
    traits: characterData.personalityTraits || [],
    ideals: characterData.ideals || [],
    bonds: characterData.bonds || [],
    flaws: characterData.flaws || []
  }), [characterData]);

  // ===========================
  // HANDLERS
  // ===========================

  const handleAddItem = (category: 'traits' | 'ideals' | 'bonds' | 'flaws', value: string) => {
    const fieldMap = {
      traits: 'personalityTraits',
      ideals: 'ideals',
      bonds: 'bonds',
      flaws: 'flaws'
    };

    const currentItems = personalityData[category];
    const newItems = [...currentItems, value];
    
    updateCharacterField(fieldMap[category] as keyof typeof characterData, newItems);
  };

  const handleEditItem = (category: 'traits' | 'ideals' | 'bonds' | 'flaws', index: number, newValue: string) => {
    const fieldMap = {
      traits: 'personalityTraits',
      ideals: 'ideals',
      bonds: 'bonds',
      flaws: 'flaws'
    };

    const currentItems = personalityData[category];
    const newItems = [...currentItems];
    newItems[index] = newValue;
    
    updateCharacterField(fieldMap[category] as keyof typeof characterData, newItems);
  };

  const handleRemoveItem = (category: 'traits' | 'ideals' | 'bonds' | 'flaws', index: number) => {
    const fieldMap = {
      traits: 'personalityTraits',
      ideals: 'ideals',
      bonds: 'bonds',
      flaws: 'flaws'
    };

    const currentItems = personalityData[category];
    const newItems = currentItems.filter((_, i) => i !== index);
    
    updateCharacterField(fieldMap[category] as keyof typeof characterData, newItems);
  };

  // ===========================
  // RENDER HELPERS
  // ===========================

  const renderPersonalitySection = (category: 'traits' | 'ideals' | 'bonds' | 'flaws') => {
    const categoryInfo = PERSONALITY_CATEGORIES.find(cat => cat.id === category);
    const items = personalityData[category];
    const CategoryIcon = categoryInfo?.icon || Heart;
    const maxItems = category === 'traits' ? 2 : 1; // Traits podem ter 2, outros apenas 1

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${categoryInfo?.color}`}>
            <CategoryIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{categoryInfo?.name}</h3>
            <p className="text-sm text-gray-400">{categoryInfo?.description}</p>
          </div>
          <div className="flex-1" />
          <span className="text-sm text-gray-500">
            {items.length}/{maxItems}
          </span>
        </div>

        {/* Items */}
        <div className="space-y-3">
          {items.map((item, index) => (
            <PersonalityItem
              key={index}
              item={item}
              category={category}
              onEdit={(newValue) => handleEditItem(category, index, newValue)}
              onRemove={() => handleRemoveItem(category, index)}
              isEditing={editingItem === `${category}-${index}`}
              onStartEdit={() => setEditingItem(`${category}-${index}`)}
              onStopEdit={() => setEditingItem(null)}
            />
          ))}

          {/* Add Item */}
          <AddPersonalityItem
            category={category}
            onAdd={(value) => handleAddItem(category, value)}
            maxItems={maxItems}
            currentCount={items.length}
          />
        </div>
      </div>
    );
  };

  // ===========================
  // RENDER PRINCIPAL
  // ===========================

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Personalidade do Personagem</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Defina os traços, ideais, vínculos e defeitos que tornam seu personagem único e memorável.
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-500/20 rounded-xl p-6 border border-blue-500/30">
        <div className="flex items-start space-x-3">
          <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-300 mb-2">Dicas para Criação de Personalidade</h4>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>• <strong>Traços:</strong> Características que outros notam sobre você</li>
              <li>• <strong>Ideais:</strong> Princípios que guiam suas decisões</li>
              <li>• <strong>Vínculos:</strong> O que é mais importante para você</li>
              <li>• <strong>Defeitos:</strong> Fraquezas que podem causar problemas</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Personality Sections */}
      {PERSONALITY_CATEGORIES.map(category => (
        <div key={category.id} className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          {renderPersonalitySection(category.id as 'traits' | 'ideals' | 'bonds' | 'flaws')}
        </div>
      ))}

      {/* Summary */}
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <h4 className="font-medium text-white mb-4">Resumo da Personalidade</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PERSONALITY_CATEGORIES.map(category => {
            const items = personalityData[category.id as keyof typeof personalityData];
            const CategoryIcon = category.icon;
            
            return (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CategoryIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-300">{category.name}</span>
                </div>
                
                {items.length > 0 ? (
                  <div className="space-y-1">
                    {items.map((item, index) => (
                      <p key={index} className="text-sm text-gray-400 pl-6">
                        • {item}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 pl-6 italic">Nenhum item adicionado</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Completion Status */}
        <div className="mt-6 pt-4 border-t border-gray-700/50">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Itens preenchidos:</span>
            <span className="text-green-400 font-medium">
              {Object.values(personalityData).flat().length} / 5
            </span>
          </div>
          
          <div className="mt-2 w-full bg-gray-700/50 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(Object.values(personalityData).flat().length / 5) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}