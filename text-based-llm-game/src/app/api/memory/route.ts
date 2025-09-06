// src/app/api/memory/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/db/database";

export async function POST(req: NextRequest) {
    try {
        const { userId, sessionId, message } = await req.json();

        // Mevcut en büyük orderOfMemory'yi bul
        const result = db
            .prepare("SELECT MAX(orderOfMemory) as max FROM Memory WHERE userId = ? AND sessionId = ?")
            .get(userId, sessionId) as { max: number | null };


        const nextOrder = (result?.max ?? -1) + 1;

        const stmt = db.prepare(`
      INSERT INTO Memory (orderOfMemory, userId, sessionId, LLMmemory)
      VALUES (?, ?, ?, ?)
    `);
        stmt.run(nextOrder, userId, sessionId, message);

        return NextResponse.json({ message: "Memory saved", order: nextOrder });
    } catch (error) {
        console.error("Error saving memory:", error);
        return NextResponse.json({ error: (error as Error).message || "Internal error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const sessionId = searchParams.get("sessionId");

        if (!userId || !sessionId) {
            return NextResponse.json({ error: "Missing userId or sessionId" }, { status: 400 });
        }

        const rows = db
            .prepare("SELECT orderOfMemory, LLMmemory, timestamp FROM Memory WHERE userId = ? AND sessionId = ? ORDER BY orderOfMemory ASC")
            .all(userId, sessionId);

        return NextResponse.json({ memory: rows });
    } catch (error) {
        console.error("Error fetching memory:", error);
        return NextResponse.json({ error: (error as Error).message || "Internal server error" }, { status: 500 });
    }
}
