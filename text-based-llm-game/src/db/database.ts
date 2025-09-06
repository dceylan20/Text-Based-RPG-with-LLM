// src/db/database.ts
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Path to game.db
const dbPath = path.join(process.cwd(), "game.db");
const db = new Database(dbPath);

// if tables don't exist, produce them
const schema = fs.readFileSync(path.join(process.cwd(), "src", "db", "schema.sql"), "utf8");
try {
    db.exec(schema);
} catch (e) {
    console.error(" SQL Exec Error:\n", schema);
    throw e;
}

export default db;
