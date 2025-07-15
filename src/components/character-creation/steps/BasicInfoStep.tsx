// ===========================
// BASIC INFO STEP - ATUALIZADO PARA USAR NOVOS HOOKS
// src/components/character-creation/steps/BasicInfoStep.tsx
// ===========================

"use client";

import { useState, useEffect, useMemo } from "react";
import { useCharacterCreationContext } from "@/hooks/useCharacterCreation";
import { 
  User, 
  Search, 
  CheckCircle, 
  Circle, 
  Info, 
  Crown,
  Users,
  BookOpen,
  RotateCcw,
  Loader2,
  ChevronDown,
  Star,
  Zap,
  Heart,
  Shield,
  Feather,
  Flame
} from "lucide-react";
import { DndRace, DndClass, DndBackground, AlignmentType } from "@/types/characterCreation";

// ===========================
// CONFIGURAÇÕES DE ALINHAMENTO
// ===========================

const ALIGNMENTS: { value: AlignmentType; label: string; description: string }[] = [
  { value: 'lawful-good', label: 'Leal e Bom', description: 'Honrado e compassivo' },
  { value: 'neutral-good', label: 'Neutro e Bom', description: 'Benevolente e equilibrado' },
  { value: 'chaotic-good', label: 'Caótico e Bom', description: 'Bondoso e livre' },
  { value: 'lawful-neutral', label: 'Leal e Neutro', description: 'Ordenado e pragmático' },
  { value: 'true-neutral', label: 'Neutro', description: 'Equilibrado e natural' },
  { value: 'chaotic-neutral', label: 'Caótico e Neutro', description: 'Livre e imprevisível' },
  { value: 'lawful-evil', label: 'Leal e Mau', description: 'Tirano organizado' },
  { value: 'neutral-evil', label: 'Neutro e Mau', description: 'Egoísta e cruel' },
  { value: 'chaotic-evil', label: 'Caótico e Mau', description: 'Destrutivo e malvado' },
];

// ===========================
// COMPONENTE PRINCIPAL
// ===========================

export default function BasicInfoStep() {
  const {
    // Dados do personagem através do contexto compatível
    characterData,
    updateCharacterField,
    
    // Dados D&D
    races,
    classes,
    backgrounds,
    
    // Estados de loading
    isLoadingRaces,
    isLoadingClasses,
    isLoadingBackgrounds,
    
    // Search states
    raceSearch,
    setRaceSearch,
    classSearch,
    setClassSearch,
  } = useCharacterCreationContext();

  const [backgroundSearch, setBackgroundSearch] = useState('');
  const [showRaceDetails, setShowRaceDetails] = useState<string | null>(null);
  const [showClassDetails, setShowClassDetails] = useState<string | null>(null);

  // ===========================
  // FILTERED DATA
  // ===========================

  const filteredRaces = useMemo(() => {
    if (!raceSearch.trim()) return races;
    return races.filter(race => 
      race.name.toLowerCase().includes(raceSearch.toLowerCase())
    );
  }, [races, raceSearch]);

  const filteredClasses = useMemo(() => {
    if (!classSearch.trim()) return classes;
    return classes.filter(characterClass => 
      characterClass.name.toLowerCase().includes(classSearch.toLowerCase())
    );
  }, [classes, classSearch]);

  const filteredBackgrounds = useMemo(() => {
    if (!backgroundSearch.trim()) return backgrounds;
    return backgrounds.filter(background => 
      background.name.toLowerCase().includes(backgroundSearch.toLowerCase())
    );
  }, [backgrounds, backgroundSearch]);

  // ===========================
  // RACE CARD COMPONENT
  // ===========================

  const RaceCard = ({ race }: { race: DndRace }) => {
    const isSelected = characterData.selectedRace?.index === race.index;
    
    return (
      <div
        onClick={() => updateCharacterField('selectedRace', race)}
        className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer group ${
          isSelected
            ? 'bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border-blue-400/50 shadow-lg shadow-blue-500/25'
            : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-700/50'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className={`font-semibold transition-colors ${
              isSelected ? 'text-blue-300' : 'text-white group-hover:text-gray-200'
            }`}>
              {race.name}
            </h3>
            
            {race.ability_bonuses && race.ability_bonuses.length > 0 && (
              <div className="mt-2 space-y-1">
                {race.ability_bonuses.map((bonus, index) => (
                  <span 
                    key={index}
                    className="inline-block text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded mr-1"
                  >
                    {bonus.ability_score.name} +{bonus.bonus}
                  </span>
                ))}
              </div>
            )}

            {race.traits && race.traits.length > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                {race.traits.slice(0, 2).map(trait => trait.name).join(', ')}
                {race.traits.length > 2 && '...'}
              </p>
            )}
          </div>

          <div className="ml-4">
            {isSelected ? (
              <CheckCircle className="w-5 h-5 text-blue-400" />
            ) : (
              <Circle className="w-5 h-5 text-gray-500 group-hover:text-gray-400" />
            )}
          </div>
        </div>

        {/* Botão de detalhes */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowRaceDetails(showRaceDetails === race.index ? null : race.index);
          }}
          className="mt-2 text-xs text-gray-400 hover:text-gray-300 flex items-center"
        >
          <Info className="w-3 h-3 mr-1" />
          Ver detalhes
        </button>

        {/* Detalhes expandidos */}
        {showRaceDetails === race.index && (
          <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-2">
            <div className="text-sm text-gray-300">
              <strong>Tamanho:</strong> {race.size || 'Médio'}
            </div>
            <div className="text-sm text-gray-300">
              <strong>Velocidade:</strong> {race.speed || 30} pés
            </div>
            {race.languages && race.languages.length > 0 && (
              <div className="text-sm text-gray-300">
                <strong>Idiomas:</strong> {race.languages.map(lang => lang.name).join(', ')}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ===========================
  // CLASS CARD COMPONENT
  // ===========================

  const ClassCard = ({ characterClass }: { characterClass: DndClass }) => {
    const isSelected = characterData.selectedClass?.index === characterClass.index;
    
    const classIcons = {
      'barbarian': Shield,
      'bard': Heart,
      'cleric': Star,
      'druid': Feather,
      'fighter': Zap,
      'monk': Circle,
      'paladin': Crown,
      'ranger': Users,
      'rogue': User,
      'sorcerer': Flame,
      'warlock': BookOpen,
      'wizard': BookOpen,
    };
    
    const ClassIcon = classIcons[characterClass.index as keyof typeof classIcons] || User;
    
    return (
      <div
        onClick={() => updateCharacterField('selectedClass', characterClass)}
        className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer group ${
          isSelected
            ? 'bg-gradient-to-br from-purple-500/20 to-pink-600/20 border-purple-400/50 shadow-lg shadow-purple-500/25'
            : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-700/50'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${
              isSelected 
                ? 'bg-purple-500/20 text-purple-300' 
                : 'bg-gray-700/50 text-gray-400 group-hover:text-gray-300'
            }`}>
              <ClassIcon className="w-4 h-4" />
            </div>
            
            <div className="flex-1">
              <h3 className={`font-semibold transition-colors ${
                isSelected ? 'text-purple-300' : 'text-white group-hover:text-gray-200'
              }`}>
                {characterClass.name}
              </h3>
              
              <div className="mt-1 text-xs text-gray-400">
                DV: d{characterClass.hit_die} | 
                {characterClass.spellcasting ? ' Conjurador' : ' Não-conjurador'}
              </div>

              {characterClass.proficiencies && characterClass.proficiencies.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-gray-500">Proficiências principais:</span>
                  <div className="mt-1">
                    {characterClass.proficiencies.slice(0, 3).map((prof, index) => (
                      <span 
                        key={index}
                        className="inline-block text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded mr-1 mb-1"
                      >
                        {prof.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="ml-4">
            {isSelected ? (
              <CheckCircle className="w-5 h-5 text-purple-400" />
            ) : (
              <Circle className="w-5 h-5 text-gray-500 group-hover:text-gray-400" />
            )}
          </div>
        </div>

        {/* Botão de detalhes */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowClassDetails(showClassDetails === characterClass.index ? null : characterClass.index);
          }}
          className="mt-2 text-xs text-gray-400 hover:text-gray-300 flex items-center"
        >
          <Info className="w-3 h-3 mr-1" />
          Ver detalhes
        </button>

        {/* Detalhes expandidos */}
        {showClassDetails === characterClass.index && (
          <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-2">
            {characterClass.saving_throws && (
              <div className="text-sm text-gray-300">
                <strong>Resistências:</strong> {characterClass.saving_throws.map(st => st.name).join(', ')}
              </div>
            )}
            {characterClass.spellcasting && (
              <div className="text-sm text-gray-300">
                <strong>Habilidade de Conjuração:</strong> {characterClass.spellcasting.spellcasting_ability.name}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ===========================
  // BACKGROUND CARD COMPONENT
  // ===========================

  const BackgroundCard = ({ background }: { background: DndBackground }) => {
    const isSelected = characterData.selectedBackground?.index === background.index;
    
    return (
      <div
        onClick={() => updateCharacterField('selectedBackground', background)}
        className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer group ${
          isSelected
            ? 'bg-gradient-to-br from-green-500/20 to-teal-600/20 border-green-400/50 shadow-lg shadow-green-500/25'
            : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-700/50'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className={`font-semibold transition-colors ${
              isSelected ? 'text-green-300' : 'text-white group-hover:text-gray-200'
            }`}>
              {background.name}
            </h3>

            {background.skill_proficiencies && background.skill_proficiencies.length > 0 && (
              <div className="mt-2">
                <span className="text-xs text-gray-500">Perícias:</span>
                <div className="mt-1">
                  {background.skill_proficiencies.map((skill, index) => (
                    <span 
                      key={index}
                      className="inline-block text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded mr-1"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="ml-4">
            {isSelected ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <Circle className="w-5 h-5 text-gray-500 group-hover:text-gray-400" />
            )}
          </div>
        </div>
      </div>
    );
  };

  // ===========================
  // RENDER PRINCIPAL
  // ===========================

  return (
    <div className="space-y-8">
      {/* Nome do Personagem */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300">
          Nome do Personagem *
        </label>
        <input
          type="text"
          value={characterData.name}
          onChange={(e) => updateCharacterField('name', e.target.value)}
          placeholder="Digite o nome do seu personagem..."
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
        />
      </div>

      {/* Seleção de Raça */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-300">
            Raça *
          </label>
          {isLoadingRaces && (
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          )}
        </div>

        {/* Busca de Raças */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={raceSearch}
            onChange={(e) => setRaceSearch(e.target.value)}
            placeholder="Buscar raças..."
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
        </div>

        {/* Grid de Raças */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {filteredRaces.map((race) => (
            <RaceCard key={race.index} race={race} />
          ))}
        </div>

        {filteredRaces.length === 0 && !isLoadingRaces && (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma raça encontrada</p>
          </div>
        )}
      </div>

      {/* Seleção de Classe */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-300">
            Classe *
          </label>
          {isLoadingClasses && (
            <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
          )}
        </div>

        {/* Busca de Classes */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={classSearch}
            onChange={(e) => setClassSearch(e.target.value)}
            placeholder="Buscar classes..."
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
          />
        </div>

        {/* Grid de Classes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {filteredClasses.map((characterClass) => (
            <ClassCard key={characterClass.index} characterClass={characterClass} />
          ))}
        </div>

        {filteredClasses.length === 0 && !isLoadingClasses && (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma classe encontrada</p>
          </div>
        )}
      </div>

      {/* Seleção de Background */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-300">
            Background *
          </label>
          {isLoadingBackgrounds && (
            <Loader2 className="w-4 h-4 text-green-400 animate-spin" />
          )}
        </div>

        {/* Busca de Backgrounds */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={backgroundSearch}
            onChange={(e) => setBackgroundSearch(e.target.value)}
            placeholder="Buscar backgrounds..."
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
          />
        </div>

        {/* Grid de Backgrounds */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
          {filteredBackgrounds.map((background) => (
            <BackgroundCard key={background.index} background={background} />
          ))}
        </div>

        {filteredBackgrounds.length === 0 && !isLoadingBackgrounds && (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum background encontrado</p>
          </div>
        )}
      </div>

      {/* Seleção de Alinhamento */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-300">
          Alinhamento *
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {ALIGNMENTS.map((alignment) => {
            const isSelected = characterData.alignment === alignment.value;
            
            return (
              <div
                key={alignment.value}
                onClick={() => updateCharacterField('alignment', alignment.value)}
                className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border-indigo-400/50 shadow-lg shadow-indigo-500/25'
                    : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`font-medium text-sm ${
                      isSelected ? 'text-indigo-300' : 'text-white'
                    }`}>
                      {alignment.label}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {alignment.description}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircle className="w-4 h-4 text-indigo-400 ml-2" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}