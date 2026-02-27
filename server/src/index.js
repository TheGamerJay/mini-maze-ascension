import express from "express";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";

import { pool } from "./db.js";
import { redis } from "./redis.js";
import { signRunToken, verifyRunToken } from "./security.js";
import { validateEvent, validateFinish } from "./validate.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json({ limit: "200kb" }));

// Serve frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webDir = path.resolve(__dirname, "../../web");
app.use(express.static(webDir));

// Health
app.get("/api/health", async (req, res) => {
  res.json({ ok: true });
});

// Ensure DB schema exists (simple bootstrap)
app.post("/api/admin/init-db", async (req, res) => {
  try {
    const schema = await import("fs/promises").then(fs => fs.readFile(path.resolve(__dirname, "./schema.sql"), "utf8"));
    await pool.query(schema);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: "init_failed", detail: String(e) });
  }
});

/**
 * Run State stored in Redis:
 * key: run:{runId}
 * value: JSON { runId, username, seed, startedAtMs, lastEventAtMs, level, score, bossesKilled }
 * TTL: 2 hours
 */

app.post("/api/run/start", async (req, res) => {
  const username = (req.body?.username || "Anonymous").toString().slice(0, 24);
  const seed = Number.isFinite(req.body?.seed) ? req.body.seed : Math.floor(Math.random() * 1e9);

  const runId = nanoid(14);
  const startedAtMs = Date.now();

  const state = {
    runId,
    username,
    seed,
    startedAtMs,
    lastEventAtMs: startedAtMs,
    level: 1,
    score: 0,
    bossesKilled: 0
  };

  await redis.set(`run:${runId}`, JSON.stringify(state), "EX", 60 * 60 * 2);

  const token = signRunToken({ runId, startedAtMs, seed });
  res.json({ ok: true, runId, token, seed, level: 1 });
});

app.post("/api/run/event", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const decoded = verifyRunToken(token);
  if (!decoded) return res.status(401).json({ ok: false, error: "bad_token" });

  const { runId } = decoded;
  const raw = await redis.get(`run:${runId}`);
  if (!raw) return res.status(404).json({ ok: false, error: "run_not_found" });

  const state = JSON.parse(raw);
  const nowMs = Date.now();

  const type = (req.body?.type || "").toString();
  const nextLevel = Number(req.body?.level);

  if (type === "LEVEL_CLEARED") {
    const err = validateEvent({
      prevLevel: state.level,
      nextLevel,
      runStartedAtMs: state.startedAtMs,
      nowMs
    });
    if (err) return res.status(400).json({ ok: false, error: err });

    // Only allow forward by 1
    if (nextLevel === state.level + 1) {
      state.level = nextLevel;
      // score baseline for clearing a level (tune later)
      state.score += 1000 * (nextLevel - 1);
    }

    state.lastEventAtMs = nowMs;
    await redis.set(`run:${runId}`, JSON.stringify(state), "EX", 60 * 60 * 2);
    return res.json({ ok: true, level: state.level, score: state.score });
  }

  if (type === "BOSS_KILLED") {
    const count = Number(req.body?.count || 1);
    if (!Number.isFinite(count) || count < 1 || count > 2) {
      return res.status(400).json({ ok: false, error: "bad_count" });
    }
    state.bossesKilled += count;
    state.score += 2000 * count; // tune later
    state.lastEventAtMs = nowMs;
    await redis.set(`run:${runId}`, JSON.stringify(state), "EX", 60 * 60 * 2);
    return res.json({ ok: true, bossesKilled: state.bossesKilled, score: state.score });
  }

  return res.status(400).json({ ok: false, error: "unknown_event" });
});

app.post("/api/run/finish", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const decoded = verifyRunToken(token);
  if (!decoded) return res.status(401).json({ ok: false, error: "bad_token" });

  const { runId } = decoded;
  const raw = await redis.get(`run:${runId}`);
  if (!raw) return res.status(404).json({ ok: false, error: "run_not_found" });

  const state = JSON.parse(raw);
  const nowMs = Date.now();

  const err = validateFinish({
    level: state.level,
    runStartedAtMs: state.startedAtMs,
    nowMs
  });
  if (err) return res.status(400).json({ ok: false, error: err });

  const timeSurvivedS = Math.max(1, Math.floor((nowMs - state.startedAtMs) / 1000));

  // Write leaderboard entry
  await pool.query(
    `INSERT INTO leaderboard_entries (username, highest_level, score, time_survived_s, bosses_killed)
     VALUES ($1, $2, $3, $4, $5)`,
    [state.username, state.level, state.score, timeSurvivedS, state.bossesKilled]
  );

  // invalidate run
  await redis.del(`run:${runId}`);

  res.json({
    ok: true,
    username: state.username,
    highest_level: state.level,
    score: state.score,
    time_survived_s: timeSurvivedS,
    bosses_killed: state.bossesKilled
  });
});

app.get("/api/leaderboard", async (req, res) => {
  const limit = Math.min(50, Math.max(5, Number(req.query.limit || 20)));

  const { rows } = await pool.query(
    `SELECT username, highest_level, score, time_survived_s, bosses_killed, created_at
     FROM leaderboard_entries
     ORDER BY highest_level DESC, time_survived_s DESC, score DESC
     LIMIT $1`,
    [limit]
  );

  res.json({ ok: true, rows });
});

// Fallback to index.html for simple routing
app.get("*", (req, res) => {
  res.sendFile(path.join(webDir, "index.html"));
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Mini Maze: Ascension running on :${port}`));
