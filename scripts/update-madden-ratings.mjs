import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CONSTANTS_PATH = path.join(ROOT, 'constants.ts');
const OUT_DIR = path.join(ROOT, 'public', 'data');
const OUT_FILE = path.join(OUT_DIR, 'madden-ratings.json');
const SOURCE_URL = 'https://www.ea.com/games/madden-nfl/ratings';

const API_CANDIDATES = [
  process.env.MADDEN_RATINGS_API_URL,
  'https://drop-api.ea.com/rating/madden-nfl-26?locale=en&limit=100&offset=0',
  'https://drop-api.ea.com/rating/madden-nfl?locale=en&limit=100&offset=0',
  'https://drop-api.ea.com/rating/madden-nfl-25?locale=en&limit=100&offset=0',
].filter(Boolean);

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
  'LE', 'RE', 'DE', 'DT', 'LOLB', 'ROLB', 'OLB', 'MLB', 'ILB', 'LB', 'CB', 'FS', 'SS', 'S',
  'K', 'P', 'LS',
]);

const NOISE_LINES = new Set([
  'PLAYER', 'ABILITY', 'POS', 'TEAM', 'OVR', 'SPD', 'STR', 'AGI', 'COD', 'INJ', 'AWR',
  'FILTER', 'RESET ALL', 'LEAGUES & TEAMS', 'AFC EAST', 'AFC NORTH', 'AFC SOUTH', 'AFC WEST',
  'NFC EAST', 'NFC NORTH', 'NFC SOUTH', 'NFC WEST', 'LANGUAGE', 'BACK TO TOP', 'PRE-ORDER NOW',
]);

function clean(value = '') {
  return String(value).replace(/\s+/g, ' ').trim();
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
  if (text.length < 3 || text.length > 45) return false;
  if (!/[A-Za-z]/.test(text)) return false;
  if (NOISE_LINES.has(upper)) return false;
  if (POSITIONS.has(upper)) return false;
  if (TEAM_ALIASES[upper]) return false;
  if (/^\d+$/.test(text)) return false;
  if (/^(showing|enter|filter|reset|buy|games|news|community|positive play|language)/i.test(text)) return false;
  return true;
}

function lineToRow(text) {
  const parts = clean(text).split(/\s+/).filter(Boolean);
  if (parts.length < 5) return null;
  const posIndex = parts.findIndex((part) => POSITIONS.has(part.toUpperCase()));
  if (posIndex <= 0) return null;
  const teamIndex = parts.findIndex((part, index) => index > posIndex && TEAM_ALIASES[part.toUpperCase()]);
  if (teamIndex < 0) return null;
  const numbers = parts.slice(teamIndex + 1).map(parseNumber).filter((value) => Number.isFinite(value));
  if (!numbers.length) return null;
  const name = parts.slice(0, posIndex).join(' ');
  return normalizeRatingRow({
    player: name,
    pos: parts[posIndex],
    team: parts[teamIndex],
    ovr: numbers[0],
    spd: numbers[1],
    str: numbers[2],
    agi: numbers[3],
    cod: numbers[4],
    inj: numbers[5],
    awr: numbers[6],
  });
}

function parseRowsFromLines(rawLines) {
  const lines = rawLines.map(clean).filter(Boolean);
  const rows = [];

  for (const line of lines) {
    const parsed = lineToRow(line);
    if (parsed) rows.push(parsed);
  }

  for (let i = 0; i < lines.length; i += 1) {
    const name = lines[i];
    if (!tokenLooksLikeName(name)) continue;

    const max = Math.min(lines.length, i + 18);
    let posIndex = -1;
    let teamIndex = -1;
    let ovrIndex = -1;

    for (let j = i + 1; j < max; j += 1) {
      if (POSITIONS.has(lines[j].toUpperCase())) {
        posIndex = j;
        break;
      }
    }
    if (posIndex < 0) continue;

    for (let j = posIndex + 1; j < max; j += 1) {
      if (TEAM_ALIASES[lines[j].toUpperCase()]) {
        teamIndex = j;
        break;
      }
    }
    if (teamIndex < 0) continue;

    for (let j = teamIndex + 1; j < max; j += 1) {
      const n = parseNumber(lines[j]);
      if (Number.isFinite(n) && n >= 40 && n <= 99) {
        ovrIndex = j;
        break;
      }
    }
    if (ovrIndex < 0) continue;

    const numbers = lines.slice(ovrIndex, Math.min(lines.length, ovrIndex + 8)).map(parseNumber).filter((value) => Number.isFinite(value));
    const ability = lines.slice(i + 1, posIndex).filter((line) => !NOISE_LINES.has(line.toUpperCase())).join(' ') || null;

    const parsed = normalizeRatingRow({
      player: name,
      ability,
      pos: lines[posIndex],
      team: lines[teamIndex],
      ovr: numbers[0],
      spd: numbers[1],
      str: numbers[2],
      agi: numbers[3],
      cod: numbers[4],
      inj: numbers[5],
      awr: numbers[6],
    });
    if (parsed) rows.push(parsed);
  }

  return dedupeRows(rows);
}

async function fetchFromPlaywright() {
  let playwright;
  try {
    playwright = await import('playwright');
  } catch (error) {
    throw new Error(`Playwright unavailable: ${error.message}`);
  }

  const { chromium } = playwright;
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1600, height: 1800 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    locale: 'en-US',
  });

  const page = await context.newPage();
  const responseRows = [];
  const discoveredUrls = new Set();

  page.on('response', async (response) => {
    try {
      const url = response.url();
      const contentType = response.headers()['content-type'] || '';
      if (!contentType.includes('json') && !/rating|madden|player|drop|api|graphql/i.test(url)) return;
      const text = await response.text();
      const json = JSON.parse(text);
      const rows = extractRows(json);
      if (rows.length) {
        responseRows.push(...rows);
        discoveredUrls.add(url);
        console.log(`Captured ${rows.length} rows from ${url}`);
      }
    } catch {
      // Most page assets are unrelated. Ignore them.
    }
  });

  try {
    await page.goto(SOURCE_URL, { waitUntil: 'domcontentloaded', timeout: 90000 });

    for (const text of ['Accept All Cookies', 'Accept All', 'I Accept', 'Accept']) {
      await page.getByRole('button', { name: new RegExp(text, 'i') }).click({ timeout: 1500 }).catch(() => {});
    }

    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(5000);

    for (let i = 0; i < 14; i += 1) {
      await page.mouse.wheel(0, 1800).catch(() => {});
      await page.waitForTimeout(400);
    }

    for (let pageNumber = 2; pageNumber <= 21; pageNumber += 1) {
      await page.getByText(String(pageNumber), { exact: true }).click({ timeout: 1200 }).catch(() => {});
      await page.waitForTimeout(600);
    }

    let rows = dedupeRows(responseRows);
    let sourceUrl = discoveredUrls.values().next().value || SOURCE_URL;

    for (const url of discoveredUrls) {
      if (!/[?&](offset|page|limit)=/i.test(url)) continue;
      try {
        const candidateRows = await fetchFromApiCandidate(url);
        if (candidateRows.length > rows.length) {
          rows = candidateRows;
          sourceUrl = url;
        }
      } catch {
        // Keep browser-captured rows.
      }
    }

    const visibleText = await page.locator('body').innerText({ timeout: 10000 }).catch(() => '');
    const visibleRows = parseRowsFromLines(visibleText.split('\n'));
    if (visibleRows.length > rows.length) {
      rows = visibleRows;
      sourceUrl = SOURCE_URL;
    }

    const elementTexts = await page.evaluate(() => Array.from(document.querySelectorAll('*'))
      .map((element) => element.innerText || element.textContent || '')
      .filter(Boolean));
    const elementRows = parseRowsFromLines(elementTexts.flatMap((text) => String(text).split('\n')));
    if (elementRows.length > rows.length) {
      rows = elementRows;
      sourceUrl = SOURCE_URL;
    }

    console.log(`Browser scraper found ${rows.length} usable Madden rating rows.`);
    if (rows.length > 100) return { rows, sourceUrl };
    throw new Error(`Browser scraper only found ${rows.length} usable rows.`);
  } finally {
    await browser.close();
  }
}

async function fetchRatings() {
  const errors = [];

  for (const url of API_CANDIDATES) {
    try {
      const rows = await fetchFromApiCandidate(url);
      if (rows.length > 100) return { rows, sourceUrl: url };
      errors.push(`${url}: only ${rows.length} usable rows`);
    } catch (error) {
      errors.push(`${url}: ${error.message}`);
    }
  }

  try {
    return await fetchFromPlaywright();
  } catch (error) {
    errors.push(`Playwright browser fallback: ${error.message}`);
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
  const { rows, sourceUrl } = await fetchRatings();
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
    schemaVersion: 1,
    source: 'EA Madden Ratings',
    sourceUrl,
    updatedAt,
    totalSourceRatings: rows.length,
    rosterPlayerCount: rosterPlayers.length,
    matchedCount,
    unmatchedCount: rosterPlayers.length - matchedCount,
    players,
    sampleSourceRatings: rows.slice(0, 8).map((row) => ({
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
