// ===========================
// PERSONALITY STEP - COMPONENTE REFATORADO
// src/components/character-creation/steps/PersonalityStep.tsx
// ===========================

"use client";

import { useState } from "react";
import { useCharacterCreationContext } from "@/hooks/useCharacterCreation";
import { 
  Heart, 
  User,
  Target,
  Link,
  AlertTriangle,
  Plus,
  X,
  Dice6,
  Scroll,
  Crown,
  Star,
  BookOpen,
  Feather,
  Sparkles
} from "lucide-react";

interface PersonalityOption {
  id: string;
  text: string;
  category: 'trait' | 'ideal' | 'bond' | 'flaw';
}

// Mock personality options - em produção virá do background selecionado
const mockPersonalityOptions = {
  traits: [
    "Eu julgo as pessoas pelas suas ações, não pelas suas palavras.",
    "Se alguém está em apuros, eu sempre estou pronto para dar assistência.",
    "Quando fixo minha mente em alguma coisa, sigo esse caminho, independente do que surja no meu caminho.",
    "Eu tenho um forte senso de fair play e sempre tento encontrar a solução mais equitativa para discussões.",
    "Eu sou confiante em minhas próprias habilidades e faço o que posso para incutir confiança nos outros.",
    "Pensar é para outras pessoas. Eu prefiro agir.",
    "Eu uso polissílabos para transmitir a impressão de grande erudição.",
    "Eu me acanho em situações sociais."
  ],
  ideals: [
    "Respeito. Todas as pessoas, independente da posição, merecem ser tratadas com dignidade.",
    "Equidade. Ninguém deve receber tratamento preferencial perante a lei, e ninguém está acima da lei.",
    "Liberdade. Correntes são feitas para serem quebradas, bem como aqueles que as forjariam.",
    "Poder. Se eu puder me tornar mais forte, poderei comandar qualquer situação.",
    "Fé. Eu confio que minha divindade guiará minhas ações.",
    "Aspiração. Eu busco me provar digno do favor da minha divindade ao adequar minhas ações aos seus ensinamentos.",
    "Tradição. As antigas tradições de adoração e sacrifício devem ser preservadas e defendidas.",
    "Conhecimento. O caminho para o poder e auto-aperfeiçoamento é através do conhecimento."
  ],
  bonds: [
    "Eu tenho uma família, mas não tenho ideia de onde eles estão. Espero vê-los novamente um dia.",
    "Eu trabalho a terra, amo a terra, e protegerei a terra.",
    "Um nobre orgulhoso me deu uma surra memorável, e eu buscarei minha vingança quando puder.",
    "Minhas ferramentas são símbolos da minha vida passada, e carrego elas para que eu nunca me esqueça das minhas raízes.",
    "Eu protegerei minha comunidade com minha vida.",
    "Eu devo minha vida ao sacerdote que me acolheu quando meus pais morreram.",
    "Tudo que eu faço é para o povo comum.",
    "Eu farei qualquer coisa para provar que sou superior ao meu rival odiado."
  ],
  flaws: [
    "O tirano que governa minha terra não parará por nada até me ver morto.",
    "Eu sou inflexível em meu pensamento.",
    "Eu falo sem realmente pensar nas minhas palavras, invariavelmente insultando outros.",
    "Eu não posso resistir a aceitar uma aposta ou desafio.",
    "Eu tenho uma fraqueza pelos vícios da cidade, especialmente a bebida forte.",
    "Eu não consigo manter um segredo para salvar minha vida, ou a vida de qualquer outra pessoa.",
    "Eu julgo os outros severamente, e a mim mesmo ainda mais severamente.",
    "Uma vez que alguém questiona minha coragem, eu nunca recuo, não importa quão perigosa seja a situação."
  ]
};

function PersonalitySection({ 
  title, 
  icon: Icon, 
  color, 
  description, 
  options, 
  selected, 
  onAdd, 
  onRemove, 
  maxSelections = 2 
}: {
  title: string;
  icon: any;
  color: string;
  description: string;
  options: string[];
  selected: string[];
  onAdd: (option: string) => void;
  onRemove: (option: string) => void;
  maxSelections?: number;
}) {
  const [customText, setCustomText] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const addCustom = () => {
    if (customText.trim() && selected.length < maxSelections) {
      onAdd(customText.trim());
      setCustomText('');
      setShowCustom(false);
    }
  };

  const getRandomOption = () => {
    const availableOptions = options.filter(opt => !selected.includes(opt));
    if (availableOptions.length > 0 && selected.length < maxSelections) {
      const randomOption = availableOptions[Math.floor(Math.random() * availableOptions.length)];
      onAdd(randomOption);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-white font-semibold text-lg">{title}</h4>
            <p className="text-gray-400 text-sm">{description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-sm">
            {selected.length} / {maxSelections}
          </span>
          <button
            onClick={getRandomOption}
            disabled={selected.length >= maxSelections}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              selected.length >= maxSelections
                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                : 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/50'
            }`}
          >
            <Dice6 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selected Items */}
      {selected.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-gray-300 font-medium text-sm uppercase tracking-wide">Selecionados</h5>
          {selected.map((item, index) => (
            <div 
              key={index}
              className={`p-4 bg-gradient-to-r ${color.replace('to-', 'to-')}/10 border border-current/20 rounded-xl flex items-start justify-between`}
            >
              <p className="text-gray-200 text-sm flex-1 pr-3">{item}</p>
              <button
                onClick={() => onRemove(item)}
                className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Options */}
      {selected.length < maxSelections && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="text-gray-300 font-medium text-sm uppercase tracking-wide">
              Opções Disponíveis
            </h5>
            <button
              onClick={() => setShowCustom(!showCustom)}
              className="text-sm px-3 py-1 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg transition-all border border-gray-600/50 flex items-center space-x-2"
            >
              <Plus className="w-3 h-3" />
              <span>Personalizar</span>
            </button>
          </div>

          {/* Custom Input */}
          {showCustom && (
            <div className="space-y-3">
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder={`Escreva seu próprio ${title.toLowerCase()}...`}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                rows={3}
              />
              <div className="flex space-x-2">
                <button
                  onClick={addCustom}
                  disabled={!customText.trim()}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                    customText.trim()
                      ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/50'
                      : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar</span>
                </button>
                <button
                  onClick={() => {
                    setShowCustom(false);
                    setCustomText('');
                  }}
                  className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg transition-all border border-gray-600/50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Predefined Options */}
          <div className="grid gap-3 max-h-60 overflow-y-auto custom-scrollbar">
            {options
              .filter(option => !selected.includes(option))
              .map((option, index) => (
                <div
                  key={index}
                  onClick={() => onAdd(option)}
                  className="p-3 bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/50 hover:border-gray-500/50 rounded-lg cursor-pointer transition-all text-gray-300 text-sm hover:scale-[1.01]"
                >
                  {option}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PersonalityStep() {
  const { characterData, updateCharacterData } = useCharacterCreationContext();

  const [personalityTraits, setPersonalityTraits] = useState<string[]>(
    characterData.personalityTraits || []
  );
  const [ideals, setIdeals] = useState<string[]>(
    characterData.ideals || []
  );
  const [bonds, setBonds] = useState<string[]>(
    characterData.bonds || []
  );
  const [flaws, setFlaws] = useState<string[]>(
    characterData.flaws || []
  );

  // Update character data when personality changes
  const updatePersonality = (type: string, values: string[]) => {
    const updates = {
      personalityTraits: type === 'traits' ? values : personalityTraits,
      ideals: type === 'ideals' ? values : ideals,
      bonds: type === 'bonds' ? values : bonds,
      flaws: type === 'flaws' ? values : flaws
    };
    
    updateCharacterData(updates);
    
    switch (type) {
      case 'traits':
        setPersonalityTraits(values);
        break;
      case 'ideals':
        setIdeals(values);
        break;
      case 'bonds':
        setBonds(values);
        break;
      case 'flaws':
        setFlaws(values);
        break;
    }
  };

  const addToCategory = (type: string, value: string) => {
    switch (type) {
      case 'traits':
        if (personalityTraits.length < 2) {
          updatePersonality('traits', [...personalityTraits, value]);
        }
        break;
      case 'ideals':
        if (ideals.length < 1) {
          updatePersonality('ideals', [...ideals, value]);
        }
        break;
      case 'bonds':
        if (bonds.length < 1) {
          updatePersonality('bonds', [...bonds, value]);
        }
        break;
      case 'flaws':
        if (flaws.length < 1) {
          updatePersonality('flaws', [...flaws, value]);
        }
        break;
    }
  };

  const removeFromCategory = (type: string, value: string) => {
    switch (type) {
      case 'traits':
        updatePersonality('traits', personalityTraits.filter(t => t !== value));
        break;
      case 'ideals':
        updatePersonality('ideals', ideals.filter(i => i !== value));
        break;
      case 'bonds':
        updatePersonality('bonds', bonds.filter(b => b !== value));
        break;
      case 'flaws':
        updatePersonality('flaws', flaws.filter(f => f !== value));
        break;
    }
  };

  const randomizeAll = () => {
    // Add random selections to empty categories
    if (personalityTraits.length === 0) {
      const randomTraits = mockPersonalityOptions.traits
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);
      updatePersonality('traits', randomTraits);
    }
    
    if (ideals.length === 0) {
      const randomIdeal = [mockPersonalityOptions.ideals[Math.floor(Math.random() * mockPersonalityOptions.ideals.length)]];
      updatePersonality('ideals', randomIdeal);
    }
    
    if (bonds.length === 0) {
      const randomBond = [mockPersonalityOptions.bonds[Math.floor(Math.random() * mockPersonalityOptions.bonds.length)]];
      updatePersonality('bonds', randomBond);
    }
    
    if (flaws.length === 0) {
      const randomFlaw = [mockPersonalityOptions.flaws[Math.floor(Math.random() * mockPersonalityOptions.flaws.length)]];
      updatePersonality('flaws', randomFlaw);
    }
  };

  const totalSelected = personalityTraits.length + ideals.length + bonds.length + flaws.length;
  const totalRequired = 5; // 2 traits + 1 ideal + 1 bond + 1 flaw

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Personalidade & Background</h3>
              <p className="text-pink-200 text-sm mt-1">
                Defina quem é seu personagem além das estatísticas
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{totalSelected}</div>
            <div className="text-pink-400 text-sm">de {totalRequired}</div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-pink-200">
            <strong>Background:</strong> {characterData.selectedBackground?.name || 'Não selecionado'}
          </div>
          <button
            onClick={randomizeAll}
            className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-medium rounded-xl transition-all duration-200 flex items-center space-x-2 border border-yellow-500/50"
          >
            <Dice6 className="w-4 h-4" />
            <span>Aleatorizar Tudo</span>
          </button>
        </div>
      </div>

      {/* Personality Sections */}
      <div className="grid gap-8">
        {/* Personality Traits */}
        <PersonalitySection
          title="Traços de Personalidade"
          icon={User}
          color="from-blue-500 to-blue-600"
          description="Como seu personagem se comporta e reage em diferentes situações"
          options={mockPersonalityOptions.traits}
          selected={personalityTraits}
          onAdd={(trait) => addToCategory('traits', trait)}
          onRemove={(trait) => removeFromCategory('traits', trait)}
          maxSelections={2}
        />

        {/* Ideals */}
        <PersonalitySection
          title="Ideais"
          icon={Target}
          color="from-green-500 to-green-600"
          description="Os princípios que movem e motivam seu personagem"
          options={mockPersonalityOptions.ideals}
          selected={ideals}
          onAdd={(ideal) => addToCategory('ideals', ideal)}
          onRemove={(ideal) => removeFromCategory('ideals', ideal)}
          maxSelections={1}
        />

        {/* Bonds */}
        <PersonalitySection
          title="Vínculos"
          icon={Link}
          color="from-purple-500 to-purple-600"
          description="Conexões importantes com pessoas, lugares ou eventos"
          options={mockPersonalityOptions.bonds}
          selected={bonds}
          onAdd={(bond) => addToCategory('bonds', bond)}
          onRemove={(bond) => removeFromCategory('bonds', bond)}
          maxSelections={1}
        />

        {/* Flaws */}
        <PersonalitySection
          title="Defeitos"
          icon={AlertTriangle}
          color="from-red-500 to-red-600"
          description="Fraquezas ou vícios que podem causar problemas"
          options={mockPersonalityOptions.flaws}
          selected={flaws}
          onAdd={(flaw) => addToCategory('flaws', flaw)}
          onRemove={(flaw) => removeFromCategory('flaws', flaw)}
          maxSelections={1}
        />
      </div>

      {/* Summary */}
      {totalSelected > 0 && (
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-white font-semibold">Resumo da Personalidade</h4>
          </div>
          
          <div className="prose prose-sm prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed">
              <strong>{characterData.name || 'Seu personagem'}</strong> é caracterizado por{' '}
              {personalityTraits.length > 0 && (
                <span>
                  ser alguém que{' '}
                  {personalityTraits.map((trait, index) => (
                    <span key={index}>
                      {trait.toLowerCase()}
                      {index < personalityTraits.length - 1 ? ' e ' : ''}
                    </span>
                  ))}
                </span>
              )}
              {ideals.length > 0 && (
                <span>
                  . {personalityTraits.length > 0 ? 'Seus' : 'Seus'} ideais incluem:{' '}
                  {ideals[0].toLowerCase()}
                </span>
              )}
              {bonds.length > 0 && (
                <span>
                  . {ideals.length > 0 || personalityTraits.length > 0 ? 'Além disso,' : 'Este personagem'}{' '}
                  possui vínculos importantes: {bonds[0].toLowerCase()}
                </span>
              )}
              {flaws.length > 0 && (
                <span>
                  . No entanto, possui a fraqueza de {flaws[0].toLowerCase()}
                </span>
              )}
              .
            </p>
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Progresso da Personalidade</span>
          <span className="text-white font-medium">{totalSelected}/{totalRequired}</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500"
            style={{ width: `${(totalSelected / totalRequired) * 100}%` }}
          />
        </div>
        {totalSelected < totalRequired && (
          <p className="text-gray-400 text-xs mt-2">
            Complete todos os aspectos da personalidade para prosseguir
          </p>
        )}
      </div>
    </div>
  );
}