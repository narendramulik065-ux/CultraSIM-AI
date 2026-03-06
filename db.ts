import Database from 'better-sqlite3';

const db = new Database('app.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    transcript TEXT,
    avgCulturalScore REAL,
    avgConfidenceScore REAL,
    avgPolitenessScore REAL,
    report TEXT,
    avatar TEXT,
    scenario TEXT
  );
`);

try {
  db.exec("ALTER TABLE sessions ADD COLUMN avatar TEXT;");
} catch (e) {
  // Column might already exist
}

try {
  db.exec("ALTER TABLE sessions ADD COLUMN scenario TEXT;");
} catch (e) {
  // Column might already exist
}

export default db;
