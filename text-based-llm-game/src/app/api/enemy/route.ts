// src/app/api/enemy/route.ts
import { NextResponse } from "next/server";
import { createEnemy } from "@/lib/combat/enemies/enemyFactory";
import { Character } from "@/lib/types/character";

export async function POST(req: Request) {
  try {
    const { scenarioId, player }: { scenarioId: number; player: Character } = await req.json();

    const enemy = createEnemy(scenarioId, player.level);

    return NextResponse.json(enemy);
  } catch (err) {
    console.error("❌ Enemy creation failed:", err);
    return NextResponse.json({ error: "Enemy generation failed" }, { status: 500 });
  }
}
