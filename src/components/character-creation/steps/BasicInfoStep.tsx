// ===========================
// BASIC INFO STEP - VERSÃO CORRIGIDA
// src/components/character-creation/steps/BasicInfoStep.tsx
// ===========================

"use client";

import { User, Users, Briefcase, Search, Loader2, Sparkles, Crown } from "lucide-react";
import { useCharacterCreationContext } from "@/hooks/useCharacterCreation";
import { useState } from "react";
import { DndRace, DndClass, DndBackground, DndSubrace } from "@/types/characterCreation";

interface SelectionCardProps {
  title: string;
  description: string;
  details?: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
  isRequired?: boolean;
}

function SelectionCard({ 
  title, 
  description, 
  details, 
  selected, 
  onClick, 
  className = "",
  isRequired = false 
}: SelectionCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-lg border cursor-pointer transition-all hover:scale-105 relative
        ${selected 
          ? 'bg-purple-600/20 border-purple-400 ring-2 ring-purple-400/50' 
          : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'
        }
        ${className}
      `}
    >
      {isRequired && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          Obrigatório
        </div>
      )}
      
      <h3 className="font-semibold text-white mb-1">{title}</h3>
      <p className="text-white/70 text-sm mb-2">{description}</p>
      {details && (
        <p className="text-white/50 text-xs">{details}</p>
      )}
    </div>
  );
}

interface SearchableListProps<T> {
  items: T[];
  searchTerm: string;
  onSearchChange: (search: string) => void;
  selectedItem: T | null;
  onItemSelect: (item: T) => void;
  renderItem: (item: T) => React.ReactNode;
  placeholder: string;
  emptyMessage: string;
  isLoading?: boolean;
}

function SearchableList<T>({
  items,
  searchTerm,
  onSearchChange,
  selectedItem,
  onItemSelect,
  renderItem,
  placeholder,
  emptyMessage,
  isLoading = false
}: SearchableListProps<T>) {
  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-2" />
            <p className="text-white/70">Carregando...</p>
          </div>
        </div>
      )}

      {/* Items List */}
      {!isLoading && (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {items.length > 0 ? (
            items.map((item, index) => (
              <div key={index}>
                {renderItem(item)}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-white/50">
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
    isLoadingRaces,
    isLoadingClasses,
    isLoadingBackgrounds,
    isLoadingSubraces,
    raceSearch,
    setRaceSearch,
    classSearch,
    setClassSearch,
    
    // ===========================
    // FUNÇÕES CORRIGIDAS
    // ===========================
    getAvailableSubraces, // ✅ Agora existe
    getAvailableSubclasses, // ✅ Agora existe
    needsSubrace, // ✅ Agora existe
    needsSubclass, // ✅ Agora existe
    getCombinedAbilityBonuses, // ✅ Para preview
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

  // ===========================
  // USAR AS FUNÇÕES CORRETAS DO CONTEXTO
  // ===========================
  
  // Get available subraces for the selected race
  const availableSubraces = getAvailableSubraces(); // ✅ Agora funciona
  const hasSubraces = availableSubraces.length > 0;
  const raceNeedsSubrace = needsSubrace(); // ✅ Verifica se é obrigatório

  // Get available subclasses for the selected class
  const availableSubclasses = getAvailableSubclasses(); // ✅ Agora funciona
  const hasSubclasses = availableSubclasses.length > 0;
  const classNeedsSubclass = needsSubclass(); // ✅ Verifica se é obrigatório

  // Get combined bonuses for preview
  const combinedBonuses = getCombinedAbilityBonuses();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Character Name */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="flex items-center space-x-3 mb-4">
          <User className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Nome do Personagem</h2>
          <span className="text-red-400 text-sm">*</span>
        </div>
        
        <input
          type="text"
          placeholder="Digite o nome do seu personagem..."
          value={characterData.name}
          onChange={(e) => updateCharacterData({ name: e.target.value })}
          className="w-full p-4 bg-white/10 border border-white/20 rounded-lg text-white text-xl placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
        />
        
        {!characterData.name.trim() && (
          <p className="text-red-400 text-sm mt-2">Nome é obrigatório</p>
        )}
      </div>

      {/* Main Selection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Race Selection */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Raça</h2>
              <span className="text-red-400 text-sm">*</span>
            </div>
            
            {/* Race Count */}
            <span className="text-white/50 text-sm">
              {filteredRaces.length} raças
            </span>
          </div>

          <SearchableList
            items={filteredRaces}
            searchTerm={raceSearch}
            onSearchChange={setRaceSearch}
            selectedItem={characterData.selectedRace}
            onItemSelect={(race) => {
              updateCharacterData({ 
                selectedRace: race,
                selectedSubrace: null // Reset subrace when changing race
              });
            }}
            renderItem={(race: DndRace) => (
              <SelectionCard
                title={race.name}
                description={`Velocidade: ${race.speed} pés`}
                details={race.ability_bonuses
                  .map(bonus => `+${bonus.bonus} ${bonus.ability_score.name}`)
                  .join(", ")}
                selected={characterData.selectedRace?.index === race.index}
                onClick={() => {
                  updateCharacterData({ 
                    selectedRace: race,
                    selectedSubrace: null
                  });
                }}
                isRequired={true}
              />
            )}
            placeholder="Buscar raças..."
            emptyMessage="Nenhuma raça encontrada"
            isLoading={isLoadingRaces}
          />
        </div>

        {/* Class Selection */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Briefcase className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-bold text-white">Classe</h2>
              <span className="text-red-400 text-sm">*</span>
            </div>
            
            {/* Class Count */}
            <span className="text-white/50 text-sm">
              {filteredClasses.length} classes
            </span>
          </div>

          <SearchableList
            items={filteredClasses}
            searchTerm={classSearch}
            onSearchChange={setClassSearch}
            selectedItem={characterData.selectedClass}
            onItemSelect={(cls) => {
              updateCharacterData({ 
                selectedClass: cls,
                selectedSubclass: null // Reset subclass when changing class
              });
            }}
            renderItem={(cls: DndClass) => (
              <SelectionCard
                title={cls.name}
                description={`Dado de Vida: d${cls.hit_die}`}
                details={cls.saving_throws
                  ?.map(save => save.name)
                  .join(", ") || ""}
                selected={characterData.selectedClass?.index === cls.index}
                onClick={() => {
                  updateCharacterData({ 
                    selectedClass: cls,
                    selectedSubclass: null
                  });
                }}
                isRequired={true}
              />
            )}
            placeholder="Buscar classes..."
            emptyMessage="Nenhuma classe encontrada"
            isLoading={isLoadingClasses}
          />
        </div>

        {/* Background Selection */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Briefcase className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">Background</h2>
              <span className="text-red-400 text-sm">*</span>
            </div>
            
            {/* Background Count */}
            <span className="text-white/50 text-sm">
              {filteredBackgrounds.length} backgrounds
            </span>
          </div>

          <SearchableList
            items={filteredBackgrounds}
            searchTerm={backgroundSearch}
            onSearchChange={setBackgroundSearch}
            selectedItem={characterData.selectedBackground}
            onItemSelect={(background) => {
              updateCharacterData({ selectedBackground: background });
            }}
            renderItem={(background: DndBackground) => (
              <SelectionCard
                title={background.name}
                description={background.feature?.name || "Background especial"}
                details={background.starting_proficiencies
                  ?.map(prof => prof.name)
                  .slice(0, 2)
                  .join(", ") || ""}
                selected={characterData.selectedBackground?.index === background.index}
                onClick={() => {
                  updateCharacterData({ selectedBackground: background });
                }}
                isRequired={true}
              />
            )}
            placeholder="Buscar backgrounds..."
            emptyMessage="Nenhum background encontrado"
            isLoading={isLoadingBackgrounds}
          />
        </div>
      </div>

      {/* Subrace Selection - Only show if race has subraces */}
      {hasSubraces && characterData.selectedRace && (
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Crown className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">Sub-raça</h2>
              <span className="text-sm text-white/50">
                ({characterData.selectedRace.name})
              </span>
              {raceNeedsSubrace && <span className="text-red-400 text-sm">*</span>}
            </div>
            
            <span className="text-white/50 text-sm">
              {availableSubraces.length} sub-raças
            </span>
          </div>

          {isLoadingSubraces ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
                <p className="text-white/70">Carregando sub-raças...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableSubraces.map((subrace: DndSubrace) => (
                <SelectionCard
                  key={subrace.index}
                  title={subrace.name}
                  description={subrace.desc.length > 100 ? subrace.desc.substring(0, 100) + "..." : subrace.desc}
                  details={subrace.ability_bonuses
                    ?.map(bonus => `+${bonus.bonus} ${bonus.ability_score.name}`)
                    .join(", ") || ""}
                  selected={characterData.selectedSubrace?.index === subrace.index}
                  onClick={() => {
                    updateCharacterData({ selectedSubrace: subrace });
                  }}
                  isRequired={raceNeedsSubrace}
                />
              ))}
            </div>
          )}
          
          {raceNeedsSubrace && !characterData.selectedSubrace && (
            <p className="text-red-400 text-sm mt-2">
              Esta raça requer a escolha de uma sub-raça
            </p>
          )}
        </div>
      )}

      {/* Subclass Info - Show if class will need subclass later */}
      {hasSubclasses && characterData.selectedClass && classNeedsSubclass && (
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-400/30">
          <div className="flex items-center space-x-3 mb-3">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Subclasse</h3>
          </div>
          
          <p className="text-white/80 mb-3">
            Sua classe <strong>{characterData.selectedClass.name}</strong> poderá escolher uma subclasse nos próximos passos.
            Há <strong>{availableSubclasses.length}</strong> subclasses disponíveis para esta classe.
          </p>
          
          <div className="flex flex-wrap gap-2">
            {availableSubclasses.slice(0, 3).map((subclass) => (
              <span key={subclass.index} className="text-xs bg-blue-600/30 text-blue-200 px-3 py-1 rounded-full">
                {subclass.name}
              </span>
            ))}
            {availableSubclasses.length > 3 && (
              <span className="text-xs bg-blue-600/30 text-blue-200 px-3 py-1 rounded-full">
                +{availableSubclasses.length - 3} mais
              </span>
            )}
          </div>
        </div>
      )}

      {/* Character Preview */}
      {(characterData.selectedRace || characterData.selectedClass || characterData.selectedBackground) && (
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-400/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Prévia do Personagem
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <div className="text-white">
                <span className="text-white/70">Nome: </span>
                <strong>{characterData.name || "Sem nome"}</strong>
              </div>
              
              {characterData.selectedRace && (
                <div className="text-white">
                  <span className="text-white/70">Raça: </span>
                  <strong>{characterData.selectedRace.name}</strong>
                  {characterData.selectedSubrace && (
                    <span> ({characterData.selectedSubrace.name})</span>
                  )}
                </div>
              )}
              
              {characterData.selectedClass && (
                <div className="text-white">
                  <span className="text-white/70">Classe: </span>
                  <strong>{characterData.selectedClass.name}</strong>
                </div>
              )}
              
              {characterData.selectedBackground && (
                <div className="text-white">
                  <span className="text-white/70">Background: </span>
                  <strong>{characterData.selectedBackground.name}</strong>
                </div>
              )}
            </div>

            {/* Stats Preview */}
            <div className="space-y-3">
              <div className="text-white">
                <span className="text-white/70">Nível: </span>
                <strong>{characterData.level}</strong>
              </div>
              
              {characterData.selectedRace && (
                <div className="text-white">
                  <span className="text-white/70">Velocidade: </span>
                  <strong>{characterData.selectedRace.speed} pés</strong>
                </div>
              )}
              
              {characterData.selectedClass && (
                <div className="text-white">
                  <span className="text-white/70">Dado de Vida: </span>
                  <strong>d{characterData.selectedClass.hit_die}</strong>
                </div>
              )}

              {/* Racial Bonuses Preview */}
              {Object.values(combinedBonuses).some(bonus => bonus > 0) && (
                <div className="text-white">
                  <span className="text-white/70">Bônus Raciais: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(combinedBonuses).map(([ability, bonus]) => (
                      bonus > 0 && (
                        <span key={ability} className="text-xs bg-green-600/30 text-green-200 px-2 py-1 rounded">
                          {ability.toUpperCase()}: +{bonus}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Validation Status */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Status das informações básicas:</span>
              
              {characterData.name && characterData.selectedRace && characterData.selectedClass && characterData.selectedBackground && 
               (!raceNeedsSubrace || characterData.selectedSubrace) ? (
                <div className="flex items-center space-x-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-medium">Completo</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-yellow-400">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Incompleto</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}