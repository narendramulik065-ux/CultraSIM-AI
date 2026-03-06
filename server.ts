import express from "express";
import { createServer as createViteServer } from "vite";
import db from "./db.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Auth (Mock)
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    let user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email) as any;
    if (!user) {
      const info = db
        .prepare("INSERT INTO users (email, password) VALUES (?, ?)")
        .run(email, password);
      user = { id: info.lastInsertRowid, email };
    }
    res.json({
      token: "mock-jwt-token",
      user: { id: user.id, email: user.email },
    });
  });

  // Sessions
  app.get("/api/sessions", (req, res) => {
    const userId = req.query.userId;
    const sessions = db
      .prepare(
        "SELECT * FROM sessions WHERE userId = ? ORDER BY createdAt DESC",
      )
      .all(userId);
    res.json(sessions);
  });

  app.post("/api/sessions", (req, res) => {
    const { userId, avatar, scenario } = req.body;
    const info = db
      .prepare(
        "INSERT INTO sessions (userId, transcript, avgCulturalScore, avgConfidenceScore, avgPolitenessScore, report, avatar, scenario) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(userId, "[]", 0, 0, 0, null, avatar || null, scenario || null);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/sessions/:id", (req, res) => {
    const session = db
      .prepare("SELECT * FROM sessions WHERE id = ?")
      .get(req.params.id);
    if (!session) return res.status(404).json({ error: "Not found" });
    res.json(session);
  });

  app.put("/api/sessions/:id", (req, res) => {
    const {
      transcript,
      avgCulturalScore,
      avgConfidenceScore,
      avgPolitenessScore,
      report,
      avatar,
      scenario,
    } = req.body;
    db.prepare(
      "UPDATE sessions SET transcript = ?, avgCulturalScore = ?, avgConfidenceScore = ?, avgPolitenessScore = ?, report = ?, avatar = ?, scenario = ? WHERE id = ?",
    ).run(
      JSON.stringify(transcript),
      avgCulturalScore,
      avgConfidenceScore,
      avgPolitenessScore,
      JSON.stringify(report),
      avatar || null,
      scenario || null,
      req.params.id,
    );
    res.json({ success: true });
  });

  // Chat & AI Evaluation
  // Removed from backend to comply with frontend-only AI rule

  // Report Generation
  // Removed from backend to comply with frontend-only AI rule

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
