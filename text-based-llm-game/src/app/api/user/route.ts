// src/app/api/user/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/db/database";


export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const stmt = db.prepare("SELECT * FROM Users WHERE userId = ?");
    const user = stmt.get(userId);

    return NextResponse.json({ found: !!user });
}

export async function POST(req: NextRequest) {
    try {
        const { userId, password } = await req.json();

        const check = db.prepare("SELECT * FROM Users WHERE userId = ?").get(userId);
        if (check) {
            return NextResponse.json({ error: "User already exists." }, { status: 400 });
        }

        const stmt = db.prepare("INSERT INTO Users (userId, password) VALUES (?, ?)");
        stmt.run(userId, password);

        return NextResponse.json({ message: "User created successfully!" });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}



