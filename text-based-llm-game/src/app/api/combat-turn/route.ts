// src/app/api/combat-turn/route.ts
import { NextResponse } from "next/server";
import { playTurn } from "@/lib/combat/engine/combatEngine";
import { Character } from "@/lib/types/character";

export async function POST(req: Request) {
  try {
    const { player, enemy, command }: { player: Character; enemy: Character; command: string } = await req.json();

    const result = playTurn(player, enemy, command);

    return NextResponse.json({
      combatLog: result.log,
      updatedPlayer: result.updatedPlayer,
      updatedEnemy: result.updatedEnemy,
      winner: result.winner, // "player" | "enemy" | null
    });
  } catch (error) {
    console.error("❌ combat-turn error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
