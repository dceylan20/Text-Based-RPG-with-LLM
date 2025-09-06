// src/app/api/combat-real/route.ts
import { NextResponse } from "next/server";
import { Character, CharacterClass } from "@/lib/types/character";
import { handleCombat } from "@/lib/combat/engine/combatEngine";
import { createEnemy } from "@/lib/combat/enemies/enemyFactory";

export async function POST(req: Request) {
  const { player, scenarioId } = await req.json();

  const enemy = createEnemy(scenarioId, player.level);
  const result = handleCombat({ ...player }, enemy);

  return NextResponse.json({
    message: `You entered battle with ${enemy.name}.`,
    combatLog: result.log,
    winner: result.winner,
    enemyName: enemy.name,
    updatedPlayer: result.updatedPlayer, 
  });
}
