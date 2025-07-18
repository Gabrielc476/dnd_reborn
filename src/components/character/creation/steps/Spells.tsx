import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Sparkles, Zap, Clock, Target, Shield, Wand2, AlertCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { DndSpell } from '@/types/characterCreation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// ===========================
// INTERFACES
// ===========================

interface SpellsComponentProps {
  selectedClass?: string;
  onSpellSelect?: (spell: DndSpell) => void;
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
  onSelect?: (spell: DndSpell) => void;
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
              <Badge variant={spell.level === 0 ? "default" : "secondary"}>
                {getSpellLevelDisplay(spell.level)}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {spell.school?.name || 'Evocação'}
              </Badge>
              {spell.concentration && (
                <Badge className="bg-orange-100 text-orange-800">
                  Concentração
                </Badge>
              )}
              {spell.ritual && (
                <Badge className="bg-green-100 text-green-800">
                  Ritual
                </Badge>
              )}
            </div>
          </div>
          
          {showSelection && onSelect && (
            <Button
              onClick={() => onSelect(spell)}
              variant={isSelected ? "default" : "outline"}
              size="sm"
            >
              {isSelected ? 'Selecionada' : 'Selecionar'}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Informações Básicas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <span className="text-gray-600">Tempo:</span>
              <div className="font-medium">{spell.casting_time}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-gray-400" />
            <div>
              <span className="text-gray-600">Alcance:</span>
              <div className="font-medium">{spell.range}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-gray-400" />
            <div>
              <span className="text-gray-600">Componentes:</span>
              <div className="font-medium">{spell.components?.join(', ')}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gray-400" />
            <div>
              <span className="text-gray-600">Duração:</span>
              <div className="font-medium">{spell.duration}</div>
            </div>
          </div>
        </div>

        {/* Descrição Resumida */}
        <div className="mb-3">
          <p className="text-gray-700 text-sm line-clamp-2">
            {spell.desc?.[0] || 'Descrição não disponível'}
          </p>
        </div>

        {/* Expandir/Recolher */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full">
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
                      Dano: <span className="font-medium">{spell.damage.damage_at_slot_level["1"]}</span>
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
      </CardContent>
    </Card>
  );
};

// ===========================
// FUNÇÕES DE API
// ===========================

const fetchSpellsByClass = async (classIndex: string) => {
  try {
    console.log(`🔍 Carregando magias para a classe: ${classIndex}`);
    
    // 1. Verificar se a classe é conjuradora
    const classResponse = await fetch(`https://www.dnd5eapi.co/api/classes/${classIndex}`);
    if (!classResponse.ok) {
      throw new Error(`Erro ao buscar classe: ${classResponse.status}`);
    }
    
    const classData = await classResponse.json();
    
    if (!classData.spellcasting) {
      console.log(`⚠️ Classe ${classIndex} não é conjuradora`);
      return [];
    }

    console.log(`✅ Classe ${classIndex} é conjuradora, buscando magias...`);

    // 2. Buscar todas as magias
    const spellsResponse = await fetch('https://www.dnd5eapi.co/api/spells');
    if (!spellsResponse.ok) {
      throw new Error(`Erro ao buscar lista de magias: ${spellsResponse.status}`);
    }
    
    const spellsList = await spellsResponse.json();
    console.log(`📚 ${spellsList.results.length} magias encontradas na API`);

    // 3. Buscar detalhes de cada magia e filtrar
    const validSpells = [];
    const batchSize = 10;

    for (let i = 0; i < spellsList.results.length; i += batchSize) {
      const batch = spellsList.results.slice(i, i + batchSize);
      console.log(`📖 Processando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(spellsList.results.length/batchSize)}...`);
      
      const batchPromises = batch.map(async (spellRef) => {
        try {
          const spellResponse = await fetch(`https://www.dnd5eapi.co${spellRef.url}`);
          if (!spellResponse.ok) return null;
          
          const spell = await spellResponse.json();
          
          // Filtrar apenas truques (0) e nível 1
          if (spell.level > 1) return null;
          
          // Verificar se a classe pode usar esta magia
          const canUseSpell = spell.classes?.some(spellClass => 
            spellClass.index.toLowerCase() === classIndex.toLowerCase()
          );
          
          if (!canUseSpell) return null;
          
          return spell;
        } catch (error) {
          console.warn(`⚠️ Erro ao processar magia ${spellRef.index}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      const validBatchSpells = batchResults.filter(spell => spell !== null);
      validSpells.push(...validBatchSpells);

      // Pausa entre lotes
      if (i + batchSize < spellsList.results.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`✅ ${validSpells.length} magias válidas encontradas para ${classIndex}`);
    return validSpells;
    
  } catch (error) {
    console.error(`❌ Erro ao buscar magias para ${classIndex}:`, error);
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
    if (!selectedClass) {
      setSpells([]);
      return;
    }

    const loadSpells = async () => {
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
    };

    loadSpells();
  }, [selectedClass]);

  // Filtrar magias
  const filteredSpells = spells.filter(spell => {
    // Filtro por busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!spell.name.toLowerCase().includes(searchLower) && 
          !spell.desc?.[0]?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Filtro por nível
    if (selectedLevel !== 'all' && spell.level !== selectedLevel) {
      return false;
    }

    // Filtro por escola
    if (selectedSchool !== 'all' && spell.school?.index !== selectedSchool) {
      return false;
    }

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

  // Handler para seleção
  const handleSpellSelect = (spell: DndSpell) => {
    if (!onSpellSelect) return;

    const isCurrentlySelected = selectedSpells.includes(spell.index);
    
    if (isCurrentlySelected) {
      onSpellSelect(spell);
      return;
    }

    // Verificar limites
    if (spell.level === 0 && selectedCantrips >= maxCantrips) {
      alert(`Você já selecionou o máximo de ${maxCantrips} truques`);
      return;
    }

    if (spell.level === 1 && selectedLevel1 >= maxLevel1Spells) {
      alert(`Você já selecionou o máximo de ${maxLevel1Spells} magias de 1º nível`);
      return;
    }

    onSpellSelect(spell);
  };

  // Render sem classe selecionada
  if (!selectedClass) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Selecione uma Classe
          </h3>
          <p className="text-gray-600">
            Escolha uma classe primeiro para ver as magias disponíveis
          </p>
        </div>
      </Card>
    );
  }

  // Render com erro
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao Carregar Magias</AlertTitle>
        <AlertDescription>
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Tentar Novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Magias - {selectedClass}</CardTitle>
              <p className="text-muted-foreground text-sm">
                Truques e magias de 1º nível disponíveis para sua classe
              </p>
              {isLoading && (
                <div className="flex items-center gap-2 mt-2 text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Carregando magias da API...</span>
                </div>
              )}
            </div>
            
            {showSelection && (
              <div className="text-sm text-muted-foreground">
                <div>Truques: {selectedCantrips}/{maxCantrips}</div>
                <div>Nível 1: {selectedLevel1}/{maxLevel1Spells}</div>
              </div>
            )}
          </div>
        </CardHeader>

        {/* Filtros */}
        {!isLoading && spells.length > 0 && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar magias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as 'all' | 0 | 1)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">Todos os níveis</option>
                <option value={0}>Truques</option>
                <option value={1}>1º Nível</option>
              </select>

              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">Todas as escolas</option>
                {availableSchools.map(school => (
                  <option key={school} value={school} className="capitalize">
                    {school}
                  </option>
                ))}
              </select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedLevel('all');
                  setSelectedSchool('all');
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Conteúdo */}
      {isLoading ? (
        <Card className="p-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando magias da API D&D 5e...</p>
            <p className="text-gray-500 text-sm mt-2">Isso pode levar alguns momentos</p>
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
              Esta classe não é conjuradora no 1º nível ou não possui magias de truque/1º nível
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
                    <span className="text-sm font-normal text-muted-foreground ml-2">
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
                    <span className="text-sm font-normal text-muted-foreground ml-2">
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