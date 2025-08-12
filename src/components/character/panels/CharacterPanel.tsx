import { useEffect } from "react";
import { Character } from "@/api/characterAPI";
import { 
  Heart, 
  Shield, 
  Sparkles, 
  User,
  Activity,
  Zap,
  Star,
  ShieldCheck,
  PlusCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from 'next/link';

interface CharacterPanelProps {
  character?: Character | null;
  campaignId: string; 
}

const attributeApiMap: Record<keyof Character['attributes'], string> = {
  strength: "str",
  dexterity: "dex",
  constitution: "con",
  intelligence: "int",
  wisdom: "wis",
  charisma: "cha"
};

const CharacterPanel: React.FC<CharacterPanelProps> = ({ character, campaignId }) => {
  const attributeNames: Record<keyof Character['attributes'], string> = {
    strength: "Força",
    dexterity: "Destreza",
    constitution: "Constituição",
    intelligence: "Inteligência",
    wisdom: "Sabedoria",
    charisma: "Carisma"
  };
  useEffect(() => {
    console.log("CharacterPanel: campaignId recebido =", campaignId);
    console.log("CharacterPanel: character =", character);
  }, [campaignId, character]);

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

  const quickStats = [
    {
      label: "Pontos de Vida",
      value: character?.stats?.hit_points || 0,
      icon: Heart,
      color: "text-red-400"
    },
    {
      label: "Classe de Armadura",
      value: character?.stats?.armor_class || 0,
      icon: Shield,
      color: "text-blue-400"
    },
    {
      label: "Nível",
      value: character?.basic_info?.level || 1,
      icon: Sparkles,
      color: "text-purple-400"
    },
    {
      label: "Bônus de Proficiência",
      value: `+${getProficiencyBonus(character?.basic_info?.level || 1)}`,
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
        <Link href={`/campaign/${campaignId}/create-character`}>
          <Button className="gap-2">
            <PlusCircle className="w-5 h-5" />
            Criar Novo Personagem
          </Button>
        </Link>
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {character.basic_info?.name || "Personagem sem nome"}
          </h2>
          <p className="text-gray-400 flex items-center gap-2">
            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
              {character.basic_info?.character_class || "Classe desconhecida"}
            </span>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
              Nível {character.basic_info?.level || 1}
            </span>
            <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
              {character.basic_info?.race_info?.race_name || "Raça desconhecida"}
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
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Atributos Primários
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {(Object.entries(character.attributes) as [keyof Character['attributes'], number][])
            .map(([key, value]) => {
              const modifier = getModifier(value);
              
              return (
                <Card 
                  key={key} 
                  className="text-center bg-gray-800/30 border border-gray-700/50 hover:border-purple-500/50 transition-colors"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">
                      {attributeNames[key]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center">
                      <div className="text-3xl font-bold text-white mb-1">
                        {value}
                      </div>
                      <div className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                        {formatModifier(modifier)}
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
            <p className="text-white">{character.player_name || "N/A"}</p>
          </div>
          
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Antecedente</h4>
            <p className="text-white">{character.basic_info?.background || "N/A"}</p>
          </div>
          
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Alinhamento</h4>
            <p className="text-white">{character.basic_info?.alignment || "N/A"}</p>
          </div>
          
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Experiência</h4>
            <p className="text-white">{character.stats?.experience_points || 0} XP</p>
          </div>
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

export default CharacterPanel;