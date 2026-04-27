import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("nabu.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak INTEGER DEFAULT 0,
    last_login TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS progress (
    user_id TEXT,
    lesson_id TEXT,
    completed_at TIMESTAMP,
    score INTEGER,
    PRIMARY KEY (user_id, lesson_id)
  );

  CREATE TABLE IF NOT EXISTS vocabulary (
    user_id TEXT,
    word TEXT,
    strength REAL DEFAULT 0.1,
    next_review TIMESTAMP,
    interval INTEGER DEFAULT 1,
    ease_factor REAL DEFAULT 2.5,
    PRIMARY KEY (user_id, word)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/user/:id", (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
    if (!user) {
      // Create default user if not exists for demo
      const newUser = { id: req.params.id, name: "Learner", xp: 0, level: 1, streak: 1, last_login: new Date().toISOString() };
      db.prepare("INSERT INTO users (id, name, xp, level, streak, last_login) VALUES (?, ?, ?, ?, ?, ?)").run(
        newUser.id, newUser.name, newUser.xp, newUser.level, newUser.streak, newUser.last_login
      );
      return res.json(newUser);
    }
    res.json(user);
  });

  app.post("/api/user/:id/progress", (req, res) => {
    const { lessonId, score, xpGained } = req.body;
    const userId = req.params.id;
    
    db.prepare("INSERT OR REPLACE INTO progress (user_id, lesson_id, completed_at, score) VALUES (?, ?, ?, ?)")
      .run(userId, lessonId, new Date().toISOString(), score);
      
    db.prepare("UPDATE users SET xp = xp + ? WHERE id = ?").run(xpGained, userId);
    
    // Potentially handle level ups here
    res.json({ success: true });
  });

  app.get("/api/user/:id/vocabulary", (req, res) => {
    const vocab = db.prepare("SELECT * FROM vocabulary WHERE user_id = ?").all(req.params.id);
    res.json(vocab);
  });

  app.post("/api/user/:id/vocabulary/review", (req, res) => {
    const { word, success } = req.body;
    const userId = req.params.id;
    
    let entry = db.prepare("SELECT * FROM vocabulary WHERE user_id = ? AND word = ?").get(userId, word) as any;
    
    if (!entry) {
      entry = { user_id: userId, word, strength: 0.1, interval: 1, ease_factor: 2.5 };
    }

    // Simple SM-2 like logic
    if (success) {
      entry.interval = Math.ceil(entry.interval * entry.ease_factor);
      entry.strength = Math.min(1.0, entry.strength + 0.1);
    } else {
      entry.interval = 1;
      entry.ease_factor = Math.max(1.3, entry.ease_factor - 0.2);
      entry.strength = Math.max(0.1, entry.strength - 0.2);
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + entry.interval);

    db.prepare(`
      INSERT OR REPLACE INTO vocabulary (user_id, word, strength, next_review, interval, ease_factor)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, word, entry.strength, nextReview.toISOString(), entry.interval, entry.ease_factor);
    
    res.json({ success: true, nextReview: nextReview.toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
