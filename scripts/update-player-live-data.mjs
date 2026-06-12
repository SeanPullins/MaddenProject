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

async function fetchJson(url, fallback) {
  try {
    const response = await fetch(url);
    if (!response.ok) return fallback;
    return await response.json();
  } catch {
    return fallback;
  }
}

function buildRosterNote(player, liveTeam) {
  const name = player.full_name || [player.first_name, player.last_name].filter(Boolean).join(" ");
  const position = player.position || "player";
  const team = liveTeam || "free agency / no listed team";
  const status = player.status || "Rostered";

  const notes = [];

  notes.push(`${name} is currently listed as a ${position} with ${team}.`);
  notes.push(`Roster status: ${status}.`);

  if (player.injury_status) {
    notes.push(`Injury designation: ${player.injury_status}.`);
  }

  if (player.practice_participation) {
    notes.push(`Practice participation: ${player.practice_participation}.`);
  }

  if (player.depth_chart_order) {
    notes.push(
      `Depth chart: #${player.depth_chart_order}${player.depth_chart_position ? ` at ${player.depth_chart_position}` : ""}.`
    );
  }

  return notes.join(" ");
}

function buildAvailabilityNote(player) {
  const status = String(player.status || "").toLowerCase();
  const injury = player.injury_status;
  const practice = player.practice_participation;

  if (injury) {
    return `Monitor injury status: ${injury}${practice ? `; practice: ${practice}` : ""}.`;
  }

  if (status.includes("active")) {
    return "Currently listed as active with no injury designation in the live data.";
  }

  if (status) {
    return `Current live status is ${player.status}.`;
  }

  return "No special injury or availability note is listed in the live data.";
}

function makeNewsLinks(name, liveTeam, espnId) {
  const newsQuery = encodeURIComponent(`${name} ${liveTeam || ""} NFL roster status injury news`);
  const links = {
    googleNewsUrl: `https://news.google.com/search?q=${newsQuery}`,
  };

  if (espnId) {
    links.espnUrl = `https://www.espn.com/nfl/player/_/id/${espnId}`;
  }

  return links;
}

async function main() {
  const rosterNames = extractRosterNames();

  const [allPlayers, trendingAdds, trendingDrops] = await Promise.all([
    fetchJson("https://api.sleeper.app/v1/players/nfl", {}),
    fetchJson("https://api.sleeper.app/v1/players/nfl/trending/add?lookback_hours=24&limit=100", []),
    fetchJson("https://api.sleeper.app/v1/players/nfl/trending/drop?lookback_hours=24&limit=100", []),
  ]);

  const addMap = new Map(trendingAdds.map((p) => [String(p.player_id), p.count]));
  const dropMap = new Map(trendingDrops.map((p) => [String(p.player_id), p.count]));

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
        rosterStatusNote: "No live NFL data match found yet.",
      };
      continue;
    }

    const playerId = String(match.player_id);
    const liveTeam = match.team ?? null;
    const trendingAddCount = addMap.get(playerId) ?? 0;
    const trendingDropCount = dropMap.get(playerId) ?? 0;

    let trendingDirection = "neutral";
    if (trendingAddCount > trendingDropCount) trendingDirection = "rising";
    if (trendingDropCount > trendingAddCount) trendingDirection = "falling";

    livePlayers[name] = {
      matched: true,
      source: "Sleeper",
      updatedAt: new Date().toISOString(),

      sleeperId: match.player_id ?? null,
      espnId: match.espn_id ?? null,
      yahooId: match.yahoo_id ?? null,
      rotowireId: match.rotowire_id ?? null,
      sportradarId: match.sportradar_id ?? null,

      fullName:
        match.full_name ||
        [match.first_name, match.last_name].filter(Boolean).join(" "),

      firstName: match.first_name ?? null,
      lastName: match.last_name ?? null,
      currentTeam: liveTeam,
      team: liveTeam,
      position: match.position ?? null,
      number: match.number ?? null,
      active: match.active ?? null,
      status: match.status ?? null,

      injuryStatus: match.injury_status ?? null,
      injuryStartDate: match.injury_start_date ?? null,
      injuryBodyPart: match.injury_body_part ?? null,
      injuryNotes: match.injury_notes ?? null,
      practiceParticipation: match.practice_participation ?? null,

      age: match.age ?? null,
      birthDate: match.birth_date ?? null,
      height: match.height ?? null,
      weight: match.weight ?? null,
      college: match.college ?? null,
      yearsExp: match.years_exp ?? null,

      depthChartOrder: match.depth_chart_order ?? null,
      depthChartPosition: match.depth_chart_position ?? null,
      fantasyPositions: match.fantasy_positions ?? [],

      searchRank: match.search_rank ?? null,
      hashtag: match.hashtag ?? null,

      trendingAddCount,
      trendingDropCount,
      trendingDirection,

      rosterStatusNote: buildRosterNote(match, liveTeam),
      availabilityNote: buildAvailabilityNote(match),
      newsLinks: makeNewsLinks(name, liveTeam, match.espn_id),
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
