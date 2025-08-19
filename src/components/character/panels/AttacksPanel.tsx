import { useState, useEffect, useCallback } from "react";
import { Character, EquipmentItem, Spell } from "@/types/character";
import DiceRollModal from "@/components/DiceRollModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sword, Wand2, Loader2 } from "lucide-react";

const AttacksPanel = ({ character }: { character: Character }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    diceRoll: number;
    modifier: number;
    total: number;
    isCritical: boolean;
    isCriticalFailure: boolean;
    attributeName: string;
    isSpell?: boolean;
    spellName?: string;
    spellLevel?: number;
    damage?: string;
    isSavingThrow?: boolean;
    savingThrowAbility?: string;
    savingThrowDC?: number;
  } | null>(null);
  const [lastAttack, setLastAttack] = useState<{
    name: string;
    isCritical: boolean;
    isSpell?: boolean;
  } | null>(null);
  const [weapons, setWeapons] = useState<EquipmentItem[]>([]);
  const [attackSpells, setAttackSpells] = useState<Spell[]>([]);
  const [loadingWeapons, setLoadingWeapons] = useState(true);
  const [loadingSpells, setLoadingSpells] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeaponDetails = useCallback(async (item: EquipmentItem) => {
    try {
      const index = item.index;
      const response = await fetch(`https://www.dnd5eapi.co/api/2014/equipment/${index}`);
      
      if (!response.ok) {
        throw new Error('Item não encontrado na API');
      }
      
      const data = await response.json();
      return {
        ...item,
        weapon_category: data.weapon_category,
        damage: data.damage,
        properties: data.properties,
        weapon_range: data.weapon_range
      };
    } catch (err) {
      console.error(`Erro ao buscar detalhes da arma ${item.name}:`, err);
      return null;
    }
  }, []);

  const fetchSpellDetails = useCallback(async (spell: Spell) => {
    try {
      const index = spell.name;
      const response = await fetch(`https://www.dnd5eapi.co/api/2014/spells/${index}`);
      
      if (!response.ok) {
        throw new Error('Magia não encontrada na API');
      }
      
      const data = await response.json();
      
      // Adaptação para magias de saving throw como Burning Hands
      const isAttackSpell = !!data.attack_type || !!data.damage;
      const damageType = data.damage?.damage_type?.name || "N/A";
      
      // Extrair dano base (nível 1) para magias com dano escalável
      let baseDamage = "N/A";
      if (data.damage?.damage_at_slot_level) {
        baseDamage = data.damage.damage_at_slot_level["1"] || Object.values(data.damage.damage_at_slot_level)[0];
      } else if (data.damage?.damage_dice) {
        baseDamage = data.damage.damage_dice;
      }
      
      return {
        ...spell,
        name: data.name,
        level: data.level,
        school: data.school?.name || "N/A",
        description: data.desc?.join("\n\n") || "",
        is_attack_spell: isAttackSpell,
        damage: baseDamage !== "N/A" ? {
          damage_dice: baseDamage,
          damage_type: damageType
        } : null,
        save_dc: data.dc?.dc_value || null,
        save_ability: data.dc?.dc_type?.name || null,
        range: data.range || "N/A"
      };
    } catch (err) {
      console.error(`Erro ao buscar detalhes da magia ${spell.name}:`, err);
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchWeaponsData = async () => {
      setLoadingWeapons(true);
      const weaponsData: EquipmentItem[] = [];
      
      for (const item of character.equipment) {
        const detailedItem = await fetchWeaponDetails(item);
        if (detailedItem && detailedItem.weapon_category) {
          weaponsData.push(detailedItem);
        }
      }
      
      setWeapons(weaponsData);
      setLoadingWeapons(false);
    };

    fetchWeaponsData();
  }, [character.equipment, fetchWeaponDetails]);

  useEffect(() => {
    const fetchSpellsData = async () => {
      setLoadingSpells(true);
      const spellsData: Spell[] = [];
      
      for (const spell of character.magic.known_spells) {
        const detailedSpell = await fetchSpellDetails(spell);
        if (detailedSpell && detailedSpell.is_attack_spell) {
          spellsData.push(detailedSpell);
        }
      }
      
      setAttackSpells(spellsData);
      setLoadingSpells(false);
    };

    fetchSpellsData();
  }, [character.magic.known_spells, fetchSpellDetails]);

  const rollDice = (sides: number, count: number = 1) => {
    let total = 0;
    for (let i = 0; i < count; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    return total;
  };

  const getAbilityModifier = (abilityScore: number) => {
    return Math.floor((abilityScore - 10) / 2);
  };

  const proficiencyBonus = character.calculated_stats?.proficiency_bonus || 0;

  const getWeaponAttribute = (weapon: EquipmentItem) => {
    if (!weapon.properties) {
      return "strength";
    }

    const isFinesse = weapon.properties.some(
      (prop) => prop.index === "finesse"
    );
    const isRanged = weapon.weapon_range === "Ranged";

    if (isRanged) {
      return "dexterity";
    }

    if (isFinesse) {
      const strMod = getAbilityModifier(character.attributes.strength);
      const dexMod = getAbilityModifier(character.attributes.dexterity);
      return strMod >= dexMod ? "strength" : "dexterity";
    }

    return "strength";
  };

  const getWeaponAttackBonus = (weapon: EquipmentItem) => {
    const attribute = getWeaponAttribute(weapon);
    const abilityModifier = getAbilityModifier(character.attributes[attribute]);
    return abilityModifier + proficiencyBonus;
  };

  const getWeaponDamage = (weapon: EquipmentItem) => {
    const attribute = getWeaponAttribute(weapon);
    const abilityModifier = getAbilityModifier(character.attributes[attribute]);
    
    if (!weapon.damage) {
      return {
        diceCount: 0,
        diceSides: 0,
        modifier: abilityModifier,
      };
    }

    const diceString = weapon.damage.damage_dice;
    const [diceCount, diceSides] = diceString.split('d').map(Number);

    return {
      diceCount,
      diceSides,
      modifier: abilityModifier,
    };
  };

  const getSpellAttackBonus = () => {
    if (!character.magic.spellcasting_ability) return 0;
    const abilityModifier = getAbilityModifier(
      character.attributes[character.magic.spellcasting_ability as keyof typeof character.attributes]
    );
    return abilityModifier + proficiencyBonus;
  };

  const handleWeaponAttack = (weapon: EquipmentItem) => {
    const attackBonus = getWeaponAttackBonus(weapon);
    const roll = rollDice(20);
    const isCritical = roll === 20;
    const isCriticalFailure = roll === 1;
    const total = roll + attackBonus;

    setModalContent({
      title: `Ataque com ${weapon.name}`,
      diceRoll: roll,
      modifier: attackBonus,
      total,
      isCritical,
      isCriticalFailure,
      attributeName: getWeaponAttribute(weapon) === "strength" ? "Força" : "Destreza",
    });
    setIsModalOpen(true);
    setLastAttack({
      name: weapon.name,
      isCritical,
    });
  };

  const handleWeaponDamage = (weapon: EquipmentItem) => {
    const damageInfo = getWeaponDamage(weapon);
    let diceCount = damageInfo.diceCount;
    let diceSides = damageInfo.diceSides;
    let modifier = damageInfo.modifier;

    if (lastAttack?.name === weapon.name && lastAttack?.isCritical) {
      diceCount *= 2;
    }

    const roll = rollDice(diceSides, diceCount);
    const total = roll + modifier;

    setModalContent({
      title: `Dano com ${weapon.name}`,
      diceRoll: roll,
      modifier,
      total,
      isCritical: lastAttack?.isCritical || false,
      isCriticalFailure: false,
      attributeName: getWeaponAttribute(weapon) === "strength" ? "Força" : "Destreza",
    });
    setIsModalOpen(true);
  };

  const handleSpellAttack = (spell: Spell) => {
    // Magias que requerem saving throw (como Burning Hands)
    if (spell.save_dc) {
      setModalContent({
        title: `Conjurar ${spell.name}`,
        diceRoll: 0,
        modifier: 0,
        total: spell.save_dc,
        isCritical: false,
        isCriticalFailure: false,
        attributeName: "CD de Salvamento",
        isSpell: true,
        spellName: spell.name,
        spellLevel: spell.level,
        isSavingThrow: true,
        savingThrowAbility: spell.save_ability || "Desconhecido",
        savingThrowDC: spell.save_dc
      });
      setIsModalOpen(true);
      setLastAttack({
        name: spell.name,
        isCritical: false,
        isSpell: true
      });
      return;
    }

    // Magias que requerem ataque normal
    const attackBonus = getSpellAttackBonus();
    const roll = rollDice(20);
    const isCritical = roll === 20;
    const isCriticalFailure = roll === 1;
    const total = roll + attackBonus;

    setModalContent({
      title: `Ataque com ${spell.name}`,
      diceRoll: roll,
      modifier: attackBonus,
      total,
      isCritical,
      isCriticalFailure,
      attributeName: character.magic.spellcasting_ability
        ? character.magic.spellcasting_ability.charAt(0).toUpperCase() +
          character.magic.spellcasting_ability.slice(1)
        : "Magia",
      isSpell: true,
      spellName: spell.name,
      spellLevel: spell.level,
    });
    setIsModalOpen(true);
    setLastAttack({
      name: spell.name,
      isCritical,
      isSpell: true
    });
  };

  const handleSpellDamage = (spell: Spell) => {
    if (!spell.damage) return;

    let diceCount = 0;
    let diceSides = 0;
    let modifier = 0;
    
    // Extrair dados de dano da string (ex: "3d6")
    const diceMatch = spell.damage.damage_dice.match(/(\d+)d(\d+)/);
    if (diceMatch) {
      diceCount = parseInt(diceMatch[1], 10);
      diceSides = parseInt(diceMatch[2], 10);
    }
    
    // Verificar se há modificador (ex: "3d6+2")
    const modifierMatch = spell.damage.damage_dice.match(/[+-]\d+$/);
    if (modifierMatch) {
      modifier = parseInt(modifierMatch[0], 10);
    }

    // Dobrar dados em crítico
    if (lastAttack?.name === spell.name && lastAttack?.isCritical && lastAttack?.isSpell) {
      diceCount *= 2;
    }

    const roll = rollDice(diceSides, diceCount);
    const total = roll + modifier;

    setModalContent({
      title: `Dano com ${spell.name}`,
      diceRoll: roll,
      modifier,
      total,
      isCritical: lastAttack?.isCritical || false,
      isCriticalFailure: false,
      isSpell: true,
      spellName: spell.name,
      spellLevel: spell.level,
      damage: `${diceCount}d${diceSides}${modifier >= 0 ? '+' : ''}${modifier}`,
      attributeName: spell.damage.damage_type || "Dano",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Ataques e Magias</h2>
      
      {/* Ataques com Armas */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Sword className="w-6 h-6 text-red-500" />
          <CardTitle>Ataques com Armas</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingWeapons ? (
            <div className="flex justify-center items-center gap-2 text-gray-500">
              <Loader2 className="animate-spin" />
              <span>Carregando armas...</span>
            </div>
          ) : weapons.length > 0 ? (
            <div className="space-y-4">
              {weapons.map((weapon) => (
                <div key={weapon.index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{weapon.name}</h3>
                      {weapon.damage && (
                        <p className="text-sm text-gray-500">
                          {weapon.damage.damage_dice} {weapon.damage.damage_type?.name || "Tipo de dano"}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleWeaponAttack(weapon)}
                      >
                        Atacar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleWeaponDamage(weapon)}
                        disabled={!lastAttack || lastAttack.name !== weapon.name}
                      >
                        Dano
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Nenhuma arma equipada</p>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Magias de Ataque */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Wand2 className="w-6 h-6 text-purple-500" />
          <CardTitle>Magias de Ataque</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSpells ? (
            <div className="flex justify-center items-center gap-2 text-gray-500">
              <Loader2 className="animate-spin" />
              <span>Carregando magias...</span>
            </div>
          ) : attackSpells.length > 0 ? (
            <div className="space-y-4">
              {attackSpells.map((spell) => (
                <div key={spell.name} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{spell.name}</h3>
                      <p className="text-sm text-gray-500">
                        Nível {spell.level} • {spell.school}
                        {spell.damage && spell.damage.damage_type && (
                          ` • ${spell.damage.damage_dice} ${spell.damage.damage_type}`
                        )}
                        {spell.save_dc && spell.save_ability && (
                          ` • CD ${spell.save_dc} (${spell.save_ability})`
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleSpellAttack(spell)}
                      >
                        {spell.save_dc ? "Conjurar" : "Atacar"}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleSpellDamage(spell)}
                        disabled={!lastAttack || lastAttack.name !== spell.name}
                      >
                        Dano
                      </Button>
                    </div>
                  </div>
                  {spell.description && (
                    <p className="mt-2 text-sm text-gray-600">
                      {spell.description.split('\n\n')[0]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>Nenhuma magia de ataque conhecida</p>
          )}
        </CardContent>
      </Card>

      {/* Modal de Rolagem de Dados */}
      {isModalOpen && modalContent && (
        <DiceRollModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={modalContent.title}
          diceRoll={modalContent.diceRoll}
          modifier={modalContent.modifier}
          total={modalContent.total}
          isCritical={modalContent.isCritical}
          isCriticalFailure={modalContent.isCriticalFailure}
          attributeName={modalContent.attributeName}
          isSpell={modalContent.isSpell}
          spellName={modalContent.spellName}
          spellLevel={modalContent.spellLevel}
          damage={modalContent.damage}
          isSavingThrow={modalContent.isSavingThrow}
          savingThrowAbility={modalContent.savingThrowAbility}
          savingThrowDC={modalContent.savingThrowDC}
        />
      )}
    </div>
  );
};

export default AttacksPanel;