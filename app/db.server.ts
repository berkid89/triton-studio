import Database from "better-sqlite3";

const dbPath = process.env.DATABASE_URL ?? "./app.db";
export const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Initialize TritonServer table
db.exec(`
  CREATE TABLE IF NOT EXISTS triton_servers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Trigger to update updated_at timestamp
db.exec(`
  CREATE TRIGGER IF NOT EXISTS update_triton_servers_timestamp 
  AFTER UPDATE ON triton_servers
  BEGIN
    UPDATE triton_servers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END
`);