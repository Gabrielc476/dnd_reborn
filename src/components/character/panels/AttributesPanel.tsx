import React, { useEffect, useState } from 'react';
import { Character } from "@/types/character";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  Heart, 
  Shield, 
  Sparkles, 
  User,
  Activity,
  Zap,
  Star,
  Dice4,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import DiceRollModal, { DiceRollModalProps } from '@/components/DiceRollModal';

interface AttributesPanelProps {
  character?: Character | null;
}

const attributeApiMap: Record<keyof Character['attributes'], string> = {
  strength: "str",
  dexterity: "dex",
  constitution: "con",
  intelligence: "int",
  wisdom: "wis",
  charisma: "cha"
};

const AttributesPanel: React.FC<AttributesPanelProps> = ({ character }) => {
  const [savingThrowProficiencies, setSavingThrowProficiencies] = useState<string[]>([]);
  const [loadingProficiencies, setLoadingProficiencies] = useState(false);
  const [rollModal, setRollModal] = useState<DiceRollModalProps>({
    isOpen: false,
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

  useEffect(() => {
    if (character) {
      console.log("Personagem recebido no AttributesPanel:", character);
    } else {
      console.log("Nenhum personagem recebido no AttributesPanel");
    }
  }, [character]);

  useEffect(() => {
    const fetchSavingThrowProficiencies = async () => {
      // Verifica se temos a classe do personagem
      if (!character?.basic_info?.character_class?.index) return;
      
      setLoadingProficiencies(true);
      try {
        const classIndex = character.basic_info.character_class.index;
        const response = await fetch(`https://www.dnd5eapi.co/api/classes/${classIndex}`);
        const data = await response.json();
        
        // Extrai os testes de resistência que a classe é proficiente
        const savingThrows = data.proficiencies
          .filter((p: any) => p.type === 'Saving Throws')
          .map((p: any) => p.name.split(': ')[1].toLowerCase());
        
        setSavingThrowProficiencies(savingThrows);
      } catch (error) {
        console.error("Erro ao buscar proficiências:", error);
        toast.error("Erro de Carregamento", {
          description: "Não foi possível carregar as proficiências da classe"
        });
      } finally {
        setLoadingProficiencies(false);
      }
    };

    fetchSavingThrowProficiencies();
  }, [character?.basic_info?.character_class?.index]);

  const attributeNames: Record<keyof Character['attributes'], string> = {
    strength: "Força",
    dexterity: "Destreza",
    constitution: "Constituição",
    intelligence: "Inteligência",
    wisdom: "Sabedoria",
    charisma: "Carisma"
  };

  const getModifier = (value: number): number => {
    return Math.floor((value - 10) / 2);
  };

  const formatModifier = (modifier: number): string => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  const getProficiencyBonus = (level: number): number => {
    if (level >= 17) return 6;
    if (level >= 13) return 5;
    if (level >= 9) return 4;
    if (level >= 5) return 3;
    return 2;
  };

  const rollDice = (attribute: keyof Character['attributes'], isSavingThrow = false) => {
    if (!character || !character.attributes) {
      toast.error("Erro", {
        description: "Atributos do personagem não disponíveis"
      });
      return;
    }

    const attributeValue = character.attributes[attribute];
    const modifier = getModifier(attributeValue);
    const diceRoll = Math.floor(Math.random() * 20) + 1;
    const total = diceRoll + modifier;
    
    const isProficient = savingThrowProficiencies.includes(attributeApiMap[attribute]);
    const proficiencyBonus = getProficiencyBonus(character.basic_info?.level || 1);
    
    const savingTotal = isSavingThrow && isProficient
      ? total + proficiencyBonus
      : total;
    
    const isCritical = diceRoll === 20;
    const isCriticalFailure = diceRoll === 1;
    
    setRollModal({
      isOpen: true,
      title: isSavingThrow ? "Teste de Resistência" : "Teste de Habilidade",
      diceRoll,
      modifier,
      total: isSavingThrow ? savingTotal : total,
      isCritical,
      isCriticalFailure,
      attributeName: attributeNames[attribute],
      isProficient: isSavingThrow ? isProficient : false,
      proficiencyBonus
    });
  };

  // Extrai os dados do personagem de forma segura
  const characterName = character?.basic_info?.name || "Personagem sem nome";
  const className = character?.basic_info?.character_class?.name || "Classe desconhecida";
  const raceName = character?.basic_info?.race_info?.race_name || "Raça desconhecida";
  const level = character?.basic_info?.level || 1;
  const background = character?.basic_info?.background || "N/A";
  const alignment = character?.basic_info?.alignment || "N/A";
  const experiencePoints = character?.stats?.experience_points || 0;
  const playerName = character?.player_name || "N/A";
  const hitPoints = character?.stats?.hit_points || 0;
  const armorClass = character?.stats?.armor_class || 0;

  const quickStats = [
    {
      label: "Pontos de Vida",
      value: hitPoints,
      icon: Heart,
      color: "text-red-400"
    },
    {
      label: "Classe de Armadura",
      value: armorClass,
      icon: Shield,
      color: "text-blue-400"
    },
    {
      label: "Nível",
      value: level,
      icon: Sparkles,
      color: "text-purple-400"
    },
    {
      label: "Bônus de Proficiência",
      value: `+${getProficiencyBonus(level)}`,
      icon: ShieldCheck,
      color: "text-green-400"
    }
  ];

  if (!character) {
    return (
      <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
        <User className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Nenhum Personagem Encontrado</h3>
        <p className="text-gray-400 mb-6">
          Você ainda não criou um personagem nesta campanha
        </p>
      </div>
    );
  }

  if (!character.attributes) {
    return (
      <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
        <Activity className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Atributos Indisponíveis</h3>
        <p className="text-gray-400">
          Os atributos do personagem não foram carregados corretamente
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DiceRollModal
        isOpen={rollModal.isOpen}
        onClose={() => setRollModal({ ...rollModal, isOpen: false })}
        title={rollModal.title}
        diceRoll={rollModal.diceRoll}
        modifier={rollModal.modifier}
        total={rollModal.total}
        isCritical={rollModal.isCritical}
        isCriticalFailure={rollModal.isCriticalFailure}
        attributeName={rollModal.attributeName}
        isProficient={rollModal.isProficient}
        proficiencyBonus={rollModal.proficiencyBonus}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Atributos de {characterName}
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
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <div 
            key={index}
            className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 hover:bg-gray-800/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 ${stat.color} bg-opacity-20 rounded-lg`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-xl font-bold text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Atributos Primários
          </h3>
          
          {loadingProficiencies && (
            <span className="text-sm text-gray-400">Carregando proficiências...</span>
          )}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {(Object.entries(character.attributes) as [keyof Character['attributes'], number][])
            .map(([key, value]) => {
              const modifier = getModifier(value);
              const isProficient = savingThrowProficiencies.includes(attributeApiMap[key]);
              
              return (
                <Card 
                  key={key} 
                  className="text-center bg-gray-800/30 border border-gray-700/50 hover:border-purple-500/50 transition-colors group relative"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300 flex items-center justify-center">
                      {attributeNames[key]}
                      {isProficient && (
                        <span className="ml-1 text-xs text-yellow-400">
                          ★
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center">
                      <div className="text-3xl font-bold text-white mb-1">
                        {value}
                      </div>
                      <div className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm mb-3">
                        {formatModifier(modifier)}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-xs gap-1 shadow-md"
                          onClick={() => rollDice(key)}
                        >
                          <Dice4 className="w-3 h-3" /> Teste
                        </Button>
                        <Button 
                          size="sm" 
                          variant={isProficient ? "default" : "secondary"}
                          className="text-xs gap-1 shadow-md"
                          onClick={() => rollDice(key, true)}
                        >
                          <ShieldCheck className="w-3 h-3" /> Resist
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          }
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-purple-400" />
          Detalhes do Personagem
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Jogador</h4>
            <p className="text-white">{playerName}</p>
          </div>
          
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Antecedente</h4>
            <p className="text-white">{background}</p>
          </div>
          
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Alinhamento</h4>
            <p className="text-white">{alignment}</p>
          </div>
          
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Experiência</h4>
            <p className="text-white">{experiencePoints} XP</p>
          </div>
        </div>
      </div>
      
      {savingThrowProficiencies.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-400" />
            Proficiências em Testes de Resistência
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {savingThrowProficiencies.map((proficiency, index) => {
              const attributeKey = Object.entries(attributeApiMap)
                .find(([_, apiName]) => apiName === proficiency)?.[0] as keyof Character['attributes'];
              
              return (
                <div 
                  key={index} 
                  className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm flex items-center"
                >
                  {attributeKey ? attributeNames[attributeKey] : proficiency}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 text-xs">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">Informações Técnicas</span>
          <span className="text-purple-400">ID: {character.id?.slice(-8) || "N/A"}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-gray-500">
          <div>Player ID: {character.user_id?.slice(-8) || "N/A"}</div>
          <div>Campaign ID: {character.campaign_id?.slice(-8) || "N/A"}</div>
        </div>
      </div>
    </div>
  );
};

export default AttributesPanel;