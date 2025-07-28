// src/components/character/creation/steps/Spells.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, BookOpen, Sparkles, Zap, Clock, Target, Shield, Wand2, AlertCircle, Loader2, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DndSpell {
  index: string;
  name: string;
  desc: string[];
  higher_level?: string[];
  range: string;
  components: string[];
  material?: string;
  ritual: boolean;
  duration: string;
  concentration: boolean;
  casting_time: string;
  level: number;
  attack_type?: string;
  damage?: {
    damage_type: { index: string; name: string; url: string };
    damage_at_slot_level: Record<string, string>;
  };
  school: { index: string; name: string; url: string };
  classes: Array<{ index: string; name: string; url: string }>;
  subclasses: Array<{ index: string; name: string; url: string }>;
  url: string;
}

interface SpellsComponentProps {
  selectedClass?: string;
  onValidationChange?: (isValid: boolean) => void;
}

// ===========================
// STORAGE - COM TIPAGEM CORRIGIDA
// ===========================

const STORAGE_KEYS = {
  SELECTED_SPELLS: 'character_creation_selected_spells',
  SPELLS_DATA: 'character_creation_spells_cache',
  SPELLS_VALIDATION: 'character_creation_spells_validation'
};

// Função corrigida com tipagem genérica
const saveToStorage = <T,>(key: string, data: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar no storage:', error);
  }
};

// Função corrigida com tipagem genérica
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Erro ao carregar do storage:', error);
    return defaultValue;
  }
};

// ===========================
// COMPONENTE PRINCIPAL
// ===========================

const SpellsComponent = ({ selectedClass, onValidationChange }: SpellsComponentProps) => {
  // ===========================
  // STATES COM STORAGE
  // ===========================
  
  const [selectedSpells, setSelectedSpells] = useState<string[]>(() => 
    loadFromStorage<string[]>(STORAGE_KEYS.SELECTED_SPELLS, [])
  );
  
  const [spells, setSpells] = useState<DndSpell[]>(() => 
    loadFromStorage<DndSpell[]>(STORAGE_KEYS.SPELLS_DATA, [])
  );

  // ===========================
  // ESTADOS ADICIONAIS
  // ===========================
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 0 | 1>('all');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');

  // ===========================
  // DADOS DE OUTROS STEPS (SEM TIPAGEM ESPECÍFICA PARA CLASSE)
  // ===========================
  
  const [crossStepData, setCrossStepData] = useState({
    selectedClass: loadFromStorage('character_creation_class', null)
  });

  // ===========================
  // LIMITES POR CLASSE
  // ===========================
  
  const spellLimits = useMemo(() => {
    return {
      warlock: { maxCantrips: 2, maxLevel1Spells: 2 },
      wizard: { maxCantrips: 3, maxLevel1Spells: 6 },
      sorcerer: { maxCantrips: 4, maxLevel1Spells: 2 },
      bard: { maxCantrips: 2, maxLevel1Spells: 4 },
      cleric: { maxCantrips: 3, maxLevel1Spells: 0 },
      druid: { maxCantrips: 2, maxLevel1Spells: 0 },
      paladin: { maxCantrips: 0, maxLevel1Spells: 0 },
      ranger: { maxCantrips: 0, maxLevel1Spells: 0 },
      fighter: { maxCantrips: 0, maxLevel1Spells: 0 },
      rogue: { maxCantrips: 0, maxLevel1Spells: 0 },
      barbarian: { maxCantrips: 0, maxLevel1Spells: 0 },
      monk: { maxCantrips: 0, maxLevel1Spells: 0 }
    };
  }, []);

  // Determinar limites com base na classe selecionada
  const limits = useMemo(() => {
    if (!selectedClass) return { maxCantrips: 0, maxLevel1Spells: 0 };
    return spellLimits[selectedClass as keyof typeof spellLimits] || { maxCantrips: 0, maxLevel1Spells: 0 };
  }, [selectedClass, spellLimits]);

  const { maxCantrips, maxLevel1Spells } = limits;

  // ===========================
  // CONTAGEM DE MAGIAS SELECIONADAS (DECLARADAS ANTES DO handleSpellSelect)
  // ===========================
  
  const cleanSelectedSpells = selectedSpells.filter((spell: string) => spell !== null);

  // Contagem corrigida - declarada antes do handleSpellSelect
  const selectedCantrips = cleanSelectedSpells.filter(spellIndex => 
    spells.some(spell => spell.index === spellIndex && spell.level === 0)
  ).length;
  
  const selectedLevel1 = cleanSelectedSpells.filter(spellIndex =>
    spells.some(spell => spell.index === spellIndex && spell.level === 1)
  ).length;

  // ===========================
  // API FUNCTIONS
  // ===========================

  const fetchSpellDetails = useCallback(async (spellIndex: string): Promise<DndSpell> => {
    try {
      const response = await fetch(`https://www.dnd5eapi.co/api/spells/${spellIndex}`);
      if (!response.ok) {
        throw new Error(`Erro ${response.status} ao buscar magia ${spellIndex}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Erro ao buscar detalhes de ${spellIndex}:`, error);
      throw error;
    }
  }, []);

  const fetchSpellsByClass = useCallback(async (classIndex: string): Promise<DndSpell[]> => {
    try {
      const cacheKey = `spells_cache_${classIndex}`;
      const cachedData = localStorage.getItem(cacheKey);
      
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const oneHour = 60 * 60 * 1000;
        
        if (Date.now() - timestamp < oneHour) {
          return data;
        }
      }

      const response = await fetch(`https://www.dnd5eapi.co/api/classes/${classIndex}/spells`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar magias da classe ${classIndex}: ${response.status}`);
      }
      
      const data = await response.json();
      const filteredSpells = data.results.filter((spell: any) => 
        spell.level === 0 || spell.level === 1
      );
      
      const detailedSpells: DndSpell[] = [];
      const batchSize = 5;
      const delay = 200;
      
      for (let i = 0; i < filteredSpells.length; i += batchSize) {
        const batch = filteredSpells.slice(i, i + batchSize);
        const batchPromises = batch.map(spell => 
          fetchSpellDetails(spell.index)
        );
        
        const batchResults = await Promise.all(batchPromises);
        detailedSpells.push(...batchResults);
        
        if (i + batchSize < filteredSpells.length) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      const cacheData = {
        data: detailedSpells,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      
      return detailedSpells;
      
    } catch (error) {
      console.error(`[API] Erro ao buscar magias:`, error);
      throw error;
    }
  }, [fetchSpellDetails]);

  const loadSpells = useCallback(async () => {
    if (!selectedClass) {
      setSpells([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const classSpells = await fetchSpellsByClass(selectedClass);
      setSpells(classSpells);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao carregar magias';
      setError(errorMessage);
      setSpells([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedClass, fetchSpellsByClass]);

  // ===========================
  // HANDLERS
  // ===========================

  const handleSpellSelect = useCallback((spellIndex: string, shouldBeSelected: boolean) => {
    const spell = spells.find(s => s.index === spellIndex);
    if (!spell) {
      return;
    }

    if (shouldBeSelected) {
      // Verificar limites para truques
      if (spell.level === 0 && selectedCantrips >= maxCantrips) {
        alert(`Você já selecionou o máximo de ${maxCantrips} truques permitidos para sua classe`);
        return;
      }

      // Verificar limites para magias de 1º nível
      if (spell.level === 1 && selectedLevel1 >= maxLevel1Spells) {
        alert(`Você já selecionou o máximo de ${maxLevel1Spells} magias de 1º nível permitidas para sua classe`);
        return;
      }
    }

    setSelectedSpells(prev => {
      let newSpells;
      if (shouldBeSelected) {
        newSpells = [...prev, spellIndex];
      } else {
        newSpells = prev.filter(s => s !== spellIndex);
      }
      return newSpells;
    });
  }, [spells, selectedCantrips, maxCantrips, selectedLevel1, maxLevel1Spells]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    let parsedValue: 'all' | 0 | 1;
    
    if (newValue === 'all') {
      parsedValue = 'all';
    } else {
      parsedValue = parseInt(newValue) as 0 | 1;
    }
    
    setSelectedLevel(parsedValue);
  };

  const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSchool(e.target.value);
  };

  // Função para limpar todas as seleções
  const handleClearSelection = () => {
    setSelectedSpells([]);
  };

  // ===========================
  // CLEAR STORAGE
  // ===========================

  const clearStorageData = () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    setSelectedSpells([]);
    setSpells([]);
  };

  // ===========================
  // FILTRAGEM
  // ===========================
  
  const filteredSpells = spells.filter(spell => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesName = spell.name.toLowerCase().includes(searchLower);
      const matchesDesc = spell.desc?.[0]?.toLowerCase().includes(searchLower);
      
      if (!matchesName && !matchesDesc) return false;
    }

    if (selectedLevel !== 'all' && spell.level !== selectedLevel) return false;

    if (selectedSchool !== 'all' && spell.school?.index !== selectedSchool) return false;

    return true;
  });

  const cantrips = filteredSpells.filter(spell => spell.level === 0);
  const level1Spells = filteredSpells.filter(spell => spell.level === 1);

  const availableSchools = [...new Set(spells.map(spell => spell.school?.index).filter(Boolean))];

  // ===========================
  // EFFECTS
  // ===========================

  // Salvar dados selecionados
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SELECTED_SPELLS, selectedSpells);
  }, [selectedSpells]);

  // Salvar cache de dados da API
  useEffect(() => {
    if (spells.length > 0) {
      saveToStorage(STORAGE_KEYS.SPELLS_DATA, spells);
    }
  }, [spells]);

  // Validação com dependências corrigidas
  useEffect(() => {
    if (!selectedClass) {
      onValidationChange?.(true);
      return;
    }
    
    const isValid = selectedSpells.length >= (maxCantrips + maxLevel1Spells);
    onValidationChange?.(isValid);
    saveToStorage(STORAGE_KEYS.SPELLS_VALIDATION, isValid);
  }, [selectedSpells, selectedClass, onValidationChange, maxCantrips, maxLevel1Spells]);

  // Atualizar dados de outros steps
  useEffect(() => {
    const interval = setInterval(() => {
      const newClass = loadFromStorage('character_creation_class', null);

      setCrossStepData(prev => {
        const hasChanges = 
          JSON.stringify(prev.selectedClass) !== JSON.stringify(newClass);

        if (hasChanges) {
          return {
            selectedClass: newClass
          };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Carregar magias quando a classe mudar
  useEffect(() => {
    if (selectedClass) {
      loadSpells();
    }
  }, [selectedClass, loadSpells]);

  // ===========================
  // RENDER HELPER COMPONENTS
  // ===========================

  const SpellCard = ({ 
    spell, 
    isSelected, 
    onSelect, 
    showSelection 
  }: {
    spell: DndSpell;
    isSelected: boolean;
    onSelect?: (spellIndex: string, isSelected: boolean) => void;
    showSelection: boolean;
  }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getSpellLevelDisplay = (level: number) => {
      if (level === 0) return "Truque";
      return `${level}º Nível`;
    };

    const getSpellIcon = (school: string) => {
      switch (school) {
        case 'conjuration': return <Sparkles className="w-4 h-4 text-yellow-400" />;
        case 'evocation': return <Zap className="w-4 h-4 text-red-400" />;
        case 'abjuration': return <Shield className="w-4 h-4 text-blue-400" />;
        case 'enchantment': return <Wand2 className="w-4 h-4 text-purple-400" />;
        case 'transmutation': return <Target className="w-4 h-4 text-green-400" />;
        default: return <BookOpen className="w-4 h-4 text-slate-400" />;
      }
    };

    const getComponentsDisplay = (components: string[]) => {
      return components.map(comp => {
        switch (comp) {
          case 'V': return 'Verbal';
          case 'S': return 'Somático';
          case 'M': return 'Material';
          default: return comp;
        }
      }).join(', ');
    };

    const handleSelect = () => {
      if (onSelect) {
        onSelect(spell.index, !isSelected);
      }
    };

    return (
      <Card className={`transition-colors ${isSelected ? 'border-blue-500 bg-blue-900/20' : 'bg-slate-800 border-slate-700'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getSpellIcon(spell.school?.index || 'evocation')}
                <CardTitle className="text-lg text-white">{spell.name}</CardTitle>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={spell.level === 0 ? "secondary" : "default"} className={spell.level === 0 ? "bg-purple-900/50 text-purple-300" : "bg-blue-900/50 text-blue-300"}>
                  {getSpellLevelDisplay(spell.level)}
                </Badge>
                <Badge variant="outline" className="border-slate-600 bg-slate-700 text-slate-300">
                  {spell.school?.name}
                </Badge>
                <Badge variant="outline" className="border-slate-600 bg-slate-700 text-slate-300">
                  <Clock className="w-3 h-3 mr-1" />
                  {spell.casting_time}
                </Badge>
                <Badge variant="outline" className="border-slate-600 bg-slate-700 text-slate-300">
                  <Target className="w-3 h-3 mr-1" />
                  {spell.range}
                </Badge>
              </div>
            </div>

            {showSelection && (
              <Button
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={handleSelect}
                className={isSelected ? "bg-blue-600 hover:bg-blue-700" : "border-slate-600 text-slate-300 hover:bg-slate-700"}
              >
                {isSelected ? "✓ Selecionada" : "Selecionar"}
              </Button>
            )}
          </div>

          <div className="mt-2 text-sm text-slate-400">
            <div className="flex items-center gap-4 flex-wrap">
              <span>📏 <strong>Alcance:</strong> {spell.range}</span>
              <span>⏱️ <strong>Duração:</strong> {spell.duration}</span>
              <span>🔮 <strong>Componentes:</strong> {getComponentsDisplay(spell.components)}</span>
              {spell.concentration && <span className="text-red-400">🎯 Concentração</span>}
              {spell.ritual && <span className="text-purple-400">📿 Ritual</span>}
            </div>
          </div>

          <div className="mt-3">
            <p className="text-slate-300 text-sm line-clamp-2">
              {spell.desc?.[0] || 'Descrição não disponível'}
            </p>
          </div>

          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full mt-2 bg-slate-700 text-slate-300 hover:bg-slate-600">
                {isExpanded ? (
                  <>
                    Ver menos <ChevronUp className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Ver detalhes <ChevronDown className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-4 pt-4 border-t border-slate-700">
              <div className="mb-4">
                <h4 className="font-semibold text-white mb-2">Descrição</h4>
                {spell.desc?.map((paragraph, index) => (
                  <p key={index} className="text-slate-300 text-sm mb-2">
                    {paragraph}
                  </p>
                ))}
              </div>

              {spell.higher_level && spell.higher_level.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-white mb-2">Em Níveis Superiores</h4>
                  {spell.higher_level.map((text, index) => (
                    <p key={index} className="text-slate-300 text-sm mb-2">
                      {text}
                    </p>
                  ))}
                </div>
              )}

              {spell.material && (
                <div className="mb-4">
                  <h4 className="font-semibold text-white mb-2">Componente Material</h4>
                  <p className="text-slate-300 text-sm">{spell.material}</p>
                </div>
              )}

              {spell.damage && (
                <div className="mb-4">
                  <h4 className="font-semibold text-white mb-2">Dano</h4>
                  <div className="text-sm">
                    <p className="text-slate-300">
                      Tipo: <span className="font-medium">{spell.damage.damage_type?.name}</span>
                    </p>
                    {spell.damage.damage_at_slot_level && (
                      <p className="text-slate-300">
                        Dano: <span className="font-medium">{spell.damage.damage_at_slot_level[spell.level.toString()]}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-white mb-2">Classes</h4>
                <div className="flex flex-wrap gap-1">
                  {spell.classes?.map((cls, index) => (
                    <Badge key={index} variant="outline" className="border-slate-600 bg-slate-700 text-slate-300">
                      {cls.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardHeader>
      </Card>
    );
  };

  // ===========================
  // RENDER
  // ===========================

  if (!selectedClass) {
    return (
      <div className="p-8">
        <Card className="p-6 text-center bg-slate-700 border-slate-600">
          <h3 className="text-lg font-semibold mb-2 text-white">Não é Conjurador</h3>
          <p className="text-slate-300 mb-4">
            Sua classe não tem acesso a magias no 1º nível.
          </p>
          <p className="text-sm text-green-400">
            Você pode prosseguir para o próximo passo.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="p-4 bg-slate-800/60 border-slate-700">
          <h4 className="font-bold text-sm mb-2 text-slate-200">Debug - Magias Storage:</h4>
          <div className="text-xs space-y-1 text-slate-400">
            <p>Classe Selecionada: {selectedClass || 'Nenhuma'}</p>
            <p>Limites: Truques: {maxCantrips} | Nível 1: {maxLevel1Spells}</p>
            <p>Magias Selecionadas: {cleanSelectedSpells.length}</p>
            <p>Cache de magias: {spells.length} itens</p>
            <p>Status: {isLoading ? 'Carregando...' : error ? 'Erro' : 'Pronto'}</p>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={clearStorageData}
              className="mt-2 border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
            >
              Limpar Storage
            </Button>
          </div>
        </Card>
      )}

      {/* Context Info */}
      {crossStepData.selectedClass && (
        <Card className="p-4 bg-green-500/10 border-green-500/30">
          <h4 className="font-semibold mb-2 text-green-300">Classe Selecionada</h4>
          <p className="text-sm text-slate-300">
            {/* Correção: acesso seguro à propriedade name */}
            <strong>{crossStepData.selectedClass?.name}</strong>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Você pode selecionar até {maxCantrips} truques e {maxLevel1Spells} magias de 1º nível
          </p>
        </Card>
      )}

      {/* Card Principal */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <Wand2 className="w-5 h-5 text-purple-400" />
                Magias Disponíveis
                {isLoading && (
                  <div className="flex items-center gap-2 ml-4 text-blue-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Carregando magias...</span>
                  </div>
                )}
              </CardTitle>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="text-sm text-slate-400">
                <div>Truques: {selectedCantrips}/{maxCantrips}</div>
                <div>Nível 1: {selectedLevel1}/{maxLevel1Spells}</div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearSelection}
                disabled={cleanSelectedSpells.length === 0}
                className="flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Limpar Seleção
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isLoading && spells.length > 0 && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Buscar magias..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 bg-slate-700 border-slate-600 text-slate-300"
                />
              </div>

              <select
                value={selectedLevel.toString()}
                onChange={handleLevelChange}
                className="flex h-9 w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-1 text-sm text-slate-300 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-500"
              >
                <option value="all" className="bg-slate-800">Todos os níveis</option>
                <option value="0" className="bg-slate-800">Truques</option>
                <option value="1" className="bg-slate-800">1º Nível</option>
              </select>

              <select
                value={selectedSchool}
                onChange={handleSchoolChange}
                className="flex h-9 w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-1 text-sm text-slate-300 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-500"
              >
                <option value="all" className="bg-slate-800">Todas as escolas</option>
                {availableSchools.map(school => (
                  <option key={school} value={school} className="bg-slate-800">
                    {spells.find(s => s.school?.index === school)?.school?.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Conteúdo */}
      {error ? (
        <Alert className="bg-red-900/30 border-red-800">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertTitle className="text-red-400">Erro ao carregar magias</AlertTitle>
          <AlertDescription className="text-red-300">{error}</AlertDescription>
        </Alert>
      ) : isLoading ? (
        <Card className="p-8 bg-slate-800 border-slate-700">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-slate-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Carregando Magias...
            </h3>
            <p className="text-slate-400">
              Buscando magias disponíveis para {selectedClass}
            </p>
          </div>
        </Card>
      ) : spells.length === 0 ? (
        <Card className="p-8 bg-slate-800 border-slate-700">
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Nenhuma magia encontrada
            </h3>
            <p className="text-slate-400">
              Esta classe não possui magias de truque/1º nível
            </p>
          </div>
        </Card>
      ) : filteredSpells.length === 0 ? (
        <Card className="p-8 bg-slate-800 border-slate-700">
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Nenhuma magia encontrada
            </h3>
            <p className="text-slate-400">
              Tente ajustar os filtros para encontrar magias
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {cantrips.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">
                  Truques ({cantrips.length})
                  <span className="text-sm font-normal text-slate-400 ml-2">
                    - {selectedCantrips}/{maxCantrips} selecionados
                  </span>
                </h3>
              </div>
              <div className="grid gap-4">
                {cantrips.map(spell => (
                  <SpellCard
                    key={spell.index}
                    spell={spell}
                    isSelected={cleanSelectedSpells.includes(spell.index)}
                    onSelect={handleSpellSelect}
                    showSelection={true}
                  />
                ))}
              </div>
            </div>
          )}

          {level1Spells.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">
                  Magias de 1º Nível ({level1Spells.length})
                  <span className="text-sm font-normal text-slate-400 ml-2">
                    - {selectedLevel1}/{maxLevel1Spells} selecionadas
                  </span>
                </h3>
              </div>
              <div className="grid gap-4">
                {level1Spells.map(spell => (
                  <SpellCard
                    key={spell.index}
                    spell={spell}
                    isSelected={cleanSelectedSpells.includes(spell.index)}
                    onSelect={handleSpellSelect}
                    showSelection={true}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpellsComponent;