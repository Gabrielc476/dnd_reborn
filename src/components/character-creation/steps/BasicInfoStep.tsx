// ===========================
// BASIC INFO STEP - COMPONENTE REFATORADO
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
                      ? 'bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/25'
                      : 'bg-gray-700/30 border-gray-600/50 hover:bg-gray-700/50 hover:border-gray-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-white font-medium">{displayName}</h4>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      {description && (
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                          {description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-gray-400">
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

  // Filtrar dados baseado na busca
  const filteredRaces = races.filter(race =>
    race.name.toLowerCase().includes(raceSearch.toLowerCase())
  );

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(classSearch.toLowerCase())
  );

  const filteredBackgrounds = backgrounds.filter(bg =>
    bg.name.toLowerCase().includes(backgroundSearch.toLowerCase())
  );

  // Subrace logic
  const availableSubraces = subraces.filter(subrace => 
    characterData.selectedRace ? subrace.race.index === characterData.selectedRace.index : false
  );
  const hasSubraces = availableSubraces.length > 0;
  const raceNeedsSubrace = hasSubraces && ['elf', 'dwarf', 'halfling', 'gnome'].includes(characterData.selectedRace?.index || '');

  // Subclass logic
  const availableSubclasses = subclasses.filter(subclass => 
    characterData.selectedClass ? subclass.class.index === characterData.selectedClass.index : false
  );
  const hasSubclasses = availableSubclasses.length > 0;
  
  // Verificar se pode escolher subclasse baseado no nível
  const getSubclassLevel = (classIndex: string): number => {
    const subclassLevels: Record<string, number> = {
      'cleric': 1,
      'sorcerer': 1,
      'warlock': 1,
      'wizard': 2,
      'druid': 2,
      'fighter': 3,
      'monk': 3,
      'paladin': 3,
      'ranger': 3,
      'rogue': 3,
      'barbarian': 3,
      'bard': 3,
    };
    return subclassLevels[classIndex] || 1;
  };

  const canChooseSubclass = characterData.selectedClass ? 
    characterData.level >= getSubclassLevel(characterData.selectedClass.index) : false;

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
                      ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/25'
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
                      <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subclasses (se aplicável e nível suficiente) */}
      {hasSubclasses && canChooseSubclass && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Sword className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg">
              Subclasses de {characterData.selectedClass?.name}
            </h3>
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg border border-green-500/30">
              Nível {getSubclassLevel(characterData.selectedClass?.index || '')}+
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

      {/* Background */}
      <SelectionGrid
        title="Backgrounds"
        icon={Scroll}
        items={filteredBackgrounds}
        selectedItem={characterData.selectedBackground}
        onSelect={(background) => updateCharacterData({ selectedBackground: background })}
        isLoading={isLoadingBackgrounds}
        searchValue={backgroundSearch}
        onSearchChange={setBackgroundSearch}
        emptyMessage="Nenhum background encontrado"
        getDescription={() => "Determina suas habilidades iniciais e características"}
      />
    </div>
  );
}