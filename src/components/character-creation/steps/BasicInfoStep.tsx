// ===========================
// BASIC INFO STEP - COMPONENTE COMPLETO COM INFORMAÇÕES DOS BACKGROUNDS
// src/components/character-creation/steps/BasicInfoStep.tsx
// ===========================

"use client";

import { useState } from "react";
import { useCharacterCreationContext } from "@/hooks/useCharacterCreation";
import { 
  User, 
  Search, 
  Crown, 
  Sword, 
  Scroll,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

// Componente para seleção com busca
function SelectionGrid({ 
  title, 
  icon: Icon, 
  items, 
  selectedItem, 
  onSelect, 
  isLoading, 
  searchValue, 
  onSearchChange, 
  emptyMessage,
  getDisplayName = (item) => item.name,
  getDescription = () => ""
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-white font-semibold text-lg">{title}</h3>
      </div>
      
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={`Buscar ${title.toLowerCase()}...`}
          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
      </div>

      {/* Items Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Carregando {title.toLowerCase()}...</span>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 max-h-80 overflow-y-auto custom-scrollbar">
          {items.length > 0 ? (
            items.map((item, index) => {
              const isSelected = selectedItem?.index === item.index;
              const displayName = getDisplayName(item);
              const description = getDescription(item);
              
              return (
                <div
                  key={item.index || index}
                  onClick={() => onSelect(item)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                    isSelected
                      ? 'bg-green-500/20 border-green-500/50 shadow-lg shadow-green-500/25'
                      : 'bg-gray-700/30 border-gray-600/50 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">{displayName}</h4>
                      {description && (
                        <p className="text-gray-400 text-sm">{description}</p>
                      )}
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 ml-3" />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>{emptyMessage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BasicInfoStep() {
  const {
    characterData,
    updateCharacterData,
    races,
    classes,
    backgrounds,
    subclasses,
    subraces,
    isLoadingRaces,
    isLoadingClasses,
    isLoadingBackgrounds,
    isLoadingSubclasses,
    isLoadingSubraces,
    raceSearch,
    setRaceSearch,
    classSearch,
    setClassSearch,
  } = useCharacterCreationContext();

  const [backgroundSearch, setBackgroundSearch] = useState("");

  // Filtros de busca
  const filteredRaces = races.filter(race =>
    race.name.toLowerCase().includes(raceSearch.toLowerCase())
  );

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(classSearch.toLowerCase())
  );

  const filteredBackgrounds = backgrounds.filter(bg =>
    bg.name.toLowerCase().includes(backgroundSearch.toLowerCase())
  );

  // Subraças disponíveis para a raça selecionada
  const availableSubraces = subraces.filter(subrace => 
    subrace.race.index === characterData.selectedRace?.index
  );

  // Subclasses disponíveis para a classe selecionada
  const availableSubclasses = subclasses.filter(subclass => 
    subclass.class.index === characterData.selectedClass?.index
  );

  // Verificações de disponibilidade
  const hasSubraces = characterData.selectedRace && availableSubraces.length > 0;
  const raceNeedsSubrace = hasSubraces && characterData.selectedRace?.subraces?.length > 0;

  const hasSubclasses = characterData.selectedClass && availableSubclasses.length > 0;
  
  // Função para determinar quando mostrar subclasses (geralmente nível 1, 2 ou 3)
  const getSubclassLevel = (classIndex) => {
    const subclassLevels = {
      'sorcerer': 1,
      'warlock': 1,
      'cleric': 1,
      'druid': 2,
      'wizard': 2,
      'bard': 3,
      'fighter': 3,
      'ranger': 3,
      'rogue': 3,
      'barbarian': 3,
      'monk': 3,
      'paladin': 3,
    };
    return subclassLevels[classIndex] || 3;
  };

  const showSubclasses = hasSubclasses && 
    characterData.level >= getSubclassLevel(characterData.selectedClass.index);

  return (
    <div className="space-y-8">
      {/* Nome e Nível */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-white font-medium text-sm uppercase tracking-wide">
            Nome do Personagem
          </label>
          <input
            type="text"
            value={characterData.name}
            onChange={(e) => updateCharacterData({ name: e.target.value })}
            placeholder="Digite o nome do seu herói"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-lg font-medium"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-white font-medium text-sm uppercase tracking-wide">
            Nível Inicial
          </label>
          <div className="relative">
            <select
              value={characterData.level}
              onChange={(e) => updateCharacterData({ level: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-lg font-medium appearance-none cursor-pointer"
            >
              {Array.from({ length: 20 }, (_, i) => i + 1).map(level => (
                <option key={level} value={level}>
                  Nível {level}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Seleções principais em grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Raças */}
        <SelectionGrid
          title="Raças"
          icon={Crown}
          items={filteredRaces}
          selectedItem={characterData.selectedRace}
          onSelect={(race) => {
            updateCharacterData({ 
              selectedRace: race,
              selectedSubrace: null // Reset subrace when race changes
            });
          }}
          isLoading={isLoadingRaces}
          searchValue={raceSearch}
          onSearchChange={setRaceSearch}
          emptyMessage="Nenhuma raça encontrada"
          getDescription={(race) => `Velocidade: ${race.speed} pés. ${race.size_description}`}
        />

        {/* Classes */}
        <SelectionGrid
          title="Classes"
          icon={Sword}
          items={filteredClasses}
          selectedItem={characterData.selectedClass}
          onSelect={(cls) => {
            updateCharacterData({ 
              selectedClass: cls,
              selectedSubclass: null // Reset subclass when class changes
            });
          }}
          isLoading={isLoadingClasses}
          searchValue={classSearch}
          onSearchChange={setClassSearch}
          emptyMessage="Nenhuma classe encontrada"
          getDescription={(cls) => `Dado de Vida: d${cls.hit_die}. ${cls.spellcasting ? 'Conjurador' : 'Não-conjurador'}`}
        />
      </div>

      {/* Subraças (se aplicável) */}
      {hasSubraces && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg">
              Subraças de {characterData.selectedRace?.name}
            </h3>
            {raceNeedsSubrace && (
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-lg border border-yellow-500/30">
                Obrigatório
              </span>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-3">
            {availableSubraces.map((subrace) => {
              const isSelected = characterData.selectedSubrace?.index === subrace.index;
              
              return (
                <div
                  key={subrace.index}
                  onClick={() => updateCharacterData({ selectedSubrace: subrace })}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                    isSelected
                      ? 'bg-green-500/20 border-green-500/50 shadow-lg shadow-green-500/25'
                      : 'bg-gray-700/30 border-gray-600/50 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">{subrace.name}</h4>
                      {subrace.desc && (
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                          {subrace.desc}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subclasses (se aplicável e nível suficiente) */}
      {showSubclasses && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <Sword className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg">
              Subclasses de {characterData.selectedClass?.name}
            </h3>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg border border-blue-500/30">
              Nível {getSubclassLevel(characterData.selectedClass.index)}+
            </span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-3">
            {availableSubclasses.map((subclass) => {
              const isSelected = characterData.selectedSubclass?.index === subclass.index;
              
              return (
                <div
                  key={subclass.index}
                  onClick={() => updateCharacterData({ selectedSubclass: subclass })}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                    isSelected
                      ? 'bg-green-500/20 border-green-500/50 shadow-lg shadow-green-500/25'
                      : 'bg-gray-700/30 border-gray-600/50 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">{subclass.name}</h4>
                      <p className="text-gray-400 text-sm">{subclass.subclass_flavor}</p>
                      {subclass.desc && subclass.desc.length > 0 && (
                        <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                          {subclass.desc[0]}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Background - Versão Melhorada com Informações Detalhadas */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Scroll className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-white font-semibold text-lg">Backgrounds</h3>
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={backgroundSearch}
            onChange={(e) => setBackgroundSearch(e.target.value)}
            placeholder="Buscar backgrounds..."
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        {/* Backgrounds Grid */}
        {isLoadingBackgrounds ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Carregando backgrounds...</span>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 max-h-80 overflow-y-auto custom-scrollbar">
            {filteredBackgrounds.length > 0 ? (
              filteredBackgrounds.map((background) => {
                const isSelected = characterData.selectedBackground?.index === background.index;
                
                return (
                  <div
                    key={background.index}
                    onClick={() => updateCharacterData({ selectedBackground: background })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                      isSelected
                        ? 'bg-green-500/20 border-green-500/50 shadow-lg shadow-green-500/25'
                        : 'bg-gray-700/30 border-gray-600/50 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-2">{background.name}</h4>
                        
                        {/* Proficiências */}
                        {background.starting_proficiencies && background.starting_proficiencies.length > 0 && (
                          <div className="mb-2">
                            <span className="text-blue-400 text-xs font-medium">Proficiências: </span>
                            <span className="text-gray-300 text-xs">
                              {background.starting_proficiencies.map(prof => prof.name).join(", ")}
                            </span>
                          </div>
                        )}
                        
                        {/* Característica especial */}
                        {background.feature && (
                          <div className="mb-2">
                            <span className="text-purple-400 text-xs font-medium">Característica: </span>
                            <span className="text-gray-300 text-xs">{background.feature.name}</span>
                          </div>
                        )}
                        
                        {/* Equipamentos iniciais */}
                        {background.starting_equipment && background.starting_equipment.length > 0 && (
                          <div>
                            <span className="text-yellow-400 text-xs font-medium">Equipamentos: </span>
                            <span className="text-gray-300 text-xs">
                              {background.starting_equipment
                                .slice(0, 3) // Limita a 3 itens
                                .map(eq => eq.equipment.name)
                                .join(", ")}
                              {background.starting_equipment.length > 3 && "..."}
                            </span>
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 ml-3" />
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum background encontrado</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detalhes do Background Selecionado */}
      {characterData.selectedBackground && (
        <div className="mt-6 p-6 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-2xl border border-purple-500/30">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Scroll className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl">{characterData.selectedBackground.name}</h3>
              <p className="text-purple-300 text-sm">Background Selecionado</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Coluna Esquerda - Proficiências e Equipamentos */}
            <div className="space-y-4">
              {/* Proficiências */}
              {characterData.selectedBackground.starting_proficiencies && 
               characterData.selectedBackground.starting_proficiencies.length > 0 && (
                <div>
                  <h4 className="text-blue-400 font-semibold mb-2 flex items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    Proficiências Iniciais
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {characterData.selectedBackground.starting_proficiencies.map((prof, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-lg border border-blue-500/30"
                      >
                        {prof.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Equipamentos Iniciais */}
              {characterData.selectedBackground.starting_equipment && 
               characterData.selectedBackground.starting_equipment.length > 0 && (
                <div>
                  <h4 className="text-yellow-400 font-semibold mb-2 flex items-center">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                    Equipamentos Iniciais
                  </h4>
                  <div className="space-y-1">
                    {characterData.selectedBackground.starting_equipment.map((eq, index) => (
                      <div key={index} className="text-gray-300 text-sm flex items-center">
                        <span className="w-1 h-1 bg-gray-500 rounded-full mr-2"></span>
                        {eq.quantity > 1 ? `${eq.quantity}x ` : ""}{eq.equipment.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Opções de Idiomas */}
              {characterData.selectedBackground.language_options && (
                <div>
                  <h4 className="text-green-400 font-semibold mb-2 flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    Opções de Idiomas
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Escolha {characterData.selectedBackground.language_options.choose} idioma(s) adicional(is)
                  </p>
                </div>
              )}
            </div>

            {/* Coluna Direita - Característica e Descrições */}
            <div className="space-y-4">
              {/* Característica Especial */}
              {characterData.selectedBackground.feature && (
                <div>
                  <h4 className="text-purple-400 font-semibold mb-2 flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                    {characterData.selectedBackground.feature.name}
                  </h4>
                  <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/20">
                    {characterData.selectedBackground.feature.desc.map((desc, index) => (
                      <p key={index} className="text-gray-300 text-sm mb-2 last:mb-0">
                        {desc}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Sugestões de Personalidade (se disponível) */}
              {characterData.selectedBackground.personality_traits && (
                <div>
                  <h4 className="text-pink-400 font-semibold mb-2 flex items-center">
                    <div className="w-2 h-2 bg-pink-400 rounded-full mr-2"></div>
                    Traços de Personalidade Sugeridos
                  </h4>
                  <div className="bg-pink-900/20 p-3 rounded-lg border border-pink-500/20 max-h-32 overflow-y-auto">
                    {characterData.selectedBackground.personality_traits.from.options.slice(0, 3).map((trait, index) => (
                      <p key={index} className="text-gray-300 text-xs mb-1 last:mb-0">
                        • {trait.string}
                      </p>
                    ))}
                    {characterData.selectedBackground.personality_traits.from.options.length > 3 && (
                      <p className="text-pink-300 text-xs mt-2 italic">
                        +{characterData.selectedBackground.personality_traits.from.options.length - 3} mais opções disponíveis...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}