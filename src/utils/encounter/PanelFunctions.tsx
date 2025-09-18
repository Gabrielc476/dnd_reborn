// utils/encounter/PanelFunctions.tsx
import { EnhancedNPC } from '@/types/enhancedNPC';
import { Character } from '@/types/character';

// Funções de manipulação de HP
export const handleHeal = (
  currentHPState: Record<string, number>,
  setCurrentHP: React.Dispatch<React.SetStateAction<Record<string, number>>>,
  id: string,
  amount: number,
  maxHPState: Record<string, number>
) => {
  const currentHP = currentHPState[id] || 0;
  const maxHP = maxHPState[id] || 0;
  const newHP = Math.min(currentHP + amount, maxHP);
  setCurrentHP(prev => ({ ...prev, [id]: newHP }));
};

export const handleDamage = (
  currentHPState: Record<string, number>,
  setCurrentHP: React.Dispatch<React.SetStateAction<Record<string, number>>>,
  id: string,
  amount: number
) => {
  const currentHP = currentHPState[id] || 0;
  const newHP = Math.max(currentHP - amount, 0);
  setCurrentHP(prev => ({ ...prev, [id]: newHP }));
};

export const handleKill = (
  setCurrentHP: React.Dispatch<React.SetStateAction<Record<string, number>>>,
  id: string
) => {
  setCurrentHP(prev => ({ ...prev, [id]: 0 }));
};

export const handleRevive = (
  setCurrentHP: React.Dispatch<React.SetStateAction<Record<string, number>>>,
  id: string,
  maxHP: number
) => {
  setCurrentHP(prev => ({ ...prev, [id]: maxHP }));
};

// Funções de controle de turno
export const getCombatantsCount = (
  npcs: EnhancedNPC[],
  characters: Character[],
  npcCurrentHP: Record<string, number>,
  characterCurrentHP: Record<string, number>
) => {
  return Math.max(
    1, 
    [...npcs, ...characters].filter(c => {
      const currentHP = c.id in npcCurrentHP ? npcCurrentHP[c.id] : 
                       c.id in characterCurrentHP ? characterCurrentHP[c.id] : 
                       'current_hit_points' in c ? c.current_hit_points : 
                       'stats' in c ? c.stats.hit_points : 0;
      return currentHP > 0;
    }).length
  );
};

// Outras funções utilitárias
export const handleEditNPC = (npcId: string) => {
  console.log(`Editar NPC: ${npcId}`);
};

export const handleDeleteNPC = (npcId: string) => {
  if (window.confirm('Tem certeza que deseja excluir este NPC?')) {
    console.log(`Excluir NPC: ${npcId}`);
  }
};

export const handleAttackRoll = (npcId: string, attackId: string, options?: any) => {
  console.log(`NPC ${npcId} rolou ataque ${attackId}`, options);
};

export const handleDamageRoll = (npcId: string, attackId: string, options?: any) => {
  console.log(`NPC ${npcId} rolou dano ${attackId}`, options);
};