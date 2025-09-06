// // src/lib/combat/engine/combatEngine.ts
import { Character } from "@/lib/types/character";
import { AttackResult } from "@/lib/types/combat";
import { handleCombatAction } from "../logic/handlers";

/**
 * Tek bir fiziksel saldırı turunu hesaplar.
 */
export function performAttack(
  attacker: Character,
  defender: Character,
  targetIsDodging: boolean = false
): AttackResult {
  // 🎯 Dodge modu aktifse saldırı tamamen boşa gider
  if (targetIsDodging) {
    return {
      damage: 0,
      isCritical: false,
      isEvaded: true,
      log: `🌀 ${defender.name} gracefully dodged the attack!`,
    };
  }

  const hitChance = 50 + attacker.accuracy * 2;
  const evadeChance = defender.speed;

  const hitRoll = Math.random() * 100;
  if (hitRoll < evadeChance) {
    return {
      damage: 0,
      isCritical: false,
      isEvaded: true,
      log: `⚡ ${defender.name} dodged the attack!`,
    };
  }

  // 💥 Kritik vurma ihtimali
  const critRoll = Math.random();
  const isCritical = critRoll < 0.1;


  const rawDamage = attacker.strength *2 - defender.defence;
  const baseDamage = Math.max(0, rawDamage * (isCritical ? 2 : 1));
  const variation = 0.75 + Math.random() * 0.5;
  const finalDamage = Math.max(3, Math.round(baseDamage * variation));

  

  return {
    damage: finalDamage,
    isCritical,
    isEvaded: false,
    log: `🗡️ ${attacker.name} hit ${defender.name} for ${finalDamage} damage${isCritical ? " (CRITICAL!)" : ""}.`,
  };
}


/**
 * Her inputta bir tur savaş oynatır. (Turn-based combat loop)
 */
export function playTurn(
  player: Character,
  enemy: Character,
  command: string
): {
  updatedPlayer: Character,
  updatedEnemy: Character,
  log: string[],
  winner: "player" | "enemy" | null,
} {
  const log: string[] = [];

  let updatedPlayer = { ...player };
  let updatedEnemy = { ...enemy };

  // 1. Oyuncunun hamlesi
  const playerActionResult = handleCombatAction(command, updatedPlayer, updatedEnemy);
  updatedEnemy.HP = Math.max(0, updatedEnemy.HP - playerActionResult.damage);
  log.push(playerActionResult.log);

  // 🔒 Eğer düşman öldüyse, artık saldırmaz
  if (updatedEnemy.HP <= 0) {
    log.push(`🏆 ${updatedPlayer.name} defeated ${updatedEnemy.name}!`);
    return {
      updatedPlayer,
      updatedEnemy,
      log,
      winner: "player",
    };
  }

  // 2. Düşmanın karşı saldırısı
  const enemyActionResult = performAttack(updatedEnemy, updatedPlayer);
  updatedPlayer.HP = Math.max(0, updatedPlayer.HP - enemyActionResult.damage);
  log.push(enemyActionResult.log);

  // 🔒 Eğer oyuncu öldüyse, oyun biter
  if (updatedPlayer.HP <= 0) {
    log.push(`💀 ${updatedPlayer.name} was defeated by ${updatedEnemy.name}...`);
    return {
      updatedPlayer,
      updatedEnemy,
      log,
      winner: "enemy",
    };
  }

  // 🟡 Kimse ölmedi, döngü devam ediyor
  return {
    updatedPlayer,
    updatedEnemy,
    log,
    winner: null,
  };
}





