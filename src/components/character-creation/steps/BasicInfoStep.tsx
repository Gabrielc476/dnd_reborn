"use client";

import { useState } from "react";
import { useCharacterCreationContext } from "@/hooks/useCharacterCreation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  User, 
  Users, 
  Briefcase, 
  Sparkles, 
  CheckCircle,
  Crown,
  TrendingUp,
  Plus,
  Minus
} from "lucide-react";

import SearchableList from "../ui/SearchableList";
import SelectionCard from "../ui/SelectionCard";
import { DndRace, DndClass, DndBackground, DndSubrace, DndSubclass } from "@/types/characterCreation";

// Interface para o componente SearchableList
interface SearchableListProps<T> {
  items: T[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedItem?: T | null;
  onItemSelect?: (item: T) => void;
  renderItem: (item: T) => React.ReactNode;
  placeholder: string;
  emptyMessage: string;
  isLoading?: boolean;
}

function SearchableList<T>({
  items,
  searchTerm,
  onSearchChange,
  renderItem,
  placeholder,
  emptyMessage,
  isLoading = false,
}: SearchableListProps<T>) {
  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400"
        />
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
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
    getCombinedAbilityBonuses,
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

  const classNeedsSubclass = hasSubclasses && canChooseSubclass;

  // Get combined bonuses for preview
  const combinedBonuses = getCombinedAbilityBonuses();

  // Level controls
  const adjustLevel = (delta: number) => {
    const newLevel = Math.max(1, Math.min(20, characterData.level + delta));
    updateCharacterData({ 
      level: newLevel,
      // Reset subclass if level is too low
      selectedSubclass: (characterData.selectedClass && newLevel < getSubclassLevel(characterData.selectedClass.index)) 
        ? null 
        : characterData.selectedSubclass
    });
  };

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

      {/* Character Level */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Nível do Personagem</h2>
          <span className="text-red-400 text-sm">*</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => adjustLevel(-1)}
            disabled={characterData.level <= 1}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Minus className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <span className="text-white/70">Nível:</span>
            <span className="text-3xl font-bold text-yellow-400 min-w-[3rem] text-center">
              {characterData.level}
            </span>
          </div>
          
          <Button
            onClick={() => adjustLevel(1)}
            disabled={characterData.level >= 20}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="mt-3 text-sm text-white/60">
          {characterData.selectedClass && (
            <p>
              Poderá escolher subclasse no nível {getSubclassLevel(characterData.selectedClass.index)}
            </p>
          )}
        </div>
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
                  ?.map(bonus => `+${bonus.bonus} ${bonus.ability_score.name}`)
                  .join(", ") || ""}
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
              <Crown className="w-6 h-6 text-green-400" />
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
            onItemSelect={(bg) => {
              updateCharacterData({ selectedBackground: bg });
            }}
            renderItem={(bg: DndBackground) => (
              <SelectionCard
                title={bg.name}
                description="Background"
                details={bg.starting_proficiencies
                  ?.map(prof => prof.name)
                  .slice(0, 3)
                  .join(", ") || ""}
                selected={characterData.selectedBackground?.index === bg.index}
                onClick={() => {
                  updateCharacterData({ selectedBackground: bg });
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

      {/* Subrace Selection - Show if race has subraces */}
      {hasSubraces && characterData.selectedRace && (
        <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-green-400/30">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-bold text-white">Sub-raça</h3>
            {raceNeedsSubrace && <span className="text-red-400 text-sm">*</span>}
          </div>
          
          <p className="text-white/80 mb-4">
            Escolha uma sub-raça para <strong>{characterData.selectedRace.name}</strong>:
          </p>
          
          {isLoadingSubraces ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableSubraces.map((subrace) => (
                <SelectionCard
                  key={subrace.index}
                  title={subrace.name}
                  description={subrace.desc.length > 100 ? 
                    subrace.desc.substring(0, 100) + "..." : subrace.desc}
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

      {/* Subclass Selection - Show if class has subclasses and level is sufficient */}
      {hasSubclasses && characterData.selectedClass && canChooseSubclass && (
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-400/30">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Subclasse</h3>
            <span className="text-red-400 text-sm">*</span>
          </div>
          
          <p className="text-white/80 mb-4">
            Escolha uma subclasse para <strong>{characterData.selectedClass.name}</strong> 
            (disponível no nível {getSubclassLevel(characterData.selectedClass.index)}):
          </p>
          
          {isLoadingSubclasses ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableSubclasses.map((subclass) => (
                <SelectionCard
                  key={subclass.index}
                  title={subclass.name}
                  description={subclass.subclass_flavor}
                  details={subclass.desc?.[0]?.substring(0, 100) + "..." || ""}
                  selected={characterData.selectedSubclass?.index === subclass.index}
                  onClick={() => {
                    updateCharacterData({ selectedSubclass: subclass });
                  }}
                  isRequired={true}
                />
              ))}
            </div>
          )}
          
          {!characterData.selectedSubclass && (
            <p className="text-red-400 text-sm mt-2">
              Escolha uma subclasse é obrigatória para esta classe
            </p>
          )}
        </div>
      )}

      {/* Subclass Info - Show if class will need subclass later */}
      {hasSubclasses && characterData.selectedClass && !canChooseSubclass && (
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-400/30">
          <div className="flex items-center space-x-3 mb-3">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Subclasse</h3>
          </div>
          
          <p className="text-white/80 mb-3">
            Sua classe <strong>{characterData.selectedClass.name}</strong> poderá escolher uma subclasse no nível {getSubclassLevel(characterData.selectedClass.index)}. 
            Atualmente você está no nível {characterData.level}.
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
                  {characterData.selectedSubclass && (
                    <span> ({characterData.selectedSubclass.name})</span>
                  )}
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
               (!raceNeedsSubrace || characterData.selectedSubrace) && 
               (!classNeedsSubclass || characterData.selectedSubclass) ? (
                <div className="flex items-center text-green-400">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">Completo</span>
                </div>
              ) : (
                <div className="flex items-center text-yellow-400">
                  <User className="w-4 h-4 mr-1" />
                  <span className="text-sm">Pendente</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}