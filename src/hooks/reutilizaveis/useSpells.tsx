// ===========================
// HOOK USESSPELLS REUTILIZÁVEL E OTIMIZADO
// src/hooks/reutilizaveis/useSpells.tsx
// ===========================
"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DndSpell } from "@/types/characterCreation";

// ===========================
// TYPES
// ===========================

interface SpellFilters {
  classIndex?: string;
  maxLevel?: number;
  school?: string;
  searchTerm?: string;
}

interface UseSpellsOptions {
  enabled?: boolean;
  autoFetch?: boolean;
  staleTime?: number;
}

interface UseSpellsReturn {
  spells: DndSpell[];
  isLoading: boolean;
  error: Error | null;
  fetchSpells: (filters: SpellFilters) => void;
  clearSpells: () => void;
  hasSpells: boolean;
  filteredSpells: DndSpell[];
}

// ===========================
// CONSTANTS
// ===========================

const DND_API_BASE_URL = "https://www.dnd5eapi.co/api";
const DEFAULT_STALE_TIME = 30 * 60 * 1000; // 30 minutos

// ===========================
// API FUNCTIONS
// ===========================

/**
 * Busca magias otimizada por classe e nível
 */
async function fetchSpellsForClass(
  classIndex: string, 
  maxLevel: number = 9
): Promise<DndSpell[]> {
  try {
    console.log(`🎯 Buscando magias para ${classIndex} (max nível: ${maxLevel})`);

    // 1. Buscar lista de magias da classe
    const classSpellsResponse = await fetch(`${DND_API_BASE_URL}/classes/${classIndex}/spells`);
    
    if (!classSpellsResponse.ok) {
      throw new Error(`Erro ao buscar magias da classe: ${classSpellsResponse.status}`);
    }
    
    const classSpellsData = await classSpellsResponse.json();
    
    if (!classSpellsData.results?.length) {
      console.log(`📝 Nenhuma magia encontrada para ${classIndex}`);
      return [];
    }

    // 2. Buscar detalhes das magias em lotes pequenos
    const batchSize = 6;
    const allSpells: DndSpell[] = [];
    const totalBatches = Math.ceil(classSpellsData.results.length / batchSize);
    
    for (let i = 0; i < classSpellsData.results.length; i += batchSize) {
      const batch = classSpellsData.results.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      console.log(`🔄 Carregando lote ${batchNumber}/${totalBatches} (${batch.length} magias)`);
      
      const batchPromises = batch.map(async (spellRef: any, index: number) => {
        try {
          // Delay escalonado para evitar rate limiting
          await new Promise(resolve => setTimeout(resolve, index * 200));
          
          const spellResponse = await fetch(`${DND_API_BASE_URL}${spellRef.url}`);
          
          if (!spellResponse.ok) {
            console.warn(`⚠️ Erro ao buscar ${spellRef.name}: ${spellResponse.status}`);
            return null;
          }
          
          const spell: DndSpell = await spellResponse.json();
          
          // Filtrar por nível durante o carregamento para economizar memória
          if (spell.level <= maxLevel) {
            return spell;
          }
          
          return null;
          
        } catch (error) {
          console.warn(`❌ Falha ao carregar ${spellRef.name}:`, error);
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      const validSpells = batchResults.filter(Boolean) as DndSpell[];
      
      allSpells.push(...validSpells);
      
      // Delay entre lotes
      if (i + batchSize < classSpellsData.results.length) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }

    console.log(`✅ Carregadas ${allSpells.length} magias para ${classIndex}`);
    return allSpells;
    
  } catch (error) {
    console.error(`❌ Erro ao buscar magias para ${classIndex}:`, error);
    throw new Error(`Falha ao carregar magias: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Fallback: retorna magias mock básicas
 */
function getMockSpells(classIndex: string): DndSpell[] {
  console.log(`🔄 Usando magias mock para ${classIndex}`);
  
  const mockSpells: DndSpell[] = [
    {
      index: "cantrip-light",
      name: "Light",
      level: 0,
      desc: ["You touch one object that is no larger than 10 feet in any dimension."],
      higher_level: [],
      range: "Touch",
      components: ["V", "M"],
      material: "A firefly or phosphorescent moss",
      ritual: false,
      duration: "1 hour",
      concentration: false,
      casting_time: "1 action",
      school: { index: "evocation", name: "Evocation", url: "/api/magic-schools/evocation" },
      classes: [{ index: classIndex, name: classIndex, url: `/api/classes/${classIndex}` }],
      subclasses: [],
      url: "/api/spells/light"
    },
    {
      index: "magic-missile",
      name: "Magic Missile",
      level: 1,
      desc: ["You create three glowing darts of magical force."],
      higher_level: [],
      range: "120 feet",
      components: ["V", "S"],
      ritual: false,
      duration: "Instantaneous",
      concentration: false,
      casting_time: "1 action",
      school: { index: "evocation", name: "Evocation", url: "/api/magic-schools/evocation" },
      classes: [{ index: classIndex, name: classIndex, url: `/api/classes/${classIndex}` }],
      subclasses: [],
      url: "/api/spells/magic-missile"
    }
  ];
  
  return mockSpells;
}

// ===========================
// MAIN HOOK
// ===========================

export const useSpells = (
  filters: SpellFilters = {},
  options: UseSpellsOptions = {}
): UseSpellsReturn => {
  const {
    enabled = true,
    autoFetch = false,
    staleTime = DEFAULT_STALE_TIME
  } = options;

  const [currentFilters, setCurrentFilters] = useState<SpellFilters>(filters);
  const [shouldFetch, setShouldFetch] = useState(autoFetch);

  // Query Key baseada nos filtros atuais
  const queryKey = useMemo(() => [
    "spells",
    currentFilters.classIndex,
    currentFilters.maxLevel,
    currentFilters.school
  ], [currentFilters]);

  // React Query para buscar magias
  const {
    data: spells = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!currentFilters.classIndex) {
        return [];
      }

      try {
        return await fetchSpellsForClass(
          currentFilters.classIndex,
          currentFilters.maxLevel || 9
        );
      } catch (error) {
        console.warn("🔄 API falhou, usando dados mock");
        return getMockSpells(currentFilters.classIndex);
      }
    },
    enabled: enabled && shouldFetch && !!currentFilters.classIndex,
    staleTime,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Filtros adicionais em memória
  const filteredSpells = useMemo(() => {
    let filtered = spells;

    // Filtro por escola de magia
    if (currentFilters.school) {
      filtered = filtered.filter(spell => 
        spell.school.index === currentFilters.school
      );
    }

    // Filtro por termo de busca
    if (currentFilters.searchTerm) {
      const searchLower = currentFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(spell =>
        spell.name.toLowerCase().includes(searchLower) ||
        spell.desc.some(desc => desc.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [spells, currentFilters.school, currentFilters.searchTerm]);

  // Função para buscar magias com novos filtros
  const fetchSpells = useCallback((newFilters: SpellFilters) => {
    console.log("🎯 Iniciando busca de magias:", newFilters);
    setCurrentFilters(newFilters);
    setShouldFetch(true);
  }, []);

  // Função para limpar magias
  const clearSpells = useCallback(() => {
    setCurrentFilters({});
    setShouldFetch(false);
  }, []);

  return {
    spells,
    isLoading,
    error: error as Error | null,
    fetchSpells,
    clearSpells,
    hasSpells: spells.length > 0,
    filteredSpells,
  };
};

// ===========================
// HOOK ESPECÍFICO PARA CRIAÇÃO DE PERSONAGEM
// ===========================

export const useCharacterSpells = (characterData: {
  selectedClass?: { index: string } | null;
  level: number;
  isSpellcaster: boolean;
}) => {
  const maxSpellLevel = useMemo(() => {
    if (!characterData.isSpellcaster || !characterData.selectedClass) return 0;
    
    const classIndex = characterData.selectedClass.index;
    const level = characterData.level;

    // Lógica para calcular nível máximo de magia baseado na classe e nível
    switch (classIndex) {
      case "wizard":
      case "sorcerer":
      case "cleric":
      case "druid":
      case "bard":
        // Conjuradores completos
        return Math.min(9, Math.ceil(level / 2));
      
      case "paladin":
      case "ranger":
        // Meio-conjuradores
        if (level < 2) return 0;
        return Math.min(5, Math.ceil((level - 1) / 4) + 1);
      
      case "warlock":
        // Warlock tem progressão especial
        if (level >= 9) return 5;
        if (level >= 7) return 4;
        if (level >= 5) return 3;
        if (level >= 3) return 2;
        return 1;
      
      default:
        return 0;
    }
  }, [characterData.selectedClass, characterData.level, characterData.isSpellcaster]);

  const spellsHook = useSpells({
    classIndex: characterData.selectedClass?.index,
    maxLevel: maxSpellLevel,
  }, {
    enabled: characterData.isSpellcaster,
    autoFetch: false, // Só busca quando solicitado
  });

  return {
    ...spellsHook,
    maxSpellLevel,
    canCastSpells: characterData.isSpellcaster && maxSpellLevel > 0,
  };
};