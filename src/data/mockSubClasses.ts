// ===========================
// MOCK SUBCLASSES DATA - COMPLETE SRD
// ===========================

import { Subclass } from "@/types/character";
import { BarbarianSubclasses } from "@/data/subclasses/barbarian";
import { BardSubClasses } from "./subclasses/bard";
import { ClericSubclasses } from "./subclasses/cleric";
import { DruidSubclasses } from "./subclasses/druid";
import { FighterSubclasses } from "./subclasses/fighter";
import { MonkSubclasses } from "./subclasses/monk";
import { PaladinSubclasses } from "./subclasses/paladin";
import { RangerSubclasses } from "./subclasses/ranger";
import { RogueSubclasses } from "./subclasses/rogue";
import { SorcererSubclasses } from "./subclasses/sorcerer";
import { WarlockSubclasses } from "./subclasses/warlock";
import { WizardSubclasses } from "./subclasses/wizard";

// Definição correta do tipo
interface ClassSubclasses {
  index: string;
  subclasses: Subclass[];
}

// Exportação como array de ClassSubclasses
export const MockSubclasses: ClassSubclasses[] = [
  { index: "barbarian", subclasses: BarbarianSubclasses },
  { index: "bard", subclasses: BardSubClasses },
  { index: "cleric", subclasses: ClericSubclasses },
  { index: "druid", subclasses: DruidSubclasses },
  { index: "fighter", subclasses: FighterSubclasses },
  { index: "monk", subclasses: MonkSubclasses },
  { index: "paladin", subclasses: PaladinSubclasses },
  { index: "ranger", subclasses: RangerSubclasses },
  { index: "rogue", subclasses: RogueSubclasses },
  { index: "sorcerer", subclasses: SorcererSubclasses },
  { index: "warlock", subclasses: WarlockSubclasses },
  { index: "wizard", subclasses: WizardSubclasses }
];

// Função utilitária para obter todas as subclasses
export const getAllMockSubclasses = (): Subclass[] => {
  return MockSubclasses.flatMap(cls => cls.subclasses);
};

// Função utilitária para obter subclasses de uma classe específica
export const getSubclassesForClass = (classIndex: string): Subclass[] => {
  const classData = MockSubclasses.find(cls => cls.index === classIndex);
  return classData ? classData.subclasses : [];
};
