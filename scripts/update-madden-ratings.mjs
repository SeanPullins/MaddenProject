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

function normalizeName(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(jr|sr|ii|iii|iv|v)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function normalizeTeam(value = '') {
  const key = String(value).trim().toUpperCase();
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
  if (direct) return String(direct).trim();
  const first = getValue(row, ['firstName', 'first_name', 'first']);
  const last = getValue(row, ['lastName', 'last_name', 'last']);
  return [first, last].filter(Boolean).join(' ').trim();
}

function normalizeRatingRow(row) {
  const name = getName(row);
  const ovr = parseNumber(getValue(row, ['ovr', 'overall', 'overallRating', 'overall_rating', 'rating']));
  if (!name || ovr === null) return null;

  return {
    name,
    ability: String(getValue(row, ['ability', 'archetype', 'playerAbility', 'trait']) || '').trim() || null,
    position: String(getValue(row, ['pos', 'position', 'positionGroup']) || '').trim() || null,
    team: normalizeTeam(String(getValue(row, ['team', 'teamAbbr', 'teamAbbreviation', 'teamName', 'club']) || '').trim()),
    ovr,
    spd: parseNumber(getValue(row, ['spd', 'speed'])),
    str: parseNumber(getValue(row, ['str', 'strength'])),
    agi: parseNumber(getValue(row, ['agi', 'agility'])),
    cod: parseNumber(getValue(row, ['cod', 'changeOfDirection', 'change_of_direction'])),
    inj: parseNumber(getValue(row, ['inj', 'injury'])),
    awr: parseNumber(getValue(row, ['awr', 'awareness'])),
  };
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

function dedupeRows(rows) {
  const unique = new Map();
  rows.forEach((row) => unique.set(`${normalizeName(row.name)}|${normalizeTeam(row.team) || ''}|${row.position || ''}`, row));
  return [...unique.values()];
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

async function fetchFromEaPage() {
  const response = await fetch(SOURCE_URL, {
    headers: { 'User-Agent': 'MaddenProject ratings updater (+https://seanpullins.github.io/MaddenProject/)' },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const html = await response.text();
  const matches = [...html.matchAll(/<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const rows = [];

  for (const match of matches) {
    try {
      rows.push(...extractRows(JSON.parse(match[1])));
    } catch {
      // Ignore unrelated JSON.
    }
  }

  return dedupeRows(rows);
}

async function clickExactText(page, text) {
  const locator = page.getByText(text, { exact: true }).last();
  if (!(await locator.count())) return false;
  try {
    await locator.scrollIntoViewIfNeeded({ timeout: 2000 });
    await locator.click({ timeout: 3000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(750);
    return true;
  } catch {
    return false;
  }
}

async function revealPaginatedRows(page) {
  for (let pageNumber = 2; pageNumber <= 25; pageNumber += 1) {
    await clickExactText(page, String(pageNumber));
  }

  for (let i = 0; i < 10; i += 1) {
    await page.mouse.wheel(0, 1800).catch(() => {});
    await page.waitForTimeout(500);
  }
}

async function scrapeRowsFromDom(page) {
  const rawRows = await page.evaluate(({ teamAliases, positions }) => {
    const positionSet = new Set(positions);
    const teamMap = teamAliases;
    const seen = new Set();

    function isElement(value) {
      return value && value.nodeType === Node.ELEMENT_NODE;
    }

    function queryAllDeep(selector, root = document) {
      const results = [];
      const visit = (node) => {
        if (!node) return;
        if (node.querySelectorAll) {
          results.push(...node.querySelectorAll(selector));
        }
        const elements = node.querySelectorAll ? [...node.querySelectorAll('*')] : [];
        for (const element of elements) {
          if (element.shadowRoot) visit(element.shadowRoot);
        }
      };
      visit(root);
      return results;
    }

    function clean(value) {
      return String(value || '').replace(/\s+/g, ' ').trim();
    }

    function teamCode(value) {
      const key = clean(value).toUpperCase();
      return teamMap[key] || (key.length <= 4 ? key : '');
    }

    function parseCells(cells) {
      const cleaned = cells.map(clean).filter(Boolean);
      if (cleaned.length < 5) return null;

      const posIndex = cleaned.findIndex((cell) => positionSet.has(cell.toUpperCase()));
      if (posIndex <= 0) return null;

      const teamIndex = cleaned.findIndex((cell, index) => index > posIndex && teamCode(cell));
      if (teamIndex < 0) return null;

      const ovrIndex = cleaned.findIndex((cell, index) => index > teamIndex && /^\d{2}$/.test(cell));
      if (ovrIndex < 0) return null;

      const name = cleaned[0];
      const ability = cleaned.slice(1, posIndex).join(' ') || null;
      const numbers = cleaned.slice(ovrIndex).map((value) => Number(value.replace(/[^0-9.-]/g, ''))).filter(Number.isFinite);
      if (!name || !numbers.length) return null;

      return {
        name,
        ability,
        position: cleaned[posIndex],
        team: teamCode(cleaned[teamIndex]),
        ovr: numbers[0] ?? null,
        spd: numbers[1] ?? null,
        str: numbers[2] ?? null,
        agi: numbers[3] ?? null,
        cod: numbers[4] ?? null,
        inj: numbers[5] ?? null,
        awr: numbers[6] ?? null,
      };
    }

    function cellsFromRow(row) {
      const selectors = [
        'td',
        'th',
        '[role="cell"]',
        '[role="gridcell"]',
        '[class*="cell" i]',
        '[class*="column" i]',
      ];
      const cellNodes = selectors.flatMap((selector) => [...row.querySelectorAll(selector)]);
      const uniqueNodes = [...new Set(cellNodes)].filter(isElement);
      const cells = uniqueNodes.map((node) => node.innerText || node.textContent || '').map(clean).filter(Boolean);
      if (cells.length >= 5) return cells;
      return clean(row.innerText || row.textContent || '').split('\n').map(clean).filter(Boolean);
    }

    const rowSelectors = [
      'tr',
      '[role="row"]',
      '[class*="row" i]',
      '[class*="player" i]',
    ].join(',');

    const rowElements = queryAllDeep(rowSelectors);
    const rows = [];

    for (const row of rowElements) {
      const parsed = parseCells(cellsFromRow(row));
      if (!parsed || parsed.ovr === null) continue;
      const key = `${parsed.name}|${parsed.team}|${parsed.position}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push(parsed);
    }

    return rows;
  }, { teamAliases: TEAM_ALIASES, positions: [...POSITIONS] });

  return dedupeRows(rawRows.map(normalizeRatingRow).filter(Boolean));
}

async function fetchFromPlaywright() {
  let playwright;
  try {
    playwright = await import('playwright');
  } catch (error) {
    throw new Error(`Playwright fallback unavailable: ${error.message}`);
  }

  const { chromium } = playwright;
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1400 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
  });
  const page = await context.newPage();
  const batches = [];
  const discoveredUrls = new Set();

  page.on('response', async (response) => {
    try {
      const url = response.url();
      const contentType = response.headers()['content-type'] || '';
      const shouldInspect = contentType.includes('json') || /rating|madden|player|drop|api|graphql/i.test(url);
      if (!shouldInspect) return;

      const text = await response.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        return;
      }

      const rows = extractRows(json);
      if (rows.length) {
        batches.push({ url, rows });
        discoveredUrls.add(url);
        console.log(`Discovered ${rows.length} Madden rows from ${url}`);
      }
    } catch {
      // Ignore noisy page assets.
    }
  });

  try {
    await page.goto(SOURCE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(3000);
    await revealPaginatedRows(page);

    let rows = dedupeRows(batches.flatMap((batch) => batch.rows));
    let sourceUrl = batches.find((batch) => batch.rows.length)?.url || SOURCE_URL;

    for (const url of discoveredUrls) {
      try {
        if (!/[?&](offset|page|limit)=/i.test(url)) continue;
        const candidateRows = await fetchFromApiCandidate(url);
        if (candidateRows.length > rows.length) {
          rows = candidateRows;
          sourceUrl = url;
        }
      } catch {
        // Continue with collected browser responses.
      }
    }

    const domRows = await scrapeRowsFromDom(page);
    if (domRows.length > rows.length) {
      rows = domRows;
      sourceUrl = SOURCE_URL;
    }

    if (rows.length > 100) return { rows, sourceUrl };
    throw new Error(`Playwright only found ${rows.length} usable ratings rows`);
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
    const rows = await fetchFromEaPage();
    if (rows.length > 100) return { rows, sourceUrl: SOURCE_URL };
    errors.push(`${SOURCE_URL}: only ${rows.length} usable rows from static HTML`);
  } catch (error) {
    errors.push(`${SOURCE_URL}: ${error.message}`);
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
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Matched ${matchedCount}/${rosterPlayers.length} league players against ${rows.length} Madden ratings.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
