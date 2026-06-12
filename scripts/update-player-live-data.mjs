import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CONSTANTS_PATH = path.join(ROOT, "constants.ts");
const OUT_DIR = path.join(ROOT, "public", "data");
const OUT_FILE = path.join(OUT_DIR, "player-live.json");

const NEWS_PER_PLAYER = Number(process.env.NEWS_PER_PLAYER || 3);
const MAX_NEWS_PLAYERS = Number(process.env.MAX_NEWS_PLAYERS || 350);
const NEWS_CONCURRENCY = Number(process.env.NEWS_CONCURRENCY || 5);

const normalize = (value = "") =>
  value
    .toLowerCase()
