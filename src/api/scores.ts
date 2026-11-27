/**
 * Shared scores handlers for Cloudflare Pages Functions + D1.
 * Schema: scores(id, name, score, created_at)
 */

/// <reference types="@cloudflare/workers-types" />

export interface ScoreEnv {
  DB: D1Database;
}

export type ScoreRow = {
  id: number;
  name: string;
  score: number;
  created_at: string;
};

const CORS: HeadersInit = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS,
    },
  });
}

export function optionsResponse(): Response {
  return new Response(null, { status: 204, headers: CORS });
}

export async function ensureSchema(db: D1Database): Promise<void> {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        score INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
    )
    .run();
}

export async function listScores(env: ScoreEnv, limit = 20): Promise<Response> {
  await ensureSchema(env.DB);
  const { results } = await env.DB.prepare(
    `SELECT id, name, score, created_at FROM scores ORDER BY score DESC, created_at ASC LIMIT ?`,
  )
    .bind(limit)
    .all<ScoreRow>();

  return json({ scores: results ?? [] });
}

export async function createScore(request: Request, env: ScoreEnv): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  if (!body || typeof body !== "object") {
    return json({ error: "Expected object body" }, 400);
  }

  const { name, score } = body as { name?: unknown; score?: unknown };

  if (typeof name !== "string" || name.trim().length === 0) {
    return json({ error: "name is required" }, 400);
  }
  if (typeof score !== "number" || !Number.isFinite(score) || score < 0) {
    return json({ error: "score must be a non-negative number" }, 400);
  }

  const safeName = name.trim().slice(0, 16);
  const safeScore = Math.floor(score);

  await ensureSchema(env.DB);
  const result = await env.DB.prepare(
    `INSERT INTO scores (name, score) VALUES (?, ?) RETURNING id, name, score, created_at`,
  )
    .bind(safeName, safeScore)
    .first<ScoreRow>();

  return json({ score: result }, 201);
}
