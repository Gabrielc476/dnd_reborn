// ===========================
// DATA INDEX - CENTRALIZED MOCK DATA EXPORTS
// ===========================

// Export all mock data
export { mockRaces } from './mockRaces';
export { mockClasses } from './mockClasses';
export { mockSubraces } from './mockSubRaces';
export { mockSubclasses } from './mockSubClasses';
export { mockBackgrounds } from './mockBackgrounds';
export { mockSpells } from './mockSpells';

// Utility functions for data manipulation
export const findRaceByIndex = (races: any[], index: string) => 
  races.find(race => race.index === index);

export const findClassByIndex = (classes: any[], index: string) => 
  classes.find(cls => cls.index === index);

export const findBackgroundByIndex = (backgrounds: any[], index: string) => 
  backgrounds.find(bg => bg.index === index);

export const findSpellByIndex = (spells: any[], index: string) => 
  spells.find(spell => spell.index === index);

export const getSubracesByRace = (subraces: any[], raceIndex: string) => 
  subraces.filter(subrace => subrace.race.index === raceIndex);

export const getSubclassesByClass = (subclasses: any[], classIndex: string) => 
  subclasses.filter(subclass => subclass.class.index === classIndex);

export const getSpellsByClass = (spells: any[], classIndex: string) => 
  spells.filter(spell => 
    spell.classes.some((cls: any) => cls.index === classIndex)
  );

export const getSpellsByLevel = (spells: any[], level: number) => 
  spells.filter(spell => spell.level === level);

// Data validation helpers
export const validateRaceData = (race: any): boolean => {
  return !!(race?.index && race?.name && race?.ability_bonuses);
};

export const validateClassData = (cls: any): boolean => {
  return !!(cls?.index && cls?.name && cls?.hit_die);
};

export const validateSpellData = (spell: any): boolean => {
  return !!(spell?.index && spell?.name && spell?.level !== undefined);
};