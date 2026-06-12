import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CONSTANTS_PATH = path.join(ROOT, "constants.ts");
const OUT_DIR = path.join(ROOT, "public", "data");
const OUT_FILE = path.join(OUT_DIR, "player-live.json");

const normalize = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

function extractRosterNames() {
  const constants = fs.readFileSync(CONSTANTS_PATH, "utf8");

  const matches = [
    ...constants.matchAll(
      /createPlayer\(\s*['"][^'"]+['"]\s*,\s*(['"])((?:\\.|(?!\1).)*)\1/g
    ),
  ];

  return [...new Set(matches.map((m) => m[2].replaceAll("\\'", "'")))];
}

async function main() {
  const rosterNames = extractRosterNames();

  const response = await fetch("https://api.sleeper.app/v1/players/nfl");

  if (!response.ok) {
    throw new Error(`Sleeper API failed: ${response.status} ${response.statusText}`);
  }

  const allPlayers = await response.json();
  const sleeperPlayers = Object.values(allPlayers).filter(Boolean);

  const byName = new Map();

  for (const player of sleeperPlayers) {
    const fullName =
      player.full_name ||
      [player.first_name, player.last_name].filter(Boolean).join(" ");

    if (!fullName) continue;

    byName.set(normalize(fullName), player);

    if (player.search_full_name) {
      byName.set(normalize(player.search_full_name), player);
    }
  }

  const livePlayers = {};

  for (const name of rosterNames) {
    const match = byName.get(normalize(name));

    if (!match) {
      livePlayers[name] = {
        matched: false,
        updatedAt: new Date().toISOString(),
      };
      continue;
    }

    livePlayers[name] = {
      matched: true,
      source: "Sleeper",
      updatedAt: new Date().toISOString(),

      sleeperId: match.player_id ?? null,
      espnId: match.espn_id ?? null,
      fullName:
        match.full_name ||
        [match.first_name, match.last_name].filter(Boolean).join(" "),

      team: match.team ?? null,
      position: match.position ?? null,
      status: match.status ?? null,
      injuryStatus: match.injury_status ?? null,
      injuryStartDate: match.injury_start_date ?? null,
      practiceParticipation: match.practice_participation ?? null,

      age: match.age ?? null,
      height: match.height ?? null,
      weight: match.weight ?? null,
      college: match.college ?? null,
      yearsExp: match.years_exp ?? null,

      depthChartOrder: match.depth_chart_order ?? null,
      depthChartPosition: match.depth_chart_position ?? null,
      fantasyPositions: match.fantasy_positions ?? [],
    };
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  fs.writeFileSync(
    OUT_FILE,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: "Sleeper API",
        count: Object.keys(livePlayers).length,
        players: livePlayers,
      },
      null,
      2
    )
  );

  console.log(`Wrote ${OUT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
