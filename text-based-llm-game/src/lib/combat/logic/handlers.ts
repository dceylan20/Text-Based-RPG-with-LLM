// src/lib/combat/logic/handlers.ts

import { Character } from "@/lib/types/character";
import { AttackResult } from "@/lib/types/combat";
import { performAttack } from "../engine/combatEngine";
import { CharacterClass } from "@/lib/types/character";
import { useClassAbility } from "../abilities/classAbilities";


/**
 * Kullanıcının yazdığı aksiyona göre ilgili combat fonksiyonunu çalıştırır.
 */
export function handleCombatAction(
  action: string,
  player: Character,
  enemy: Character
): AttackResult {
  const normalized = action.toLowerCase();

    if (normalized.includes("special")) {
        const skills = classSkills[player.characterClass] || [];
        const specialSkill = skills[0]; // Şimdilik ilk skill özel sayılıyor
        return specialSkill.execute(player, enemy);
    }

    
    


  if (normalized.includes("dodge")) {
    const dodgeChance = 0.3 + player.speed / 100; // örneğin Speed 15 için %65
    const roll = Math.random();
    const success = roll < dodgeChance;

    return {
      damage: 0,
      isCritical: false,
      isEvaded: success,
      log: success
        ? `🌀 ${player.name} prepares to dodge the next attack!`
        : `😓 ${player.name} tried to dodge but failed.`,
    };
  }

  if (normalized.includes("attack")) {
    return performAttack(player, enemy);
  }

  return {
    damage: 0,
    isCritical: false,
    isEvaded: false,
    log: `❓ Unknown combat action: "${action}"`,
  };
}



