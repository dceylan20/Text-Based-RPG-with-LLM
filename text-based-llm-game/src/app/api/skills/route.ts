// src/app/api/skills/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/db/database";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const className = searchParams.get("className");

    if (!className) {
        return NextResponse.json({ error: "Missing className" }, { status: 400 });
    }

    try {
        const stmt = db.prepare(`
            SELECT * FROM Skills
            WHERE availableClass1 = ? OR availableClass2 = ?
        `);
        const rows = stmt.all(className, className);
        return NextResponse.json(rows);
    } catch (err) {
        console.error("❌ Error fetching skills:", err);
        return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 });
    }
}
