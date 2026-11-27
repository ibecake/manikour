# Manikour

Mobile-first browser side-scroller: human ↔ animal via artifacts. Fixed giant world, memory-driven arcade play, high scores. No install, no login, no IAP.

**Domain:** [manikour.com](https://manikour.com) · **Repo:** [ibecake/manikour](https://github.com/ibecake/manikour)

## Stack

- **Phaser 3** + **TypeScript** + **Vite**
- **Cloudflare Pages** (static client) + **Pages Functions** + **D1** (scores)

## Local run

```bash
npm install
npm run map:generate   # writes public/map/world.json (deterministic)
npm run dev            # http://localhost:5173
```

Desktop controls:

| Key | Action |
| --- | --- |
| Arrows | Move |
| **E** / **Tab** | Cycle artifact slot (and Phase 0 form stub) |
| **Space** | Action (jump / form skill) |

Touch: left **ARTIFACT** button cycles; right **ACTION** button fires skill.

## Map generator

```bash
npm run map:generate
```

Produces a large deterministic Tiled-compatible `public/map/world.json` (seed locked). Edit that file by hand (or in Tiled) afterward — same map for every player.

## Build

```bash
npm run build          # typecheck + Vite → dist/
npm run preview        # serve dist locally
```

## Cloudflare (scores + deploy)

Phase 0 ships stubs. You still need to wire Cloudflare once:

1. **Install / login Wrangler** (if not already):
   ```bash
   npx wrangler login
   ```
2. **Create D1 database** and paste the id into `wrangler.toml`:
   ```bash
   npx wrangler d1 create manikour-scores
   # set [[d1_databases]].database_id in wrangler.toml
   ```
3. **Apply schema** (local + remote):
   ```bash
   npm run db:migrate:local
   npx wrangler d1 execute manikour-scores --remote --file=./migrations/0001_scores.sql
   ```
4. **Pages project** — connect this GitHub repo in the Cloudflare dashboard (or):
   ```bash
   npm run cf:deploy
   ```
5. **Custom domain** — attach `manikour.com` to the Pages project when ready.

API stub:

- `GET /api/scores` — top scores
- `POST /api/scores` — `{ "name": "Runner", "score": 120 }`

Local Vite (`npm run dev`) has no Worker; Game Over falls back to `localStorage` when `/api/scores` is unreachable. Use `npm run cf:dev` to exercise Functions + local D1.

## Phase 0 status

- Scenes: Boot → Menu → Play (placeholder) → GameOver / HighScores
- Dual controls + 5-slot HUD
- Form stubs: Human / Cheetah / Frog
- Offline map generator → `public/map/world.json`
- Worker/Pages Function + D1 scores schema

Out of scope: full art, full animal roster, ad SDK, itch.io (Phase 2).
