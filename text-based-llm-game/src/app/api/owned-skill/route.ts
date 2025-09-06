// src/app/api/owned-skill/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/db/database";

export async function POST(req: NextRequest) {
    const { userId, sessionId, skillName } = await req.json();

    if (!userId || !sessionId || !skillName) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    try {
        const stmt = db.prepare(`
      INSERT OR IGNORE INTO OwnedSkills (userId, sessionId, skillName)
      VALUES (?, ?, ?)
    `);
        stmt.run(userId, sessionId, skillName);

        return NextResponse.json({ message: "Skill assigned" });
    } catch (error) {
        console.error("❌ Error inserting owned skill:", error);
        return NextResponse.json({ error: "Failed to assign skill" }, { status: 500 });
    }
}
