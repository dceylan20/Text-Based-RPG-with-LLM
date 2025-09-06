// src/app/api/combat-test/route.ts
import { NextResponse } from "next/server";
import { handleCombat } from "@/lib/combat/engine/combatEngine";
import { CharacterClass, Character } from "@/lib/types/character";
import { createEnemy } from "@/lib/combat/enemies/enemyFactory";

export async function GET() {
  const player: Character = {
    name: "Hero",
    characterClass: CharacterClass.Warrior,
    level: 1,
    HP: 100,
    MP: 30,
    accuracy: 10,
    speed: 10,
    defence: 8,
    strength: 18,
    dexterity: 0,
    intelligence: 0,
    constitution: 0,
    spirit: 0,
    wisdom: 0,
    agility: 0,
    charisma: 0,
  };

  const scenarioId = 1;
  const enemy = createEnemy(scenarioId, player.level);

  const result = handleCombat(player, enemy);

  return NextResponse.json({
    message: "Full combat simulation complete!",
    playerFinalHP: player.HP,
    enemyFinalHP: enemy.HP,
    winner: result.winner,
    combatLog: result.log,
  });
}
