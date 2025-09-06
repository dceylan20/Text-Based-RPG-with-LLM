// src/db/migrateSaveData.ts
import db from "@/db/database";

export function migrateSaveData() {
  try {
    db.prepare(`ALTER TABLE GameSessions ADD COLUMN saveData TEXT`).run();
  } catch (error: any) {
    if (error.message.includes("duplicate column name")) {
    } else {
      console.error("❌ Migration error:", error);
    }
  }
}
