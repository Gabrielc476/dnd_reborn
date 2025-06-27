// ===========================
// SPELLS STEP - COMPONENTE REFATORADO
// src/components/character-creation/steps/SpellsStep.tsx
// ===========================

"use client";

import { useState, useEffect } from "react";
import { useCharacterCreationContext } from "@/hooks/useCharacterCreation";
import { 
  Sparkles, 
  Wand2,
  Search,
  CheckCircle,
  Circle,
  Info,
  Star,
  Zap,
  Target,
  Book,
  Flame,
  Snowflake,
  Shield as ShieldIcon,
  Heart,
  Eye,
  Crown,
  Filter
} from "lucide-react";

interface Spell {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  duration: string;
  components: string[];
  description: string;
  damage?: string;
  saveType?: string;
  isCantrip: boolean;
  concentration: boolean;
  ritual: boolean;
}

// Mock data - em produção virá da API
const mockSpells: Spell[] = [
  // Cantrips
  {
    id: 'fire-bolt',
    name: 'Rajada de Fogo',
    level: 0,
    school: 'Evocação',
    castingTime: '1 ação',
    range: '120 pés',
    duration: 'Instantâneo',
    components: ['V', 'S'],
    description: 'Você arremessa um fragmento de fogo na direção de uma criatura ou objeto ao alcance.',
    damage: '1d10 dano de fogo',
    isCantrip: true,
    concentration: false,
    ritual: false
  },
  {
    id: 'mage-hand',
    name: 'Mão Arcana',
    level: 0,
    school: 'Conjuração',
    castingTime: '1 ação',
    range: '30 pés',
    duration: '1 minuto',
    components: ['V', 'S'],
    description: 'Uma mão espectral flutuante aparece em um ponto à sua escolha dentro do alcance.',
    isCantrip: true,
    concentration: false,
    ritual: false
  },
  {
    id: 'prestidigitation',
    name: 'Prestidigitação',
    level: 0,
    school: 'Transmutação',
    castingTime: '1 ação',
    range: '10 pés',
    duration: '1 hora',
    components: ['V', 'S'],
    description: 'Este truque permite que você execute diversos efeitos menores de magia.',
    isCantrip: true,
    concentration: false,
    ritual: false
  },
  // 1st Level
  {
    id: 'magic-missile',
    name: 'Míssil Mágico',
    level: 1,
    school: 'Evocação',
    castingTime: '1 ação',
    range: '120 pés',
    duration: 'Instantâneo',
    components: ['V', 'S'],
    description: 'Você cria três dardos brilhantes de energia mágica.',
    damage: '1d4+1 dano energético por dardo',
    isCantrip: false,
    concentration: false,
    ritual: false
  },
  {
    id: 'shield',
    name: 'Escudo',
    level: 1,
    school: 'Abjuração',
    castingTime: '1 reação',
    range: 'Pessoal',
    duration: '1 rodada',
    components: ['V', 'S'],
    description: 'Uma barreira invisível de energia mágica aparece e o protege.',
    isCantrip: false,
    concentration: false,
    ritual: false
  },
  {
    id: 'cure-wounds',
    name: 'Curar Ferimentos',
    level: 1,
    school: 'Evocação',
    castingTime: '1 ação',
    range: 'Toque',
    duration: 'Instantâneo',
    components: ['V', 'S'],
    description: 'Uma criatura que você tocar recupera pontos de vida.',
    damage: '1d8 + mod. habilidade de cura',
    isCantrip: false,
    concentration: false,
    ritual: false
  }
];

const spellSchools = {
  'Abjuração': { icon: ShieldIcon, color: 'from-blue-500 to-blue-600' },
  'Conjuração': { icon: Crown, color: 'from-purple-500 to-purple-600' },
  'Adivinhação': { icon: Eye, color: 'from-indigo-500 to-indigo-600' },
  'Encantamento': { icon: Heart, color: 'from-pink-500 to-pink-600' },
  'Evocação': { icon: Flame, color: 'from-red-500 to-red-600' },
  'Ilusão': { icon: Sparkles, color: 'from-violet-500 to-violet-600' },
  'Necromancia': { icon: Sparkles, color: 'from-gray-500 to-gray-600' },
  'Transmutação': { icon: Zap, color: 'from-yellow-500 to-yellow-600' }
};

function SpellCard({ 
  spell, 
  isSelected, 
  onToggle,
  canSelect 
}: { 
  spell: Spell; 
  isSelected: boolean; 
  onToggle: () => void;
  canSelect: boolean;
}) {
  const school = spellSchools[spell.school] || spellSchools['Evocação'];
  const SchoolIcon = school.icon;
  const isDisabled = !canSelect && !isSelected;

  return (
    <div
      onClick={canSelect || isSelected ? onToggle : undefined}
      className={`p-4 rounded-xl border transition-all duration-200 ${
        isDisabled
          ? 'opacity-50 cursor-not-allowed bg-gray-800/30 border-gray-700/50'
          : isSelected
          ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/25 cursor-pointer hover:scale-[1.02]'
          : 'bg-gray-700/30 border-gray-600/50 hover:bg-gray-700/50 cursor-pointer hover:scale-[1.02] hover:border-gray-500/50'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${school.color} rounded-xl flex items-center justify-center shadow-lg`}>
            <SchoolIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-white font-medium">{spell.name}</h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs px-2 py-1 bg-gray-600/50 rounded-lg text-gray-300">
                {spell.isCantrip ? 'Cantrip' : `Nível ${spell.level}`}
              </span>
              <span className="text-xs px-2 py-1 bg-purple-500/20 rounded-lg text-purple-300 border border-purple-500/30">
                {spell.school}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0">
          {isSelected ? (
            <CheckCircle className="w-6 h-6 text-purple-400" />
          ) : (
            <Circle className={`w-6 h-6 ${isDisabled ? 'text-gray-600' : 'text-gray-400'}`} />
          )}
        </div>
      </div>

      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
        {spell.description}
      </p>

      {/* Spell Details */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Tempo:</span>
            <span className="text-gray-300 ml-1">{spell.castingTime}</span>
          </div>
          <div>
            <span className="text-gray-500">Alcance:</span>
            <span className="text-gray-300 ml-1">{spell.range}</span>
          </div>
          <div>
            <span className="text-gray-500">Duração:</span>
            <span className="text-gray-300 ml-1">{spell.duration}</span>
          </div>
          <div>
            <span className="text-gray-500">Componentes:</span>
            <span className="text-gray-300 ml-1">{spell.components.join(', ')}</span>
          </div>
        </div>

        {spell.damage && (
          <div className="text-sm">
            <span className="text-gray-500">Efeito:</span>
            <span className="text-yellow-400 ml-1 font-medium">{spell.damage}</span>
          </div>
        )}

        {/* Spell Tags */}
        <div className="flex flex-wrap gap-1 pt-2">
          {spell.concentration && (
            <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-300 rounded border border-orange-500/30">
              Concentração
            </span>
          )}
          {spell.ritual && (
            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
              Ritual
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SpellsStep() {
  const { characterData, updateCharacterData } = useCharacterCreationContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<number | 'all'>('all');
  const [filterSchool, setFilterSchool] = useState<string>('all');
  const [selectedSpells, setSelectedSpells] = useState<string[]>([]);
  const [selectedCantrips, setSelectedCantrips] = useState<string[]>([]);

  // Check if class is a spellcaster
  const isSpellcaster = characterData.selectedClass?.spellcasting != null;
  
  // Mock spell slots - em produção virá do contexto
  const cantripsKnown = isSpellcaster ? 2 : 0;
  const level1SpellsKnown = isSpellcaster ? 2 : 0;
  const maxSpellLevel = 1; // Para nível 1

  const handleSpellToggle = (spellId: string, isCantrip: boolean) => {
    if (isCantrip) {
      setSelectedCantrips(prev =>
        prev.includes(spellId)
          ? prev.filter(id => id !== spellId)
          : prev.length < cantripsKnown
          ? [...prev, spellId]
          : prev
      );
    } else {
      setSelectedSpells(prev =>
        prev.includes(spellId)
          ? prev.filter(id => id !== spellId)
          : prev.length < level1SpellsKnown
          ? [...prev, spellId]
          : prev
      );
    }
  };

  // Filter spells
  const filteredSpells = mockSpells.filter(spell => {
    const matchesSearch = spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spell.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || spell.level === filterLevel;
    const matchesSchool = filterSchool === 'all' || spell.school === filterSchool;
    return matchesSearch && matchesLevel && matchesSchool;
  });

  const cantrips = filteredSpells.filter(spell => spell.isCantrip);
  const levelSpells = filteredSpells.filter(spell => !spell.isCantrip && spell.level <= maxSpellLevel);

  // Early return if not a spellcaster
  if (!isSpellcaster) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Wand2 className="w-10 h-10 text-gray-500" />
        </div>
        <h3 className="text-gray-400 font-semibold text-xl mb-3">Classe Não-Conjuradora</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          A classe selecionada ({characterData.selectedClass?.name}) não possui habilidades de conjuração.
          Você pode pular esta etapa.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Seleção de Magias</h3>
              <p className="text-purple-200 text-sm mt-1">
                Escolha seus feitiços iniciais como {characterData.selectedClass?.name}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {selectedCantrips.length + selectedSpells.length}
            </div>
            <div className="text-purple-400 text-sm">Magias</div>
          </div>
        </div>
        
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-purple-200 text-sm">Cantrips:</span>
            <span className="text-purple-200 font-medium">
              {selectedCantrips.length} / {cantripsKnown}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-purple-200 text-sm">Magias de 1º Nível:</span>
            <span className="text-purple-200 font-medium">
              {selectedSpells.length} / {level1SpellsKnown}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar magias..."
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>

          {/* Level Filter */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
          >
            <option value="all">Todos os Níveis</option>
            <option value={0}>Cantrips</option>
            <option value={1}>1º Nível</option>
          </select>

          {/* School Filter */}
          <select
            value={filterSchool}
            onChange={(e) => setFilterSchool(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
          >
            <option value="all">Todas as Escolas</option>
            {Object.keys(spellSchools).map(school => (
              <option key={school} value={school}>{school}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cantrips Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-semibold text-lg flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <span>Cantrips (Nível 0)</span>
          </h4>
          
          <div className="text-sm text-gray-400">
            {selectedCantrips.length} / {cantripsKnown} selecionados
          </div>
        </div>

        {cantrips.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {cantrips.map((spell) => (
              <SpellCard
                key={spell.id}
                spell={spell}
                isSelected={selectedCantrips.includes(spell.id)}
                onToggle={() => handleSpellToggle(spell.id, true)}
                canSelect={selectedCantrips.length < cantripsKnown}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Book className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum cantrip encontrado com os filtros atuais</p>
          </div>
        )}
      </div>

      {/* Level 1 Spells Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-semibold text-lg flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            <span>Magias de 1º Nível</span>
          </h4>
          
          <div className="text-sm text-gray-400">
            {selectedSpells.length} / {level1SpellsKnown} selecionadas
          </div>
        </div>

        {levelSpells.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {levelSpells.map((spell) => (
              <SpellCard
                key={spell.id}
                spell={spell}
                isSelected={selectedSpells.includes(spell.id)}
                onToggle={() => handleSpellToggle(spell.id, false)}
                canSelect={selectedSpells.length < level1SpellsKnown}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Book className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma magia de 1º nível encontrada com os filtros atuais</p>
          </div>
        )}
      </div>

      {/* Selected Spells Summary */}
      {(selectedCantrips.length > 0 || selectedSpells.length > 0) && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-white font-semibold">Magias Selecionadas</h4>
          </div>
          
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="text-blue-400 text-xs uppercase tracking-wide">Cantrips</div>
                <div className="text-white font-bold text-lg">{selectedCantrips.length}</div>
              </div>
              <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="text-purple-400 text-xs uppercase tracking-wide">Magias de 1º Nível</div>
                <div className="text-white font-bold text-lg">{selectedSpells.length}</div>
              </div>
            </div>

            {/* Spell Lists */}
            <div className="grid md:grid-cols-2 gap-6">
              {selectedCantrips.length > 0 && (
                <div>
                  <h5 className="text-blue-400 font-medium mb-3">Cantrips</h5>
                  <div className="space-y-2">
                    {selectedCantrips.map(spellId => {
                      const spell = mockSpells.find(s => s.id === spellId);
                      if (!spell) return null;
                      
                      return (
                        <div key={spellId} className="flex items-center justify-between p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <span className="text-blue-300 font-medium">{spell.name}</span>
                          <span className="text-blue-400 text-sm">{spell.school}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedSpells.length > 0 && (
                <div>
                  <h5 className="text-purple-400 font-medium mb-3">Magias de 1º Nível</h5>
                  <div className="space-y-2">
                    {selectedSpells.map(spellId => {
                      const spell = mockSpells.find(s => s.id === spellId);
                      if (!spell) return null;
                      
                      return (
                        <div key={spellId} className="flex items-center justify-between p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                          <span className="text-purple-300 font-medium">{spell.name}</span>
                          <span className="text-purple-400 text-sm">{spell.school}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info about spell slots */}
      <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
        <div className="flex items-center space-x-3">
          <Info className="w-5 h-5 text-blue-400" />
          <div>
            <h5 className="text-blue-400 font-medium">Sobre Conjuração</h5>
            <p className="text-gray-300 text-sm">
              Como {characterData.selectedClass?.name} de nível {characterData.level}, você tem {level1SpellsKnown} espaços 
              de magia de 1º nível e conhece {cantripsKnown} cantrips. Cantrips podem ser usados à vontade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}