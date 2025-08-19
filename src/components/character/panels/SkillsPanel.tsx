import React, { useEffect, useState } from 'react';
import { Character } from "@/types/character";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Activity,
  Book,
  Eye,
  Ghost,
  Hand,
  Lock,
  Music,
  Navigation,
  Search,
  Settings,
  Speech,
  Sword,
  User,
  Zap,
  Dice4,
  ChevronDown,
  ChevronRight,
  Brain,
  Heart,
  Dumbbell,
  Zap as Lightning,
  Eye as WisdomIcon,
  Smile
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import DiceRollModal, { DiceRollModalProps } from '@/components/DiceRollModal';
import { mockBackgrounds } from '@/data/mockBackgrounds';

interface SkillsPanelProps {
  character?: Character | null;
}

const skillAttributeMap: Record<string, keyof Character['attributes']> = {
  acrobatics: "dexterity",
  animal_handling: "wisdom",
  arcana: "intelligence",
  athletics: "strength",
  deception: "charisma",
  history: "intelligence",
  insight: "wisdom",
  intimidation: "charisma",
  investigation: "intelligence",
  medicine: "wisdom",
  nature: "intelligence",
  perception: "wisdom",
  performance: "charisma",
  persuasion: "charisma",
  religion: "intelligence",
  sleight_of_hand: "dexterity",
  stealth: "dexterity",
  survival: "wisdom"
};

const skillNames: Record<string, string> = {
  acrobatics: "Acrobacia",
  animal_handling: "Lidar com Animais",
  arcana: "Arcanismo",
  athletics: "Atletismo",
  deception: "Enganação",
  history: "História",
  insight: "Intuição",
  intimidation: "Intimidação",
  investigation: "Investigação",
  medicine: "Medicina",
  nature: "Natureza",
  perception: "Percepção",
  performance: "Atuação",
  persuasion: "Persuasão",
  religion: "Religião",
  sleight_of_hand: "Prestidigitação",
  stealth: "Furtividade",
  survival: "Sobrevivência"
};

const skillIcons: Record<string, React.ComponentType> = {
  acrobatics: Activity,
  animal_handling: User,
  arcana: Book,
  athletics: Sword,
  deception: Ghost,
  history: Book,
  insight: Eye,
  intimidation: Zap,
  investigation: Search,
  medicine: Activity,
  nature: Navigation,
  perception: Eye,
  performance: Music,
  persuasion: Speech,
  religion: Book,
  sleight_of_hand: Hand,
  stealth: Settings,
  survival: Navigation
};

const attributeNames: Record<keyof Character['attributes'], string> = {
  strength: "Força",
  dexterity: "Destreza",
  constitution: "Constituição",
  intelligence: "Inteligência",
  wisdom: "Sabedoria",
  charisma: "Carisma"
};

const attributeIcons: Record<keyof Character['attributes'], React.ComponentType> = {
  strength: Dumbbell,
  dexterity: Lightning,
  constitution: Heart,
  intelligence: Brain,
  wisdom: WisdomIcon,
  charisma: Smile
};

const attributeColors: Record<keyof Character['attributes'], string> = {
  strength: "text-red-400 bg-red-500/20",
  dexterity: "text-green-400 bg-green-500/20",
  constitution: "text-orange-400 bg-orange-500/20",
  intelligence: "text-blue-400 bg-blue-500/20",
  wisdom: "text-purple-400 bg-purple-500/20",
  charisma: "text-pink-400 bg-pink-500/20"
};

// Mapeamento das proficiências do background para nomes de skills
const backgroundSkillMap: Record<string, string> = {
  "skill-insight": "insight",
  "skill-religion": "religion",
  "skill-deception": "deception",
  "skill-stealth": "stealth",
  "skill-animal-handling": "animal_handling",
  "skill-survival": "survival",
  "skill-history": "history",
  "skill-persuasion": "persuasion",
  "skill-arcana": "arcana",
  "skill-athletics": "athletics",
  "skill-intimidation": "intimidation",
  "skill-investigation": "investigation",
  "skill-nature": "nature",
  "skill-performance": "performance",
  "skill-medicine": "medicine",
  "skill-perception": "perception",
  "skill-acrobatics": "acrobatics",
  "skill-sleight-of-hand": "sleight_of_hand"
};

const SkillsPanel: React.FC<SkillsPanelProps> = ({ character }) => {
  const [skillProficiencies, setSkillProficiencies] = useState<string[]>([]);
  const [loadingProficiencies, setLoadingProficiencies] = useState(false);
  
  const closeModal = () => setRollModal(prev => ({ ...prev, isOpen: false }));

  const [rollModal, setRollModal] = useState<DiceRollModalProps>({
    isOpen: false,
    onClose: closeModal,
    title: '',
    diceRoll: 0,
    modifier: 0,
    total: 0,
    isCritical: false,
    isCriticalFailure: false,
    attributeName: '',
    isProficient: false,
    proficiencyBonus: 0
  });

  // Extrai dados do personagem de forma segura
  const characterName = character?.basic_info?.name || "Personagem sem nome";
  const className = character?.basic_info?.character_class?.name || "Classe desconhecida";
  const raceName = character?.basic_info?.race_info?.race_name || "Raça desconhecida";
  const level = character?.basic_info?.level || 1;
  const background = character?.basic_info?.background || null;

  // Puxa proficiências do personagem e do background
  useEffect(() => {
    if (character) {
      setLoadingProficiencies(true);
      
      const proficiencies = new Set<string>();
      
      // Proficiências diretas do character.skills
      if (character.skills) {
        Object.entries(character.skills)
          .filter(([_, hasSkill]) => hasSkill)
          .forEach(([skillKey]) => proficiencies.add(skillKey));
      }
      
      // Proficiências do background
      if (background) {
        const backgroundObj = mockBackgrounds.find(bg => 
          bg.index === background || 
          bg.name === background
        );
        
        if (backgroundObj?.starting_proficiencies) {
          backgroundObj.starting_proficiencies.forEach(prof => {
            if (prof.index && backgroundSkillMap[prof.index]) {
              proficiencies.add(backgroundSkillMap[prof.index]);
            }
          });
        }
      }
      
      setSkillProficiencies(Array.from(proficiencies));
      setLoadingProficiencies(false);
    }
  }, [character, background]);

  const getModifier = (value: number): number => Math.floor((value - 10) / 2);
  const formatModifier = (modifier: number): string => modifier >= 0 ? `+${modifier}` : `${modifier}`;
  const getProficiencyBonus = (level: number): number => {
    if (level >= 17) return 6;
    if (level >= 13) return 5;
    if (level >= 9) return 4;
    if (level >= 5) return 3;
    return 2;
  };

  const rollSkill = (skill: string) => {
    if (!character?.attributes) {
      toast.error("Erro", { description: "Atributos do personagem não disponíveis" });
      return;
    }

    const attributeKey = skillAttributeMap[skill];
    const attributeValue = character.attributes[attributeKey] || 10;
    const attributeModifier = getModifier(attributeValue);
    const isProficient = skillProficiencies.includes(skill);
    const proficiencyBonus = getProficiencyBonus(level);
    const diceRoll = Math.floor(Math.random() * 20) + 1;
    const total = diceRoll + attributeModifier + (isProficient ? proficiencyBonus : 0);
    const isCritical = diceRoll === 20;
    const isCriticalFailure = diceRoll === 1;

    setRollModal({
      isOpen: true,
      onClose: closeModal,
      title: "Teste de Perícia",
      diceRoll,
      modifier: attributeModifier,
      total,
      isCritical,
      isCriticalFailure,
      attributeName: skillNames[skill] || skill,
      isProficient,
      proficiencyBonus: isProficient ? proficiencyBonus : 0
    });
  };

  if (!character) return (
    <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
      <User className="w-16 h-16 text-gray-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">Nenhum Personagem Encontrado</h3>
      <p className="text-gray-400 mb-6">Você ainda não criou um personagem nesta campanha</p>
    </div>
  );

  if (!character.attributes) return (
    <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
      <Activity className="w-16 h-16 text-gray-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">Perícias Indisponíveis</h3>
      <p className="text-gray-400">Os atributos do personagem não foram carregados corretamente</p>
    </div>
  );

  const proficiencyBonus = getProficiencyBonus(level);

  // Agrupar perícias por atributo
  const skillsByAttribute = Object.entries(skillAttributeMap).reduce((acc, [skill, attribute]) => {
    if (!acc[attribute]) {
      acc[attribute] = [];
    }
    acc[attribute].push(skill);
    return acc;
  }, {} as Record<keyof Character['attributes'], string[]>);

  return (
    <div className="space-y-6">
      <DiceRollModal {...rollModal} />
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Perícias de {characterName}
          </h2>
          <p className="text-gray-400 flex items-center gap-2">
            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
              {className}
            </span>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
              Nível {level}
            </span>
            <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
              {raceName}
            </span>
            {background && (
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">
                {background}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Perícias agrupadas por atributo */}
      <div className="space-y-4">
        {Object.entries(skillsByAttribute).map(([attributeKey, skills]) => {
          const attribute = attributeKey as keyof Character['attributes'];
          const AttributeIcon = attributeIcons[attribute];
          const attributeValue = character.attributes[attribute] || 10;
          const attributeModifier = getModifier(attributeValue);
          const colorClasses = attributeColors[attribute];

          return (
            <Collapsible key={attributeKey} defaultOpen={true} className="bg-gray-800/50 rounded-xl border border-gray-700/50">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-gray-700/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${colorClasses}`}>
                    <AttributeIcon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-white">
                      {attributeNames[attribute]}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Valor: {attributeValue} ({formatModifier(attributeModifier)}) • {skills.length} perícias
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {loadingProficiencies && (
                    <span className="text-xs text-gray-400">Carregando...</span>
                  )}
                  <ChevronDown className="w-5 h-5 text-gray-400 transform transition-transform group-data-[state=closed]:rotate-[-90deg]" />
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent className="px-4 pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {skills.map((skillKey) => {
                    const isProficient = skillProficiencies.includes(skillKey);
                    const skillBonus = attributeModifier + (isProficient ? proficiencyBonus : 0);
                    const SkillIcon = skillIcons[skillKey] || Activity;

                    return (
                      <Card key={skillKey} className="text-left bg-gray-800/30 border border-gray-600/50 hover:border-blue-500/50 transition-colors group">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-md ${colorClasses.replace('bg-', 'bg-').replace('/20', '/30')}`}>
                              <SkillIcon className="w-3.5 h-3.5" />
                            </div>
                            <CardTitle className="text-sm font-medium text-white">
                              {skillNames[skillKey]}
                            </CardTitle>
                            {isProficient && (
                              <span className="text-yellow-400 text-xs">★</span>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex justify-between items-center">
                            <div className="text-xs text-gray-400">
                              {formatModifier(attributeModifier)}
                              {isProficient && ` + ${proficiencyBonus}`}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">
                                {formatModifier(skillBonus)}
                              </span>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-xs p-1 h-6 w-6" 
                                onClick={() => rollSkill(skillKey)}
                              >
                                <Dice4 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      {/* Resumo das proficiências */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-yellow-400" /> 
          Proficiências em Perícias
          <span className="text-sm text-gray-400">({skillProficiencies.length} total)</span>
        </h3>
        {skillProficiencies.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skillProficiencies.map((proficiency, idx) => (
              <span key={idx} className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm border border-yellow-500/30">
                {skillNames[proficiency] || proficiency}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">Nenhuma proficiência em perícia encontrada para este personagem</p>
        )}
      </div>
    </div>
  );
};

export default SkillsPanel;