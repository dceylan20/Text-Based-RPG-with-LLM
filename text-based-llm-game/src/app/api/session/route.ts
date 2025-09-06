// src/app/api/session/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/db/database";

export async function POST(req: NextRequest) {
    try {
        const { userId, sessionId } = await req.json();

        const check = db.prepare("SELECT * FROM GameSessions WHERE userId = ? AND sessionId = ?").get(userId, sessionId);
        if (check) {
            return NextResponse.json({ error: "Session already exists." }, { status: 400 });
        }

        const stmt = db.prepare("INSERT INTO GameSessions (userId, sessionId, saveData) VALUES (?, ?, ?)");
        stmt.run(userId, sessionId, "");

        return NextResponse.json({ message: "Session created successfully!" });
    } catch (error) {
        console.error("Error creating session:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        const sessions = db
            .prepare("SELECT sessionId, createdAt, updatedAt FROM GameSessions WHERE userId = ?")
            .all(userId);

        return NextResponse.json({ sessions });
    } catch (error) {
        console.error("❌ GET /api/session error:", error);
        return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
    }
}

// delete fonksiyonu
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get("sessionId");
        const userId = searchParams.get("userId"); 

        if (!sessionId || !userId) {
            return NextResponse.json({ error: "Missing sessionId or userId for deletion" }, { status: 400 });
        }

        const deleteTransaction = db.transaction(() => {
            //players tablosundan bu sessionidyi sil
            const deletePlayersStmt = db.prepare("DELETE FROM Players WHERE sessionId = ?");
            deletePlayersStmt.run(sessionId);

            // memory tablosundan bu sessionidyi sil
            const deleteMemoryStmt = db.prepare("DELETE FROM Memory WHERE sessionId = ?");
            deleteMemoryStmt.run(sessionId);

            // OwnedItems tablosundan bu sessionidyi sil
            const deleteOwnedItemsStmt = db.prepare("DELETE FROM OwnedItems WHERE sessionId = ?");
            deleteOwnedItemsStmt.run(sessionId);

            // OwnedEquipments tablosundanbu sessionidyi sil
            const deleteOwnedEquipmentsStmt = db.prepare("DELETE FROM OwnedEquipments WHERE sessionId = ?");
            deleteOwnedEquipmentsStmt.run(sessionId);

            // OwnedSkills tablosundan bu sessionidyi sil
            const deleteOwnedSkillsStmt = db.prepare("DELETE FROM OwnedSkills WHERE sessionId = ?");
            deleteOwnedSkillsStmt.run(sessionId);

            // 'GameSessions' kaydını sil.
            const deleteSessionStmt = db.prepare("DELETE FROM GameSessions WHERE sessionId = ? AND userId = ?");
            const info = deleteSessionStmt.run(sessionId, userId);

            if (info.changes > 0) {
                return { success: true, message: "Session and all related data deleted successfully" };
            } else {
                return { success: false, status: 404, message: "Session not found or you are not authorized to delete this session" };
            }
        });

        const result = deleteTransaction();

        if (result.success) {
            return NextResponse.json({ message: result.message }, { status: 200 });
        } else {
            return NextResponse.json({ error: result.message }, { status: result.status || 500 });
        }

    } catch (error) {
        console.error("❌ DELETE /api/session error:", error);
        if ((error as any).code && (error as any).code.startsWith('SQLITE_CONSTRAINT')) {
             return NextResponse.json({
                error: "Failed to delete session due to a database constraint. This might indicate an issue with the deletion order or an unhandled dependency.",
                details: (error as Error).message,
                code: (error as any).code
            }, { status: 409 }); 
        }
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}