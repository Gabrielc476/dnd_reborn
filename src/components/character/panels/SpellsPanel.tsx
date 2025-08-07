import React, { useEffect, useState } from 'react';
import { Character } from "@/api/characterAPI";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  Sparkles, 
  Shield, 
  Zap, 
  User,
  Activity,
  Star,
  Wand2,
  Book,
  Target,
  Clock,
  Flame,
  Eye,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import DiceRollModal, { DiceRollModalProps } from '@/components/DiceRollModal';

interface SpellsPanelProps {
  character?: Character | null;
}

interface SpellCastState {
  isOpen: boolean;
  title: string;
  diceRoll: number;
  modifier: number;
  total: number;
  isCritical: boolean;
  isCriticalFailure: boolean;
  attributeName: string;
  isProficient: boolean;
  proficiencyBonus: number;
  isSpell: boolean;
  spellName: string;
  spellLevel: number;
  damage: string;
  spellAttackBonus: number;
  spellSaveDC: number;
}

interface Spell {
  index: string;
  name: string;
  level: number;
  school: {
    name: string;
    index: string;
  };
  casting_time: string;
  range: string;
  components: string[];
  duration: string;
  concentration: boolean;
  ritual: boolean;
  damage?: {
    damage_type: {
      name: string;
    };
    damage_at_slot_level?: Record<string, string>;
  };
  dc?: {
    dc_type: {
      name: string;
    };
    dc_success: string;
  };
  desc: string[];
  higher_level?: string[];
}

interface SpellSlots {
  [key: number]: {
    total: number;
    used: number;
  };
}

const spellcastingClasses = [
  'bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard'
];

const SpellsPanel: React.FC<SpellsPanelProps> = ({ character }) => {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [spellSlots, setSpellSlots] = useState<SpellSlots>({});
  const [loadingSpells, setLoadingSpells] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [castModal, setCastModal] = useState<SpellCastState>({
    isOpen: false,
    title: '',
    diceRoll: 0,
    modifier: 0,
    total: 0,
    isCritical: false,
    isCriticalFailure: false,
    attributeName: '',
    isProficient: false,
    proficiencyBonus: 0,
    isSpell: false,
    spellName: '',
    spellLevel: 0,
    damage: '',
    spellAttackBonus: 0,
    spellSaveDC: 0
  });

  useEffect(() => {
    if (character) {
      console.log("Personagem recebido no SpellsPanel:", character);
    } else {
      console.log("Nenhum personagem recebido no SpellsPanel");
    }
  }, [character]);

  useEffect(() => {
    const fetchSpells = async () => {
      if (!character?.basic_info?.character_class) return;
      
      const className = character.basic_info.character_class.toLowerCase().replace(/\s+/g, '-');
      
      if (!spellcastingClasses.includes(className)) {
        console.log("Classe não conjuradora:", className);
        return;
      }
      
      setLoadingSpells(true);
      try {
        const response = await fetch(`https://www.dnd5eapi.co/api/classes/${className}/spells`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const spellPromises = data.results.slice(0, 20).map(async (spell: any) => {
            const spellResponse = await fetch(`https://www.dnd5eapi.co${spell.url}`);
            return await spellResponse.json();
          });
          
          const spellsData = await Promise.all(spellPromises);
          setSpells(spellsData);
          
          // Initialize spell slots based on class and level
          initializeSpellSlots(className, character.basic_info?.level || 1);
        }
      } catch (error) {
        console.error("Erro ao buscar magias:", error);
        toast.error("Erro de Carregamento", {
          description: "Não foi possível carregar as magias da classe"
        });
      } finally {
        setLoadingSpells(false);
      }
    };

    fetchSpells();
  }, [character?.basic_info?.character_class, character?.basic_info?.level]);

  const initializeSpellSlots = (className: string, level: number) => {
    const slots: SpellSlots = {};
    
    // Simplified spell slot progression - you can expand this with proper D&D rules
    if (level >= 1) {
      slots[1] = { total: level >= 1 ? 2 : 0, used: 0 };
    }
    if (level >= 3) {
      slots[2] = { total: level >= 3 ? 1 : 0, used: 0 };
    }
    if (level >= 5) {
      slots[3] = { total: level >= 5 ? 1 : 0, used: 0 };
    }
    if (level >= 7) {
      slots[4] = { total: level >= 7 ? 1 : 0, used: 0 };
    }
    if (level >= 9) {
      slots[5] = { total: level >= 9 ? 1 : 0, used: 0 };
    }
    
    setSpellSlots(slots);
  };

  const getSpellcastingModifier = (): number => {
    if (!character?.attributes) return 0;
    
    const className = character.basic_info?.character_class?.toLowerCase();
    let primaryAttribute = 'intelligence';
    
    switch (className) {
      case 'bard':
      case 'paladin':
      case 'sorcerer':
      case 'warlock':
        primaryAttribute = 'charisma';
        break;
      case 'cleric':
      case 'druid':
      case 'ranger':
        primaryAttribute = 'wisdom';
        break;
      default:
        primaryAttribute = 'intelligence';
    }
    
    const attributeValue = character.attributes[primaryAttribute as keyof typeof character.attributes];
    return Math.floor((attributeValue - 10) / 2);
  };

  const getProficiencyBonus = (level: number): number => {
    if (level >= 17) return 6;
    if (level >= 13) return 5;
    if (level >= 9) return 4;
    if (level >= 5) return 3;
    return 2;
  };

  const getSpellAttackBonus = (): number => {
    const modifier = getSpellcastingModifier();
    const proficiency = getProficiencyBonus(character?.basic_info?.level || 1);
    return modifier + proficiency;
  };

  const getSpellSaveDC = (): number => {
    return 8 + getSpellAttackBonus();
  };

  const castSpell = (spell: Spell, slotLevel: number = spell.level) => {
    if (!character) {
      toast.error("Erro", {
        description: "Personagem não disponível"
      });
      return;
    }

    if (spell.level > 0 && spellSlots[slotLevel] && spellSlots[slotLevel].used >= spellSlots[slotLevel].total) {
      toast.error("Sem Espaços de Magia", {
        description: `Você não tem espaços de magia de nível ${slotLevel} disponíveis`
      });
      return;
    }

    let damage = '';
    if (spell.damage?.damage_at_slot_level) {
      damage = spell.damage.damage_at_slot_level[slotLevel.toString()] || 
               spell.damage.damage_at_slot_level['1'] || '';
    }

    // Simular rolagem de d20 para ataque de magia
    const diceRoll = Math.floor(Math.random() * 20) + 1;
    const spellcastingModifier = getSpellcastingModifier();
    const spellAttackBonus = getSpellAttackBonus();
    const spellSaveDC = getSpellSaveDC();
    const total = diceRoll + spellAttackBonus;

    const isCritical = diceRoll === 20;
    const isCriticalFailure = diceRoll === 1;

    setCastModal({
      isOpen: true,
      title: "Conjuração de Magia",
      diceRoll,
      modifier: spellAttackBonus,
      total,
      isCritical,
      isCriticalFailure,
      attributeName: spell.name,
      isProficient: true,
      proficiencyBonus: getProficiencyBonus(character?.basic_info?.level || 1),
      isSpell: true,
      spellName: spell.name,
      spellLevel: spell.level,
      damage,
      spellAttackBonus,
      spellSaveDC
    });

    // Use spell slot if not a cantrip
    if (spell.level > 0) {
      setSpellSlots(prev => ({
        ...prev,
        [slotLevel]: {
          ...prev[slotLevel],
          used: prev[slotLevel].used + 1
        }
      }));
    }
  };

  const filteredSpells = spells.filter(spell => {
    const matchesSearch = spell.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === null || spell.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const spellLevels = [...new Set(spells.map(spell => spell.level))].sort();

  const quickStats = [
    {
      label: "CD de Resistência",
      value: getSpellSaveDC(),
      icon: Shield,
      color: "text-blue-400"
    },
    {
      label: "Bônus de Ataque",
      value: `+${getSpellAttackBonus()}`,
      icon: Target,
      color: "text-red-400"
    },
    {
      label: "Mod. Conjuração",
      value: getSpellcastingModifier() >= 0 ? `+${getSpellcastingModifier()}` : `${getSpellcastingModifier()}`,
      icon: Star,
      color: "text-purple-400"
    },
    {
      label: "Magias Conhecidas",
      value: spells.length,
      icon: Book,
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

  const className = character.basic_info?.character_class?.toLowerCase().replace(/\s+/g, '-');
  if (!spellcastingClasses.includes(className || '')) {
    return (
      <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
        <Wand2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Classe Não Conjuradora</h3>
        <p className="text-gray-400">
          A classe {character.basic_info?.character_class} não possui habilidades de conjuração
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DiceRollModal
        {...castModal}
        onClose={() => setCastModal({ ...castModal, isOpen: false })}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Magias de {character.basic_info?.name || "Personagem sem nome"}
          </h2>
          <p className="text-gray-400 flex items-center gap-2">
            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
              {character.basic_info?.character_class || "Classe desconhecida"}
            </span>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
              Nível {character.basic_info?.level || 1}
            </span>
            <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
              Conjurador
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

      {Object.keys(spellSlots).length > 0 && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Espaços de Magia
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {Object.entries(spellSlots).map(([level, slots]) => (
              <div 
                key={level}
                className="bg-gray-800/30 rounded-lg p-4 text-center"
              >
                <div className="text-sm text-gray-400 mb-1">Nível {level}</div>
                <div className="text-lg font-bold text-white">
                  {slots.total - slots.used}/{slots.total}
                </div>
                <div className="flex justify-center gap-1 mt-2">
                  {Array.from({ length: slots.total }, (_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full border-2 ${
                        i < slots.used 
                          ? 'bg-gray-600 border-gray-600' 
                          : 'bg-purple-500 border-purple-500'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Book className="w-5 h-5 text-blue-400" />
            Lista de Magias
          </h3>
          
          {loadingSpells && (
            <span className="text-sm text-gray-400">Carregando magias...</span>
          )}
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar magias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700/50 text-white"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={selectedLevel === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLevel(null)}
            >
              Todos
            </Button>
            {spellLevels.map((level) => (
              <Button
                key={level}
                variant={selectedLevel === level ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLevel(level)}
              >
                {level === 0 ? 'Truques' : `Nível ${level}`}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="grid gap-4">
          {filteredSpells.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {loadingSpells ? (
                <>
                  <Activity className="w-8 h-8 mx-auto mb-2 animate-spin" />
                  <p>Carregando magias...</p>
                </>
              ) : (
                <>
                  <Eye className="w-8 h-8 mx-auto mb-2" />
                  <p>Nenhuma magia encontrada</p>
                </>
              )}
            </div>
          ) : (
            filteredSpells.map((spell) => (
              <Card 
                key={spell.index} 
                className="bg-gray-800/30 border border-gray-700/50 hover:border-purple-500/50 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        {spell.name}
                        {spell.concentration && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                            Concentração
                          </span>
                        )}
                        {spell.ritual && (
                          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                            Ritual
                          </span>
                        )}
                      </CardTitle>
                      <p className="text-sm text-gray-400">
                        {spell.level === 0 ? 'Truque' : `Nível ${spell.level}`} • {spell.school.name}
                      </p>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => castSpell(spell)}
                      className="gap-2"
                      disabled={spell.level > 0 && spellSlots[spell.level] && 
                                spellSlots[spell.level].used >= spellSlots[spell.level].total}
                    >
                      <Wand2 className="w-4 h-4" />
                      Conjurar
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-400">Tempo:</span>
                      <p className="text-white">{spell.casting_time}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Alcance:</span>
                      <p className="text-white">{spell.range}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Componentes:</span>
                      <p className="text-white">{spell.components.join(', ')}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Duração:</span>
                      <p className="text-white">{spell.duration}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-300">
                    <p className="line-clamp-2">{spell.desc[0]}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      
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

export default SpellsPanel;