// components/encounter/CharacterCard.tsx
import { Character } from '@/types/character';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Shield, Plus, Minus } from 'lucide-react';
import { useState } from 'react';

interface CharacterCardProps {
  character: Character;
  initiative?: number;
  onInitiativeChange?: (characterId: string, initiative: number) => void;
  onHeal?: ( amount: number) => void;
  onDamage?: ( amount: number) => void;
  isGM?: boolean;
  currentHP: number;
  maxHP: number;
}

export default function CharacterCard({ 
  character, 
  initiative, 
  onInitiativeChange, 
  onHeal,
  onDamage,
  isGM,
  currentHP,
  maxHP
}: CharacterCardProps) {
  const [healAmount, setHealAmount] = useState(5);
  const [damageAmount, setDamageAmount] = useState(5);
  
  const displayHP = Math.max(0, currentHP);
  const hpPercentage = Math.max(0, (displayHP / maxHP) * 100);
  
  const handleInitiativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && onInitiativeChange) {
      onInitiativeChange(character.id, value);
    }
  };

  const handleHealClick = (amount: number) => {
    if (onHeal) {
      onHeal(amount);
      console.log(amount)
    }
  };

  const handleDamageClick = (amount: number) => {
    if (onDamage) {
      onDamage(amount);
      console.log(amount)
    }
  };

  const getHPColor = () => {
    if (hpPercentage > 50) return 'bg-green-500';
    if (hpPercentage > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleHealAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setHealAmount(isNaN(value) ? 0 : value);
   
  };

  const handleDamageAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setDamageAmount(isNaN(value) ? 0 : value);
    
  };

  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-gray-500 transition-colors">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-semibold text-white">{character.basic_info.name}</h4>
            <p className="text-sm text-gray-400">
              {character.basic_info.race_info.race_name} {character.basic_info.character_class.name}
            </p>
          </div>
          <div className="flex items-center">
            <span className="text-xs text-gray-400 mr-2">Iniciativa:</span>
            {isGM ? (
              <Input
                type="number"
                value={initiative || ''}
                onChange={handleInitiativeChange}
                className="w-12 bg-gray-700 text-white text-center rounded py-1 px-1 border border-gray-600 h-8"
                min="1"
                max="30"
              />
            ) : (
              <Badge variant="secondary" className="bg-purple-600 text-white">
                {initiative || '?'}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="flex items-center">
            <Heart className="w-4 h-4 text-red-400 mr-1" />
            <div>
              <div className="text-xs text-gray-400">PV</div>
              <div className="text-white text-sm font-medium">
                {displayHP}/{maxHP}
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <Shield className="w-4 h-4 text-blue-400 mr-1" />
            <div>
              <div className="text-xs text-gray-400">CA</div>
              <div className="text-white text-sm font-medium">
                {character.stats.armor_class}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-400">Pontos de Vida</span>
            <span className="text-xs text-gray-400">{Math.round(hpPercentage)}%</span>
          </div>
          <Progress value={hpPercentage} className={getHPColor()} />
          <div className="text-xs text-gray-400 mt-1 text-center">
            Nvl {character.basic_info.level}
          </div>
        </div>

        {isGM && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Controlador de Vida</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <div className="flex items-center">
                  <Input
                    type="number"
                    value={healAmount}
                    onChange={handleHealAmountChange}
                    className="w-12 h-7 text-center text-xs bg-gray-700 border-gray-600 text-white"
                    min="1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 ml-1 bg-green-600 hover:bg-green-700 border-green-700 text-white"
                    onClick={() => handleHealClick(healAmount)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-xs text-gray-400 text-center">Curar</div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center">
                  <Input
                    type="number"
                    value={damageAmount}
                    onChange={handleDamageAmountChange}
                    className="w-12 h-7 text-center text-xs bg-gray-700 border-gray-600 text-white"
                    min="1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 ml-1 bg-red-600 hover:bg-red-700 border-red-700 text-white"
                    onClick={() => handleDamageClick(damageAmount)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-xs text-gray-400 text-center">Dano</div>
              </div>
            </div>
            
            <div className="flex justify-between space-x-1 mt-2">
              {[1, 5, 10].map((amount) => (
                <Button
                  key={`heal-${amount}`}
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs bg-green-600/20 hover:bg-green-600/40 border-green-700 text-green-300 flex-1"
                  onClick={() => handleHealClick(amount)}
                >
                  +{amount}
                </Button>
              ))}
              {[1, 5, 10].map((amount) => (
                <Button
                  key={`damage-${amount}`}
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs bg-red-600/20 hover:bg-red-600/40 border-red-700 text-red-300 flex-1"
                  onClick={() => handleDamageClick(amount)}
                >
                  -{amount}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}