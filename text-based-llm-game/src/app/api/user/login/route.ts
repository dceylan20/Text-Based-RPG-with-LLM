// src/app/api/user/login/route.ts

import { NextResponse } from "next/server";
import db from "@/db/database";

export async function POST(req: Request) {
    const { userId, password } = await req.json();

    const stmt = db.prepare("SELECT * FROM Users WHERE userId = ? AND password = ?");
    const user = stmt.get(userId, password);

    if (user) {
        return NextResponse.json({ message: "Login successful", user });
    } else {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
}
