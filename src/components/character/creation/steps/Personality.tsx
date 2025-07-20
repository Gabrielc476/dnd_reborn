// ===========================
// PERSONALITY STEP - TRAÇOS DE PERSONALIDADE DO PERSONAGEM
// src/components/character/creation/steps/Personality.tsx
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
import { Plus, Trash2, Heart, Target, Users, Zap, User, BookOpen, AlertCircle, Sparkles, Edit, Save } from "lucide-react";

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
// SUGESTÕES DE INSPIRAÇÃO
// ===========================
const INSPIRATION_SUGGESTIONS = {
  traits: [
    "Sempre falo em terceira pessoa quando nervoso",
    "Tenho um tique nervoso quando minto",
    "Coleciono histórias e rumores interessantes",
    "Sou extremamente superstioso sobre números",
    "Tenho um jeito peculiar de cumprimentar pessoas",
    "Sempre sussurro quando estou pensando",
    "Não consigo resistir a um bom enigma",
    "Falo com meus equipamentos como se fossem pessoas",
    "Sempre verifico as saídas de qualquer local",
    "Tenho uma risada muito característica"
  ],
  ideals: [
    "A honra é mais importante que a vida",
    "O conhecimento é poder e deve ser compartilhado",
    "A liberdade vale qualquer sacrifício",
    "A justiça deve prevalecer sempre",
    "A família está acima de tudo",
    "A tradição deve ser respeitada",
    "O poder corrompe, então devo evitá-lo",
    "A natureza deve ser protegida da civilização",
    "Todo ser vivo merece uma segunda chance",
    "A verdade deve ser descoberta, não importa o custo"
  ],
  bonds: [
    "Devo tudo ao mentor que me treinou",
    "Minha cidade natal foi destruída e juro reconstruí-la",
    "Meu irmão/irmã desapareceu e vou encontrá-lo",
    "Protejo um segredo que pode mudar o mundo",
    "Devo vingar a morte de meus pais",
    "Uma antiga dívida de família precisa ser paga",
    "Meu animal de estimação é meu melhor amigo",
    "Guardo uma reliquia sagrada que devo proteger",
    "Amo alguém de uma classe social diferente",
    "Meu templo/guilda conta comigo"
  ],
  flaws: [
    "Não resisto a uma aposta, não importa as chances",
    "Minto compulsivamente, mesmo sobre coisas simples",
    "Sou covarde quando as coisas ficam difíceis",
    "Tenho uma fraqueza por vícios caros",
    "Não confio em ninguém facilmente",
    "Guardo rancor por muito tempo",
    "Sou arrogante demais para meu próprio bem",
    "Tenho medo irracional de algo específico",
    "Fico paralizado quando preciso tomar decisões",
    "Sempre culpo outros pelos meus erros"
  ]
};

// ===========================
// COMPONENTE PRINCIPAL
// ===========================
const PersonalityStep: React.FC<PersonalityStepProps> = ({ onValidationChange }) => {
  // ===========================
  // ESTADOS
  // ===========================
  const [characterName, setCharacterName] = useState<string>('');
  const [personalityTraits, setPersonalityTraits] = useState<string[]>([]);
  const [ideals, setIdeals] = useState<string[]>([]);
  const [bonds, setBonds] = useState<string[]>([]);
  const [flaws, setFlaws] = useState<string[]>([]);
  const [backstory, setBackstory] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  // ===========================
  // CARREGAMENTO INICIAL
  // ===========================
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCharacterName(loadFromStorage(STORAGE_KEYS.CHARACTER_NAME, ''));
      setPersonalityTraits(loadFromStorage(STORAGE_KEYS.PERSONALITY_TRAITS, []));
      setIdeals(loadFromStorage(STORAGE_KEYS.IDEALS, []));
      setBonds(loadFromStorage(STORAGE_KEYS.BONDS, []));
      setFlaws(loadFromStorage(STORAGE_KEYS.FLAWS, []));
      setBackstory(loadFromStorage(STORAGE_KEYS.BACKSTORY, ''));
      setNotes(loadFromStorage(STORAGE_KEYS.NOTES, ''));
      setIsMounted(true);
    }
  }, []);

  // ===========================
  // VALIDAÇÃO
  // ===========================
  const validateStep = useCallback(() => {
    const isValid = characterName.trim().length > 0;
    onValidationChange?.(isValid);
    return isValid;
  }, [characterName, onValidationChange]);

  useEffect(() => {
    if (isMounted) {
      validateStep();
    }
  }, [validateStep, isMounted]);

  // ===========================
  // HANDLERS DE SALVAMENTO
  // ===========================
  const handleNameChange = (value: string) => {
    setCharacterName(value);
    saveToStorage(STORAGE_KEYS.CHARACTER_NAME, value);
  };

  const handleListUpdate = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    storageKey: string,
    index: number,
    value: string
  ) => {
    const updated = [...list];
    updated[index] = value;
    setList(updated);
    saveToStorage(storageKey, updated);
  };

  const handleListAdd = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    storageKey: string,
    value: string = ''
  ) => {
    const updated = [...list, value];
    setList(updated);
    saveToStorage(storageKey, updated);
  };

  const handleListRemove = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    storageKey: string,
    index: number
  ) => {
    const updated = list.filter((_, i) => i !== index);
    setList(updated);
    saveToStorage(storageKey, updated);
  };

  const handleBackstoryChange = (value: string) => {
    setBackstory(value);
    saveToStorage(STORAGE_KEYS.BACKSTORY, value);
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    saveToStorage(STORAGE_KEYS.NOTES, value);
  };

  // ===========================
  // SUGESTÕES ALEATÓRIAS
  // ===========================
  const getRandomSuggestion = (type: keyof typeof INSPIRATION_SUGGESTIONS): string => {
    const suggestions = INSPIRATION_SUGGESTIONS[type];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  // ===========================
  // COMPONENTE DE LISTA
  // ===========================
  const ListSection = ({ 
    title, 
    icon: Icon, 
    items, 
    setItems, 
    storageKey, 
    placeholder, 
    bgColor, 
    accentColor,
    suggestionType 
  }: {
    title: string;
    icon: React.ComponentType<any>;
    items: string[];
    setItems: React.Dispatch<React.SetStateAction<string[]>>;
    storageKey: string;
    placeholder: string;
    bgColor: string;
    accentColor: string;
    suggestionType: keyof typeof INSPIRATION_SUGGESTIONS;
  }) => (
    <Card className="overflow-hidden shadow-lg border-0">
      <div className={`${bgColor} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Icon className="w-5 h-5" />
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      const suggestion = getRandomSuggestion(suggestionType);
                      handleListAdd(items, setItems, storageKey, suggestion);
                    }}
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 h-8"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Inspiração
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Adicionar sugestão aleatória</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              onClick={() => handleListAdd(items, setItems, storageKey)}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 h-8"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="group relative">
              <Textarea
                value={item}
                onChange={(e) => handleListUpdate(items, setItems, storageKey, index, e.target.value)}
                placeholder={placeholder}
                className={`pr-12 border-2 focus:border-${accentColor} transition-colors resize-none`}
                rows={2}
              />
              <Button
                onClick={() => handleListRemove(items, setItems, storageKey, index)}
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Icon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Nenhum item adicionado ainda</p>
              <p className="text-xs text-gray-400">Clique em "Adicionar" ou "Inspiração" para começar</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  // Loading state
  if (!isMounted) {
    return (
      <div className="p-8">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Personalidade do Personagem</h1>
            <p className="text-gray-600">Defina a personalidade única e história do seu personagem</p>
          </div>
        </div>

        {/* Validação */}
        {characterName.trim().length === 0 && (
          <Alert className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              O nome do personagem é obrigatório para prosseguir.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Nome do Personagem */}
      <Card className="overflow-hidden shadow-lg border-0">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <User className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Nome do Personagem</h2>
            <Badge variant="secondary" className="ml-auto bg-white/20 text-white">
              Obrigatório
            </Badge>
          </div>
        </div>
        <div className="p-6">
          <Input
            value={characterName}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Digite o nome do seu personagem..."
            className="text-lg font-medium border-2 focus:border-blue-500 transition-colors"
          />
        </div>
      </Card>

      {/* Grid de Seções de Personalidade */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ListSection
          title="Traços de Personalidade"
          icon={Heart}
          items={personalityTraits}
          setItems={setPersonalityTraits}
          storageKey={STORAGE_KEYS.PERSONALITY_TRAITS}
          placeholder="Descreva um traço único de personalidade..."
          bgColor="bg-gradient-to-r from-pink-500 to-rose-600"
          accentColor="pink-500"
          suggestionType="traits"
        />

        <ListSection
          title="Ideais"
          icon={Target}
          items={ideals}
          setItems={setIdeals}
          storageKey={STORAGE_KEYS.IDEALS}
          placeholder="Descreva um ideal que guia seu personagem..."
          bgColor="bg-gradient-to-r from-amber-500 to-orange-600"
          accentColor="amber-500"
          suggestionType="ideals"
        />

        <ListSection
          title="Vínculos"
          icon={Users}
          items={bonds}
          setItems={setBonds}
          storageKey={STORAGE_KEYS.BONDS}
          placeholder="Descreva uma conexão importante do personagem..."
          bgColor="bg-gradient-to-r from-green-500 to-emerald-600"
          accentColor="green-500"
          suggestionType="bonds"
        />

        <ListSection
          title="Defeitos"
          icon={Zap}
          items={flaws}
          setItems={setFlaws}
          storageKey={STORAGE_KEYS.FLAWS}
          placeholder="Descreva uma fraqueza ou defeito..."
          bgColor="bg-gradient-to-r from-red-500 to-rose-600"
          accentColor="red-500"
          suggestionType="flaws"
        />
      </div>

      {/* História e Notas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden shadow-lg border-0">
          <div className="bg-gradient-to-r from-purple-500 to-violet-600 px-6 py-4">
            <div className="flex items-center gap-2 text-white">
              <BookOpen className="w-5 h-5" />
              <h3 className="text-lg font-semibold">História de Fundo</h3>
            </div>
          </div>
          <div className="p-6">
            <Textarea
              value={backstory}
              onChange={(e) => handleBackstoryChange(e.target.value)}
              placeholder="Conte a história de vida do seu personagem, suas origens, experiências importantes..."
              className="min-h-[150px] border-2 focus:border-purple-500 transition-colors resize-none"
            />
          </div>
        </Card>

        <Card className="overflow-hidden shadow-lg border-0">
          <div className="bg-gradient-to-r from-gray-500 to-slate-600 px-6 py-4">
            <div className="flex items-center gap-2 text-white">
              <Edit className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Notas Adicionais</h3>
            </div>
          </div>
          <div className="p-6">
            <Textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Anote qualquer informação adicional sobre seu personagem..."
              className="min-h-[150px] border-2 focus:border-gray-500 transition-colors resize-none"
            />
          </div>
        </Card>
      </div>

      {/* Resumo */}
      {(characterName || personalityTraits.length > 0 || ideals.length > 0 || bonds.length > 0 || flaws.length > 0) && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Save className="w-5 h-5" />
              Resumo da Personalidade
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{characterName ? '✓' : '○'}</div>
                <div className="text-gray-600">Nome</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">{personalityTraits.length}</div>
                <div className="text-gray-600">Traços</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{ideals.length}</div>
                <div className="text-gray-600">Ideais</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{bonds.length + flaws.length}</div>
                <div className="text-gray-600">Vínculos/Defeitos</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Debug Info (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="p-4">
            <h4 className="font-bold text-sm mb-2">Debug - Dados salvos:</h4>
            <div className="text-xs space-y-1">
              <p>Nome: {characterName || 'vazio'}</p>
              <p>Traços: {personalityTraits.length} itens</p>
              <p>Ideais: {ideals.length} itens</p>
              <p>Vínculos: {bonds.length} itens</p>
              <p>Defeitos: {flaws.length} itens</p>
              <p>História: {backstory ? 'preenchida' : 'vazia'}</p>
              <p>Notas: {notes ? 'preenchidas' : 'vazias'}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PersonalityStep;