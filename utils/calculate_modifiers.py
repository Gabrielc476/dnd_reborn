from database.schemas.character import Character, Attributes
from typing import Dict
import math


def calculate_ability_modifier(ability_score: int) -> int:
    """
    Calcula o modificador de um atributo em D&D 5e
    Fórmula: (atributo - 10) / 2, arredondado para baixo
    """
    return math.floor((ability_score - 10) / 2)


def calculate_all_modifiers(attributes: Attributes) -> Dict[str, int]:
    """
    Calcula todos os modificadores de atributos de uma vez
    Retorna dicionário com os modificadores
    """
    return {
        "strength_mod": calculate_ability_modifier(attributes.strength),
        "dexterity_mod": calculate_ability_modifier(attributes.dexterity),
        "constitution_mod": calculate_ability_modifier(attributes.constitution),
        "intelligence_mod": calculate_ability_modifier(attributes.intelligence),
        "wisdom_mod": calculate_ability_modifier(attributes.wisdom),
        "charisma_mod": calculate_ability_modifier(attributes.charisma)
    }


def calculate_proficiency_bonus(level: int) -> int:
    """
    Calcula o bônus de proficiência baseado no nível
    Níveis 1-4: +2, 5-8: +3, 9-12: +4, 13-16: +5, 17-20: +6
    """
    if level <= 4:
        return 2
    elif level <= 8:
        return 3
    elif level <= 12:
        return 4
    elif level <= 16:
        return 5
    else:
        return 6


def calculate_skill_bonus(attribute_modifier: int, is_proficient: bool, proficiency_bonus: int) -> int:
    """
    Calcula o bônus total de uma perícia
    = modificador do atributo + (bônus de proficiência se treinado)
    """
    return attribute_modifier + (proficiency_bonus if is_proficient else 0)


def calculate_armor_class_from_dex(base_ac: int, dex_modifier: int, max_dex_bonus: int = None) -> int:
    """
    Calcula CA considerando modificador de Destreza
    max_dex_bonus para armaduras pesadas (geralmente 0) ou médias (geralmente 2)
    """
    dex_bonus = dex_modifier
    if max_dex_bonus is not None:
        dex_bonus = min(dex_modifier, max_dex_bonus)

    return base_ac + dex_bonus


def calculate_hit_points_from_constitution(base_hp: int, level: int, constitution_modifier: int) -> int:
    """
    Calcula PV considerando modificador de Constituição
    = PV base + (nível * modificador de CON)
    """
    return base_hp + (level * constitution_modifier)


def calculate_saving_throw(attribute_modifier: int, is_proficient: bool, proficiency_bonus: int) -> int:
    """
    Calcula bônus de resistência
    = modificador do atributo + (bônus de proficiência se treinado)
    """
    return attribute_modifier + (proficiency_bonus if is_proficient else 0)


def calculate_attack_bonus(attribute_modifier: int, proficiency_bonus: int, is_proficient: bool = True) -> int:
    """
    Calcula bônus de ataque
    = modificador do atributo + bônus de proficiência (se treinado)
    """
    return attribute_modifier + (proficiency_bonus if is_proficient else 0)


def calculate_spell_attack_bonus(spellcasting_modifier: int, proficiency_bonus: int) -> int:
    """
    Calcula bônus de ataque mágico
    = modificador de conjuração + bônus de proficiência
    """
    return spellcasting_modifier + proficiency_bonus


def calculate_spell_save_dc(spellcasting_modifier: int, proficiency_bonus: int) -> int:
    """
    Calcula CD de resistência contra magias
    = 8 + modificador de conjuração + bônus de proficiência
    """
    return 8 + spellcasting_modifier + proficiency_bonus


def get_spellcasting_modifier(character: Character) -> int:
    """
    Retorna o modificador de conjuração baseado na habilidade de conjuração
    """
    spellcasting_ability = character.magic.spellcasting_ability

    if spellcasting_ability == "INT":
        return calculate_ability_modifier(character.attributes.intelligence)
    elif spellcasting_ability == "WIS":
        return calculate_ability_modifier(character.attributes.wisdom)
    elif spellcasting_ability == "CHA":
        return calculate_ability_modifier(character.attributes.charisma)
    else:
        return 0


def calculate_character_stats(character: Character) -> Dict[str, any]:
    """
    Calcula todas as estatísticas derivadas de um personagem
    Retorna dicionário completo com todos os cálculos
    """
    # Modificadores de atributos
    modifiers = calculate_all_modifiers(character.attributes)

    # Bônus de proficiência
    prof_bonus = calculate_proficiency_bonus(character.basic_info.level)

    # Modificador de conjuração
    spellcasting_mod = get_spellcasting_modifier(character)

    return {
        "ability_modifiers": modifiers,
        "proficiency_bonus": prof_bonus,
        "spellcasting_modifier": spellcasting_mod,
        "spell_attack_bonus": calculate_spell_attack_bonus(spellcasting_mod,
                                                           prof_bonus) if character.magic.spellcaster else None,
        "spell_save_dc": calculate_spell_save_dc(spellcasting_mod, prof_bonus) if character.magic.spellcaster else None,
        "initiative_bonus": modifiers["dexterity_mod"]  # Iniciativa = mod DEX
    }