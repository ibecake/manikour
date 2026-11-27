/**
 * Offline deterministic map generator for Manikour.
 * Writes a large Tiled-compatible JSON to public/map/world.json.
 *
 * Usage: npm run map:generate
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SEED = 0x4d414e49; // "MANI"
const TILE = 64;
const MAP_HEIGHT = 20; // tiles
const MAP_WIDTH = 400; // tiles → 25,600 px world
const GROUND_ID = 1;
const EMPTY = 0;

/** Mulberry32 — deterministic PRNG from a 32-bit seed. */
function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function generateGroundLayer(rand: () => number): number[] {
  const data = new Array<number>(MAP_WIDTH * MAP_HEIGHT).fill(EMPTY);
  const groundRow = MAP_HEIGHT - 3; // y index of main floor

  let x = 0;
  while (x < MAP_WIDTH) {
    // Segment length 8–24 tiles of solid ground
    const run = 8 + Math.floor(rand() * 17);
    for (let i = 0; i < run && x + i < MAP_WIDTH; i++) {
      const col = x + i;
      set(data, col, groundRow, GROUND_ID);
      set(data, col, groundRow + 1, GROUND_ID);
      set(data, col, groundRow + 2, GROUND_ID);
    }
    x += run;

    if (x >= MAP_WIDTH) break;

    // Feature: gap, low wall, or raised platform
    const feature = rand();
    if (feature < 0.4) {
      // Gap (water/fall zone placeholder)
      const gap = 2 + Math.floor(rand() * 4);
      x += gap;
    } else if (feature < 0.7) {
      // Wall climb stub — stacked tiles
      const wallH = 2 + Math.floor(rand() * 3);
      for (let h = 0; h < wallH; h++) {
        set(data, x, groundRow - 1 - h, GROUND_ID);
      }
      set(data, x, groundRow, GROUND_ID);
      set(data, x, groundRow + 1, GROUND_ID);
      set(data, x, groundRow + 2, GROUND_ID);
      x += 1;
    } else {
      // Raised platform
      const plat = 3 + Math.floor(rand() * 5);
      const raise = 2 + Math.floor(rand() * 2);
      for (let i = 0; i < plat && x + i < MAP_WIDTH; i++) {
        set(data, x + i, groundRow - raise, GROUND_ID);
      }
      x += plat;
    }
  }

  // Ensure spawn area (first 8 cols) is solid
  for (let col = 0; col < 8; col++) {
    set(data, col, groundRow, GROUND_ID);
    set(data, col, groundRow + 1, GROUND_ID);
    set(data, col, groundRow + 2, GROUND_ID);
    for (let row = 0; row < groundRow; row++) {
      set(data, col, row, EMPTY);
    }
  }

  return data;
}

function set(data: number[], col: number, row: number, value: number): void {
  if (col < 0 || col >= MAP_WIDTH || row < 0 || row >= MAP_HEIGHT) return;
  data[row * MAP_WIDTH + col] = value;
}

function main(): void {
  const rand = mulberry32(SEED);
  const groundData = generateGroundLayer(rand);

  const world = {
    compressionlevel: -1,
    height: MAP_HEIGHT,
    width: MAP_WIDTH,
    tileheight: TILE,
    tilewidth: TILE,
    infinite: false,
    orientation: "orthogonal",
    renderorder: "right-down",
    type: "map",
    version: "1.10",
    tiledversion: "1.10.2",
    nextlayerid: 2,
    nextobjectid: 1,
    tilesets: [
      {
        firstgid: 1,
        name: "manikour-placeholder",
        tilewidth: TILE,
        tileheight: TILE,
        tilecount: 1,
        columns: 1,
        image: "tiles.png",
        imagewidth: TILE,
        imageheight: TILE,
      },
    ],
    layers: [
      {
        id: 1,
        name: "ground",
        type: "tilelayer",
        visible: true,
        opacity: 1,
        width: MAP_WIDTH,
        height: MAP_HEIGHT,
        x: 0,
        y: 0,
        data: groundData,
      },
    ],
    properties: [
      { name: "generator", type: "string", value: "manikour-phase0" },
      { name: "seed", type: "int", value: SEED },
    ],
  };

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const outPath = resolve(__dirname, "../../public/map/world.json");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(world));
  console.log(
    `Wrote ${outPath} (${MAP_WIDTH}×${MAP_HEIGHT} tiles, seed=0x${SEED.toString(16)})`,
  );
}

main();
