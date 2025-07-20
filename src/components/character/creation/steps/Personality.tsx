// ===========================
// PERSONALITY STEP - TRAÇOS DE PERSONALIDADE DO PERSONAGEM
// src/components/character/creation/steps/PersonalityStep.tsx
// ===========================
'use client';

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Plus, Trash2, Heart, Target, Users, Zap, User, BookOpen, AlertCircle } from "lucide-react";

interface PersonalityStepProps {
  onValidationChange?: (isValid: boolean) => void;
}

// ===========================
// STORAGE KEYS
// ===========================
const STORAGE_KEYS = {
  CHARACTER_NAME: 'character_creation_name',
  PERSONALITY_TRAITS: 'character_creation_personality_traits',
  IDEALS: 'character_creation_ideals',
  BONDS: 'character_creation_bonds',
  FLAWS: 'character_creation_flaws',
  BACKSTORY: 'character_creation_backstory',
  NOTES: 'character_creation_notes'
};

// ===========================
// UTILITY FUNCTIONS
// ===========================
const saveToStorage = (key: string, data: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar:', error);
  }
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Erro ao carregar:', error);
    return defaultValue;
  }
};

// ===========================
// EXAMPLES FOR INSPIRATION
// ===========================
const PERSONALITY_EXAMPLES = {
  traits: [
    "Sempre falo em terceira pessoa",
    "Não consigo resistir a um bom mistério",
    "Tenho o hábito de tocar objetos brilhantes",
    "Faço piadas mesmo em situações sérias",
    "Mantenho um diário de minhas aventuras"
  ],
  ideals: [
    "Justiça: A lei deve ser respeitada por todos",
    "Liberdade: Todos merecem viver livres", 
    "Conhecimento: O saber é o maior tesouro",
    "Honra: Minha palavra é meu vínculo",
    "Família: Protejo aqueles que amo"
  ],
  bonds: [
    "Devo minha vida ao mentor que me treinou",
    "Minha vila natal foi destruída",
    "Carrego uma relíquia familiar sagrada",
    "Protejo um segredo importante",
    "Tenho uma dívida com alguém"
  ],
  flaws: [
    "Não resisto a apostar",
    "Tenho medo irracional de altura",
    "Confio demais em estranhos",
    "Guardo rancor por muito tempo",
    "Fico nervoso em multidões"
  ]
};

export const PersonalityStep = ({ onValidationChange }: PersonalityStepProps) => {
  // ===========================
  // STATES COM STORAGE
  // ===========================
  const [characterName, setCharacterName] = useState<string>(() => 
    loadFromStorage<string>(STORAGE_KEYS.CHARACTER_NAME, '')
  );
  
  const [personalityTraits, setPersonalityTraits] = useState<string[]>(() => 
    loadFromStorage<string[]>(STORAGE_KEYS.PERSONALITY_TRAITS, [])
  );
  
  const [ideals, setIdeals] = useState<string[]>(() => 
    loadFromStorage<string[]>(STORAGE_KEYS.IDEALS, [])
  );
  
  const [bonds, setBonds] = useState<string[]>(() => 
    loadFromStorage<string[]>(STORAGE_KEYS.BONDS, [])
  );
  
  const [flaws, setFlaws] = useState<string[]>(() => 
    loadFromStorage<string[]>(STORAGE_KEYS.FLAWS, [])
  );
  
  const [backstory, setBackstory] = useState<string>(() => 
    loadFromStorage<string>(STORAGE_KEYS.BACKSTORY, '')
  );
  
  const [notes, setNotes] = useState<string>(() => 
    loadFromStorage<string>(STORAGE_KEYS.NOTES, '')
  );

  const [isHydrated, setIsHydrated] = useState(false);

  // ===========================
  // HYDRATION EFFECT
  // ===========================
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // ===========================
  // STORAGE EFFECTS
  // ===========================
  useEffect(() => {
    if (isHydrated) {
      saveToStorage(STORAGE_KEYS.CHARACTER_NAME, characterName);
    }
  }, [characterName, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      saveToStorage(STORAGE_KEYS.PERSONALITY_TRAITS, personalityTraits);
    }
  }, [personalityTraits, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      saveToStorage(STORAGE_KEYS.IDEALS, ideals);
    }
  }, [ideals, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      saveToStorage(STORAGE_KEYS.BONDS, bonds);
    }
  }, [bonds, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      saveToStorage(STORAGE_KEYS.FLAWS, flaws);
    }
  }, [flaws, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      saveToStorage(STORAGE_KEYS.BACKSTORY, backstory);
    }
  }, [backstory, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      saveToStorage(STORAGE_KEYS.NOTES, notes);
    }
  }, [notes, isHydrated]);

  // ===========================
  // VALIDATION
  // ===========================
  const validateStep = useCallback(() => {
    const hasName = characterName.trim().length >= 2;
    const hasPersonality = personalityTraits.length > 0 || ideals.length > 0 || bonds.length > 0 || flaws.length > 0;
    
    return hasName && hasPersonality;
  }, [characterName, personalityTraits, ideals, bonds, flaws]);

  useEffect(() => {
    if (isHydrated) {
      const isValid = validateStep();
      onValidationChange?.(isValid);
    }
  }, [validateStep, onValidationChange, isHydrated]);

  // ===========================
  // HANDLERS
  // ===========================
  const addToList = (list: string[], setList: (list: string[]) => void) => {
    setList([...list, '']);
  };

  const updateListItem = (list: string[], setList: (list: string[]) => void, index: number, value: string) => {
    const newList = [...list];
    newList[index] = value;
    setList(newList);
  };

  const removeFromList = (list: string[], setList: (list: string[]) => void, index: number) => {
    const newList = list.filter((_, i) => i !== index);
    setList(newList);
  };

  const addRandomExample = (type: 'traits' | 'ideals' | 'bonds' | 'flaws') => {
    const examples = PERSONALITY_EXAMPLES[type];
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    
    switch (type) {
      case 'traits':
        setPersonalityTraits(prev => [...prev, randomExample]);
        break;
      case 'ideals':
        setIdeals(prev => [...prev, randomExample]);
        break;
      case 'bonds':
        setBonds(prev => [...prev, randomExample]);
        break;
      case 'flaws':
        setFlaws(prev => [...prev, randomExample]);
        break;
    }
  };

  // ===========================
  // RENDER HELPER - LIST SECTION
  // ===========================
  const renderListSection = (
    title: string,
    icon: React.ReactNode,
    list: string[],
    setList: (list: string[]) => void,
    placeholder: string,
    color: string,
    exampleType: 'traits' | 'ideals' | 'bonds' | 'flaws'
  ) => (
    <Card className="p-6 bg-gray-800/50 border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {icon}
          <Label className="text-lg font-semibold text-white">{title}</Label>
        </div>
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => addRandomExample(exampleType)}
                  variant="outline"
                  size="sm"
                  className={`text-${color}-400 border-${color}-400/30 hover:bg-${color}-400/10`}
                >
                  Inspiração
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clique para adicionar um exemplo aleatório</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            onClick={() => addToList(list, setList)}
            size="sm"
            className={`bg-${color}-600 hover:bg-${color}-700`}
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>
      </div>

      <ScrollArea className="max-h-64">
        <div className="space-y-3 pr-4">
          {list.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <Input
                value={item}
                onChange={(e) => updateListItem(list, setList, index, e.target.value)}
                placeholder={placeholder}
                className="flex-1"
                maxLength={200}
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => removeFromList(list, setList, index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remover item</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}
          
          {list.length === 0 && (
            <div className="text-gray-500 text-sm italic text-center py-4 border-2 border-dashed border-gray-600 rounded-lg">
              Nenhum item adicionado ainda
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );

  // ===========================
  // RENDER
  // ===========================
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Personalidade e Traços</h2>
          <p className="text-gray-400 text-lg">
            Defina a personalidade única do seu personagem
          </p>
        </div>

        {/* Character Name */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <User className="w-5 h-5 text-blue-400" />
            <Label htmlFor="character-name" className="text-lg font-semibold text-white">
              Nome do Personagem
            </Label>
          </div>
          
          <Input
            id="character-name"
            type="text"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="Digite o nome do seu personagem..."
            className="text-lg"
            maxLength={50}
          />
          
          {characterName.trim().length > 0 && characterName.trim().length < 2 && (
            <Alert variant="destructive" className="mt-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Nome deve ter pelo menos 2 caracteres
              </AlertDescription>
            </Alert>
          )}
        </Card>

        <Separator className="my-6" />

        {/* Personality Traits */}
        {renderListSection(
          "Traços de Personalidade",
          <Heart className="w-5 h-5 text-pink-400" />,
          personalityTraits,
          setPersonalityTraits,
          "Ex: Sempre falo em terceira pessoa...",
          "pink",
          "traits"
        )}

        <Separator className="my-6" />

        {/* Ideals */}
        {renderListSection(
          "Ideais",
          <Target className="w-5 h-5 text-blue-400" />,
          ideals,
          setIdeals,
          "Ex: Justiça: A lei deve ser respeitada por todos...",
          "blue",
          "ideals"
        )}

        <Separator className="my-6" />

        {/* Bonds */}
        {renderListSection(
          "Vínculos",
          <Users className="w-5 h-5 text-green-400" />,
          bonds,
          setBonds,
          "Ex: Devo minha vida ao mentor que me treinou...",
          "green",
          "bonds"
        )}

        <Separator className="my-6" />

        {/* Flaws */}
        {renderListSection(
          "Defeitos",
          <Zap className="w-5 h-5 text-yellow-400" />,
          flaws,
          setFlaws,
          "Ex: Não resisto a apostar...",
          "yellow",
          "flaws"
        )}

        <Separator className="my-6" />

        {/* Backstory */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <Label htmlFor="backstory" className="text-lg font-semibold text-white">
              História Pessoal (Backstory)
            </Label>
          </div>
          
          <Textarea
            id="backstory"
            value={backstory}
            onChange={(e) => setBackstory(e.target.value)}
            placeholder="Conte a história do seu personagem... De onde ele veio? O que o motivou a se tornar um aventureiro?"
            className="resize-y min-h-[120px]"
            maxLength={2000}
          />
          
          <div className="text-right text-sm text-gray-400 mt-2">
            {backstory.length}/2000 caracteres
          </div>
        </Card>

        {/* Notes */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <BookOpen className="w-5 h-5 text-gray-400" />
            <Label htmlFor="notes" className="text-lg font-semibold text-white">
              Notas Adicionais
            </Label>
          </div>
          
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Qualquer informação adicional sobre seu personagem..."
            className="resize-y min-h-[100px]"
            maxLength={1000}
          />
          
          <div className="text-right text-sm text-gray-400 mt-2">
            {notes.length}/1000 caracteres
          </div>
        </Card>

        <Separator className="my-6" />

        {/* Validation Status */}
        <div className="text-center">
          {validateStep() ? (
            <Badge variant="default" className="bg-green-500/10 text-green-400 border-green-500/20 px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              Personalidade definida!
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 px-4 py-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
              {characterName.trim().length < 2 
                ? "Digite o nome do personagem" 
                : "Adicione pelo menos um traço de personalidade"}
            </Badge>
          )}
        </div>

        {/* Debug Panel */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="p-4 bg-gray-800/30 border-gray-700">
            <Label className="text-white font-semibold mb-2 text-sm block">
              Debug - Personality Data
            </Label>
            <ScrollArea className="h-32">
              <pre className="text-gray-400 text-xs">
                {JSON.stringify({
                  characterName,
                  personalityTraits: personalityTraits.length,
                  ideals: ideals.length,
                  bonds: bonds.length,
                  flaws: flaws.length,
                  backstoryLength: backstory.length,
                  notesLength: notes.length,
                  isValid: validateStep()
                }, null, 2)}
              </pre>
            </ScrollArea>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
};

export default PersonalityStep;