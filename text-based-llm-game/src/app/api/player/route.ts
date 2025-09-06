// src/app/api/player/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/db/database";
import { Character } from "@/lib/types/character";

export async function POST(req: NextRequest) {
    try {


        const body = await req.json();
        const player: Character & { sessionId: string; userId: string; inventory?: any[]; equipment?: any[] } = body;


        const stmt = db.prepare(`
      INSERT INTO Players (
        sessionId, nickname, profile_pic_path, class, lvl, currentExp,
        hp, mana, speed, defence, intelligence, dexterity, charisma,
        wisdom, strength, inventory, equipment
      ) VALUES (
        @sessionId, @nickname, @profile_pic_path, @characterClass, @level, @currentExp,
        @HP, @MP, @speed, @defence, @intelligence, @dexterity, @charisma,
        @wisdom, @strength, @inventory, @equipment
      )
      ON CONFLICT(sessionId, nickname) DO UPDATE SET
        profile_pic_path = excluded.profile_pic_path,
        class = excluded.class,
        lvl = excluded.lvl,
        currentExp = excluded.currentExp,
        hp = excluded.hp,
        mana = excluded.mana,
        speed = excluded.speed,
        defence = excluded.defence,
        intelligence = excluded.intelligence,
        dexterity = excluded.dexterity,
        charisma = excluded.charisma,
        wisdom = excluded.wisdom,
        strength = excluded.strength,
        inventory = excluded.inventory,
        equipment = excluded.equipment
    `);

        console.log("📝 INSERTING PLAYER:", {
            sessionId: player.sessionId,
            userId: player.userId,
            nickname: player.name,
            characterClass: player.characterClass,
            HP: player.HP,
            // diğer alanlar...
        });

        stmt.run({
            sessionId: player.sessionId,
            nickname: player.name, // Character.name → Players.nickname
            profile_pic_path: "/pp.jpeg", // default image
            characterClass: player.characterClass,
            level: player.level,
            currentExp: player.currentExp ?? 0, 
            HP: player.HP,
            MP: player.MP,
            speed: player.speed,
            defence: player.defence,
            intelligence: player.intelligence,
            dexterity: player.dexterity,
            charisma: player.charisma,
            wisdom: player.wisdom,
            strength: player.strength,
            inventory: JSON.stringify(player.inventory ?? []),
            equipment: JSON.stringify(player.equipment ?? []),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("❌ Error saving player:", error);
        return NextResponse.json({ error: "Failed to save player" }, { status: 500 });
    }
}


export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
        return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    try {
        const stmt = db.prepare(`SELECT * FROM Players WHERE sessionId = ?`);
        const player = stmt.get(sessionId);

        if (!player) {
            return NextResponse.json({ error: "Player not found" }, { status: 404 });
        }

        return NextResponse.json(player);
    } catch (error) {
        console.error("❌ Error reading player:", error);
        return NextResponse.json({ error: "Failed to read player" }, { status: 500 });
    }
}

