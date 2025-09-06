// src/app/api/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/db/database";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      userId,
      player,
      inventory,
      equipment,
      currentStory,
      lastAction,
      storyCountSinceStart,
      storyCountSinceLastBattle,
      hasBattledOnce,
    } = body;

    const stmt = db.prepare(`
      INSERT INTO Players (
        sessionId, userId, nickname, class, lvl, currentExp,
        hp, mana, speed, defence, intelligence, dexterity, charisma,
        wisdom, strength, accuracy, inventory, equipment,
        currentStory, lastAction, storyCountSinceStart, storyCountSinceLastBattle, hasBattledOnce
      ) VALUES (
        @sessionId, @userId, @nickname, @class, @lvl, @currentExp,
        @hp, @mana, @speed, @defence, @intelligence, @dexterity, @charisma,
        @wisdom, @strength, @accuracy, @inventory, @equipment,
        @currentStory, @lastAction, @storyCountSinceStart, @storyCountSinceLastBattle, @hasBattledOnce
      )
      ON CONFLICT(sessionId) DO UPDATE SET
        userId=@userId, nickname=@nickname, class=@class, lvl=@lvl, currentExp=@currentExp,
        hp=@hp, mana=@mana, speed=@speed, defence=@defence, intelligence=@intelligence,
        dexterity=@dexterity, charisma=@charisma, wisdom=@wisdom, strength=@strength, accuracy=@accuracy,
        inventory=@inventory, equipment=@equipment,
        currentStory=@currentStory, lastAction=@lastAction,
        storyCountSinceStart=@storyCountSinceStart, storyCountSinceLastBattle=@storyCountSinceLastBattle,
        hasBattledOnce=@hasBattledOnce
    `);

    stmt.run({
      sessionId,
      userId,
      nickname: player.name,
      class: player.characterClass,
      lvl: player.level,
      currentExp: player.currentExp,
      hp: player.HP,
      mana: player.MP,
      speed: player.speed,
      defence: player.defence,
      intelligence: player.intelligence,
      dexterity: player.dexterity,
      charisma: player.charisma,
      wisdom: player.wisdom,
      strength: player.strength,
      accuracy: player.accuracy,
      inventory: JSON.stringify(inventory),
      equipment: JSON.stringify(equipment),
      currentStory,
      lastAction,
      storyCountSinceStart,
      storyCountSinceLastBattle,
      hasBattledOnce: hasBattledOnce ? 1 : 0,
    });

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("❌ Save failed:", err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
