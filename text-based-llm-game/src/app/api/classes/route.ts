// src/app/api/classes/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/db/database";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const className = searchParams.get("className");

    if (!className) {
        return NextResponse.json({ error: "Missing className" }, { status: 400 });
    }

    try {
        const stmt = db.prepare("SELECT * FROM Classes WHERE className = ?");
        const classRow = stmt.get(className);

        if (!classRow) {
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        return NextResponse.json(classRow);
    } catch (err) {
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}
