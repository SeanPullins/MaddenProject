import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CONSTANTS_PATH = path.join(ROOT, 'constants.ts');
const OUT_DIR = path.join(ROOT, 'public', 'data');
const OUT_FILE = path.join(OUT_DIR, 'madden-ratings.json');
const SOURCE_URL = 'https://www.ea.com/games/madden-nfl/ratings';
const TEAM_SOURCE_BASE = 'https://www.ea.com/games/madden-nfl/ratings/teams-ratings';

const API_CANDIDATES = [
  process.env.MADDEN_RATINGS_API_URL,
  'https://drop-api.ea.com/rating/madden-nfl-26?locale=en&limit=100&offset=0',
  'https://drop-api.ea.com/rating/madden-nfl?locale=en&limit=100&offset=0',
  'https://drop-api.ea.com/rating/madden-nfl-25?locale=en&limit=100&offset=0',
].filter(Boolean);

const TEAM_PAGES = [
  ['ARI', 'Arizona Cardinals', 'arizona-cardinals'],
  ['ATL', 'Atlanta Falcons', 'atlanta-falcons'],
  ['BAL', 'Baltimore Ravens', 'baltimore-ravens'],
  ['BUF', 'Buffalo Bills', 'buffalo-bills'],
  ['CAR', 'Carolina Panthers', 'carolina-panthers'],
  ['CHI', 'Chicago Bears', 'chicago-bears'],
  ['CIN', 'Cincinnati Bengals', 'cincinnati-bengals'],
  ['CLE', 'Cleveland Browns', 'cleveland-browns'],
  ['DAL', 'Dallas Cowboys', 'dallas-cowboys'],
  ['DEN', 'Denver Broncos', 'denver-broncos'],
  ['DET', 'Detroit Lions', 'detroit-lions'],
  ['GB', 'Green Bay Packers', 'green-bay-packers'],
  ['HOU', 'Houston Texans', 'houston-texans'],
  ['IND', 'Indianapolis Colts', 'indianapolis-colts'],
  ['JAX', 'Jacksonville Jaguars', 'jacksonville-jaguars'],
  ['KC', 'Kansas City Chiefs', 'kansas-city-chiefs'],
  ['LV', 'Las Vegas Raiders', 'las-vegas-raiders'],
  ['LAC', 'Los Angeles Chargers', 'los-angeles-chargers'],
  ['LAR', 'Los Angeles Rams', 'los-angeles-rams'],
  ['MIA', 'Miami Dolphins', 'miami-dolphins'],
  ['MIN', 'Minnesota Vikings', 'minnesota-vikings'],
  ['NE', 'New England Patriots', 'new-england-patriots'],
  ['NO', 'New Orleans Saints', 'new-orleans-saints'],
  ['NYG', 'New York Giants', 'new-york-giants'],
  ['NYJ', 'New York Jets', 'new-york-jets'],
  ['PHI', 'Philadelphia Eagles', 'philadelphia-eagles'],
  ['PIT', 'Pittsburgh Steelers', 'pittsburgh-steelers'],
  ['SF', 'San Francisco 49ers', 'san-francisco-49ers'],
  ['SEA', 'Seattle Seahawks', 'seattle-seahawks'],
  ['TB', 'Tampa Bay Buccaneers', 'tampa-bay-buccaneers'],
  ['TEN', 'Tennessee Titans', 'tennessee-titans'],
  ['WAS', 'Washington Commanders', 'washington-commanders'],
].map(([abbr, name, slug]) => ({ abbr, name, slug }));

const TEAM_ALIASES = {
  ARZ: 'ARI', ARI: 'ARI', CARDINALS: 'ARI', 'ARIZONA CARDINALS': 'ARI',
  ATL: 'ATL', FALCONS: 'ATL', 'ATLANTA FALCONS': 'ATL',
  BAL: 'BAL', RAVENS: 'BAL', 'BALTIMORE RAVENS': 'BAL',
  BUF: 'BUF', BILLS: 'BUF', 'BUFFALO BILLS': 'BUF',
  CAR: 'CAR', PANTHERS: 'CAR', 'CAROLINA PANTHERS': 'CAR',
  CHI: 'CHI', BEARS: 'CHI', 'CHICAGO BEARS': 'CHI',
  CIN: 'CIN', BENGALS: 'CIN', 'CINCINNATI BENGALS': 'CIN',
  CLE: 'CLE', BROWNS: 'CLE', 'CLEVELAND BROWNS': 'CLE',
  DAL: 'DAL', COWBOYS: 'DAL', 'DALLAS COWBOYS': 'DAL',
  DEN: 'DEN', BRONCOS: 'DEN', 'DENVER BRONCOS': 'DEN',
  DET: 'DET', LIONS: 'DET', 'DETROIT LIONS': 'DET',
  GB: 'GB', GBP: 'GB', PACKERS: 'GB', 'GREEN BAY PACKERS': 'GB',
  HOU: 'HOU', TEXANS: 'HOU', 'HOUSTON TEXANS': 'HOU',
  IND: 'IND', COLTS: 'IND', 'INDIANAPOLIS COLTS': 'IND',
  JAC: 'JAX', JAX: 'JAX', JAGUARS: 'JAX', 'JACKSONVILLE JAGUARS': 'JAX',
  KC: 'KC', KAN: 'KC', CHIEFS: 'KC', 'KANSAS CITY CHIEFS': 'KC',
  LAC: 'LAC', CHARGERS: 'LAC', 'LOS ANGELES CHARGERS': 'LAC',
  LAR: 'LAR', RAMS: 'LAR', 'LOS ANGELES RAMS': 'LAR',
  LV: 'LV', LVR: 'LV', RAIDERS: 'LV', 'LAS VEGAS RAIDERS': 'LV',
  MIA: 'MIA', DOLPHINS: 'MIA', 'MIAMI DOLPHINS': 'MIA',
  MIN: 'MIN', VIKINGS: 'MIN', 'MINNESOTA VIKINGS': 'MIN',
  NE: 'NE', NEP: 'NE', PATRIOTS: 'NE', 'NEW ENGLAND PATRIOTS': 'NE',
  NO: 'NO', NOS: 'NO', SAINTS: 'NO', 'NEW ORLEANS SAINTS': 'NO',
  NYG: 'NYG', GIANTS: 'NYG', 'NEW YORK GIANTS': 'NYG',
  NYJ: 'NYJ', JETS: 'NYJ', 'NEW YORK JETS': 'NYJ',
  PHI: 'PHI', EAGLES: 'PHI', 'PHILADELPHIA EAGLES': 'PHI',
  PIT: 'PIT', STEELERS: 'PIT', 'PITTSBURGH STEELERS': 'PIT',
  SEA: 'SEA', SEAHAWKS: 'SEA', 'SEATTLE SEAHAWKS': 'SEA',
  SF: 'SF', SFO: 'SF', '49ERS': 'SF', 'SAN FRANCISCO 49ERS': 'SF',
  TB: 'TB', TBB: 'TB', BUCCANEERS: 'TB', 'TAMPA BAY BUCCANEERS': 'TB',
  TEN: 'TEN', TITANS: 'TEN', 'TENNESSEE TITANS': 'TEN',
  WAS: 'WAS', WSH: 'WAS', COMMANDERS: 'WAS', 'WASHINGTON COMMANDERS': 'WAS',
};

const POSITIONS = new Set([
  'QB', 'HB', 'RB', 'FB', 'WR', 'TE', 'LT', 'LG', 'C', 'RG', 'RT', 'OL', 'OT', 'OG',
  'LE', 'RE', 'DE', 'ED', 'DT', 'LOLB', 'ROLB', 'OLB', 'MLB', 'ILB', 'LB', 'CB', 'FS', 'SS', 'S',
  'K', 'P', 'LS', 'REDG', 'LEDG', 'RDT', 'RRE', 'RLE', 'SUBLB', 'NCB', 'MIKE', 'WILL', 'SAM',
]);

const RATING_LABELS = ['OVR', 'SPD', 'STR', 'AGI', 'COD', 'INJ', 'AWR'];

const NOISE_LINES = new Set([
  'PLAYER', 'ABILITY', 'POS', 'TEAM', 'OVR', 'SPD', 'STR', 'AGI', 'COD', 'INJ', 'AWR',
  'FILTER', 'RESET ALL', 'LEAGUES & TEAMS', 'AFC EAST', 'AFC NORTH', 'AFC SOUTH', 'AFC WEST',
  'NFC EAST', 'NFC NORTH', 'NFC SOUTH', 'NFC WEST', 'LANGUAGE', 'BACK TO TOP', 'PRE-ORDER NOW',
  'HOME', 'RATINGS', 'NEWS', 'COMMUNITY', 'POSITIVE PLAY', '*',
]);

function clean(value = '') {
  return String(value).replace(/\s+/g, ' ').trim();
}

function decodeEntities(value = '') {
  return String(value)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/&ndash;|&mdash;/gi, '-')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)));
}

function htmlToLines(html = '') {
  return decodeEntities(html)
    .replace(/<script[\s\S]*?<\/script>/gi, '\n')
    .replace(/<style[\s\S]*?<\/style>/gi, '\n')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '\n')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(p|div|li|a|span|h\d|button|td|th|tr|section|article)>/gi, '\n')
    .replace(/<[^>]+>/g, '\n')
    .split('\n')
    .map(clean)
    .filter(Boolean);
}

function normalizeName(value = '') {
  return clean(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(jr|sr|ii|iii|iv|v)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function normalizeTeam(value = '') {
  const key = clean(value).toUpperCase();
  return TEAM_ALIASES[key] || key;
}

function playerKey(player) {
  return `${normalizeName(player.name)}|${normalizeTeam(player.team)}`;
}

function parseNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(num) ? num : null;
}

function getValue(row, keys) {
  if (!row || typeof row !== 'object') return undefined;
  const entries = Object.entries(row);
  for (const wanted of keys) {
    const normalizedWanted = wanted.toLowerCase().replace(/[^a-z0-9]/g, '');
    const found = entries.find(([key]) => key.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedWanted);
    if (found && found[1] !== undefined && found[1] !== null && found[1] !== '') return found[1];
  }
  return undefined;
}

function getName(row) {
  const direct = getValue(row, ['player', 'playerName', 'fullName', 'displayName', 'name', 'commonName', 'full_name']);
  if (direct) return clean(direct);
  const first = getValue(row, ['firstName', 'first_name', 'first']);
  const last = getValue(row, ['lastName', 'last_name', 'last']);
  return [first, last].filter(Boolean).join(' ').trim();
}

function normalizeRatingRow(row) {
  const name = getName(row);
  const ovr = parseNumber(getValue(row, ['ovr', 'overall', 'overallRating', 'overall_rating', 'rating']));
  if (!name || ovr === null || ovr < 40 || ovr > 99) return null;

  return {
    name,
    ability: clean(getValue(row, ['ability', 'archetype', 'playerAbility', 'trait']) || '') || null,
    position: clean(getValue(row, ['pos', 'position', 'positionGroup']) || '') || null,
    team: normalizeTeam(clean(getValue(row, ['team', 'teamAbbr', 'teamAbbreviation', 'teamName', 'club']) || '')),
    ovr,
    spd: parseNumber(getValue(row, ['spd', 'speed'])),
    str: parseNumber(getValue(row, ['str', 'strength'])),
    agi: parseNumber(getValue(row, ['agi', 'agility'])),
    cod: parseNumber(getValue(row, ['cod', 'changeOfDirection', 'change_of_direction'])),
    inj: parseNumber(getValue(row, ['inj', 'injury'])),
    awr: parseNumber(getValue(row, ['awr', 'awareness'])),
  };
}

function dedupeRows(rows) {
  const unique = new Map();
  for (const row of rows) {
    if (!row?.name || row.ovr === null || row.ovr === undefined) continue;
    const key = `${normalizeName(row.name)}|${normalizeTeam(row.team) || ''}|${String(row.position || '').toUpperCase()}`;
    unique.set(key, row);
  }
  return [...unique.values()];
}

function collectArrays(value, arrays = []) {
  if (!value || typeof value !== 'object') return arrays;
  if (Array.isArray(value)) {
    if (value.some((item) => normalizeRatingRow(item))) arrays.push(value);
    value.forEach((item) => collectArrays(item, arrays));
    return arrays;
  }
  Object.values(value).forEach((item) => collectArrays(item, arrays));
  return arrays;
}

function extractRows(json) {
  const direct = [json, json?.items, json?.results, json?.data, json?.docs, json?.players, json?.entities].filter(Array.isArray);
  const arrays = direct.length ? direct : collectArrays(json);
  const rows = [];
  for (const array of arrays) {
    for (const item of array) {
      const row = normalizeRatingRow(item);
      if (row) rows.push(row);
    }
  }
  return dedupeRows(rows);
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json,text/plain,*/*',
      'User-Agent': 'MaddenProject ratings updater (+https://seanpullins.github.io/MaddenProject/)',
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'User-Agent': 'Mozilla/5.0 MaddenProject ratings updater (+https://seanpullins.github.io/MaddenProject/)',
    },
    redirect: 'follow',
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return { text: await response.text(), finalUrl: response.url || url };
}

function setOffset(url, offset) {
  const parsed = new URL(url);
  parsed.searchParams.set('offset', String(offset));
  return parsed.toString();
}

async function fetchFromApiCandidate(url) {
  const firstJson = await fetchJson(url);
  let rows = extractRows(firstJson);
  const limit = Number(new URL(url).searchParams.get('limit') || 100);
  let offset = limit;

  while (rows.length >= offset && offset <= 5000) {
    try {
      const pageRows = extractRows(await fetchJson(setOffset(url, offset)));
      if (!pageRows.length) break;
      rows = dedupeRows(rows.concat(pageRows));
      offset += limit;
    } catch {
      break;
    }
  }

  return rows;
}

function tokenLooksLikeName(value) {
  const text = clean(value);
  const upper = text.toUpperCase();
  if (text.length < 3 || text.length > 55) return false;
  if (!/[A-Za-z]/.test(text)) return false;
  if (NOISE_LINES.has(upper)) return false;
  if (POSITIONS.has(upper)) return false;
  if (TEAM_ALIASES[upper]) return false;
  if (/^\d+$/.test(text)) return false;
  if (/^(image:|showing|enter|filter|reset|buy|games|news|community|positive play|language|ea sports|madden nfl|the highest rated|official|continue to|pre-order|home$)/i.test(text)) return false;
  if (/^(ovr|spd|str|agi|cod|inj|awr)\s+\d+$/i.test(text)) return false;
  return true;
}

function readRatingLines(lines, startIndex) {
  const values = {};
  const endIndex = Math.min(lines.length, startIndex + 60);

  for (let i = startIndex; i < endIndex; i += 1) {
    const line = clean(lines[i]);
    const upper = line.toUpperCase();

    for (const label of RATING_LABELS) {
      if (values[label.toLowerCase()] !== undefined) continue;

      const inline = upper.match(new RegExp(`^${label}\\s*:?\\s*(\\d{1,3})$`));
      if (inline) {
        values[label.toLowerCase()] = parseNumber(inline[1]);
        continue;
      }

      if (upper === label) {
        const next = parseNumber(lines[i + 1]);
        if (Number.isFinite(next)) values[label.toLowerCase()] = next;
      }
    }

    if (values.ovr !== undefined && i > startIndex + 6 && tokenLooksLikeName(line)) break;
  }

  return values;
}

function parseRowsFromLines(rawLines, forcedTeam = '') {
  const lines = rawLines.map(clean).filter(Boolean);
  const rows = [];

  for (let i = 0; i < lines.length; i += 1) {
    const name = lines[i];
    if (!tokenLooksLikeName(name)) continue;

    const max = Math.min(lines.length, i + 18);
    let posIndex = -1;

    for (let j = i + 1; j < max; j += 1) {
      if (POSITIONS.has(lines[j].toUpperCase())) {
        posIndex = j;
        break;
      }
    }
    if (posIndex < 0) continue;

    const ratings = readRatingLines(lines, posIndex + 1);
    if (!Number.isFinite(ratings.ovr) || ratings.ovr < 40 || ratings.ovr > 99) continue;

    const ability = lines
      .slice(i + 1, posIndex)
      .filter((line) => !NOISE_LINES.has(line.toUpperCase()) && !/^image:/i.test(line))
      .join(' ') || null;

    const parsed = normalizeRatingRow({
      player: name,
      ability,
      pos: lines[posIndex],
      team: forcedTeam,
      ovr: ratings.ovr,
      spd: ratings.spd,
      str: ratings.str,
      agi: ratings.agi,
      cod: ratings.cod,
      inj: ratings.inj,
      awr: ratings.awr,
    });

    if (parsed) rows.push(parsed);
  }

  return dedupeRows(rows);
}

async function fetchTeamWithKnownUrl(team) {
  const url = `${TEAM_SOURCE_BASE}/${team.slug}`;
  const { text, finalUrl } = await fetchText(url);
  const rows = parseRowsFromLines(htmlToLines(text), team.abbr);
  if (rows.length < 10) throw new Error(`${team.name}: only ${rows.length} rows from ${finalUrl}`);
  return { rows, sourceUrl: finalUrl };
}

async function fetchTeamByProbingIds(team) {
  for (let id = 0; id <= 40; id += 1) {
    const url = `${TEAM_SOURCE_BASE}/${team.slug}/${id}`;
    try {
      const { text, finalUrl } = await fetchText(url);
      if (!new RegExp(team.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(text)) continue;
      const rows = parseRowsFromLines(htmlToLines(text), team.abbr);
      if (rows.length >= 10) return { rows, sourceUrl: finalUrl };
    } catch {
      // Keep probing; EA uses numeric ids in the URL and they can change by release.
    }
  }
  throw new Error(`${team.name}: no working team page id found`);
}

async function fetchFromTeamPages() {
  const allRows = [];
  const sourceUrls = [];
  const errors = [];

  for (const team of TEAM_PAGES) {
    try {
      const result = await fetchTeamWithKnownUrl(team).catch(() => fetchTeamByProbingIds(team));
      allRows.push(...result.rows);
      sourceUrls.push(result.sourceUrl);
      console.log(`Fetched ${result.rows.length} ${team.name} Madden ratings.`);
    } catch (error) {
      errors.push(error.message);
      console.warn(error.message);
    }
  }

  const rows = dedupeRows(allRows);
  console.log(`Static EA team pages produced ${rows.length} unique Madden rating rows.`);

  if (rows.length > 300) return { rows, sourceUrl: SOURCE_URL, sourceUrls };
  throw new Error(`Static team pages only produced ${rows.length} rows. ${errors.join(' | ')}`);
}

async function fetchRatings() {
  const errors = [];

  for (const url of API_CANDIDATES) {
    try {
      const rows = await fetchFromApiCandidate(url);
      if (rows.length > 100) return { rows, sourceUrl: url, sourceUrls: [url] };
      errors.push(`${url}: only ${rows.length} usable rows`);
    } catch (error) {
      errors.push(`${url}: ${error.message}`);
    }
  }

  try {
    return await fetchFromTeamPages();
  } catch (error) {
    errors.push(`EA static team pages: ${error.message}`);
  }

  throw new Error(`Unable to pull Madden ratings. Tried:\n${errors.join('\n')}`);
}

function parseRosterPlayers() {
  const source = fs.readFileSync(CONSTANTS_PATH, 'utf8');
  const playerRegex = /createPlayer\(\s*['"]([^'"]+)['"]\s*,\s*['"]((?:\\['"]|[^'"])*)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*([0-9]+)\s*,\s*['"]([^'"]+)['"]/g;
  const players = [];
  let match;

  while ((match = playerRegex.exec(source))) {
    const player = {
      id: match[1],
      name: match[2].replace(/\\'/g, "'").replace(/\\"/g, '"'),
      position: match[3],
      siteOvr: Number(match[4]),
      team: normalizeTeam(match[5]),
    };
    players.push({ ...player, key: playerKey(player) });
  }

  if (!players.length) throw new Error('No createPlayer(...) calls found in constants.ts');
  return players;
}

function buildIndexes(rows) {
  const byNameTeam = new Map();
  const byNamePos = new Map();
  const byName = new Map();

  rows.forEach((row) => {
    const name = normalizeName(row.name);
    const team = normalizeTeam(row.team);
    const pos = String(row.position || '').toUpperCase();
    if (!name) return;
    if (team) byNameTeam.set(`${name}|${team}`, row);
    if (pos) byNamePos.set(`${name}|${pos}`, row);
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name).push(row);
  });

  return { byNameTeam, byNamePos, byName };
}

function matchPlayer(player, indexes) {
  const name = normalizeName(player.name);
  const team = normalizeTeam(player.team);
  const pos = String(player.position || '').toUpperCase();
  const exactTeam = indexes.byNameTeam.get(`${name}|${team}`);
  if (exactTeam) return { row: exactTeam, confidence: 'exact name + team' };
  const exactPos = indexes.byNamePos.get(`${name}|${pos}`);
  if (exactPos) return { row: exactPos, confidence: 'exact name + position' };
  const exactName = indexes.byName.get(name) || [];
  if (exactName.length === 1) return { row: exactName[0], confidence: 'unique exact name' };
  return { row: null, confidence: 'unmatched' };
}

async function main() {
  const { rows, sourceUrl, sourceUrls = [] } = await fetchRatings();
  const rosterPlayers = parseRosterPlayers();
  const indexes = buildIndexes(rows);
  const updatedAt = new Date().toISOString();
  const players = {};
  let matchedCount = 0;

  for (const player of rosterPlayers) {
    const { row, confidence } = matchPlayer(player, indexes);
    const matched = Boolean(row);
    if (matched) matchedCount += 1;
    const ovr = matched ? row.ovr : null;

    players[player.key] = {
      matched,
      confidence,
      source: 'EA Madden Ratings',
      sourceUrl,
      playerKey: player.key,
      playerId: player.id,
      name: matched ? row.name : player.name,
      team: matched ? row.team : player.team,
      position: matched ? row.position : player.position,
      ability: matched ? row.ability : null,
      ovr,
      spd: matched ? row.spd : null,
      str: matched ? row.str : null,
      agi: matched ? row.agi : null,
      cod: matched ? row.cod : null,
      inj: matched ? row.inj : null,
      awr: matched ? row.awr : null,
      siteOvr: player.siteOvr,
      delta: typeof ovr === 'number' ? ovr - player.siteOvr : null,
      updatedAt,
    };
  }

  const output = {
    schemaVersion: 2,
    source: 'EA Madden Ratings',
    sourceUrl,
    sourceUrls: sourceUrls.slice(0, 40),
    updatedAt,
    totalSourceRatings: rows.length,
    rosterPlayerCount: rosterPlayers.length,
    matchedCount,
    unmatchedCount: rosterPlayers.length - matchedCount,
    players,
    sampleSourceRatings: rows.slice(0, 12).map((row) => ({
      name: row.name,
      team: row.team,
      position: row.position,
      ovr: row.ovr,
    })),
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Matched ${matchedCount}/${rosterPlayers.length} league players against ${rows.length} Madden ratings.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
