import { Player, Team, FormerPlayer } from './types';

// Mock Attributes for visual flair
const GENERIC_ATTRS = [
  { name: 'SPD', value: 88 },
  { name: 'ACC', value: 85 },
  { name: 'STR', value: 70 },
  { name: 'AGI', value: 82 },
  { name: 'AWR', value: 75 },
];

const createPlayer = (id: string, name: string, pos: string, ovr: number, team: string, draft: string, fa: string, depth: number, status: 'ACTIVE' | 'PRACTICE_SQUAD' = 'ACTIVE'): Player => ({
    id,
    name,
    position: pos,
    team, // NFL Team
    ovr,
    imageUrl: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random&color=fff`, // Placeholder
    attributes: GENERIC_ATTRS,
    projectedPoints: Math.floor(ovr / 5),
    draftRound: draft,
    faYear: fa,
    status,
    depthOrder: depth
});

// Parsed Roster Data for Cruise Ship Crusaders
const ROSTER_CSC: Player[] = [
    // QB
    createPlayer('qb1', 'Clayton Tune', 'QB', 50, 'ARZ', '4th', '2027', 1),
    
    // RB
    createPlayer('rb1', 'Devin Neal', 'RB', 72, 'NO', '5th', '2029', 1),
    createPlayer('rb2', 'Roschon Johnson', 'RB', 71, 'CHI', '4th', '2027', 2),
    createPlayer('rb3', 'Dj Giddens', 'RB', 70, 'IND', '4th', '2029', 3),
    createPlayer('rb4', 'Rasheen Ali', 'RB', 69, 'BAL', '5th', '2028', 4),
    createPlayer('rb5', 'Sean Tucker', 'RB', 70, 'TB', 'UN', '2027', 5),
    
    // WR
    createPlayer('wr1', 'AJ Brown', 'WR', 89, 'PHI', 'FA 2023', '2028', 1),
    createPlayer('wr2', 'Adonai Mitchell', 'WR', 75, 'IND', '2nd', '2028', 2),
    createPlayer('wr3', 'Khalil Shakir', 'WR', 82, 'BUF', '4c', '2026', 1),
    createPlayer('wr4', 'Skyy Moore', 'WR', 72, 'KC', '2nd', '2026', 2),
    createPlayer('wr5', 'Jayden Higgins', 'WR', 75, 'HOU', '1st', '2029', 1),
    createPlayer('wr6', 'Isaiah Bond', 'WR', 69, 'CLE', '7th', '2029', 2),

    // TE
    createPlayer('te1', 'Noah Gray', 'TE', 75, 'KC', '4th', '2025', 1),
    createPlayer('te2', 'Gunnar Helm', 'TE', 70, 'TEN', '3rd', '2029', 2),
    createPlayer('te3', 'Ben Sims', 'TE', 62, 'MIN', 'UN', '2027', 3),
    createPlayer('te4', 'Chig Okonkwo', 'TE', 75, 'TEN', '4c', '2026', 1),
    createPlayer('te5', 'Charlie Kolar', 'TE', 68, 'BAL', '4th', '2026', 2),
    createPlayer('te6', 'Tanner McLachlan', 'TE', 0, 'CIN', '6th', '2028', 3), // Listed in active columns
    
    // OL
    createPlayer('ol1', 'Rashawn Slater', 'OT', 93, 'LAC', '1st', '2025', 1),
    createPlayer('ol2', 'KT Levingston', 'OG', 67, 'CLE', '7th', '2028', 2),
    createPlayer('ol3', 'Mason McCormick', 'OG', 75, 'PIT', '4th', '2028', 1),
    createPlayer('ol4', 'Robert Jones', 'OG', 70, 'MIA', 'UN', '2025', 2),
    createPlayer('ol5', 'Creed Humphrey', 'C', 95, 'KC', '2nd', '2025', 1),
    createPlayer('ol6', 'Luke Wypler', 'C', 66, 'CLE', '5th', '2027', 2),
    createPlayer('ol7', 'Chris Paul', 'OG', 74, 'WSH', '7th', '2026', 1),
    createPlayer('ol8', 'Jackson Slater', 'OG', 68, 'TEN', '5th', '2029', 2),
    createPlayer('ol9', 'Andrew Thomas', 'OT', 92, 'NYG', 'FA 2024', '2029', 1),
    createPlayer('ol10', 'Frank Crum', 'OT', 63, 'DEN', 'UN', '2028', 2),

    // DEFENSE ED
    createPlayer('ed1', 'Brian Burns', 'ED', 89, 'NYG', 'FA 2023', '2028', 1),
    createPlayer('ed2', 'Laiatu Latu', 'ED', 79, 'IND', '1st', '2028', 2),
    createPlayer('ed3', 'Isaiah McGuire', 'ED', 72, 'CLE', '3rd', '2027', 3),
    createPlayer('ed4', 'Josh Sweat', 'ED', 84, 'PHI', 'FA 2022', '2027', 1),
    createPlayer('ed5', 'Mike Green', 'ED', 75, 'BAL', '2nd', '2029', 2),
    createPlayer('ed6', 'Xavier Thomas', 'ED', 0, 'ARZ', '4th', '2028', 3),

    // DT
    createPlayer('dt1', 'Grady Jarrett', 'DT', 80, 'ATL', 'Legend', '2029', 1),
    createPlayer('dt2', 'Joshua Farmer', 'DT', 71, 'NE', '3rd', '2029', 2),
    createPlayer('dt3', 'Aeneas Peebles', 'DT', 68, 'BAL', '6th', '2029', 3),
    createPlayer('dt4', 'Javon Hargrave', 'DT', 80, 'SF', 'FA 2020', '2025', 1),
    createPlayer('dt5', 'CJ West', 'DT', 68, 'SF', '3rd', '2029', 2),
    createPlayer('dt6', 'Desjuan Johnson', 'DT', 63, 'LAR', '7th', '2027', 3),
    createPlayer('dt7', 'Keeanu Benton', 'DT', 76, 'PIT', '2nd', '2027', 1),

    // LB
    createPlayer('lb1', 'Zack Baun', 'LB', 90, 'PHI', 'FA 2024', '2029', 1),
    createPlayer('lb2', 'Henry To\'oTo\'o', 'LB', 75, 'HOU', '5th', '2027', 2),
    createPlayer('lb3', 'Damone Clark', 'LB', 71, 'DAL', '5th', '2026', 3),
    createPlayer('lb4', 'Nakobe Dean', 'LB', 78, 'PHI', '3rd', '2026', 1),
    createPlayer('lb5', 'Derrick Barnes', 'LB', 74, 'DET', '3rd', '2025', 2),
    createPlayer('lb6', 'Shaun Dolac', 'LB', 69, 'LAR', 'UN', '2029', 3),

    // CB
    createPlayer('cb1', 'Christian Gonzalez', 'CB', 96, 'NE', '1st', '2027', 1),
    createPlayer('cb2', 'Cam Hart', 'CB', 73, 'LAC', '4th', '2028', 2),
    createPlayer('cb3', 'Cobee Bryant', 'CB', 65, 'SEA', 'UN', '2029', 3),
    createPlayer('cb4', 'Jarvis Brownlee', 'CB', 75, 'TEN', '4th', '2028', 1),
    createPlayer('cb5', 'Bo Melton', 'CB', 68, 'SEA', '6c', '2026', 2),
    createPlayer('cb6', 'Benjamin Morrison', 'CB', 75, 'TB', '2nd', '2029', 1),
    createPlayer('cb7', 'Tre Brown', 'CB', 50, 'SEA', '4th', '2025', 2),

    // S
    createPlayer('s1', 'Kyle Hamilton', 'S', 93, 'BAL', '1st', '2026', 1),
    createPlayer('s2', 'Ji\'Ayir Brown', 'S', 74, 'SF', '3rd', '2027', 2),
    createPlayer('s3', 'Xavier Woods', 'S', 81, 'CAR', 'FA 2020', '2026', 1),
    createPlayer('s4', 'Darrick Forrest', 'S', 50, 'WSH', '4th', '2025', 2),
];

const PRACTICE_SQUAD_CSC: Player[] = [
    createPlayer('ps1', 'Rakim Jarrett', 'WR', 0, 'TB', 'UN', '2027', 9, 'PRACTICE_SQUAD'),
    createPlayer('ps2', 'Javon Baker', 'WR', 0, 'NE', '3rd', '2028', 9, 'PRACTICE_SQUAD'),
    createPlayer('ps3', 'Garret Greenfield', 'OT', 0, 'SEA', 'UN', '2028', 9, 'PRACTICE_SQUAD'),
    createPlayer('ps4', 'Atonio Mafi', 'OG', 0, 'NE', '4th', '2027', 9, 'PRACTICE_SQUAD'),
    createPlayer('ps5', 'Joshua Gray', 'OG', 0, 'Unknown', 'UN', '2029', 9, 'PRACTICE_SQUAD'),
    createPlayer('ps6', 'Brenden Jaimes', 'OT', 0, 'LAC', '5th', '2025', 9, 'PRACTICE_SQUAD'),
    createPlayer('ps7', 'Carl Lawson', 'ED', 0, 'Unknown', 'FA 2021', '2026', 9, 'PRACTICE_SQUAD'),
    createPlayer('ps8', 'Chris Paul jr', 'LB', 0, 'Unknown', '5th', '2029', 9, 'PRACTICE_SQUAD'),
    createPlayer('ps9', 'Desmond King', 'CB', 0, 'HOU', 'FA 2021', '2026', 9, 'PRACTICE_SQUAD'),
    createPlayer('ps10', 'Jc Jackson', 'CB', 0, 'Unknown', 'FA 2022', '2027', 9, 'PRACTICE_SQUAD'),
];

const FORMER_PLAYERS_CSC: FormerPlayer[] = [
    { name: 'Pierre Desir', reason: 'FA', compensation: '4th Rd (2014)' },
    { name: 'C Latimer, L Seastrunk, S Johnson, J Janis', reason: 'Cut' },
    { name: 'Dj Humphries', reason: 'FA', compensation: '4th Rd (2015)' },
    { name: 'R Gregory, C Davis, M Bennett', reason: 'Cut' },
    { name: 'L Ekpre-Olomu', reason: 'Cut' },
    { name: 'Joe Haeg', reason: 'FA', compensation: '5th Rd (2016)' },
    { name: 'Karl Joseph', reason: 'FA', compensation: '4th Rd' },
    { name: 'Mackenzie Alexander', reason: 'FA', compensation: '4th Rd' },
    { name: 'A Morrison, M Thomas, S Wright', reason: 'Cut' },
    { name: 'Pat Elfein', reason: 'FA', compensation: '4th Rd (2017)' },
    { name: 'Sidney Jones', reason: 'FA', compensation: '4th Rd' },
    { name: 'Solomon Thomas', reason: 'FA', compensation: '6th Rd' },
    { name: 'J Rosen, Q Meeks, J Myrick, T Coney', reason: 'Cut' },
    { name: 'C Wilson, K Hudson, K Willekes, H Matafa', reason: 'Cut' },
    { name: 'Michael Gallup', reason: 'FA', compensation: '4th Rd (2018)' },
    { name: 'Equanimeous St Brown', reason: 'FA', compensation: '3rd Rd' },
    { name: 'Richie James', reason: 'FA', compensation: '5th Rd' },
    { name: 'D Guice, M Hurst, J Jones', reason: 'Cut' },
    { name: 'C Strong, S Morgan, J Wiggins', reason: 'Cut' },
    { name: 'D Moses, F Darby', reason: 'Cut' },
    { name: 'C Winovich, A Oruwariye, O Udoh, M Dogbe', reason: 'Cut', compensation: '2019 Draft' },
    { name: 'Kyle Fuller, Preston Williams', reason: 'Cut' },
    { name: 'Foster Moreau', reason: 'FA', compensation: '4th Rd' },
    { name: 'Blake Cashman', reason: 'FA', compensation: '4th Rd' },
    { name: 'Aj Green, L Jackson, G Jackson', reason: 'Cut', compensation: '2020 Draft' },
    { name: 'M Bailey, D Peoples Jones', reason: 'Cut' },
    { name: 'K Dotson', reason: 'Trade' },
    { name: 'Geno Stone', reason: 'FA', compensation: '3rd Rd' },
    { name: 'JK Dobbins', reason: 'FA', compensation: '4th Rd' },
    { name: 'Shane Lemieux', reason: 'FA', compensation: '5th Rd' },
];

// --- Key West Killas Data ---

const ROSTER_KILLAS: Player[] = [
    // QB
    createPlayer('kqb1', 'Shedeur Sanders', 'QB', 69, 'Unknown', '4th', '2029', 1),
    createPlayer('kqb2', 'Malik Willis', 'QB', 65, 'TEN', '3rd', '2026', 2),
    createPlayer('kqb3', 'Sam Howell', 'QB', 65, 'WAS', '4th', '2026', 3),

    // RB
    createPlayer('krb1', 'Omarion Hampton', 'RB', 80, 'Unknown', '1st', '2029', 1),
    createPlayer('krb2', 'Jaylen Wright', 'RB', 73, 'MIA', '4th', '2028', 2),

    // WR
    createPlayer('kwr1', 'Christian Kirk', 'WR', 77, 'JAX', 'FA 2022', '2026', 1),
    createPlayer('kwr2', 'Jacob Cowing', 'WR', 71, 'SF', '4th', '2028', 2),
    createPlayer('kwr3', 'Cedric Tillman', 'WR', 74, 'CLE', '3rd', '2026', 1),
    createPlayer('kwr4', 'Isaiah Williams', 'WR', 67, 'DET', 'UN', '2028', 2),
    createPlayer('kwr5', 'Malik Washington', 'WR', 72, 'MIA', '5th', '2028', 1),
    createPlayer('kwr6', 'Ihmir Smith-Marsette', 'WR', 50, 'NYG', '4th', '2025', 2),

    // TE
    createPlayer('kte1', 'Luke Musgrave', 'TE', 70, 'GB', '2nd', '2027', 1),
    createPlayer('kte2', 'Dallin Holker', 'TE', 50, 'NO', 'UN', '2027', 2),
    createPlayer('kte3', 'Jake Briningstool', 'TE', 63, 'Unknown', 'UN', '2029', 1),
    createPlayer('kte4', 'Noah Grindorf', 'TE', 50, 'NDST', 'UN', '2027', 2),

    // OL
    createPlayer('kol1', 'Warren McClendon', 'OT', 73, 'LAR', '5th', '2027', 1),
    createPlayer('kol2', 'Cam Williams', 'OT', 66, 'Unknown', '6th', '2029', 2),
    createPlayer('kol3', 'Kevin Dotson', 'OG', 86, 'LAR', 'FA 2024', '2028', 1),
    createPlayer('kol4', 'Emery Jones', 'OG', 71, 'Unknown', '3rd', '2029', 2),
    createPlayer('kol5', 'Tyler Linderbaum', 'C', 87, 'BAL', '1st', '2026', 1),
    createPlayer('kol6', 'Jedrick Wills', 'C', 45, 'CLE', 'FA 2024', '2028', 2), // Listed as C backup
    createPlayer('kol7', 'Andrew Vorhees', 'OG', 71, 'BAL', '7th', '2027', 1),
    createPlayer('kol8', 'Logan Brown', 'OT', 50, 'Unknown', 'UN', '2029', 2),
    createPlayer('kol9', 'Jamaree Salyer', 'OT', 70, 'LAC', '6th', '2026', 1),
    createPlayer('kol10', 'Carter Warren', 'OT', 50, 'NYJ', '4th', '2027', 2),

    // ED
    createPlayer('ked1', 'Montez Sweat', 'ED', 82, 'CHI', 'FA 2023', '2027', 1),
    createPlayer('ked2', 'Josiah Stewart', 'ED', 73, 'Unknown', '3rd', '2029', 2),
    createPlayer('ked3', 'Jared Ivey', 'ED', 59, 'Unknown', '7th', '2029', 3),
    createPlayer('ked4', 'Jaelan Phillips', 'ED', 81, 'MIA', '1st', '2025', 1),
    createPlayer('ked5', 'Bradyn Swinson', 'ED', 71, 'Unknown', '4th', '2029', 2),

    // DT
    createPlayer('kdt1', 'Byron Murphy', 'DT', 81, 'SEA', '1st', '2028', 1),
    createPlayer('kdt2', 'Adetomiwa Adebawore', 'DT', 67, 'IND', '3rd', '2027', 2),
    createPlayer('kdt3', 'Levi Drake Rodriguez', 'DT', 69, 'MIN', '7th', '2028', 1),
    createPlayer('kdt4', 'Leonard Taylor', 'DT', 50, 'NYJ', '6th', '2028', 2),

    // LB
    createPlayer('klb1', 'Micah McFadden', 'LB', 76, 'NYG', '4c', '2026', 1), // Listed as DT3/LB3
    createPlayer('klb2', 'Jack Campbell', 'LB', 87, 'DET', '1st', '2027', 1),
    createPlayer('klb3', 'Jamal Adams', 'LB', 72, 'TEN', 'FA 2021', '2026', 2),
    createPlayer('klb4', 'Jeremiah Owusu-Koramoah', 'LB', 83, 'CLE', '2nd', '2025', 1),
    createPlayer('klb5', 'Cody Simon', 'LB', 70, 'Unknown', '3rd', '2029', 2),

    // CB
    createPlayer('kcb1', 'Kamari Lassiter', 'CB', 85, 'HOU', '2nd', '2028', 1),
    createPlayer('kcb2', 'Marcus Harris', 'CB', 71, 'Unknown', '5th', '2029', 2),
    createPlayer('kcb3', 'Paulson Adebo', 'CB', 78, 'NO', '3rd', '2025', 1),
    createPlayer('kcb4', 'Andrew Booth', 'CB', 50, 'MIN', '2nd', '2026', 2),
    createPlayer('kcb5', 'Clark Phillips', 'CB', 75, 'ATL', '3rd', '2027', 1), // Nickel
    createPlayer('kcb6', 'Eli Ricks', 'CB', 50, 'PHI', 'UN', '2027', 2),

    // S
    createPlayer('ks1', 'Calen Bullock', 'S', 77, 'HOU', '3rd', '2028', 1),
    createPlayer('ks2', 'Malachi Moore', 'S', 70, 'Unknown', '4th', '2029', 2),
    createPlayer('ks3', 'Markquese Bell', 'S', 72, 'DAL', 'UN', '2026', 1),
    createPlayer('ks4', 'JJ Roberts', 'S', 64, 'Unknown', 'UN', '2029', 2),
];

const PRACTICE_SQUAD_KILLAS: Player[] = [
    createPlayer('kps1', 'Blake Watson', 'RB', 0, 'DEN', 'UN', '2028', 9, 'PRACTICE_SQUAD'),
    createPlayer('kps2', 'Israel Abanikanda', 'RB', 0, 'NYJ', '4th', '2027', 9, 'PRACTICE_SQUAD'),
    createPlayer('kps3', 'DeWayne McBride', 'RB', 0, 'MIN', '6th', '2027', 9, 'PRACTICE_SQUAD'),
    createPlayer('kps4', 'Abram Smith', 'RB', 0, 'NO', 'UN', '2026', 9, 'PRACTICE_SQUAD'),
    createPlayer('kps5', 'Justyn Ross', 'WR', 0, 'KC', '5c', '2026', 9, 'PRACTICE_SQUAD'),
    createPlayer('kps6', 'Kyle Philips', 'WR', 0, 'TEN', '5th', '2026', 9, 'PRACTICE_SQUAD'),
    createPlayer('kps7', 'Austin Watkins', 'WR', 0, 'Unknown', 'UN', '2025', 9, 'PRACTICE_SQUAD'),
    createPlayer('kps8', 'Tamorrian Terry', 'WR', 0, 'Unknown', 'UN', '2025', 9, 'PRACTICE_SQUAD'),
    createPlayer('kps9', 'David Moore', 'OT', 0, 'Unknown', 'UN', '2025', 9, 'PRACTICE_SQUAD'),
    createPlayer('kps10', 'Marvin Wilson', 'DT', 0, 'Unknown', '7th', '2025', 9, 'PRACTICE_SQUAD'),
    createPlayer('kps11', 'Jerrod Clark', 'DT', 0, 'LAC', 'UN', '2027', 9, 'PRACTICE_SQUAD'),
    createPlayer('kps12', 'Cam McGrone', 'LB', 0, 'Unknown', '5th', '2025', 9, 'PRACTICE_SQUAD'),
    createPlayer('kps13', 'Jeremiah Gemmel', 'LB', 0, 'SF', 'UN', '2026', 9, 'PRACTICE_SQUAD'),
    createPlayer('kps14', 'Thomas Graham Jr', 'CB', 0, 'Unknown', '6th', '2025', 9, 'PRACTICE_SQUAD'),
    createPlayer('kps15', 'Shaun Wade', 'CB', 0, 'Unknown', '4th', '2025', 9, 'PRACTICE_SQUAD'),
    createPlayer('kps16', 'Kendall Fuller', 'CB', 0, 'Unknown', 'FA 2020', '2025', 9, 'PRACTICE_SQUAD'),
    createPlayer('kps17', 'Sidney Jones', 'CB', 0, 'Unknown', 'FA 2021', '2026', 9, 'PRACTICE_SQUAD'),
    createPlayer('kps18', 'DJ James', 'CB', 0, 'SEA', '6th', '2028', 9, 'PRACTICE_SQUAD'),
    createPlayer('kps19', 'Juan Thornhill', 'S', 0, 'CLE', 'FA 2023', '2027', 9, 'PRACTICE_SQUAD'),
    createPlayer('kps20', 'Caden Sterns', 'S', 0, 'DEN', '4th', '2025', 9, 'PRACTICE_SQUAD'),
];

const FORMER_PLAYERS_KILLAS: FormerPlayer[] = [
    { name: 'Jon Ursehl', reason: 'Retired', compensation: '2014 Draft' },
    { name: 'J Attaochu, T Brooks, T Savage', reason: 'Cut' },
    { name: 'D McCullers, A Dixon', reason: 'Cut' },
    { name: 'R Gregory, T Clemons, M Bennett', reason: 'Cut', compensation: '2015 Draft' },
    { name: 'L Ekpre-Olomu', reason: 'Cut' },
    { name: 'Devontae Booker', reason: 'FA', compensation: '6th Rd (2016)' },
    { name: 'Mackenzie Alexander', reason: 'FA', compensation: '4th Rd' },
    { name: 'C Coleman, K Brothers', reason: 'Cut' },
    { name: 'A Zettel, S Wright', reason: 'Cut' },
    { name: 'Pat Elflien', reason: 'FA', compensation: '4th Rd (2017)' },
    { name: 'T Thompson, J Leggett, C Brantley', reason: 'Cut' },
    { name: 'B Hodges, A Carr', reason: 'Cut' },
    { name: 'D. Harrison, G. Stroman, J. Jones', reason: 'Cut', compensation: '2018 Draft' },
    { name: 'D. Burnett, R. Foster, M. Hurst', reason: 'Cut' },
    { name: 'R. Freeman, J. Rosen', reason: 'Cut' },
    { name: 'Equanimeous St Brown', reason: 'Cut', compensation: '3rd Rd' },
    { name: 'Josh Sweat', reason: 'Cut', compensation: '3rd Rd' },
    { name: 'B Evans, M Jordan, K Harmon, A Mack', reason: 'Cut', compensation: '2019 Draft' },
    { name: 'S Denmark, T Jackson, T Hanks, T Coney', reason: 'Cut' },
    { name: 'Mack Wilson', reason: 'FA', compensation: '6th Rd' },
    { name: 'L Shenault, D Asiasi, K Hill', reason: 'Cut', compensation: '2020 Draft' },
    { name: 'E Benjamin, C Johnston, H Bryant', reason: 'Cut' },
    { name: 'J Leake, J Robinson, M Brown', reason: 'Cut' },
    { name: 'L Collins, T Gipson', reason: 'Cut' },
    { name: 'Harrison Bryant', reason: 'FA', compensation: '5th Rd' },
    { name: 'Grady Jarrett', reason: 'FA', compensation: '3rd Rd' },
    { name: 'Zach Martin', reason: 'Retired', compensation: '4th Rd' },
];

// --- New Lexington Legends Data ---
const ROSTER_LEGENDS: Player[] = [
    // QB
    createPlayer('lqb1', 'Jaxson Dart', 'QB', 76, 'Unknown', '1st', '2029', 1),
    createPlayer('lqb2', 'Mac Jones', 'QB', 74, 'JAX', '1st', '2025', 2),
    createPlayer('lqb3', 'Spencer Rattler', 'QB', 70, 'NO', '4th', '2028', 3),

    // RB
    createPlayer('lrb1', 'Jonathan Taylor', 'RB', 97, 'IND', 'FA 2024', '2029', 1),

    // WR
    createPlayer('lwr1', 'Jaxson Smith-Njigba', 'WR', 94, 'SEA', '1st', '2027', 1),
    createPlayer('lwr2', 'Nico Collins', 'WR', 89, 'HOU', '3rd', '2025', 1),
    createPlayer('lwr3', 'Chris Olave', 'WR', 86, 'NO', '1st', '2026', 1),
    createPlayer('lwr4', 'Jalen Nailor', 'WR', 77, 'MIN', '5c', '2026', 2),
    createPlayer('lwr5', 'Bryce Ford-Wheaton', 'WR', 68, 'NYG', 'UN', '2027', 2),
    createPlayer('lwr6', 'Tre Nixon', 'WR', 50, 'NE', '7th', '2025', 2),

    // TE
    createPlayer('lte1', 'Brock Bowers', 'TE', 93, 'LV', '1st', '2028', 1),
    createPlayer('lte2', 'Josh Whyle', 'TE', 69, 'TEN', '4th', '2027', 2),
    createPlayer('lte3', 'Brevin Jordan', 'TE', 68, 'HOU', '4th', '2025', 1),

    // OL
    createPlayer('lol1', 'Tristian Wirfs', 'OT', 96, 'TB', 'FA 2024', '2029', 1),
    createPlayer('lol2', 'Trey Smith', 'OG', 91, 'KC', '5th', '2025', 1),
    createPlayer('lol3', 'Kiran Amegadjie', 'OT', 69, 'CHI', '3rd', '2028', 1),
    createPlayer('lol4', 'Miles Frazier', 'OG', 69, 'Unknown', '3rd', '2029', 1),
    createPlayer('lol5', 'Darian Kinnard', 'OT', 68, 'PHI', '3c', '2026', 2),
    createPlayer('lol6', 'Jake Andrews', 'C', 67, 'NE', '3rd', '2027', 1),
    createPlayer('lol7', 'Sedrick Van Pran-Granger', 'C', 66, 'BUF', '4th', '2028', 2),
    createPlayer('lol8', 'Myles Hinton', 'OG', 65, 'Unknown', '5th', '2029', 2),
    createPlayer('lol9', 'Chase Lundt', 'OT', 65, 'Unknown', '6th', '2029', 2),
    createPlayer('lol10', 'Stone Forsythe', 'OT', 63, 'SEA', '6th', '2025', 3),
    createPlayer('lol11', 'Willie Lampkin', 'OG', 63, 'Unknown', 'UN', '2029', 2),

    // ED
    createPlayer('led1', 'Josh Sweat', 'ED', 84, 'PHI', 'FA 2022', '2027', 1),
    createPlayer('led2', 'Tavius Robinson', 'ED', 74, 'BAL', '4th', '2027', 1),
    createPlayer('led3', 'Kingsley Enagbare', 'ED', 71, 'GB', '5c', '2026', 2),
    createPlayer('led4', 'Mekhi Wingo', 'ED', 70, 'DET', '5th', '2028', 2),
    createPlayer('led5', 'Matt Judon', 'ED', 50, 'ATL', 'FA 2020', '2025', 2),

    // DT
    createPlayer('ldt1', 'Gervon Dexter Sr', 'DT', 79, 'CHI', '2nd', '2027', 1),
    createPlayer('ldt2', 'Travis Jones', 'DT', 79, 'BAL', '3rd', '2026', 1),
    createPlayer('ldt3', 'JJ Pegues', 'DT', 67, 'Unknown', '5th', '2029', 2),
    createPlayer('ldt4', 'Tyrion Ingram-Dawkins', 'DT', 67, 'Unknown', '4th', '2029', 2),

    // LB
    createPlayer('llb1', 'Ivan Pace', 'LB', 77, 'MIN', '7th', '2027', 1),
    createPlayer('llb2', 'Jamal Adams', 'LB', 72, 'TEN', 'FA 2021', '2026', 1),
    createPlayer('llb3', 'Nathaniel Watson', 'LB', 68, 'CLE', '6th', '2028', 1),
    createPlayer('llb4', 'Jay Higgins', 'LB', 61, 'Unknown', 'UN', '2029', 2),
    createPlayer('llb5', 'JaWhaun Bentley', 'LB', 50, 'NE', 'FA 2022', '2027', 2),

    // CB
    createPlayer('lcb1', 'Tariq Woolen', 'CB', 81, 'SEA', '5th', '2026', 1),
    createPlayer('lcb2', 'Asante Samuel Jr', 'CB', 76, 'LAC', '2nd', '2025', 1), // Nickel
    createPlayer('lcb3', 'Mekhi Blackmon', 'CB', 76, 'MIN', '3rd', '2027', 1),
    createPlayer('lcb4', 'Josh Jobe', 'CB', 74, 'PHI', 'UN', '2026', 2),
    createPlayer('lcb5', 'Shavon Revel', 'CB', 72, 'Unknown', '2nd', '2029', 2),
    createPlayer('lcb6', 'Damarri Mathis', 'CB', 71, 'DEN', '4th', '2026', 2),
    createPlayer('lcb7', 'TJ Tampa', 'CB', 69, 'BAL', '4th', '2028', 3),
    createPlayer('lcb8', 'Cory Trice', 'CB', 67, 'PIT', '6th', '2027', 3),

    // S
    createPlayer('ls1', 'Jaquan Brisker', 'S', 84, 'CHI', '2nd', '2026', 1),
    createPlayer('ls2', 'Javon Bullard', 'S', 75, 'GB', '2nd', '2028', 1),
    createPlayer('ls3', 'Jordan Battle', 'S', 76, 'CIN', '3rd', '2027', 1),
    createPlayer('ls4', 'Xavier Watts', 'S', 76, 'Unknown', '3rd', '2029', 1),
    createPlayer('ls5', 'Lathan Ransom', 'S', 70, 'Unknown', '3rd', '2029', 2),
    createPlayer('ls6', 'JL Skinner', 'S', 66, 'DEN', '5th', '2027', 2),
];

const PRACTICE_SQUAD_LEGENDS: Player[] = [
    createPlayer('lps1', 'Michael Pratt', 'QB', 0, 'GB', '7th', '2028', 9, 'PRACTICE_SQUAD'),
    createPlayer('lps2', 'Kevin Austin', 'WR', 0, 'NO', 'UN', '2026', 9, 'PRACTICE_SQUAD'),
    createPlayer('lps3', 'Samori Toure', 'WR', 0, 'GB', '7th', '2026', 9, 'PRACTICE_SQUAD'),
    createPlayer('lps4', 'Michael Gallup', 'WR', 0, 'LV', 'FA 2022', '2026', 9, 'PRACTICE_SQUAD'),
    createPlayer('lps5', 'Cade Johnson', 'WR', 0, 'SEA', 'UN', '2025', 9, 'PRACTICE_SQUAD'),
    createPlayer('lps6', 'Jaxson Kirkland', 'OT', 0, 'CIN', 'UN', '2027', 9, 'PRACTICE_SQUAD'),
    createPlayer('lps7', 'Garrett Dellinger', 'OG', 0, 'Unknown', '7th', '2029', 9, 'PRACTICE_SQUAD'),
    createPlayer('lps8', 'Cody Whitehair', 'OG', 0, 'LV', 'FA 2020', '2025', 9, 'PRACTICE_SQUAD'),
    createPlayer('lps9', 'Dohnavon West', 'C', 0, 'Unknown', '6th', '2026', 9, 'PRACTICE_SQUAD'),
    createPlayer('lps10', 'Luke Kandra', 'OG', 0, 'Unknown', 'UN', '2029', 9, 'PRACTICE_SQUAD'),
    createPlayer('lps11', 'Jordan McFadden', 'OG', 0, 'LAC', '5th', '2027', 9, 'PRACTICE_SQUAD'),
    createPlayer('lps12', 'Mohamed Kamara', 'ED', 0, 'MIA', '4th', '2028', 9, 'PRACTICE_SQUAD'),
    createPlayer('lps13', 'Carl Lawson', 'ED', 0, 'DAL', 'FA 2021', '2026', 9, 'PRACTICE_SQUAD'),
    createPlayer('lps14', 'Christian Wilkins', 'DT', 0, 'LV', 'FA 2023', '2028', 9, 'PRACTICE_SQUAD'),
    createPlayer('lps15', 'Daviyon Nixon', 'DT', 0, 'Unknown', '4th', '2025', 9, 'PRACTICE_SQUAD'),
    createPlayer('lps16', 'Christopher Hinton', 'DT', 0, 'LAC', 'UN', '2026', 9, 'PRACTICE_SQUAD'),
    createPlayer('lps17', 'Andre Carter', 'ED', 0, 'MIN', 'UN', '2027', 9, 'PRACTICE_SQUAD'),
    createPlayer('lps18', 'CJ Mosley', 'LB', 0, 'NYJ', 'Legend', '2028', 9, 'PRACTICE_SQUAD'),
    createPlayer('lps19', 'Shakur Brown', 'CB', 0, 'Unknown', 'UN', '2025', 9, 'PRACTICE_SQUAD'),
    createPlayer('lps20', 'Bryan Mills', 'CB', 0, 'Unknown', 'UN', '2025', 9, 'PRACTICE_SQUAD'),
    createPlayer('lps21', 'Jamar Johnson', 'S', 0, 'Unknown', '4th', '2025', 9, 'PRACTICE_SQUAD'),
    createPlayer('lps22', 'Gerald Willis', 'DT', 0, 'Unknown', 'UN', '2025', 9, 'PRACTICE_SQUAD'),
];

const FORMER_PLAYERS_LEGENDS: FormerPlayer[] = [
    { name: 'Donte Moncrief', reason: 'FA', compensation: '5th Rd (2014)' },
    { name: 'D Yankey, L Seastrunk, S Henderson', reason: 'Cut' },
    { name: 'Breshard Perriman', reason: 'FA', compensation: '5th Rd (2015)' },
    { name: 'R Gregory, P Dawson, J Ajayi', reason: 'Cut' },
    { name: 'J James, L Ekpre-Olomu', reason: 'Cut' },
    { name: 'Karl Joseph', reason: 'FA', compensation: '4th Rd (2016)' },
    { name: 'A Washington, K Dixon, M Boehringer', reason: 'Cut' },
    { name: 'A Burbridge, S Wright', reason: 'Cut' },
    { name: 'Tyus Bowser', reason: 'FA', compensation: '3rd Rd (2017)' },
    { name: 'Ahkello Witherspoon', reason: 'FA', compensation: '5th Rd' },
    { name: 'N Peterman, C Brantley, B Hodges', reason: 'Cut' },
    { name: 'M Dupre', reason: 'Cut' },
    { name: 'J Rosen, Q Meeks, H Hill', reason: 'Cut', compensation: '2018 Draft' },
    { name: 'S Cobbs, M Hurst', reason: 'Cut' },
    { name: 'Equanimeous St Brown', reason: 'Cut', compensation: '3rd Rd' },
    { name: 'Uchenna Nwosu', reason: 'FA', compensation: '3rd Rd' },
    { name: 'Richie James', reason: 'FA', compensation: '5th Rd' },
    { name: 'G Williams, H Butler, D Edwards, D Daley', reason: 'Cut', compensation: '2019 Draft' },
    { name: 'B Benzschwel, K Doss, J Moreland', reason: 'Cut' },
    { name: 'T Prescod, G Willis, L Duvernay-Tardif, S Tuitt', reason: 'Cut' },
    { name: 'Foster Moreau', reason: 'FA', compensation: '4th Rd' },
    { name: 'Donald Parham', reason: 'FA', compensation: '4th Rd' },
    { name: 'J Eason, B Hall, B Anae', reason: 'Cut', compensation: '2020 Draft' },
    { name: 'J Pinkney, R Williams, L Bellamy', reason: 'Cut' },
    { name: 'T Higby, L Collins', reason: 'Cut' },
    { name: 'Damien Lewis', reason: 'FA', compensation: '3rd Rd' },
    { name: 'Juwaun Johnson', reason: 'FA', compensation: '5th Rd' },
];

// --- Dusty Data ---
const ROSTER_DUSTY: Player[] = [
    // QB
    createPlayer('dqb1', 'Tua Tagovailoa', 'QB', 74, 'MIA', 'FA 2024', '2029', 1),
    createPlayer('dqb2', 'Will Howard', 'QB', 64, 'Unknown', '5th', '2029', 2),

    // RB
    createPlayer('drb1', 'Kenneth Walker', 'RB', 87, 'SEA', '2nd', '2026', 1),
    createPlayer('drb2', 'Cam Skattebo', 'RB', 81, 'Unknown', '3rd', '2028', 2),
    createPlayer('drb3', 'Jonathon Brooks', 'RB', 76, 'CAR', '2nd', '2028', 3),
    createPlayer('drb4', 'Scott Matlock', 'RB', 69, 'LAC', '6th', '2028', 4),

    // WR
    createPlayer('dwr1', 'Garrett Wilson', 'WR', 86, 'NYJ', '1st', '2026', 1),
    createPlayer('dwr2', 'Elic Ayomanor', 'WR', 75, 'Unknown', '4th', '2029', 1),
    createPlayer('dwr3', 'Jalen Royals', 'WR', 71, 'Unknown', '3rd', '2028', 1),
    createPlayer('dwr4', 'Tylan Wallace', 'WR', 71, 'BAL', '4th', '2025', 2),
    createPlayer('dwr5', 'Johnny Wilson', 'WR', 68, 'PHI', '5th', '2029', 2),
    createPlayer('dwr6', 'Brendan Rice', 'WR', 50, 'LAC', '6th', '2028', 2),

    // TE
    createPlayer('dte1', 'Ja\'Tavion Sanders', 'TE', 70, 'CAR', '3rd', '2028', 1),
    createPlayer('dte2', 'Jelani Woods', 'TE', 67, 'IND', '3rd', '2026', 1),
    createPlayer('dte3', 'Will Mallory', 'TE', 65, 'IND', '4th', '2027', 2),
    createPlayer('dte4', 'Moliki Matavao', 'TE', 50, 'Unknown', '7th', '2029', 2),

    // OT
    createPlayer('dot1', 'Rasheed Walker', 'OT', 79, 'GB', '7th', '2026', 1),
    createPlayer('dot2', 'Christian Jones', 'OT', 67, 'ARZ', '4th', '2028', 1),
    createPlayer('dot3', 'Thayer Munford', 'OT', 67, 'LV', '6c', '2026', 2),
    createPlayer('dot4', 'Justin Shaffer', 'OT', 50, 'ATL', '5c', '2026', 2),

    // OG
    createPlayer('dog1', 'Cody Mauch', 'OG', 82, 'TB', '2nd', '2027', 1),
    createPlayer('dog2', 'Peter Skoronski', 'OG', 79, 'TEN', '1st', '2027', 1),
    createPlayer('dog3', 'Jared Wilson', 'OG', 71, 'Unknown', '3rd', '2028', 2),
    createPlayer('dog4', 'TJ Bass', 'OG', 69, 'DAL', 'UN', '2029', 2),
    createPlayer('dog5', 'Joe Huber', 'OG', 62, 'Unknown', 'UN', '2029', 2),
    createPlayer('dog6', 'Javion Cohen', 'OG', 0, 'CLE', '7th', '2029', 3),
    createPlayer('dog7', 'Emil Ekiyor', 'OG', 0, 'IND', '7th', '2028', 3),

    // C
    createPlayer('dc1', 'Tyler Biadasz', 'C', 80, 'WAS', 'FA 2024', '2029', 1),
    createPlayer('dc2', 'Seth McLaughlin', 'C', 50, 'Unknown', 'UN', '2029', 2),

    // ED
    createPlayer('ded1', 'Dallas Turner', 'ED', 75, 'MIN', '1st', '2028', 1),
    createPlayer('ded2', 'Azeez Ojulari', 'ED', 73, 'NYG', '2nd', '2025', 1),
    createPlayer('ded3', 'Zach Harrison', 'ED', 73, 'ATL', '3rd', '2027', 2),
    createPlayer('ded4', 'Amare Barno', 'ED', 50, 'CAR', '5c', '2026', 2),
    createPlayer('ded5', 'Adetokunbo Ogundeji', 'ED', 0, 'ATL', '5th', '2025', 2),

    // DT
    createPlayer('ddt1', 'Nnamdi Madubuike', 'DT', 92, 'BAL', 'FA 2024', '2029', 1),
    createPlayer('ddt2', 'Derrick Harmon', 'DT', 77, 'Unknown', '1st', '2029', 1),
    createPlayer('ddt3', 'Payton Wilson', 'LB', 75, 'PIT', '3rd', '2028', 1), // Listed as DT3/LB3
    createPlayer('ddt4', 'Tyler Davis', 'DT', 73, 'LAR', '6th', '2028', 2),
    createPlayer('ddt5', 'Darius Alexander', 'DT', 72, 'Unknown', '2nd', '2029', 3),

    // LB
    createPlayer('dlb1', 'Micah Parsons', 'LB', 98, 'DAL', '1st', '2025', 1),
    createPlayer('dlb2', 'Divine Deablo', 'LB', 81, 'LV', '3rd', '2026', 1),
    createPlayer('dlb3', 'JD Bertrand', 'LB', 69, 'ATL', '4th', '2028', 2),
    createPlayer('dlb4', 'Smael Mondon', 'LB', 69, 'Unknown', '5th', '2029', 2),
    createPlayer('dlb5', 'Noah Sewell', 'LB', 68, 'CHI', '5th', '2027', 2),
    createPlayer('dlb6', 'Grant Stuard', 'LB', 64, 'IND', '7th', '2025', 2),

    // CB
    createPlayer('dcb1', 'Zyon McCollum', 'CB', 81, 'TB', '5th', '2026', 1),
    createPlayer('dcb2', 'Carrington Valentine', 'CB', 78, 'GB', '7th', '2027', 1),
    createPlayer('dcb3', 'Kelee Ringo', 'CB', 73, 'PHI', '3rd', '2027', 1), // Nickel
    createPlayer('dcb4', 'Jalyn Armour-Davis', 'CB', 67, 'BAL', '4th', '2026', 2),
    createPlayer('dcb5', 'Rejzhon Wright', 'CB', 65, 'CAR', 'UN', '2028', 2),
    createPlayer('dcb6', 'Kary Vincent Jr', 'CB', 50, 'PHI', '6th', '2025', 2),

    // S
    createPlayer('ds1', 'Ar\'Darius Washington', 'S', 79, 'BAL', 'UN', '2025', 1),
    createPlayer('ds2', 'Chamarri Conner', 'S', 76, 'KC', '4th', '2027', 1),
    createPlayer('ds3', 'Antonio Johnson', 'S', 76, 'JAX', '4th', '2027', 2),
    createPlayer('ds4', 'Jaden Hicks', 'S', 73, 'KC', '4th', '2028', 2),
    createPlayer('ds5', 'RJ Mickens', 'S', 70, 'Unknown', '6th', '2029', 2),
    createPlayer('ds6', 'Kitan Oladapo', 'S', 67, 'GB', '5th', '2028', 2),
];

const PRACTICE_SQUAD_DUSTY: Player[] = [
    createPlayer('dps1', 'Sam Hartman', 'QB', 0, 'WAS', 'UN', '2029', 9, 'PRACTICE_SQUAD'),
    createPlayer('dps2', 'Jermar Jefferson', 'RB', 0, 'DET', '7th', '2025', 9, 'PRACTICE_SQUAD'),
    createPlayer('dps3', 'AT Perry', 'WR', 0, 'NO', '5th', '2027', 9, 'PRACTICE_SQUAD'),
    createPlayer('dps4', 'Sage Surratt', 'WR', 0, 'Unknown', 'UN', '2025', 9, 'PRACTICE_SQUAD'),
    createPlayer('dps5', 'Antoine Green', 'WR', 0, 'DET', '6th', '2027', 9, 'PRACTICE_SQUAD'),
    createPlayer('dps6', 'Malik Knowles', 'WR', 0, 'MIN', 'UN', '2027', 9, 'PRACTICE_SQUAD'),
    createPlayer('dps7', 'Trajan Jeffcoat', 'ED', 0, 'Unknown', 'UN', '2028', 9, 'PRACTICE_SQUAD'),
    createPlayer('dps8', 'Christopher Allen', 'ED', 0, 'DEN', 'UN', '2025', 9, 'PRACTICE_SQUAD'),
    createPlayer('dps9', 'Matt Henningsen', 'DT', 0, 'DEN', '6th', '2026', 9, 'PRACTICE_SQUAD'),
    createPlayer('dps10', 'Garrett Haskins', 'DT', 0, 'TEN', 'UN', '2025', 9, 'PRACTICE_SQUAD'),
    createPlayer('dps11', 'Fabien Lovett', 'DT', 0, 'KC', 'UN', '2028', 9, 'PRACTICE_SQUAD'),
    createPlayer('dps12', 'Hamilcar Rashad Jr', 'ED', 0, 'Unknown', 'UN', '2025', 9, 'PRACTICE_SQUAD'),
    createPlayer('dps13', 'Curtis Jacobs', 'LB', 0, 'KC', '7th', '2028', 9, 'PRACTICE_SQUAD'),
    createPlayer('dps14', 'Tony Fields', 'LB', 0, 'CLE', '4th', '2025', 9, 'PRACTICE_SQUAD'),
    createPlayer('dps15', 'Jojo Domann', 'LB', 0, 'IND', '7th', '2025', 9, 'PRACTICE_SQUAD'),
    createPlayer('dps16', 'Hamsah Nasirildeen', 'LB', 0, 'NYJ', '5th', '2025', 9, 'PRACTICE_SQUAD'),
    createPlayer('dps17', 'Tay Gowan', 'CB', 0, 'MIN', '6th', '2025', 9, 'PRACTICE_SQUAD'),
    createPlayer('dps18', 'Tommy Hill', 'S', 0, 'Unknown', 'UN', '2029', 9, 'PRACTICE_SQUAD'),
    createPlayer('dps19', 'Smoke Monday', 'S', 0, 'NO', 'UN', '2025', 9, 'PRACTICE_SQUAD'),
];

const FORMER_PLAYERS_DUSTY: FormerPlayer[] = [
    { name: 'L Perine, C Johnson, N Muti', reason: 'Cut', compensation: '2020 Draft' },
    { name: 'P Tega W, C Coughlin, T Adams', reason: 'Cut' },
    { name: 'J Mack, N Coe', reason: 'Cut' },
    { name: 'James Smith Williams', reason: 'FA', compensation: '5th Rd' },
    { name: 'Ezra Cleveland', reason: 'FA', compensation: '3rd Rd' },
];

// --- Foss Data ---
const ROSTER_FOSS: Player[] = [
    // QB
    createPlayer('fqb1', 'JJ McCarthy', 'QB', 71, 'MIN', '1st', '2026', 1),
    createPlayer('fqb2', 'Will Levis', 'QB', 68, 'TEN', '1st', '2025', 2),

    // RB
    createPlayer('frb1', 'Bhaysaul Tuten', 'RB', 76, 'Unknown', '3rd', '2027', 1),
    createPlayer('frb2', 'Kimani Vidal', 'RB', 77, 'LAC', '5th', '2026', 2),
    createPlayer('frb3', 'Brashard Smith', 'RB', 73, 'Unknown', '6th', '2027', 3),
    createPlayer('frb4', 'Keaton Mitchell', 'RB', 75, 'BAL', '7th', '2025', 4),

    // WR
    createPlayer('fwr1', 'Troy Franklin', 'WR', 79, 'DEN', '3rd', '2026', 1),
    createPlayer('fwr2', 'Jaylin Lane', 'WR', 74, 'Unknown', '4th', '2027', 1),
    createPlayer('fwr3', 'Xavier Hutchinson', 'WR', 72, 'HOU', '6th', '2025', 1),
    createPlayer('fwr4', 'Justin Shorter', 'WR', 50, 'BUF', '4th', '2025', 2),
    createPlayer('fwr5', 'Elijah Badger', 'WR', 50, 'Unknown', '7th', '2027', 3),
    createPlayer('fwr6', 'Matt Landers', 'WR', 50, 'SEA', 'UN', '2025', 4),

    // TE
    createPlayer('fte1', 'Darnell Washington', 'TE', 76, 'PIT', '3rd', '2025', 1),
    createPlayer('fte2', 'Mitchell Evans', 'TE', 69, 'Unknown', '5th', '2027', 1),
    createPlayer('fte3', 'Brayden Willis', 'TE', 50, 'SF', '7th', '2025', 2),
    createPlayer('fte4', 'Jaheim Bell', 'TE', 50, 'NE', '7th', '2026', 3),

    // OT
    createPlayer('fot1', 'Ozzy Trapilo', 'OT', 72, 'Unknown', '2nd', '2027', 1),
    createPlayer('fot2', 'Charles Grant', 'OT', 70, 'Unknown', '3rd', '2027', 1),

    // OG
    createPlayer('fog1', 'Jackson Powers-Johnson', 'OG', 78, 'LV', '2nd', '2026', 1),
    createPlayer('fog2', 'Chandler Zavala', 'OG', 64, 'CAR', '4th', '2025', 1),
    createPlayer('fog3', 'Jaelyn Duncan', 'OG', 50, 'TEN', '5th', '2025', 2),
    createPlayer('fog4', 'Charles Turner', 'OG', 50, 'NE', 'UN', '2026', 2),

    // C
    createPlayer('fc1', 'Jovaughn Gwyn', 'C', 58, 'ATL', '6th', '2025', 1),

    // ED
    createPlayer('fed1', 'Jack Sawyer', 'ED', 72, 'Unknown', '3rd', '2027', 1),
    createPlayer('fed2', 'Bralen Trice', 'ED', 71, 'ATL', '3rd', '2026', 1),
    createPlayer('fed3', 'Owen Pappoe', 'ED', 67, 'ARZ', '5th', '2025', 2),
    createPlayer('fed4', 'Jah Joyner', 'ED', 50, 'Unknown', 'UN', '2027', 3),

    // DT
    createPlayer('fdt1', 'Jalen Redmond', 'DT', 77, 'Unknown', 'UN', '2025', 1),
    createPlayer('fdt2', 'Khristian Boyd', 'DT', 70, 'NO', '6th', '2026', 1),
    createPlayer('fdt3', 'Rylie Mills', 'DT', 68, 'Unknown', '4th', '2027', 2),
    createPlayer('fdt4', 'Zeek Biggers', 'DT', 65, 'Unknown', '7th', '2027', 2),
    createPlayer('fdt5', 'Jordan Magee', 'DT', 67, 'WAS', '4th', '2026', 1), // Listed as DT3/LB3

    // LB
    createPlayer('flb1', 'Jihaad Campbell', 'LB', 80, 'Unknown', '1st', '2027', 1),
    createPlayer('flb2', 'Jeremiah Trotter Jr', 'LB', 67, 'PHI', '4th', '2026', 1),
    createPlayer('flb3', 'Kobe King', 'LB', 66, 'Unknown', '6th', '2027', 2),
    createPlayer('flb4', 'Nelson Ceasar', 'LB', 50, 'SEA', 'UN', '2026', 2),

    // CB
    createPlayer('fcb1', 'Kris Abrams-Draine', 'CB', 73, 'DEN', '4th', '2026', 1),
    createPlayer('fcb2', 'Jakorian Bennett', 'CB', 73, 'LV', '3rd', '2025', 1),
    createPlayer('fcb3', 'Josh Newton', 'CB', 71, 'CIN', '5th', '2026', 1), // Nickel
    createPlayer('fcb4', 'Dwight McGlothern', 'CB', 50, 'MIN', '7th', '2026', 2),
    createPlayer('fcb5', 'Zy Alexander', 'CB', 50, 'Unknown', 'UN', '2027', 2),
    createPlayer('fcb6', 'Darius Rush', 'CB', 50, 'IND', '4th', '2025', 2),

    // S
    createPlayer('fs1', 'Brian Branch', 'S', 91, 'DET', '2nd', '2025', 1),
    createPlayer('fs2', 'Ronnie Hickman', 'S', 76, 'CLE', 'UN', '2025', 1),
    createPlayer('fs3', 'Jaylen Reed', 'S', 68, 'Unknown', '5th', '2027', 2),
];

const PRACTICE_SQUAD_FOSS: Player[] = [
    createPlayer('fps1', 'Gabe Hall', 'DT', 0, 'PHI', 'UN', '2026', 9, 'PRACTICE_SQUAD'),
    createPlayer('fps2', 'Gabriel Murphy', 'ED', 0, 'MIN', '6th', '2026', 9, 'PRACTICE_SQUAD'),
    createPlayer('fps3', 'Simeon Barrow', 'DT', 0, 'Unknown', 'UN', '2027', 9, 'PRACTICE_SQUAD'),
];

const FORMER_PLAYERS_FOSS: FormerPlayer[] = [];

export const CRUISE_SHIP_CRUSADERS: Team = {
  id: 'csc',
  name: 'Cruise Ship Crusaders',
  owner: 'Bullard',
  avatarUrl: '/teams/Cruise Ship Crusaders Logo 2025 1.png',
  record: '0-0',
  tagsSaved: 2,
  roster: ROSTER_CSC,
  practiceSquad: PRACTICE_SQUAD_CSC,
  formerPlayers: FORMER_PLAYERS_CSC
};

export const KEY_WEST_KILLAS: Team = {
  id: 'kwk',
  name: 'Key West Killas',
  owner: 'Kurt',
  avatarUrl: '/teams/Key West Killas Logo 2025 1.png',
  record: '0-0',
  tagsSaved: 2,
  roster: ROSTER_KILLAS,
  practiceSquad: PRACTICE_SQUAD_KILLAS,
  formerPlayers: FORMER_PLAYERS_KILLAS
};

export const NEW_LEXINGTON_LEGENDS: Team = {
  id: 'nll',
  name: 'New Lexington Legends',
  owner: 'Rugg',
  avatarUrl: '/teams/New Lexington Legends Logo 2025 1.png',
  record: '0-0',
  tagsSaved: 0,
  roster: ROSTER_LEGENDS,
  practiceSquad: PRACTICE_SQUAD_LEGENDS,
  formerPlayers: FORMER_PLAYERS_LEGENDS
};

export const DUSTY_TEAM: Team = {
    id: 'dusty',
    name: 'Port Charlotte Pythons',
    owner: 'Dusty',
    avatarUrl: '/teams/Port Charlotte Pythons Logo 2025 1.png',
    record: '0-0',
    tagsSaved: 0,
    roster: ROSTER_DUSTY,
    practiceSquad: PRACTICE_SQUAD_DUSTY,
    formerPlayers: FORMER_PLAYERS_DUSTY
};

export const ROAD_WARRIORS: Team = {
    id: 'trw',
    name: 'Team Road Warriors',
    owner: 'Foss',
    avatarUrl: '/teams/Road Warriors Logo 2025 1.png',
    record: '0-0',
    tagsSaved: 0,
    roster: ROSTER_FOSS,
    practiceSquad: PRACTICE_SQUAD_FOSS,
    formerPlayers: FORMER_PLAYERS_FOSS
};

export const POSITIONS = ['QB', 'RB', 'WR', 'TE', 'OL', 'ED', 'DT', 'LB', 'CB', 'S', 'K'];
export const NFL_TEAMS = ['ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE', 'DAL', 'DEN', 'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC', 'LAC', 'LAR', 'LV', 'MIA', 'MIN', 'NE', 'NO', 'NYG', 'NYJ', 'PHI', 'PIT', 'SEA', 'SF', 'TB', 'TEN', 'WAS'];

export const ALL_TEAMS: Team[] = [
    CRUISE_SHIP_CRUSADERS,
    KEY_WEST_KILLAS,
    NEW_LEXINGTON_LEGENDS,
    DUSTY_TEAM,
    ROAD_WARRIORS
];

// Fallback for other files using the old MOCK_TEAM
export const MOCK_TEAM = CRUISE_SHIP_CRUSADERS; 
export const MOCK_PLAYER_1 = ROSTER_CSC[0];
export const MOCK_PLAYER_2 = ROSTER_CSC[6];

// RAW DRAFT CSV DATA
export const DRAFT_CSV = `RD,#,Order,Bullard,Kurt,Rugg,Dusty,Foss,Key
2026,,,,,,,,&& Wasn’t Available at this pick
,,,,,,,,
,,,,,,,,### Took extra player
,,,,,,,,
,,,,,,,,
,,,,,,,,"$ = a pick that ""Hit"""
,,,Trades,Kurt Trades ED Mike Green and 4th,"to Bull for ED J Stewart, QB Sanders, 6th in 26",,,
,,,,,,,,
,,,,,,,,"Rds 1 and 2 must be a starter (over 4) in 3 of first 5 years to ""hit"""
2025,,,Order is,"(Foss, Dusty, Rugg, Bull, Kurt)",,,,
,,,,,,,,"Rds 3 thru 5 must be starter in 2 of first 5 years to ""hit"""
1,21," 1,2,3,4,5",WR Jayden Higgins (1),RB Omarion Hampton (1),QB Jaxson Dart (1),DT Derrick Harmon (1),LB Jihaad Campbell (1),
2,53,"5,4,3,2,1",CB Benjamin Morrison,ED Mike Green,CB Shavon Revel Jr,DT Darius Alexander,OT Ozzy Trapilo (1),"Rds 6 - later just need 1 year as starter in first 5 years to be a ""hit"""
3,85,"4,3,2,1,5",ED Josaiah Stewart,OG Emery Jones,S Xavier Watts (1),C Jared Wilson (1),OT Charles Grant,
3,C,"4, 3,2,5,1",DT CJ West,,S Lathan Ransom (1),RB Cam Skattebo (1),RB Bhaysaul Tuten,
3,102  CE,"3,2,1,5,4",DT Joshua Farmer,LB Cody Simon,OG Miles Frazier,WR Jalen Royals,ED Jack Sawyer,
3,CET,,TE Gunnar Helm (1),,,,,
4,123,"2,1,5,4,3",QB Shedeur Sanders (1),S Malachi Moore (1),DT Tyrion Ingram-Dawkins,WR Elic Ayomanor (1),WR Jaylin Lane (1),
4,138  C,"5, 1, 4, ",RB DJ Giddens,ED Bradyn Swinson,,,DT Rylie Mills,
5,159,"1,5,4,3,2",OG Jackson Slater,,DT JJ Pegues,LB Smael Mondon,TE Mitchell Evans  (1),
5,159 T,,LB Chris Paul Jr,,,,,
5,176  C,"2,1,3,5,4, ",RB Devin Neal,CB Marcus Harris,OT Myles Hinton,QB Will Howard,S Jaylen Reed,
6,197,"5,4,3,2,1",DT Aeneas Peebles,OT Camerone Williams,OT Chase Lundt,S RJ Mickens $,LB Kobe King,
6,216  C,1,,,,,RB Brashard Smith,
7,237,"4,3,2,1,5",WR Isaiah Bond,ED Jared Ivey,OG Garrett Dellinger,TE Moliki Matavao,DT Zeek Biggers,
7,257 C,1,,,,,WR Elijah Badger,
UN,258,"3,2,1,5,4",LB Shaun Dolac,OT Logan Brown,LB Jay Higgins,S Tommi Hill,ED Jah Joyner,
UN,,"2,1,5,4,3",CB Cobee Bryant,S JJ Roberts,C Willie Lampkin,C Seth McLaughlin,CB Zy Alexander,
UN,,"1,5,4,3,2",OG Joshua Gray,TE Jake Briningstool,OG Luke Kandra,OG Joe Huber,DT Simeon Barrow,
,,,,,,,,
,,,Trades,Kurt Trades 3C and 5 to Bull for OG Dotson,,,,
,,,,,,,,
,,,,,,,,
,,,,,,,,
2024,,,Order is,"(Foss, Rugg, Kurt, Dusty, Bull)",,,,
,,,,,,,,
1,10,"1,2,3,4,5",ED Laiatu Latu Ind (1),DT Byron Murphy Sea (2),TE Brock Bowers Lvr (2),ED Dallas Turner Min (1),QB JJ McCarthy Min (1),
2,42,"5,4,3,2,1",WR Adonai Mitchell Ind,CB Kamari Lassiter Hou (2),S Javon Bullard Gb (2),RB Jonathon Brooks Car,C Jackson Powers-Johnson Lvr (2),
3,74,"4,3,2,1,5",WR Javon Baker Ne,S Calen Bullock Hou $,OT Kiran Amegadjie Chi,LB Payton Wilson Pit $,ED Bralen Trice Atl,
3,C 100,"4,1",,,,TE Ja'Tavion Sanders Car (2),WR Troy Franklin Den $,
4,110,"3,2,1,5,4",G Mason McCormick Pit $,RB Jaylen Wright Mia,CB Tj Tampa Bal,S Jaden Hicks Kc,CB Kris Abrams-Draine Den,
4,C 135,"5,2,1,4",CB Cam Hart Lac $,,G Sedrick Van Pran-Granger Buf,LB Jd Bertrand Atl,LB Jeremiah Trotter Jr Phi,
4,C 135,"2,5",CB Jarvis Brownlee Ten $,,QB Spencer Rattler No $,,,
4,CE 135,"2,1,5,4,3",ED Xavier Thomas Arz,WR Jacob Cowing Sf,ED Mohammed Kamara Mia,OT Christian Jones Arz,LB Jordan Magee Was (1),
5,145,"1,5,4,3,2",RB Rasheed Ali Bal,WR Malik Washington Mia,DT Mekhi Wingo Det,S Kitan Oladapo Gb,CB Josh Newton Cin (1),
5,C 176,"4,1",,,,WR Johnny Wilson Phi (1),RB Kimani Vidal Lac (1),
6,186," 5,4,3,2,1",TE Tanner McLachlan Cin,CB Dj James Sea,LB Nathaniel Watson Cle,DT Tyler Davis Lar,DT Khristian Boyd No,
6,C 220,"3,1,4",,DT Leonard Taylor Nyj,,WR Brendan Rice Lac,ED Gabriel Murphy Min,
7,230,"4,3,2,1,5",OG KT Levingston Cle $,DT Levi Drake Rodriguez Min,QB Michael Pratt Gb,LB Curtis Jacobs Kc,TE Jaheim Bell Ne,
7,C 257,"4,1",,,,OG Javion Cohen Cle,CB Dwight McGlothern Min,
UN,258," 3,2,1,5,4",OT Garret Greenfield Sea,TE Dallin Holker No, ,ED Trajan Jeffcoat,DT Gabe Hall Phi,
UN,258,"2,1,5,4,3",OT Frank Crum Den,RB Blake Watson Den, ,DT Fabien Lovett Kc,C Charles Turner Ne,
UN,258,"1,5,4,3,2",S Millard Bradford No,WR Isiah Williams Det, ,QB Sam Hartman Was,ED Nelson Ceasar Sea,
,,,,,,,,
,,,,,,,,
,,,,,,,,
2023,,,Order is,"(Arron, Kurt, Rugg, Dusty)",,,,
,,,,,,,,
1,11,,CB Christian Gonzalez Ne $,LB Jack Campbell Det $,WR Jaxson Smith-Njigba Sea (2),OT Peter Skoronski Ten $,QB Will Levis Ten (2),
2,,,DT Keeanu Benton Pit $,TE Luke Musgrave Gb (2),DT Gervon Dexter Sr Chi (2),OT Cody Mauch Tb (2),S Brian Branch Det $,
3,,,S Ji'Ayir Brown Sf $,WR Cedric Tillman Cle $,S Jordan Battle Cin $,Ed Zach Harrison Atl (1), TE Darnell Washington Pit $,
3,C,,Ed Isaiah McGuire Cle (1), DL Adetomiwa Adebawore Ind,CB Mekhi Blackmon Min,CB Keelee Ringo Phi (1),CB Jakorian Bennett Lvr $,
3,C,,,CB Clark Phillips Atl (1),C Jake Andrews Ne (1),,,
4,,,RB Roschon Johnson Chi,OT Carter Warren Nyj (1),Ed Tavious Robinson Bal (1),CB Chamarri Conner Kc $,OG Chandler Zavala Car $,
4,CE,,QB Clayton Tune Arz,RB Israel Abinkanada Nyj,TE Josh Whyle Ten (1),TE Will Mallory Ind,CB Darius Rush Ind,
4,C,,G Atonio Mafi Ne (1),,,S Antonio Johnson Jax (2),WR Justin Shorter Buf,
5,,,LB Henry To'oTo'o Hou $,OT Warren McClendon Lar (1),G Jordan McFadden Lac,LB Noah Sewell Chi (1),Owen Pappoe Arz,
5,C,,C Luke Wypler Cle,,S JL Skinner Den,WR A.T Perry No,T Jaelyn Duncan Ten (1),
6,,,TE Zack Kuntz Nyj,RB DeWayne McBride Min,CB Cory Trice Pit,DT Scott Matlock Lac $,WR Xavier Hutchinson Hou  $,
6,C,,,,,WR Antoine Green Det,G Jovaughn Gwyn Atl,
7,,,DT Desjuan Johnson Lar,G Andrew Voorhes Bal  $,LB Ivan Pace Min $,CB Carrington Valentine Gb $,TE Brayden Willis Sf,
7,C,,,,,G Emil Ekiyor Ind,RB Keaton Mitchell Bal,
UN,,,RB Sean Tucker Tb,CB Eli Ricks Phi,WR Bryce Ford-Wheaton Nyg,WR Malik Knowles Min,DT Jalen Redmond Car,
UN,,,WR Rakim Jarrett Tb,TE Noah Grindorf Ndst,ED Andre Carter Min,CB Rejzhon Wright Car,WR Matt Landers Sea,
UN,,,TE Ben Sims Min $,DT Jerrod Clark Lac,G Jaxson Kirkland Cin,G TJ Bass Dal $,S Ronnie Hickman Cle $,
,,,,,,,,
,,,,,,,,
,,,,,,,,
2022,,,Order is,"(Rugg, Kurt, Bull, Dusty)",,,,
,,,,,,,,
1,9,,3) S Kyle Hamilton ND $,2) C Tyler Linderbaum Iowa $,1) WR Chris Olave Osu $,4)  WR Garret Wilson Osu $,,
2,41,,2) WR Skyy Moore WMU (1),3) CB Andrew Booth Jr Clem,4) S Jaquan Brisker Psu $,1) RB Kenneth Walker Msu $,,
3,73,,1) LB Nakobe Dean UGA $,4) QB Malik Willis LIB,3) DT Travis Jones Uconn $,2) Jelani Woods Vir (1),,
3,C 105,, - , - ,1) OL Darian Kinnard UK, - ,,
4,114,,4) TE Charlie Kolar ISU (1),1) QB Sam Howell UNC (1),2) CB Damarri Mathis Pitt $,3) CB Jaylyn Armour-Davis BAMA (1),,
4,C 143,,1) WR Khalil Shakir BSU $,2) Micah McFadden IND $,-,-,,
4,C 143,,1) TE Chig Okonkwo MD $, ,-,-,,
5,152,,3) LB Damone Clark LSU $,2) WR Kyle Phillips UCLA,1) CB Tariq Woolen Utsa $,4) CB Zyon McCollum SamH $,,
5,CE 179,,2) LB Darrian Beavers UC,3) WR Justyn Ross CLEM,4) ED Kingsley Enagbare Sc $,1) ED Amare Barno VT,,
5,C 179,,-,-,1) WR Jalen Nailor MSU $,2) G Justin Shaffer UGA,,
6,188,,4) DT Curtis Brooks UC,1) OG Jamaree Salyer Uga $,3) C Dohnavon West ASU,2) DT Matt Henningsen WISC,,
6,C 221,,1) WR Bo Melton RUT,-,-,2) OT Thayer Munford Osu $,,
7,230,,4) OG Chris Paul TUL $,Traded to Bull,2) WR Samori Toure NEB,3) OT Rasheed Walker PSU $,,
7,T 230,,1) QB Carson Strong NEV,,,,,
7,C 262,,-,-,-,2) Jojo Domann NEB,,
UN,263,,3) CB Mario Goodrich CLEM,2) RB Abram Smith BAY,1) CB Josh Jobe BAMA $,4) ED Christopher Allen BAMA ,,
UN,263,,2) TE Jalen Wydermyer TxAM,3) S Marquise Bell FlAM $,4) WR Kevin Austin ND,1) S Smoke Monday AUB,,
UN,263,,1) DT Noah Ellis IDA,4) LB Jeremiah Gemmel UNC,3) DT Christopher Hinton MICH,2) DT Garrett Haskins OSU,,
,,,,,,,,
,,,Trades,Bull Trades 188 to Kurt for his 188 and 230,,,,
,,,,,,,,
,,,,,,,,
2021,,,Order is,"(Rugg, Dusty, Kurt, Bull)",,,,
,,,,,,,,
1,12,,4) OT Rashawn Slater Nw $,3) ED Jalen Phillips Mia $,1) QB Mac Jones Bama $,2) LB Micah Parsons Psu $,,
2,44,,2) C Creed Humphrey Okla $,1)  BN Jeremiah Owusu-Koramoah Nd $,4) CB Asante Samuel Jr Fsu $,3)  ED Azeez Ojulari Uga $,,
3,76,,1) LB Derek Barnes Pur $,2) CB Paulson Adebo Stanford $,3 WR Nico Collins Mich $,4)  LB Divine Deablo Vt $,,
4,117,,3) CB Tre Brown Okla (1),4) DB Shaun Wade Osu (1),2) TE Brevin Jordan Mia (1),1) WR Tylan Wallace Okst,,
4,C 144,,4) TE Zach Davidson Cent Mizz,3) WR Ihmir Smith-Marsette Iowa,1) DT Daviyon Nixon Iowa,2) LB Tony Fields Wvu $,,
4,C 144,,1) S Darrick Forrest Uc $,S) S Cade Sterns TX,,,,
4,C 144,,1) TE Noah Gray Duke $,,2) S Jamar Johnson Ind,,,
5,156,,1) OT Brendan Jaimes NEB,2) LB Cam McGrone MICH,4) G Trey Smith Ten $,3) ED Adetokunbo Ogundeji Nd $,,
5,C 184,,1) WR Frank Darby Arizona St,,,2)  S Hamsah Nasirildeen FSU,,
6,196,,1) DT Jonathan Marshall Ark, Traded to BULL,3) OT Stone Forsythe Fla $,4) CB Tay Gowan UCF,,
6,T 196,,2) Dylan Moses Bama,,,,,
6,C 228,, ,1) CB Thomas Graham Jr ORE,,2)  CB Kary Vincent Jr LSU,,
7,240,,3) S James Wiggins UC,4) DT Marvin Wilson FSU,2)  WR Tre Nixon UCF,1) Jamar Jefferson OreSt,,
7,C 259,,,,,1) LB Grant Stuart Hou $,,
UN,260,,4)  S Trill Williams SYR,3) G David Moore Gram,1) CB Shakur Brown MSU,2) S Ar'Darius Washington TCU $,,
UN,260,,1) LB Justin Hilliard OSU,2) WR Tamorrian Terry FSU,4) WR Cade Johnson ,3) WR Sage Surratt Wake,,
UN,260,,2)  G Robert Jones MidTen $,1) WR Austin Watkins UAB,3)  CB Bryan Mills,4) Hamilcar Rashad jr OKST,,
,,,,,,,,
,,,Trades,Bull Trades pick 1 of rd 2 and pick 2 of rd 3 to,"Kurt for pick 2 of rd 2, pick 1 of 3 and Kurts 6th",,,
,,,,,,,,
2020,,,Order was,"(Dusty, Kurt, Bull, Rugg)",,,,
,,,,,,,,
1,3,,OT Andrew Thomas Uga $,OT Jedrick Wills Bama $,OT Tristian Wirfs Iowa $,QB Tua Tagovailoa Bama $,,
2,35,,Jk Dobbins Osu (2),WR Laviska Sehnault Col $,RB Jonathon Taylor Wisc $,T Ezra Cleveland Boise $,,
3,67,,LB Zack Baun Wisc $,TE Devin Asiasi UCLA,G Damien Lewis LSU $,DT Justin Madubuike TxAm $,,
4,109,,G Kevin Dotson Louisiana $,TE Harrison Bryant Fau $,QB Jacob Eason Wash,RB La'mical Perine FL,,
4,C 146,,CB Bryce Hall Vir (traded) $,-,-,C Tyler Biadasz Wisc $,,
5,149,,S/LB Khaleke Hudson,ED Trevis Gipson Tul $, Traded for Bryce Hall,WR Collin Johnson Tx,,
5,T 149,,G Shane Lemieux Ore $,-,-,-,,
5,C 179,,-,-,ED Bradlee Anae Utah,G Netane Muti Fres,,
6,182,,WR Donovan Peoples Jones Mich $,WR KJ Hill Osu,Traded see above,OT Prince Tega Wanogho AUB,,
6,T 182,,LB Marcus Bailey PUR,-,-,-,,
6,C 214,,S Geno Stone $,RB Eno Benjamin ASU,WR Juwaun Johnson Ore $,ED Carter Coughlin Minn,,
7,217,,ED Kenny Willekes MSU,LB Clay Johnston Bay,TE Jared Pickney Vandy,ED James Smith-Williams NCST $,,
UN,UDFA,,CB Aj Green Okst,TE Hunter Bryant Wash,DT Raquan Williams MSU,OT Trey Adams Wash,,
UN,UDFA,,CB Lamar Jackson Neb $,RB Javon Leake Md,RB LeVante Bellamy,DE Nick Coe Aub,,
UN,UDFA,,TE Jacob Breeland Ore,RB James Robinson III ILL $,OL Tyler Higby MSU,LB Jordan Mack Vir,,
,,,,,,,,
,,,Trades,Bull Traded Bryce Hall to,"to Rugg for his 5th (149), and his 6th (182) ",,,
,,,,,,,,
,,,,,,,,
2019,,,,,,,,
,,,,,,,,
1,,,ED Brian Burns FSU $,ED Montez Sweat MSST $,DT Christian Wilkins CLEM $,,,
2,,,WR Aj Brown Miss $,S Juan Thornhill VIR $,CB Greedy Williams Lsu,,,
3,,,ED Chase Winovich Um,OT Bobby Evans Okla $,WR Hakeem Butler ISU,,,
4,,,TE Foster Moreau LSU $,G Michael Jordan OSU $,TE Foster Moreau LSU $,,,
4,,,CB Amani Oruwariye PSU $,,,,,
5,,,LB Blake Cashman Minn $,LB Mack Wilson BAMA $,OT David Edwards WISC $,,,
5,,,,,OT Dennis Daley SC $,,,
6,,,OT Oli Ugoh Elon $,WR Kelvin Harmon NCST,OG Beau Benzschwel WISC,,,
6,,,DL Michael Dogbe Temple $,TE Alize Mack ND,WR Keelan Doss UC DAVIS,,,
7,,,TE Caleb Wilson UCLA,CB Stephen Denmark VALD ST,CB Jimmy Moreland JAMES MAD $,,,
UN,,,LB Tevon Coney ND,QB Tyree Jackson BUF,TE Donald Parham STETSON $,,,
UN,,,WR Preston Williams CSU $,LB Terrill Hanks NEW MEX,OT Terrone Prescod NCST,,,
UN,,,WR Stanley Morgan NEB,LB Tevon Coney ND,DT Gerald Willis MIA,,,
,,,,,,,,
,,,,,,,,
2018,,,,,,,,
,,,,,,,,
1,,,QB Josh Rosen Ucla (1),QB Josh Rosen Ucla (1),QB Josh Rosen Ucla (1),,,
2,,,RB Derrius Guice Lsu (1),WR Christian Kirk TXAM $,ED Uchenna Nwuso USC $,,,
3,,,WR Michael Gallup CSU $,RB Royce Freeman Ore (1),WR Michael Gallup $,,,
4,,,OLB Josh Sweat Fsu $,OLB Josh Sweat Fsu $,OLB Josh Sweat Fsu $,,,
4,,,DT Maurice Hurst Um $,DT Maurice Hurst Um $,DT Maurice Hurst Um $,,,
5,,,OT Jamarco Jones OSU,OT Jamarco Jones OSU,LB JaWhan Bentley PUR $,,,
6,,,WR Equanimeous St Brown Nd $,WR Equanimeous St Brown Nd $,WR Equanimeous St Brown Nd $,,,
7,,,WR Richie James MT $,CB Greg Stroman VT,WR Richie James MT $,,,
UN,,,CB Quenton Meeks STAN,WR Robert Foster BAMA,CB Quenton Meeks STAN,,,
UN,,,CB J.C Jackson MARY $,WR Deontay Burnett USC,CB Holton Hill TX,,,
UN,,,DT Hercules Mata'afa WASH,LT Des Harrison CONTRA $,WR Simmie Cobbs IND,,,
,,,,,,,,
,,,,,,,,
2017,,,,,,,,
,,,,,,,,
1,,,DL Solomon Thomas STAN,S Jamal Adams LSU $,S Jamal Adams LSU $,,,
2,,,CB Sidney Jones WASH $,CB Sidney Jones WASH $,ED Tyus Bowser HOU,,,
3,,,C Pat Elfein OSU $,C Pat Elfein OSU $,CB Ahkello Witherspoon COL $,,,
4,,,ED Carl Lawson Aub $,S Tedrick Thompson COL $,ED Carl Lawson Aub $,,,
5,,,S Desmond King IOWA $,TE Jordan Leggett CLEM,QB Nathan Peterman TEN,,,
5,,,WR Robert Davis GEORGIA ST,DT Caleb Brantley FL,DT Caleb Brantley FL,,,
6,,,S Xavier Woods LaTECH $,TE Bucky Hodges VT,TE Bucky Hodges VT,,,
7,,,ED Ejuan Price PITT,WR Austin Carr NW,WR Malachi Dupre LSU,,,
,,,,,,,,
,,,,,,,,
2016,,,,,,,,
,,,,,,,,
1,,,S Karl Joseph WVU $,WR Corey Coleman BAY,S Karl Joseph WVU $,,,
2,,,CB Makenzie Alexander CLEM $,CB Makenzie Alexander CLEM $,C Cody Whitehair KSU $,,,
3,,,DL Javon Hargrave SC $,CB Kendall Fuller WASH $,DL Adolphus Washington OSU,,,
4,,,LB Antonio Morrison FL,RB Devontae Booker UTAH ,RB Kenneth Dixon LaTECH,,,
5,,,OT Joe Haeg NDST $,LB Kentrell Brothers MIZZ,&&ED Matt Judon GRAND VALLEY $,,,
6,,,WR Mike Thomas SoMISS,DL Anthony Zettel PSU,&& WR Moritz Boehringer ,,,
7,,,LB Scooby Wright ARZ,LB Scooby Wright ARZ,###WR Aaron Burbridge MSU,,,
,,,,,LB Scooby Wright ARZ,,,
,,,,,,,,
2015,,,,,,,,
,,,,,,,,
1,,,OT DJ Humphries FL $,DL Malcom Brown TX $,WR Breshad Perriman UCF $,,,
2,,,ED Randy Gregory NEB,ED Randy Gregory NEB,ED Randy Gregory NEB,,,
3,,,DL Carl Davis IOWA,OT TJ Clemmings PITT,LB Paul Dawson TCU,,,
4,,,DL Grady Jarrett CLEM $,DL Grady Jarrett CLEM $,RB Jay Ajayi BSU $,,,
5,,,DL Michael Bennett OSU,DL Michael Bennett OSU,TE Jesse James PSU $,,,
6,,,CB Lfo Ekpre-Olomu ORE,CB Lfo Ekpre-Olomu ORE,CB Lfo Ekpre-Olomu ORE,,,
7,,,OT Lael Collins LSU $,OT Lael Collins LSU $,OT Lael Collins LSU $,,,
,,,,,,,,
,,,,,,,,
2014,,,,,,,,
,,,,,,,,
1,,,CB Kyle Fuller VT $,OG Zach Martin ND $,LB CJ Mosley BAMA $,,,
2,,,WR Cody Latimer IND,ED Jeremiah Attaochu GT,DL Stephon Tuitt ND $,,,
3,,,G Gabe Jackson MSST $,S Terrance Brooks FSU,WR Donte Moncrief MISS $,,,
4,,,CB Pierre Desir LINDENWOOD $,QB Tom Savage PITT,G David Yankey STAN,,,
5,,,RB Leche Seastrunk BAY,G Jon Urshel PSU,RB Leche Seastrunk BAY,,,
6,,,RB Storm Johnson UCF,DT Dan McCullers TENN,G Laurent Duvernay-Tardif  McGILL $,,,
7,,,WR Jeff Janis SVSU,S Ahmad Dixon BAY,OT Seantrel Henderson MIA $,,,`;

export const HIT_RATES_CSV = `Highest Hit %,Team Bull,Team Kurt,Team Rugg,Team Dusty,Team Foss,Unnamed: 6,Unnamed: 7,Unnamed: 8,Unnamed: 9
,,,,,,,,,
Rd 1,0.8,0.8,0.8,1,0,,,, 
Rd 2,0.5,0.6,0.6,0.75,1,,,,
Rd 3,0.5,0.4,0.4375,0.3,0.5,,,,
Rd 4,0.64,0.35,0.3333333333333333,0.23076923076923078,0.14285714285714285,,,,
Rd 5,0.3,0.125,0.47368421052631576,0.15384615384615385,0,,,,
Rd 6,0.3333333333333333,0.1111111111111111,0.25,0.25,0.16666666666666666,,,,
Rd 7,0.2857142857142857,0.15384615384615385,0.38461538461538464,0.4,0,,,, 
UN,0.20833333333333334,0.125,0.08333333333333333,0.1111111111111111,0.1111111111111111,,,,
,,,,,,,,,
Total Ave,0.44592261904761904,0.3331196581196581,0.4203082827260459,0.39946581196581193,0.2400793650793651,,,,
, ,,,,,,,,
,,,,,,,,,
,,,,,,,,,
,,,,,,,,,
Count for Formula,,,,,,,,,
,,,,,,,,,
Highest Hit %,Team Bull,Team Kurt,Team Rugg,Team Dusty,Team Foss,,,,
,,,,,,,,,
Rd 1,8,8,8,4,0,,,,
Rd 2,5,6,6,3,1,,,,
Rd 3,8,6,7,3,3,,,,
Rd 4,16,7,7,3,1,,,,
Rd 5,6,2,9,2,0,,,,
Rd 6,6,2,4,3,1,,,,
Rd 7,4,2,5,4,0,,,,
UN,5,3,2,2,1,,,,
,,,,,,,,,
,,,,,,,,,
Rank for Hit %,,,,,,,,,
,,,,,,,,,
Rd 1,2,2,2,1,5,,,,
Rd 2,5,3,3,2,1,,,,
Rd 3,1,4,3,5,1,,,,
Rd 4,1,2,3,4,5,,,,
Rd 5,2,4,1,3,5,,,,
Rd 6,1,5,2,2,4,,,,
Rd 7,3,4,2,1,5,,,,
UN,1,2,5,3,3,,,,
, ,,,,,,,,`;
