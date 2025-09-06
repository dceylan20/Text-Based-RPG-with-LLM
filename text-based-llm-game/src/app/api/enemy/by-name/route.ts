// src/app/api/enemy/by-name/route.ts

import { NextRequest } from "next/server";
import { enemyTemplates } from "@/lib/combat/enemies/enemyTemplates";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { name } = await req.json();

  const allEnemies = Object.values(enemyTemplates).flat();

  // Esnek eşleşme: baseName geçen düşmanı bul
  let match = allEnemies.find((enemy) =>
    name.toLowerCase().includes(enemy.baseName.toLowerCase())
  );

  // Yoksa rastgele düşman seç
  if (!match) {
    console.warn(`⚠️ No match for "${name}". Picking a random fallback enemy.`);
    match = allEnemies[Math.floor(Math.random() * allEnemies.length)];
  }

  const constructedEnemy = {
    name, // LLM'den gelen ismi "görünen isim" yapıyoruz
    characterClass: match.characterClass,
    HP: match.baseStats.HP,
    MP: match.baseStats.MP,
    accuracy: match.baseStats.accuracy,
    speed: match.baseStats.speed,
    defence: match.baseStats.defence,
    strength: match.baseStats.strength,
    dexterity: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    level: 1,
    equipment: [],
  };

  return new Response(JSON.stringify(constructedEnemy), {
    headers: { "Content-Type": "application/json" },
  });
}
