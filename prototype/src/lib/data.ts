// All data in this file is fictional demo data. No real people, cases or businesses.

export const TODAY = new Date("2026-11-05T12:00:00");

export type Status =
  | "New"
  | "AI Analyzed"
  | "Lead Generated"
  | "Under Review"
  | "Lead Approved"
  | "Cleared"
  | "Inactive";

export const STATUSES: Status[] = [
  "New",
  "AI Analyzed",
  "Lead Generated",
  "Under Review",
  "Lead Approved",
  "Cleared",
  "Inactive",
];

export type SeriesId = "A" | "B" | "C";

export interface StolenItem {
  name: string;
  category: "Jewelry" | "Electronics" | "Tools" | "Bicycle" | "Cash" | "Firearm" | "Other";
  value: number;
}

export interface BurglaryCase {
  id: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (estimated)
  neighborhood: string;
  block: string;
  entry: string;
  pointOfEntry: string;
  items: StolenItem[];
  solvability: number; // 0-100
  status: Status;
  series?: SeriesId;
  fit?: number; // how strongly this case matches its series profile (0-1)
  vehicle?: string;
  evidence: { video: boolean; prints: boolean; witness: boolean };
  lat: number;
  lng: number;
  narrative: string;
  detective?: string;
}

export interface Series {
  id: SeriesId;
  name: string;
  color: string;
  timeWindow: string;
  timeLabel: string;
  entryLabel: string;
  targets: string;
  vehicle: string;
  vehicleSource: string;
  mo: string[];
  dayPattern: string;
}

export const SERIES: Record<SeriesId, Series> = {
  A: {
    id: "A",
    name: "North Lake Daytime Series",
    color: "#3b82f6",
    timeWindow: "1 PM – 4 PM",
    timeLabel: "occurred between 1 PM and 4 PM",
    entryLabel: "used rear-window entry",
    targets: "jewelry",
    vehicle: "Silver Honda Civic (2008–2012), partial plate “BXK”",
    vehicleSource: "Doorbell video (2), neighbor witness (2)",
    mo: [
      "Weekday afternoon, 1 PM – 4 PM",
      "Rear window pried with ~1/2″ flat tool",
      "Front door knock to confirm vacancy",
      "Primary bedroom targeted first",
      "In and out in under 12 minutes",
    ],
    dayPattern: "Tue – Thu",
  },
  B: {
    id: "B",
    name: "West Side Garage Series",
    color: "#22d3ee",
    timeWindow: "1 AM – 4:30 AM",
    timeLabel: "occurred between 1 AM and 4:30 AM",
    entryLabel: "entered through attached garages",
    targets: "power tools and high-end bicycles",
    vehicle: "White Ford Transit cargo van with ladder rack",
    vehicleSource: "Street camera (1), resident witness (2)",
    mo: [
      "Overnight, 1 AM – 4:30 AM",
      "Garage opener spoofed or door left open",
      "Tools and e-bikes removed in bulk",
      "Vehicle staged mid-block, engine running",
    ],
    dayPattern: "Fri – Sun",
  },
  C: {
    id: "C",
    name: "South End Forced-Door Series",
    color: "#f59e0b",
    timeWindow: "9:30 AM – 11:30 AM",
    timeLabel: "occurred between 9:30 AM and 11:30 AM",
    entryLabel: "forced the front door",
    targets: "TVs and game consoles",
    vehicle: "Dark gray Nissan Rogue, tinted rear windows",
    vehicleSource: "Doorbell video (1), witness (1)",
    mo: [
      "Weekday morning, 9:30 AM – 11:30 AM",
      "Front door kicked near deadbolt",
      "Two suspects, one waits in vehicle",
      "Living-room electronics prioritized",
    ],
    dayPattern: "Mon – Wed",
  },
};

const c = (x: BurglaryCase) => x;

export const CASES: BurglaryCase[] = [
  c({ id: 1041, date: "2026-08-02", time: "22:40", neighborhood: "Ballard", block: "5600 block of 24th Ave NW", entry: "Unlocked door", pointOfEntry: "Rear door", items: [{ name: "Cash", category: "Cash", value: 300 }, { name: "iPad Air", category: "Electronics", value: 600 }], solvability: 22, status: "Inactive", evidence: { video: false, prints: false, witness: false }, lat: 47.6705, lng: -122.3866, narrative: "Resident returned from dinner to find rear door ajar. Cash and tablet missing from kitchen counter. No forced entry, no witnesses.", detective: "Det. R. Alvarez" }),
  c({ id: 1044, date: "2026-08-06", time: "14:15", neighborhood: "Wallingford", block: "4500 block of Wallingford Ave N", entry: "Rear window (pried)", pointOfEntry: "Rear window", items: [{ name: "Antique diamond ring", category: "Jewelry", value: 4200 }, { name: "Gold chain necklace", category: "Jewelry", value: 1800 }, { name: "MacBook Pro 14″", category: "Electronics", value: 2100 }], solvability: 71, status: "Lead Generated", series: "A", fit: 0.92, vehicle: "Silver Honda Civic", evidence: { video: true, prints: true, witness: true }, lat: 47.6612, lng: -122.3352, narrative: "Homeowner left at 1 PM, returned 4:10 PM. Rear bedroom window pried with flat tool. Jewelry box emptied in primary bedroom; laptop taken from desk. Neighbor saw a silver sedan idling in the alley around 2 PM. Doorbell camera captured a man knocking at 1:52 PM.", detective: "Det. K. Nguyen" }),
  c({ id: 1049, date: "2026-08-11", time: "03:10", neighborhood: "Capitol Hill", block: "1400 block of E Republican St", entry: "Basement window", pointOfEntry: "Basement window", items: [{ name: "Road bike", category: "Bicycle", value: 1400 }], solvability: 58, status: "Cleared", evidence: { video: true, prints: false, witness: false }, lat: 47.6236, lng: -122.3141, narrative: "Bike taken from basement storage. Building camera identified a known offender. Arrest made 08/19; bike recovered.", detective: "Det. S. Okafor" }),
  c({ id: 1052, date: "2026-08-14", time: "02:20", neighborhood: "West Seattle", block: "4100 block of 42nd Ave SW", entry: "Garage (opener)", pointOfEntry: "Attached garage", items: [{ name: "Milwaukee tool set", category: "Tools", value: 1900 }, { name: "Trek e-bike", category: "Bicycle", value: 3800 }], solvability: 64, status: "Under Review", series: "B", fit: 0.9, vehicle: "White Ford Transit van", evidence: { video: true, prints: false, witness: true }, lat: 47.5652, lng: -122.3862, narrative: "Garage door found open at 6 AM. Tools and e-bike gone. Neighbor heard a van idling around 2:15 AM. Street camera shows a white cargo van with ladder rack.", detective: "Det. M. Brooks" }),
  c({ id: 1057, date: "2026-08-19", time: "11:30", neighborhood: "Queen Anne", block: "200 block of W Galer St", entry: "Sliding door (lifted)", pointOfEntry: "Rear slider", items: [{ name: "Watch collection", category: "Jewelry", value: 2600 }], solvability: 31, status: "Inactive", evidence: { video: false, prints: true, witness: false }, lat: 47.6352, lng: -122.3598, narrative: "Rear slider lifted off its track. Three watches taken. Partial print recovered from slider frame, no AFIS hit.", detective: "Det. R. Alvarez" }),
  c({ id: 1061, date: "2026-08-23", time: "10:05", neighborhood: "Rainier Valley", block: "3900 block of S Edmunds St", entry: "Front door (forced)", pointOfEntry: "Front door", items: [{ name: "65″ Samsung TV", category: "Electronics", value: 1100 }, { name: "PlayStation 5", category: "Electronics", value: 500 }], solvability: 55, status: "AI Analyzed", series: "C", fit: 0.88, vehicle: "Dark gray Nissan Rogue", evidence: { video: true, prints: false, witness: false }, lat: 47.5598, lng: -122.2871, narrative: "Front door kicked in near deadbolt. Television and game console taken from living room. Doorbell video shows two males and a dark gray SUV.", detective: "Det. T. Haddad" }),
  c({ id: 1066, date: "2026-08-27", time: "19:50", neighborhood: "University District", block: "4700 block of 17th Ave NE", entry: "Unlocked door", pointOfEntry: "Front door", items: [{ name: "Dell laptop", category: "Electronics", value: 900 }, { name: "Backpack", category: "Other", value: 80 }], solvability: 26, status: "AI Analyzed", evidence: { video: false, prints: false, witness: false }, lat: 47.6638, lng: -122.3098, narrative: "Shared student house; front door left unlocked during a gathering. Laptop and backpack missing from living room.", detective: undefined }),
  c({ id: 1070, date: "2026-08-31", time: "15:20", neighborhood: "Magnolia", block: "3200 block of W McGraw St", entry: "Side window (smashed)", pointOfEntry: "Side window", items: [{ name: "Handgun (Glock 19)", category: "Firearm", value: 550 }, { name: "Cash", category: "Cash", value: 700 }], solvability: 62, status: "Cleared", evidence: { video: true, prints: true, witness: true }, lat: 47.6395, lng: -122.3991, narrative: "Side window smashed. Firearm and cash taken from bedroom safe left open. Neighbor identified suspect. Arrest 09/04, firearm recovered.", detective: "Det. S. Okafor" }),
  c({ id: 1077, date: "2026-09-06", time: "03:40", neighborhood: "Delridge", block: "5400 block of 23rd Ave SW", entry: "Garage (opener)", pointOfEntry: "Attached garage", items: [{ name: "DeWalt table saw", category: "Tools", value: 750 }, { name: "Specialized mountain bike", category: "Bicycle", value: 2900 }], solvability: 57, status: "AI Analyzed", series: "B", fit: 0.86, vehicle: "White Ford Transit van", evidence: { video: false, prints: false, witness: true }, lat: 47.5531, lng: -122.3631, narrative: "Attached garage entered overnight; no forced entry. Saw and mountain bike missing. Resident heard a vehicle door slide shut around 3:30 AM.", detective: "Det. M. Brooks" }),
  c({ id: 1081, date: "2026-09-10", time: "20:15", neighborhood: "Northgate", block: "10500 block of 5th Ave NE", entry: "Rear door (forced)", pointOfEntry: "Rear door", items: [{ name: "Xbox Series X", category: "Electronics", value: 500 }], solvability: 18, status: "Inactive", evidence: { video: false, prints: false, witness: false }, lat: 47.7052, lng: -122.3229, narrative: "Rear door forced while residents were at a movie. Console taken. No camera or witnesses.", detective: undefined }),
  c({ id: 1086, date: "2026-09-14", time: "10:40", neighborhood: "Beacon Hill", block: "2900 block of 15th Ave S", entry: "Front door (forced)", pointOfEntry: "Front door", items: [{ name: "LG OLED TV", category: "Electronics", value: 1700 }, { name: "Nintendo Switch", category: "Electronics", value: 300 }], solvability: 52, status: "Lead Generated", series: "C", fit: 0.84, vehicle: "Dark gray Nissan Rogue", evidence: { video: false, prints: false, witness: true }, lat: 47.5772, lng: -122.3128, narrative: "Front door forced mid-morning. TV and handheld console taken. Witness saw two men loading a TV into a gray SUV.", detective: "Det. T. Haddad" }),
  c({ id: 1092, date: "2026-09-19", time: "13:00", neighborhood: "Ravenna", block: "6500 block of 25th Ave NE", entry: "Rear door (forced)", pointOfEntry: "Rear door", items: [{ name: "Camera kit (Sony A7)", category: "Electronics", value: 2400 }], solvability: 39, status: "AI Analyzed", evidence: { video: false, prints: true, witness: false }, lat: 47.6762, lng: -122.3008, narrative: "Rear door forced with a pry bar. Camera equipment taken from office. Tool marks differ from known series.", detective: undefined }),
  c({ id: 1098, date: "2026-09-24", time: "13:40", neighborhood: "Fremont", block: "3600 block of Phinney Ave N", entry: "Rear window (pried)", pointOfEntry: "Rear window", items: [{ name: "Pearl earrings", category: "Jewelry", value: 900 }, { name: "Gold bracelet", category: "Jewelry", value: 1500 }, { name: "Apple iPad Pro", category: "Electronics", value: 1100 }], solvability: 66, status: "Lead Generated", series: "A", fit: 0.96, vehicle: "Silver Honda Civic", evidence: { video: true, prints: false, witness: false }, lat: 47.6552, lng: -122.3545, narrative: "Rear window pried, same 1/2-inch tool impression. Jewelry taken from bedroom dresser; tablet from nightstand. Doorbell video shows a man knocking at 1:28 PM, then a silver Civic leaving at 1:51 PM.", detective: "Det. K. Nguyen" }),
  c({ id: 1103, date: "2026-09-28", time: "01:30", neighborhood: "Capitol Hill", block: "600 block of 19th Ave E", entry: "Sliding door (lifted)", pointOfEntry: "Rear slider", items: [{ name: "Designer handbags (2)", category: "Other", value: 3100 }], solvability: 34, status: "AI Analyzed", evidence: { video: false, prints: false, witness: false }, lat: 47.6248, lng: -122.3072, narrative: "Rear slider lifted while residents slept. Two designer handbags taken from entry closet.", detective: undefined }),
  c({ id: 1109, date: "2026-10-02", time: "02:05", neighborhood: "West Seattle", block: "6000 block of California Ave SW", entry: "Garage (opener)", pointOfEntry: "Attached garage", items: [{ name: "Rad Power e-bike", category: "Bicycle", value: 1900 }, { name: "Makita drill set", category: "Tools", value: 650 }], solvability: 61, status: "Lead Generated", series: "B", fit: 0.91, vehicle: "White Ford Transit van", evidence: { video: true, prints: false, witness: false }, lat: 47.5508, lng: -122.3868, narrative: "Garage entered without force. E-bike and drill set taken. Neighbor's camera recorded a white van with ladder rack at 2:01 AM.", detective: "Det. M. Brooks" }),
  c({ id: 1115, date: "2026-10-07", time: "09:50", neighborhood: "Columbia City", block: "4800 block of 37th Ave S", entry: "Front door (forced)", pointOfEntry: "Front door", items: [{ name: "Sony 75″ TV", category: "Electronics", value: 1600 }, { name: "PlayStation 5", category: "Electronics", value: 500 }], solvability: 59, status: "Lead Generated", series: "C", fit: 0.9, vehicle: "Dark gray Nissan Rogue", evidence: { video: true, prints: true, witness: false }, lat: 47.5585, lng: -122.2878, narrative: "Front door kicked in. Large TV and console taken. Shoe impression lifted from door. Doorbell clip shows gray SUV with tinted rear windows.", detective: "Det. T. Haddad" }),
  c({ id: 1121, date: "2026-10-11", time: "15:05", neighborhood: "Green Lake", block: "7200 block of Woodlawn Ave NE", entry: "Rear window (pried)", pointOfEntry: "Rear window", items: [{ name: "Engagement ring", category: "Jewelry", value: 5200 }, { name: "Apple Watch Series 10", category: "Electronics", value: 450 }], solvability: 68, status: "Lead Generated", series: "A", fit: 0.92, vehicle: "Silver Honda Civic", evidence: { video: false, prints: true, witness: true }, lat: 47.6818, lng: -122.3245, narrative: "Rear window pried; matching tool marks. Ring and smartwatch taken from bedroom. Neighbor saw a man in a gray hoodie walk to a silver compact car around 3 PM.", detective: "Det. K. Nguyen" }),
  c({ id: 1126, date: "2026-10-14", time: "18:30", neighborhood: "Ballard", block: "7000 block of 15th Ave NW", entry: "Side window (smashed)", pointOfEntry: "Side window", items: [{ name: "Gaming PC", category: "Electronics", value: 2200 }], solvability: 43, status: "Under Review", evidence: { video: true, prints: false, witness: false }, lat: 47.6791, lng: -122.3762, narrative: "Side window smashed during early evening. Gaming PC taken. Camera shows a single suspect on foot; face obscured.", detective: "Det. R. Alvarez" }),
  c({ id: 1133, date: "2026-10-18", time: "13:25", neighborhood: "Wallingford", block: "3800 block of Meridian Ave N", entry: "Rear window (pried)", pointOfEntry: "Rear window", items: [{ name: "Sapphire pendant", category: "Jewelry", value: 2300 }, { name: "Coin collection", category: "Other", value: 1200 }], solvability: 63, status: "AI Analyzed", series: "A", fit: 0.86, vehicle: undefined, evidence: { video: false, prints: false, witness: true }, lat: 47.6535, lng: -122.3338, narrative: "Rear window pried. Pendant and coin collection taken from primary bedroom closet. Neighbor recalls a knock at their own door around 1 PM from a man asking for “Jason.”", detective: "Det. K. Nguyen" }),
  c({ id: 1137, date: "2026-10-21", time: "12:10", neighborhood: "Queen Anne", block: "1800 block of 6th Ave W", entry: "Unlocked door", pointOfEntry: "Front door", items: [{ name: "Laptop (HP Spectre)", category: "Electronics", value: 1300 }], solvability: 29, status: "AI Analyzed", evidence: { video: false, prints: false, witness: false }, lat: 47.6365, lng: -122.3651, narrative: "Front door left unlocked during a delivery. Laptop taken from foyer table.", detective: undefined }),
  c({ id: 1140, date: "2026-10-23", time: "04:10", neighborhood: "Delridge", block: "6800 block of Delridge Way SW", entry: "Garage (opener)", pointOfEntry: "Attached garage", items: [{ name: "Snap-on toolbox", category: "Tools", value: 4100 }], solvability: 54, status: "AI Analyzed", series: "B", fit: 0.8, vehicle: "White Ford Transit van", evidence: { video: false, prints: false, witness: true }, lat: 47.5412, lng: -122.3602, narrative: "Mechanic's rolling toolbox taken from attached garage. Witness walking dog saw a white van with ladder rack leave at 4:05 AM.", detective: "Det. M. Brooks" }),
  c({ id: 1144, date: "2026-10-25", time: "21:45", neighborhood: "University District", block: "5200 block of Brooklyn Ave NE", entry: "Rear door (forced)", pointOfEntry: "Rear door", items: [{ name: "MacBook Air", category: "Electronics", value: 1200 }, { name: "AirPods Pro", category: "Electronics", value: 250 }], solvability: 37, status: "New", evidence: { video: false, prints: true, witness: false }, lat: 47.6672, lng: -122.3141, narrative: "Rear door forced while tenants were out. Laptop and earbuds taken. Fingerprints lifted from door frame.", detective: undefined }),
  c({ id: 1148, date: "2026-10-27", time: "16:20", neighborhood: "Beacon Hill", block: "3400 block of Beacon Ave S", entry: "Basement window", pointOfEntry: "Basement window", items: [{ name: "Jewelry box (mixed)", category: "Jewelry", value: 1600 }], solvability: 41, status: "AI Analyzed", evidence: { video: false, prints: false, witness: true }, lat: 47.5711, lng: -122.3081, narrative: "Basement window removed. Mixed jewelry taken. Witness saw a teenager on a bicycle leaving the yard.", detective: undefined }),
  c({ id: 1152, date: "2026-10-29", time: "14:50", neighborhood: "Northgate", block: "11000 block of Roosevelt Way NE", entry: "Sliding door (lifted)", pointOfEntry: "Rear slider", items: [{ name: "Canon camera", category: "Electronics", value: 900 }, { name: "Cash", category: "Cash", value: 400 }], solvability: 33, status: "New", evidence: { video: false, prints: false, witness: false }, lat: 47.7092, lng: -122.3175, narrative: "Rear slider lifted mid-afternoon. Camera and cash taken from home office.", detective: undefined }),
  c({ id: 1157, date: "2026-10-31", time: "14:35", neighborhood: "Fremont", block: "4300 block of Francis Ave N", entry: "Rear window (pried)", pointOfEntry: "Rear window", items: [{ name: "Apple Watch Ultra 2", category: "Electronics", value: 800 }, { name: "Gold hoop earrings", category: "Jewelry", value: 700 }], solvability: 72, status: "Lead Generated", series: "A", fit: 0.8, vehicle: "Silver Honda Civic", evidence: { video: true, prints: false, witness: false }, lat: 47.6588, lng: -122.3505, narrative: "Rear window pried. Smartwatch and earrings taken. Neighbor's doorbell camera captured partial plate “BXK” on a silver Honda Civic at 2:58 PM.", detective: "Det. K. Nguyen" }),
  c({ id: 1159, date: "2026-11-01", time: "23:55", neighborhood: "Capitol Hill", block: "1000 block of E Pike St", entry: "Rear door (forced)", pointOfEntry: "Rear door", items: [{ name: "Electric guitar", category: "Other", value: 1800 }], solvability: 36, status: "New", evidence: { video: true, prints: false, witness: false }, lat: 47.6142, lng: -122.3189, narrative: "Rear door forced late evening. Guitar taken from music room. Alley camera captured a suspect carrying a guitar case.", detective: undefined }),
  c({ id: 1162, date: "2026-11-02", time: "13:55", neighborhood: "Green Lake", block: "6500 block of Sunnyside Ave N", entry: "Rear window (pried)", pointOfEntry: "Rear window", items: [{ name: "MacBook Pro 16″", category: "Electronics", value: 2800 }, { name: "Diamond tennis bracelet", category: "Jewelry", value: 3600 }], solvability: 74, status: "Under Review", series: "A", fit: 0.74, vehicle: "Silver Honda Civic", evidence: { video: false, prints: true, witness: true }, lat: 47.6722, lng: -122.3288, narrative: "Rear window pried while homeowner was at work. Laptop and bracelet taken. Witness saw a silver Civic parked with hazard lights on near the alley at 1:45 PM.", detective: "Det. K. Nguyen" }),
  c({ id: 1165, date: "2026-11-03", time: "10:20", neighborhood: "Rainier Valley", block: "5600 block of Rainier Ave S", entry: "Front door (forced)", pointOfEntry: "Front door", items: [{ name: "TCL 85″ TV", category: "Electronics", value: 1400 }, { name: "Xbox Series X", category: "Electronics", value: 500 }], solvability: 60, status: "New", series: "C", fit: 0.82, vehicle: "Dark gray Nissan Rogue", evidence: { video: true, prints: false, witness: false }, lat: 47.5482, lng: -122.2795, narrative: "Front door forced mid-morning. TV and console taken. Neighbor's video shows two men and a gray SUV.", detective: undefined }),
  c({ id: 1168, date: "2026-11-04", time: "17:10", neighborhood: "Magnolia", block: "2600 block of 34th Ave W", entry: "Side window (smashed)", pointOfEntry: "Side window", items: [{ name: "Silverware set", category: "Other", value: 1100 }], solvability: 27, status: "New", evidence: { video: false, prints: false, witness: false }, lat: 47.6455, lng: -122.4021, narrative: "Side window smashed. Antique silverware taken from dining room hutch.", detective: undefined }),
  c({ id: 1170, date: "2026-11-05", time: "09:15", neighborhood: "Ravenna", block: "5800 block of 20th Ave NE", entry: "Rear window (pried)", pointOfEntry: "Rear window", items: [{ name: "iPhone 16 Pro (spare)", category: "Electronics", value: 1000 }, { name: "Jewelry (rings, 3)", category: "Jewelry", value: 1900 }], solvability: 49, status: "New", evidence: { video: false, prints: false, witness: false }, lat: 47.6705, lng: -122.3066, narrative: "Rear window pried overnight or early morning. Phone and three rings taken. Time window does not match the daytime series.", detective: undefined }),
];

export const getCase = (id: number) => CASES.find((x) => x.id === id);

// ---------- Series linking ----------

export const linkedCases = (bc: BurglaryCase) =>
  bc.series ? CASES.filter((x) => x.series === bc.series && x.id !== bc.id) : [];

export const pairSimilarity = (a: BurglaryCase, b: BurglaryCase) =>
  a.fit && b.fit ? Math.round(((a.fit + b.fit) / 2) * 100) : 0;

export const similarityScore = (bc: BurglaryCase) => {
  const links = linkedCases(bc);
  if (!links.length) return nearestCandidate(bc)?.score ?? 0;
  return Math.round(links.reduce((s, l) => s + pairSimilarity(bc, l), 0) / links.length);
};

// For unlinked cases: the nearest weak candidate, so the AI can explain why it is NOT a series.
export function nearestCandidate(bc: BurglaryCase) {
  let best: { other: BurglaryCase; score: number; diffs: string[] } | undefined;
  for (const o of CASES) {
    if (o.id === bc.id) continue;
    let score = 20;
    const diffs: string[] = [];
    if (o.neighborhood === bc.neighborhood) score += 12;
    else diffs.push("different neighborhood");
    if (o.entry === bc.entry) score += 14;
    else diffs.push("different entry method");
    const dh = Math.abs(parseInt(o.time) - parseInt(bc.time));
    if (Math.min(dh, 24 - dh) <= 2) score += 8;
    else diffs.push("different time of day");
    if (o.items.some((i) => bc.items.some((j) => j.category === i.category))) score += 6;
    else diffs.push("no overlapping property");
    if (!best || score > best.score) best = { other: o, score, diffs };
  }
  return best;
}

export function seriesExplanation(bc: BurglaryCase) {
  if (!bc.series) return null;
  const s = SERIES[bc.series];
  const ids = [bc, ...linkedCases(bc)]
    .sort((a, b) => pairSimilarity(bc, b) - pairSimilarity(bc, a))
    .map((x) => x.id);
  const shown = ids.slice(0, 3);
  const rest = ids.length - shown.length;
  const list = `${shown.slice(0, -1).join(", ")}, and ${shown[shown.length - 1]}`;
  return `Cases ${list}${rest ? ` (plus ${rest} more)` : ""} likely belong to the same burglary series because all ${s.timeLabel}, ${s.entryLabel}, and targeted ${s.targets}.`;
}

// ---------- LeadsOnline (mock) ----------

export type MatchStatus = "New" | "Hold Requested" | "Confirmed" | "Dismissed";

export interface PawnMatch {
  id: string;
  caseId: number;
  item: string;
  reportedItem: string;
  shop: string;
  shopArea: string;
  dateListed: string;
  confidence: number;
  basis: string[];
  price: number;
  sellerNote: string;
}

export const PAWN_MATCHES: PawnMatch[] = [
  { id: "LO-88213", caseId: 1162, item: "MacBook Pro", reportedItem: "MacBook Pro 16″", shop: "Sound Pawn Brokers", shopArea: "Aurora Ave N", dateListed: "2026-11-03", confidence: 94, basis: ["Serial number partial match (last 6)", "Model / color match", "Listed 1 day after theft"], price: 1150, sellerNote: "Seller ID on file — repeat seller (4 items in 30 days)" },
  { id: "LO-88107", caseId: 1157, item: "Apple Watch", reportedItem: "Apple Watch Ultra 2", shop: "Pioneer Trade & Loan", shopArea: "Lake City Way NE", dateListed: "2026-11-01", confidence: 87, basis: ["Engraving “M + J 2024” matches report", "Band color match", "Listed 1 day after theft"], price: 310, sellerNote: "Same seller ID as LO-88213" },
  { id: "LO-87652", caseId: 1044, item: "Jewelry Item", reportedItem: "Antique diamond ring", shop: "Rainier Gold & Pawn", shopArea: "Rainier Ave S", dateListed: "2026-10-19", confidence: 78, basis: ["Photo similarity 0.91 vs. insurance photo", "Setting style match (Art Deco)", "Weight within 0.2 g"], price: 1900, sellerNote: "Seller ID on file — matches vehicle owner lookup (silver Civic)" },
  { id: "LO-87431", caseId: 1121, item: "Jewelry Item", reportedItem: "Engagement ring", shop: "Lakeside Resale Exchange", shopArea: "Northgate Way", dateListed: "2026-10-14", confidence: 64, basis: ["Carat estimate match (1.2 ct)", "Band size match"], price: 2200, sellerNote: "Seller ID on file" },
  { id: "LO-87990", caseId: 1109, item: "E-bike", reportedItem: "Rad Power e-bike", shop: "Harbor Pawn & Cycle", shopArea: "1st Ave S", dateListed: "2026-10-06", confidence: 82, basis: ["Frame serial exact match", "Aftermarket basket matches photo"], price: 700, sellerNote: "Seller ID on file — registered owner of white Ford Transit" },
  { id: "LO-87211", caseId: 1052, item: "Tool set", reportedItem: "Milwaukee tool set", shop: "Westside Tool & Pawn", shopArea: "Delridge Way SW", dateListed: "2026-08-20", confidence: 58, basis: ["Brand / kit contents match", "Engraved initials partially visible"], price: 600, sellerNote: "Seller ID on file" },
  { id: "LO-88004", caseId: 1115, item: "Game console", reportedItem: "PlayStation 5", shop: "South End Trade Center", shopArea: "MLK Jr Way S", dateListed: "2026-10-09", confidence: 71, basis: ["Serial number exact match"], price: 260, sellerNote: "Seller ID on file" },
  { id: "LO-88301", caseId: 1144, item: "MacBook Air", reportedItem: "MacBook Air", shop: "Sound Pawn Brokers", shopArea: "Aurora Ave N", dateListed: "2026-10-30", confidence: 41, basis: ["Model match only", "No serial on report"], price: 520, sellerNote: "Seller ID on file" },
];

export const matchesForCase = (bc: BurglaryCase) => {
  const ids = new Set([bc.id, ...linkedCases(bc).map((x) => x.id)]);
  return PAWN_MATCHES.filter((m) => ids.has(m.caseId)).sort((a, b) => b.confidence - a.confidence);
};

// ---------- Prioritization ----------

export type Priority = "High" | "Medium" | "Low";

export const daysAgo = (date: string) =>
  Math.max(0, Math.round((TODAY.getTime() - new Date(date + "T12:00:00").getTime()) / 86400000));

const lower = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);

export function prioritize(bc: BurglaryCase) {
  const links = linkedCases(bc).length;
  const best = matchesForCase(bc)[0];
  const age = daysAgo(bc.date);
  const factors = [
    { label: "Linked cases", points: Math.min(links, 5) * 8, max: 40 },
    { label: "Property recovery lead", points: best ? (best.confidence >= 75 ? 25 : best.confidence >= 55 ? 14 : 5) : 0, max: 25 },
    { label: "Physical / video evidence", points: (bc.evidence.video ? 9 : 0) + (bc.evidence.prints ? 8 : 0) + (bc.evidence.witness ? 5 : 0), max: 22 },
    { label: "Suspect vehicle", points: bc.vehicle ? 6 : 0, max: 6 },
    { label: "Recency", points: age <= 7 ? 8 : age <= 30 ? 4 : 0, max: 8 },
    { label: "Base solvability", points: Math.round(bc.solvability * 0.1), max: 10 },
  ];
  const score = Math.min(100, factors.reduce((s, f) => s + f.points, 0));
  const priority: Priority = score >= 60 ? "High" : score >= 16 ? "Medium" : "Low";

  const reasons: string[] = [];
  if (links) reasons.push(`Linked to ${links} related burglar${links === 1 ? "y" : "ies"} (${SERIES[bc.series!].name})`);
  if (best && best.confidence >= 55) reasons.push(`Property recovery lead: ${best.reportedItem} at ${best.shop} (${best.confidence}% match)`);
  else if (best) reasons.push(`Weak pawn match only (${best.confidence}%)`);
  if (bc.evidence.video) reasons.push("Video evidence available");
  if (bc.evidence.prints) reasons.push("Latent prints / impressions collected");
  if (bc.evidence.witness) reasons.push("Witness statement on file");
  if (bc.vehicle) reasons.push(`Suspect vehicle described: ${bc.vehicle}`);
  if (age <= 7) reasons.push(`Reported ${age === 0 ? "today" : `${age} day${age === 1 ? "" : "s"} ago`} — evidence still fresh`);
  if (!reasons.length) reasons.push("No suspect, vehicle, forensic or property leads");

  let summary: string;
  if (priority === "High") {
    const parts = [];
    if (links) parts.push(`linked to ${links} related burglar${links === 1 ? "y" : "ies"}`);
    if (best && best.confidence >= 55) parts.push("has a property recovery lead");
    if (!parts.length) parts.push("has strong forensic evidence");
    summary = `High Priority because it is ${parts.join(" and ")}.`;
  } else if (priority === "Medium") {
    summary = links
      ? `Medium Priority: part of a ${links + 1}-case series, but the property lead is only moderate${best ? ` (${best.confidence}%)` : ""} and the case is ${age} days old.`
      : `Medium Priority: ${lower(reasons.find((r) => !r.startsWith("Weak")) ?? reasons[0])}, but no linked cases or strong property lead.`;
  } else {
    const has = reasons.filter((r) => !r.startsWith("No suspect"));
    summary = `Low Priority: no linked cases or property leads${has.length ? ` (only: ${has.map(lower).join("; ")})` : ", no suspect information"}. Recommend pattern monitoring and victim follow-up.`;
  }
  return { score, priority, factors, reasons, summary };
}

// ---------- Dashboard & impact ----------

export const MONTHLY = [
  { month: "Jan", burglaries: 864, cleared: 108 },
  { month: "Feb", burglaries: 802, cleared: 101 },
  { month: "Mar", burglaries: 839, cleared: 107 },
  { month: "Apr", burglaries: 821, cleared: 104 },
  { month: "May", burglaries: 856, cleared: 112 },
  { month: "Jun", burglaries: 879, cleared: 115 },
  { month: "Jul", burglaries: 893, cleared: 118 },
  { month: "Aug", burglaries: 871, cleared: 122 },
  { month: "Sep", burglaries: 812, cleared: 117 },
  { month: "Oct", burglaries: 775, cleared: 116 },
].map((m) => ({ ...m, rate: +((m.cleared / m.burglaries) * 100).toFixed(1) }));

export const YTD_TOTAL = MONTHLY.reduce((s, m) => s + m.burglaries, 0);
export const YTD_CLEARED = MONTHLY.reduce((s, m) => s + m.cleared, 0);

export const IMPACT = {
  annualBurglaries: 10000,
  currentRate: 13,
  projectedRate: 16,
  additionalSolved: 300,
  laborReduction: 15,
  hoursPerCaseBefore: 22,
  hoursPerCaseAfter: 18.7,
};

export const CLEARANCE_PROJECTION = [
  { q: "Q1 '26", current: 12.9, projected: null as number | null },
  { q: "Q2 '26", current: 13.1, projected: null },
  { q: "Q3 '26", current: 13.0, projected: 13.0 },
  { q: "Q4 '26", current: 13.0, projected: 13.8 },
  { q: "Q1 '27", current: 13.1, projected: 14.6 },
  { q: "Q2 '27", current: 12.9, projected: 15.3 },
  { q: "Q3 '27", current: 13.0, projected: 15.8 },
  { q: "Q4 '27", current: 13.0, projected: 16.0 },
];

export const SOLVED_SOURCES = [
  { source: "Series linking", cases: 140, detail: "Clearing one arrest closes multiple linked reports" },
  { source: "Pawn / property matches", cases: 95, detail: "LeadsOnline matches surfaced within 48 hrs" },
  { source: "Smarter prioritization", cases: 65, detail: "Detective time moved to high-solvability cases" },
];

export const LABOR_BREAKDOWN = [
  { task: "Report review", before: 6, after: 5.1 },
  { task: "Manual case linking", before: 7, after: 5.6 },
  { task: "Pawn database checks", before: 4, after: 3.0 },
  { task: "Follow-up & interviews", before: 5, after: 5.0 },
];

export const DETECTIVES = ["Det. K. Nguyen", "Det. M. Brooks", "Det. T. Haddad", "Det. S. Okafor", "Det. R. Alvarez"];

export const fmtDate = (d: string) =>
  new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const fmtTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

export const money = (n: number) => "$" + n.toLocaleString("en-US");
