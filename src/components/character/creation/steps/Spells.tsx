// src/components/character/creation/steps/Spells.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Search, BookOpen, Sparkles, Zap, Clock, Target, Shield, Wand2, AlertCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// ===========================
// INTERFACES E TIPOS
// ===========================

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
  onSpellSelect?: (spellIndex: string, isSelected: boolean) => void;
  selectedSpells?: string[];
  maxCantrips?: number;
  maxLevel1Spells?: number;
  showSelection?: boolean;
}

// ===========================
// COMPONENTE DE MAGIA INDIVIDUAL
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
      case 'conjuration': return <Sparkles className="w-4 h-4" />;
      case 'evocation': return <Zap className="w-4 h-4" />;
      case 'abjuration': return <Shield className="w-4 h-4" />;
      case 'enchantment': return <Wand2 className="w-4 h-4" />;
      case 'transmutation': return <Target className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
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
    console.log('🎯 [SpellCard] Botão clicado - Início da seleção');
    console.log(`  Magia: ${spell.name} (${spell.index})`);
    console.log(`  Estado atual: ${isSelected ? 'Selecionada' : 'Não selecionada'}`);
    console.log(`  Função onSelect disponível? ${!!onSelect}`);
    
    if (onSelect) {
      console.log('🎯 [SpellCard] Chamando onSelect...');
      console.log(`  Parâmetros: spellIndex=${spell.index}, isSelected=${!isSelected}`);
      onSelect(spell.index, !isSelected);
    } else {
      console.error('❌ [SpellCard] onSelect não está disponível!');
    }
  };

  return (
    <Card className={`transition-colors ${isSelected ? 'border-blue-500 bg-blue-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getSpellIcon(spell.school?.index || 'evocation')}
              <CardTitle className="text-lg">{spell.name}</CardTitle>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={spell.level === 0 ? "secondary" : "default"}>
                {getSpellLevelDisplay(spell.level)}
              </Badge>
              <Badge variant="outline">
                {spell.school?.name}
              </Badge>
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                {spell.casting_time}
              </Badge>
              <Badge variant="outline">
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
              className={isSelected ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              {isSelected ? "✓ Selecionada" : "Selecionar"}
            </Button>
          )}
        </div>

        {/* Informações Básicas */}
        <div className="mt-2 text-sm text-gray-600">
          <div className="flex items-center gap-4 flex-wrap">
            <span>📏 <strong>Alcance:</strong> {spell.range}</span>
            <span>⏱️ <strong>Duração:</strong> {spell.duration}</span>
            <span>🔮 <strong>Componentes:</strong> {getComponentsDisplay(spell.components)}</span>
            {spell.concentration && <span className="text-red-600">🎯 Concentração</span>}
            {spell.ritual && <span className="text-purple-600">📿 Ritual</span>}
          </div>
        </div>

        {/* Descrição Resumida */}
        <div className="mt-3">
          <p className="text-gray-700 text-sm line-clamp-2">
            {spell.desc?.[0] || 'Descrição não disponível'}
          </p>
        </div>

        {/* Expandir/Recolher */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full mt-2">
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
          
          <CollapsibleContent className="mt-4 pt-4 border-t">
            {/* Descrição Completa */}
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">Descrição</h4>
              {spell.desc?.map((paragraph, index) => (
                <p key={index} className="text-gray-700 text-sm mb-2">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Níveis Superiores */}
            {spell.higher_level && spell.higher_level.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Em Níveis Superiores</h4>
                {spell.higher_level.map((text, index) => (
                  <p key={index} className="text-gray-700 text-sm mb-2">
                    {text}
                  </p>
                ))}
              </div>
            )}

            {/* Material */}
            {spell.material && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Componente Material</h4>
                <p className="text-gray-700 text-sm">{spell.material}</p>
              </div>
            )}

            {/* Dano */}
            {spell.damage && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Dano</h4>
                <div className="text-sm">
                  <p className="text-gray-700">
                    Tipo: <span className="font-medium">{spell.damage.damage_type?.name}</span>
                  </p>
                  {spell.damage.damage_at_slot_level && (
                    <p className="text-gray-700">
                      Dano: <span className="font-medium">{spell.damage.damage_at_slot_level[spell.level.toString()]}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Classes */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Classes</h4>
              <div className="flex flex-wrap gap-1">
                {spell.classes?.map((cls, index) => (
                  <Badge key={index} variant="outline">
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
// FUNÇÕES DE API
// ===========================

const fetchSpellDetails = async (spellIndex: string): Promise<DndSpell> => {
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
};

const fetchSpellsByClass = async (classIndex: string): Promise<DndSpell[]> => {
  try {
    console.log(`[API] Buscando magias para classe: ${classIndex}`);
    
    // Verificar cache local
    const cacheKey = `spells_cache_${classIndex}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const oneHour = 60 * 60 * 1000;
      
      if (Date.now() - timestamp < oneHour) {
        console.log(`[API] Retornando ${data.length} magias do cache`);
        return data;
      }
    }

    // Buscar lista de magias da classe
    const response = await fetch(`https://www.dnd5eapi.co/api/classes/${classIndex}/spells`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar magias da classe ${classIndex}: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`[API] Total de magias encontradas: ${data.count}`);
    
    // Filtrar apenas truques (0) e nível 1
    const filteredSpells = data.results.filter((spell: any) => 
      spell.level === 0 || spell.level === 1
    );
    
    console.log(`[API] Magias após filtro (nível 0-1): ${filteredSpells.length}`);
    
    // Buscar detalhes em lotes com delay
    const detailedSpells: DndSpell[] = [];
    const batchSize = 5;
    const delay = 200; // 200ms entre lotes
    
    for (let i = 0; i < filteredSpells.length; i += batchSize) {
      const batch = filteredSpells.slice(i, i + batchSize);
      const batchPromises = batch.map(spell => 
        fetchSpellDetails(spell.index)
      );
      
      const batchResults = await Promise.all(batchPromises);
      detailedSpells.push(...batchResults);
      
      // Aguardar entre lotes para evitar rate limiting
      if (i + batchSize < filteredSpells.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // Salvar no cache
    const cacheData = {
      data: detailedSpells,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    
    console.log(`[API] ${detailedSpells.length} magias detalhadas carregadas`);
    return detailedSpells;
    
  } catch (error) {
    console.error(`[API] Erro ao buscar magias:`, error);
    throw error;
  }
};

// ===========================
// COMPONENTE PRINCIPAL
// ===========================

const SpellsComponent = ({
  selectedClass,
  onSpellSelect,
  selectedSpells = [],
  maxCantrips = 4,
  maxLevel1Spells = 2,
  showSelection = true
}: SpellsComponentProps) => {
  const [spells, setSpells] = useState<DndSpell[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 0 | 1>('all');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');

  // Carregar magias quando a classe mudar
  useEffect(() => {
    console.log(`[SpellsComponent] Classe selecionada alterada: ${selectedClass}`);
    if (!selectedClass) {
      setSpells([]);
      return;
    }

    const loadSpells = async () => {
      setIsLoading(true);
      setError(null);
      console.log(`[SpellsComponent] Iniciando carregamento de magias...`);

      try {
        const classSpells = await fetchSpellsByClass(selectedClass);
        setSpells(classSpells);
        console.log(`[SpellsComponent] Magias carregadas: ${classSpells.length}`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao carregar magias';
        setError(errorMessage);
        setSpells([]);
        console.error(`[SpellsComponent] Erro ao carregar magias: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadSpells();
  }, [selectedClass]);

  // Filtrar magias
  const filteredSpells = spells.filter(spell => {
    // Filtro por busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesName = spell.name.toLowerCase().includes(searchLower);
      const matchesDesc = spell.desc?.[0]?.toLowerCase().includes(searchLower);
      
      if (!matchesName && !matchesDesc) return false;
    }

    // Filtro por nível
    if (selectedLevel !== 'all' && spell.level !== selectedLevel) return false;

    // Filtro por escola
    if (selectedSchool !== 'all' && spell.school?.index !== selectedSchool) return false;

    return true;
  });

  // Separar por tipo
  const cantrips = filteredSpells.filter(spell => spell.level === 0);
  const level1Spells = filteredSpells.filter(spell => spell.level === 1);

  // Contadores de seleção
  const selectedCantrips = selectedSpells.filter(spellIndex => 
    cantrips.some(spell => spell.index === spellIndex)
  ).length;
  const selectedLevel1 = selectedSpells.filter(spellIndex =>
    level1Spells.some(spell => spell.index === spellIndex)
  ).length;

  // Escolas disponíveis
  const availableSchools = [...new Set(spells.map(spell => spell.school?.index).filter(Boolean))];

  // CORREÇÃO CRÍTICA: Função de seleção corrigida
  const handleSpellSelect = useCallback((spellIndex: string, shouldBeSelected: boolean) => {
    console.log('🎯 [handleSpellSelect] Evento de seleção recebido');
    console.log(`  spellIndex: ${spellIndex}`);
    console.log(`  shouldBeSelected: ${shouldBeSelected}`);
    
    if (!onSpellSelect) {
      console.error('❌ [handleSpellSelect] onSpellSelect não está definido!');
      return;
    }

    const spell = spells.find(s => s.index === spellIndex);
    if (!spell) {
      console.error(`❌ [handleSpellSelect] Magia não encontrada: ${spellIndex}`);
      return;
    }

    console.log(`  Magia encontrada: ${spell.name} (nível ${spell.level})`);
    
    // Verificar limites apenas ao ADICIONAR uma magia
    if (shouldBeSelected) {
      console.log('  Verificando limites para adição...');
      
      if (spell.level === 0 && selectedCantrips >= maxCantrips) {
        console.warn(`⚠️ [handleSpellSelect] Limite de truques atingido: ${selectedCantrips}/${maxCantrips}`);
        alert(`Você já selecionou o máximo de ${maxCantrips} truques`);
        return;
      }

      if (spell.level === 1 && selectedLevel1 >= maxLevel1Spells) {
        console.warn(`⚠️ [handleSpellSelect] Limite de magias de nível 1 atingido: ${selectedLevel1}/${maxLevel1Spells}`);
        alert(`Você já selecionou o máximo de ${maxLevel1Spells} magias de 1º nível`);
        return;
      }
    }

    console.log(`✅ [handleSpellSelect] Chamando onSpellSelect com: ${spellIndex}, ${shouldBeSelected}`);
    onSpellSelect(spellIndex, shouldBeSelected);
  }, [onSpellSelect, spells, selectedCantrips, maxCantrips, selectedLevel1, maxLevel1Spells]);

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Magias Disponíveis
                {isLoading && (
                  <div className="flex items-center gap-2 ml-4 text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Carregando magias...</span>
                  </div>
                )}
              </CardTitle>
            </div>
            
            {showSelection && (
              <div className="text-sm text-gray-600">
                <div>Truques: {selectedCantrips}/{maxCantrips}</div>
                <div>Nível 1: {selectedLevel1}/{maxLevel1Spells}</div>
              </div>
            )}
          </div>
        </CardHeader>

        {/* Filtros */}
        {!isLoading && spells.length > 0 && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar magias..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>

              <select
                value={selectedLevel.toString()}
                onChange={handleLevelChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">Todos os níveis</option>
                <option value="0">Truques</option>
                <option value="1">1º Nível</option>
              </select>

              <select
                value={selectedSchool}
                onChange={handleSchoolChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">Todas as escolas</option>
                {availableSchools.map(school => (
                  <option key={school} value={school}>
                    {spells.find(s => s.school?.index === school)?.school?.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Painel de Debug */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-800">🐛 Debug Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs space-y-2 text-yellow-700">
            <div><strong>Classe Selecionada:</strong> {selectedClass || 'Nenhuma'}</div>
            <div><strong>Status:</strong> {isLoading ? 'Carregando...' : error ? 'Erro' : 'Pronto'}</div>
            <div><strong>Total de Magias:</strong> {spells.length}</div>
            <div><strong>Magias Filtradas:</strong> {filteredSpells.length}</div>
            <div><strong>Cache:</strong> {localStorage.getItem(`spells_cache_${selectedClass}`) ? 'Presente' : 'Ausente'}</div>
            <div><strong>Função onSpellSelect:</strong> {onSpellSelect ? 'Definida' : 'Não definida'}</div>
            <div><strong>Selecionados:</strong> {selectedSpells.join(', ') || 'Nenhum'}</div>
            <div><strong>Contadores:</strong> Truques ({selectedCantrips}/{maxCantrips}) | Nível 1 ({selectedLevel1}/{maxLevel1Spells})</div>
            
            {spells.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer font-bold">📜 Magias Carregadas ({spells.length})</summary>
                <div className="mt-2 max-h-32 overflow-y-auto">
                  {spells.map(spell => (
                    <div key={spell.index} className="text-xs">
                      • {spell.name} (nível {spell.level}) - Selecionada: {selectedSpells.includes(spell.index) ? 'Sim' : 'Não'}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo */}
      {error ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar magias</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : isLoading ? (
        <Card className="p-8">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Carregando Magias...
            </h3>
            <p className="text-gray-600">
              Buscando magias disponíveis para {selectedClass}
            </p>
          </div>
        </Card>
      ) : spells.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma magia encontrada
            </h3>
            <p className="text-gray-600">
              Esta classe não possui magias de truque/1º nível
            </p>
          </div>
        </Card>
      ) : filteredSpells.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma magia encontrada
            </h3>
            <p className="text-gray-600">
              Tente ajustar os filtros para encontrar magias
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Truques */}
          {cantrips.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold">
                  Truques ({cantrips.length})
                  {showSelection && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      - {selectedCantrips}/{maxCantrips} selecionados
                    </span>
                  )}
                </h3>
              </div>
              <div className="grid gap-4">
                {cantrips.map(spell => (
                  <SpellCard
                    key={spell.index}
                    spell={spell}
                    isSelected={selectedSpells.includes(spell.index)}
                    onSelect={handleSpellSelect}
                    showSelection={showSelection}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Magias de 1º Nível */}
          {level1Spells.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-semibold">
                  Magias de 1º Nível ({level1Spells.length})
                  {showSelection && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      - {selectedLevel1}/{maxLevel1Spells} selecionadas
                    </span>
                  )}
                </h3>
              </div>
              <div className="grid gap-4">
                {level1Spells.map(spell => (
                  <SpellCard
                    key={spell.index}
                    spell={spell}
                    isSelected={selectedSpells.includes(spell.index)}
                    onSelect={handleSpellSelect}
                    showSelection={showSelection}
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