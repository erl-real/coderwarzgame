/* CoderWarz Main Core - Game Data Constants */
/* globals clamp */

var EMBED_DARK_SITES = [
  { "file": "blackmarket.exchange.html", "title": "BlackMarket Exchange", "category": "Market", "excerpt": "Underground market for restricted goods and services.", "tags": ["darkweb","market","blackmarket"] },
  { "file": "cardghost.net.html", "title": "CardGhost", "category": "Services", "excerpt": "Marketplace for anonymous services.", "tags": ["services","anonymous"] },
  { "file": "cult--------.html", "title": "Cult", "category": "Community", "excerpt": "Private community content.", "tags": ["community","forum"] },
  { "file": "newuser.net.html", "title": "NewUser", "category": "Onboarding", "excerpt": "Welcome and help for newcomers.", "tags": ["welcome","help"] },
  { "file": "selfdrive.ai.html", "title": "SelfDrive AI", "category": "Tech", "excerpt": "Self-driving AI research and projects.", "tags": ["ai","selfdrive","research"] },
  { "file": "the.portal.html", "title": "The Portal", "category": "Portal", "excerpt": "Gateway to hidden resources.", "tags": ["portal","gateway"] },
  { "file": "undergroundhome.net.html", "title": "Underground Home", "category": "Housing", "excerpt": "Hidden housing network and classifieds.", "tags": ["underground","housing"] },
  { "file": "void.net.html", "title": "Void Network", "category": "Misc", "excerpt": "An archive of voided content.", "tags": ["void","archive","misc"] }
];
var DEFAULT_WINDOW_COLORS = {
  activeFrom: "#6ec1ff",
  activeTo: "#1f4f95",
  inactiveFrom: "#8ca0c0",
  inactiveTo: "#394a63",
};
var DEFAULT_NETWORK_STATE = {
  selectedWifi: "my wifi 6C",
  airplaneMode: false,
  vpnEnabled: false,
  vpnCity: null,
};
var WIFI_SPEEDS_MBPS = {
  "my wifi 6C": 240,
};
var GOVERNMENT_CURRENCIES = [
  { code: "USD", label: "US Dollar", rate: 1, symbol: "$" },
  { code: "EUR", label: "Euro", rate: 1.08, symbol: "€" },
  { code: "JPY", label: "Japanese Yen", rate: 0.0067, symbol: "¥" },
  { code: "GBP", label: "British Pound", rate: 1.27, symbol: "£" },
  { code: "AUD", label: "Australian Dollar", rate: 0.66, symbol: "A$" },
];
var CRYPTO_COINS = [
  { code: "BTC", label: "Bitcoin", rate: 62000 },
  { code: "ETH", label: "Ethereum", rate: 3300 },
  { code: "XMR", label: "Monero", rate: 145 },
  { code: "SOL", label: "Solana", rate: 110 },
  { code: "ADA", label: "Cardano", rate: 0.62 },
  { code: "DOGE", label: "Dogecoin", rate: 0.19 },
];
var MARKET_BRANDS = [
  { id: "nodex", label: "Nodex Systems", sector: "Infrastructure", basePrice: 450 },
  { id: "cybershield", label: "CyberShield Inc", sector: "Security", basePrice: 820 },
  { id: "quantum", label: "Quantum Dynamics", sector: "Compute", basePrice: 12500 },
  { id: "voltmotors", label: "Volt Motors", sector: "Automotive", basePrice: 1200 },
  { id: "aerodrone", label: "AeroDrone", sector: "Robotics", basePrice: 2400 },
  { id: "biocore", label: "BioCore Labs", sector: "Healthcare", basePrice: 3100 },
  { id: "starrelay", label: "StarRelay", sector: "Satellite", basePrice: 15000 },
  { id: "nanolink", label: "NanoLink", sector: "Telecom", basePrice: 650 },
  { id: "voidsoft", label: "Void Software", sector: "Software", basePrice: 150 },
];

var COUNTRY_MAPPING = {
  "USA": ["Austin", "Phoenix", "Charlotte", "Columbus", "Tampa", "New York", "Detroit", "Anchorage", "Puerto Rico"],
  "UK": ["London", "Manchester"],
  "Japan": ["Tokyo"],
  "South Korea": ["Seoul"],
  "Singapore": ["Singapore"],
  "Germany": ["Berlin"],
  "Mexico": ["Mexico City"],
  "Brazil": ["São Paulo"],
  "Turkey": ["Istanbul"],
  "Philippines": ["Manila"],
  "Indonesia": ["Jakarta"],
  "Nigeria": ["Lagos"],
  "Bangladesh": ["Dhaka"],
  "Pakistan": ["Karachi"],
  "Egypt": ["Cairo"],
  "Australia": ["Sydney"],
  "Canada": ["Vancouver"],
  "Norway": ["Oslo"],
  "Poland": ["Katowice"],
  "Georgia": ["Tbilisi"],
  "Iceland": ["Reykjavik"],
  "Estonia": ["Tallinn"],
  "Others": ["Svalbard", "Guam", "Faroe Islands", "Greenland"]
};

var MARKET_INDICES = [
  { id: "US-DOW", label: "US Tech 100", region: "USA" },
  { id: "UK-FTSE", label: "UK Bluechip", region: "UK" },
  { id: "DE-DAX", label: "German DAX", region: "Germany" },
  { id: "JP-NIKKEI", label: "Japan Nikkei", region: "Japan" },
  { id: "ASIA-TECH", label: "Asia Tech 50", region: "Asia" },
  { id: "EM-LATAM", label: "LatAm Growth", region: "EM" },
  { id: "EM-AFRICA", label: "Africa Emerging", region: "EM" },
  { id: "GLOBAL-DOW", label: "Global Index", region: "Global" },
];

var DEFAULT_MARKET_STATE = {
  history: {}, // { assetId: [ { o, h, l, c, t } ] }
  lastTick: 0,
};

function generateInitialMarketHistory(assetId, basePrice) {
var history = [];
var lastClose = basePrice;
var now = Date.now();
var candleInterval = 5 * 60 * 1000; // 5 minute candles

  for (let i = 50; i >= 0; i--) {
var open = lastClose;
var volatility = basePrice * 0.02;
var change = (Math.random() - 0.5) * volatility;
var close = Math.max(0.01, open + change);
var high = Math.max(open, close) + Math.random() * (volatility * 0.2);
var low = Math.max(0.01, Math.min(open, close) - Math.random() * (volatility * 0.2));
    
    history.push({
      o: open,
      h: high,
      l: low,
      c: close,
      t: now - (i * candleInterval)
    });
    lastClose = close;
  }
  return history;
}

function getMarketStats(history) {
  if (!history || history.length === 0) return { price: 0, change: 0, changePercent: 0, isUp: true };
var current = history[history.length - 1];
var prev = history[history.length - 2] || current;
var price = current.c;
var change = price - prev.c;
var changePercent = (change / prev.c) * 100;
  return {
    price,
    change,
    changePercent,
    isUp: change >= 0
  };
}

var DEFAULT_ECONOMY_STATE = {
  government: { USD: 600, EUR: 0, JPY: 0, GBP: 0, AUD: 0 },
  crypto: { BTC: 0, ETH: 0, XMR: 0, SOL: 0, ADA: 0, DOGE: 0 },
  bankAccountUsd: 0,
  bankSavingsUsd: 0,
  investmentsUsd: 0,
  walletSlots: 1,
  connectedWallets: [
    { id: "0x8F21...A79", currency: "USD", type: "government" }
  ],
  bankActivity: [],
  contacts: [],
};
var BANK_CONTACTS = [];
var TRAVEL_DESTINATIONS = [
  "New York",
  "London",
  "Tokyo",
  "Seoul",
  "Singapore",
  "Berlin",
  "Mexico City",
  "São Paulo",
  "Istanbul",
  "Manila",
  "Jakarta",
  "Lagos",
  "Dhaka",
  "Karachi",
  "Cairo",
  "Sydney",
  "Vancouver",
  "Oslo",
  "Detroit",
  "Manchester",
  "Katowice",
  "Tbilisi",
  "Reykjavik",
  "Tallinn",
];
var STARTER_CITIES = ["Austin", "Phoenix", "Charlotte", "Columbus", "Tampa"];
var DIFFICULTY_ERAS = ["1990", "1993", "1996", "2008", "2010", "2012", "2014", "2016", "2018", "2020", "2022", "2024", "2026"];
function getDifficultyFromT(t) {
var clampedT = clamp(Number(t) || 0, 0, 1);
var moneyMult = Number((0.5 + 1.5 * clampedT).toFixed(2));
var eraIndex = Math.round(clampedT * (DIFFICULTY_ERAS.length - 1));
var era = DIFFICULTY_ERAS[eraIndex];
var label = "Normal";
  if (clampedT <= 0.15) label = "Hardest";
  else if (clampedT <= 0.35) label = "Hard";
  else if (clampedT <= 0.55) label = "Normal";
  else if (clampedT <= 0.8) label = "Easy";
  else label = "Easiest";
  return { t: clampedT, era, moneyMult, label };
}
var NORMAL_DIFFICULTY = getDifficultyFromT(1 / 3);
var VPN_ONLY_LOCATIONS = ["Svalbard", "Guam", "Faroe Islands", "Anchorage", "Puerto Rico", "Greenland"];
var VPN_LOCATIONS = [...TRAVEL_DESTINATIONS, ...VPN_ONLY_LOCATIONS];
var MAP_DOT_CALIBRATION = {
  xScale: 0.985,
  yScale: 0.94,
  xOffset: 0.2,
  yOffset: 2.6,
};
var CITY_COORDS = {
  "Austin": { lat: 30.2672, lon: -97.7431 },
  "Phoenix": { lat: 33.4484, lon: -112.074 },
  "Charlotte": { lat: 35.2271, lon: -80.8431 },
  "Columbus": { lat: 39.9612, lon: -82.9988 },
  "Tampa": { lat: 27.9506, lon: -82.4572 },
  "New York": { lat: 40.7128, lon: -74.006 },
  "London": { lat: 51.5074, lon: -0.1278 },
  "Tokyo": { lat: 35.6762, lon: 139.6503 },
  "Seoul": { lat: 37.5665, lon: 126.978 },
  "Singapore": { lat: 1.3521, lon: 103.8198 },
  "Berlin": { lat: 52.52, lon: 13.405 },
  "Mexico City": { lat: 19.4326, lon: -99.1332 },
  "São Paulo": { lat: -23.5505, lon: -46.6333 },
  "Istanbul": { lat: 41.0082, lon: 28.9784 },
  "Manila": { lat: 14.5995, lon: 120.9842 },
  "Jakarta": { lat: -6.2088, lon: 106.8456 },
  "Lagos": { lat: 6.5244, lon: 3.3792 },
  "Dhaka": { lat: 23.8103, lon: 90.4125 },
  "Karachi": { lat: 24.8607, lon: 67.0011 },
  "Cairo": { lat: 30.0444, lon: 31.2357 },
  "Sydney": { lat: -33.8688, lon: 151.2093 },
  "Vancouver": { lat: 49.2827, lon: -123.1207 },
  "Oslo": { lat: 59.9139, lon: 10.7522 },
  "Detroit": { lat: 42.3314, lon: -83.0458 },
  "Manchester": { lat: 53.4808, lon: -2.2426 },
  "Katowice": { lat: 50.2649, lon: 19.0238 },
  "Tbilisi": { lat: 41.7151, lon: 44.8271 },
  "Reykjavik": { lat: 64.1466, lon: -21.9426 },
  "Tallinn": { lat: 59.437, lon: 24.7536 },
  "Svalbard": { lat: 78.2232, lon: 15.6469 },
  "Guam": { lat: 13.4443, lon: 144.7937 },
  "Faroe Islands": { lat: 62.0079, lon: -6.7909 },
  "Anchorage": { lat: 61.2181, lon: -149.9003 },
  "Puerto Rico": { lat: 18.2208, lon: -66.5901 },
  "Greenland": { lat: 71.7069, lon: -42.6043 },
};
var ORG_TYPES = {
  LEGAL: ["Cafe", "Tech Startup", "Retail Shop", "Warehouse", "Luxury Boutique"],
  UNDERWORLD: ["Hacker Collective", "Cyber Gang", "Data Brokers", "Dark Market Cell"],
};

var BIZ_REG_BASE = 400;
var BIZ_REG_MAX = 100000;
var MAX_BIZ = 8;
var MAX_CREW = 1;
var MAX_BUILDINGS_PLAYER = 8;
function bizRegCost(existingCount){
var n = clamp(existingCount, 0, 7);
  return Math.round(BIZ_REG_BASE + (BIZ_REG_MAX - BIZ_REG_BASE) * (n / 7));
}
function totalLinkedBuildings(state){
var bizs = Array.isArray(state.businesses) ? state.businesses : [];
var c = 0;
  bizs.forEach(b => {
    if (Array.isArray(b.buildingIds)) c += b.buildingIds.length;
    else if (b.buildingId) c += 1;
  });
var pool = Array.isArray(state.player?.ownedBuildingIds) ? state.player.ownedBuildingIds.length : 0;
  return c + pool;
}
function isLinkableBuildingId(id){
  if(!id) return false;
var s = String(id).toLowerCase();
  if(s.startsWith('home-') || s.includes('home') && s.includes('residence')) return false;
  if(s.includes('gov') || s.includes('city_hall') || s.includes('court') || s.includes('jail') || s.includes('park') || s.includes('water_treatment')) return false;
  if(s.startsWith('crew_') || s.includes('bunker_unique') && s.includes('crew')) return false;
  // allow orgs / commercial
  return true;
}

var DEFAULT_ORG_STATS = {
  staff: 0,
  equipment: 10,
  cleanliness: 100,
  marketing: 0,
  menu: 10,
  prices: 50,
  security: 10,
  maintenance: 100,
  interiorDesign: 10,
};

var DEFAULT_BUSINESS_STATE = {
  businesses: [], // { id, name, type, buildingIds[], buildingId (legacy), stats: {}, staff: [], resources: { ingredients: 0 }, rep:0, debt:0 }
  globalCashPool: 0,
  globalMarketingBudget: 0,
  globalIngredients: 0,
};

var DEFAULT_CREW_STATE = {
  crews: [], // { id, name, type, stats: {}, members: [] }
  reputation: 0,
  heat: 0,
};

var DEFAULT_PLAYER_STATE = {
  playerName: "New Hacker",
  profilePhoto: "user",
  starterCity: STARTER_CITIES[0],
  currentCity: STARTER_CITIES[0],
  emails: [],
  phoneNumbers: [],
  homesOwned: [],
  houseStorage: { items: [] },
  homes: {},
  businessesOwned: [],
  ownedBuildingIds: [],
  hackedAccounts: [],
  inventory: [
    { id: "inv-usb-01", type: "usb", name: "Broken Flash Drive", icon: "usb", description: "It makes a weird clicking sound.", health: 12, capacityGb: 1, usedMb: 420 },
  ],
  networkNodes: [],              stats: {
    totalXp: 0,
    level: 1,
    playTimeSeconds: 0,
    autosavesCount: 0,
    backupsCount: 0,
    movesCount: 0,
    lifetimeEarnings: 0,
    alignment: 0, // -100 (Evil) to 100 (Good)
    fame: 0,
    occult: 0,
    loginCount: 1,
    timesHacked: 0,
    maxNetWorth: 0,
    pingsCount: 0,
    sitesVisitedCount: 0,
    filesScrapedCount: 0,
    hacksSucceeded: 0,
    hacksFailed: 0,
  },
  skills: {
    bruteforce: 1,
    stealth: 1,
    social: 1,
    hardware: 1,
    research: 1,
    coding: 1,
  },
  tutorial: {
    seen: false,
    step: 0,
    completed: false
  },
  osType: 'cubeos',
};
var WIDGET_CATALOG = [
  {
    id: "weather-widget",
    title: "Weather Widget",
    icon: "cloud-sun",
    description: "Shows random weather status for your current player city.",
  },
  {
    id: "pc-meters-widget",
    title: "PCMeters+",
    icon: "activity",
    description: "Real-time system monitoring for your rig.",
  },
  {
    id: "wallet-widget",
    title: "Wallet",
    icon: "wallet",
    description: "Live cash, bank and crypto net worth at a glance.",
  },
  {
    id: "smarthome-widget",
    title: "SmartHome",
    icon: "home",
    description: "Quick access to your homes, travel, and item storage.",
  },
  {
    id: "clippy-widget",
    title: "Clippy",
    icon: "message-circle-question",
    description: "Your built-in assistant. Comments on your rig's health and offers tips.",
  },
];
var WEATHER_STATUSES = [
  "Sunny",
  "Partly Cloudy",
  "Cloudy",
  "Light Rain",
  "Rain",
  "Thunderstorm",
  "Windy",
  "Foggy",
  "Snow",
];
var WEATHER_UPDATE_INTERVAL_MS = 2 * 60 * 60 * 1000;
var WEATHER_CITY_PROFILES = {
  "Austin": { min: 12, max: 37, statuses: ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Rain", "Thunderstorm", "Windy"] },
  "Phoenix": { min: 15, max: 43, statuses: ["Sunny", "Partly Cloudy", "Cloudy", "Windy", "Light Rain"] },
  "Charlotte": { min: 4, max: 33, statuses: ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Rain", "Thunderstorm", "Foggy"] },
  "Columbus": { min: -3, max: 31, statuses: ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Rain", "Windy", "Snow", "Foggy"] },
  "Tampa": { min: 12, max: 35, statuses: ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Rain", "Thunderstorm"] },
  "New York": { min: -4, max: 33, statuses: ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Rain", "Windy", "Snow", "Foggy"] },
  "London": { min: -1, max: 28, statuses: ["Partly Cloudy", "Cloudy", "Light Rain", "Rain", "Foggy", "Windy"] },
  "Tokyo": { min: 2, max: 34, statuses: ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Rain", "Windy"] },
  "Seoul": { min: -7, max: 34, statuses: ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Rain", "Windy", "Snow"] },
  "Singapore": { min: 24, max: 34, statuses: ["Partly Cloudy", "Cloudy", "Light Rain", "Rain", "Thunderstorm"] },
  "Berlin": { min: -5, max: 30, statuses: ["Partly Cloudy", "Cloudy", "Light Rain", "Rain", "Windy", "Snow", "Foggy"] },
  "Mexico City": { min: 8, max: 29, statuses: ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Rain"] },
  "SÃ£o Paulo": { min: 10, max: 32, statuses: ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Rain", "Thunderstorm"] },
  "Istanbul": { min: 2, max: 33, statuses: ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Rain", "Windy"] },
  "Manila": { min: 24, max: 35, statuses: ["Partly Cloudy", "Cloudy", "Light Rain", "Rain", "Thunderstorm"] },
  "Jakarta": { min: 24, max: 34, statuses: ["Partly Cloudy", "Cloudy", "Light Rain", "Rain", "Thunderstorm"] },
  "Lagos": { min: 23, max: 35, statuses: ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Rain", "Thunderstorm"] },
  "Dhaka": { min: 17, max: 36, statuses: ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Rain", "Thunderstorm"] },
  "Karachi": { min: 13, max: 39, statuses: ["Sunny", "Partly Cloudy", "Cloudy", "Windy", "Light Rain"] },
  "Cairo": { min: 10, max: 41, statuses: ["Sunny", "Partly Cloudy", "Cloudy", "Windy"] },
  "Sydney": { min: 7, max: 33, statuses: ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Rain", "Windy"] },
  "Vancouver": { min: -2, max: 27, statuses: ["Partly Cloudy", "Cloudy", "Light Rain", "Rain", "Foggy", "Snow"] },
  "Oslo": { min: -12, max: 24, statuses: ["Partly Cloudy", "Cloudy", "Light Rain", "Snow", "Windy", "Foggy"] },
  "Detroit": { min: -10, max: 30, statuses: ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Rain", "Windy", "Snow"] },
  "Manchester": { min: -1, max: 26, statuses: ["Partly Cloudy", "Cloudy", "Light Rain", "Rain", "Windy", "Foggy"] },
  "Katowice": { min: -8, max: 29, statuses: ["Partly Cloudy", "Cloudy", "Light Rain", "Rain", "Windy", "Snow"] },
  "Tbilisi": { min: -2, max: 34, statuses: ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Rain", "Windy"] },
  "Reykjavik": { min: -12, max: 17, statuses: ["Partly Cloudy", "Cloudy", "Light Rain", "Rain", "Windy", "Snow", "Foggy"] },
  "Tallinn": { min: -12, max: 25, statuses: ["Partly Cloudy", "Cloudy", "Light Rain", "Rain", "Windy", "Snow", "Foggy"] },
};
var DEFAULT_WIDGETS_STATE = {
  installedIds: [],
  weather: {
    city: DEFAULT_PLAYER_STATE.currentCity,
    status: "Clear",
    tempC: 22,
    updatedAt: 0,
  },
  weatherByCity: {},
  weatherLayout: {
    x: null,
    y: 16,
    w: 240,
    h: 130,
  },
  pcMeters: {
    showOverScreensaver: false,
    textOnlyMode: false,
    showNetworkDevices: false,
  },
  pcMetersLayout: {
    x: null,
    y: 16,
    w: 240,
    h: 220,
  },
  wallet: {
    showOverScreensaver: false,
  },
  walletLayout: {
    x: null,
    y: 16,
    w: 240,
    h: 180,
  },
  smartHome: {},
  smartHomeLayout: {
    x: null,
    y: 16,
    w: 260,
    h: 300,
  },
  clippy: {},
  /* No panel chrome: this box is only there to give the sprite and its speech
     bubble somewhere to sit, so it is sized to the character, not to a card. */
  clippyLayout: {
    x: null,
    y: 16,
    w: 260,
    h: 200,
  },
};
var CLOUD_FILE_TYPES = [
  { id: "html", label: "Web Page", rarityWeight: 80, minMb: 0.001, maxMb: 0.05, minValue: 0.0001, maxValue: 0.0099, ext: ["html", "htm", "php", "js"] },
  { id: "text", label: "Tiny Text", rarityWeight: 75, minMb: 0.001, maxMb: 0.02, minValue: 0.0001, maxValue: 0.005, ext: ["txt", "log", "conf"] },
  { id: "doc", label: "Document", rarityWeight: 60, minMb: 0.1, maxMb: 15, minValue: 1, maxValue: 50, ext: ["doc", "docx", "pdf", "rtf"] },
  { id: "photo", label: "Photo", rarityWeight: 45, minMb: 0.2, maxMb: 18, minValue: 25, maxValue: 170, ext: ["jpg", "png", "webp", "raw"] },
  { id: "audio", label: "Music", rarityWeight: 35, minMb: 3, maxMb: 45, minValue: 45, maxValue: 320, ext: ["mp3", "wav", "flac", "ogg"] },
  { id: "video", label: "Video", rarityWeight: 25, minMb: 8, maxMb: 1500, minValue: 120, maxValue: 900, ext: ["mp4", "mov", "mkv"] },
  { id: "archive", label: "Archive", rarityWeight: 20, minMb: 5, maxMb: 2000, minValue: 80, maxValue: 650, ext: ["zip", "rar", "7z", "tar.gz"] },
  { id: "program", label: "Program", rarityWeight: 15, minMb: 5, maxMb: 300, minValue: 220, maxValue: 1800, ext: ["exe", "msi", "appimg", "bin"] },
  { id: "game", label: "Game", rarityWeight: 10, minMb: 200, maxMb: 95000, minValue: 450, maxValue: 3500, ext: ["iso", "pkg", "zip"] },
  { id: "system", label: "System File", rarityWeight: 8, minMb: 60, maxMb: 30000, minValue: 850, maxValue: 7000, ext: ["img", "sys", "cfg", "fw"] },
  { id: "schema", label: "Logic Schema", rarityWeight: 6, minMb: 0.05, maxMb: 5, minValue: 1200, maxValue: 9500, ext: ["json", "yaml", "xml", "proto"] },
  { id: "table", label: "Data Table", rarityWeight: 5, minMb: 1, maxMb: 500, minValue: 2500, maxValue: 15000, ext: ["csv", "tsv", "xlsx"] },
  { id: "db", label: "Database", rarityWeight: 4, minMb: 100, maxMb: 500000, minValue: 15000, maxValue: 85000, ext: ["db", "sqlite", "sql", "mdb"] },
  { id: "enc_p", label: "Encrypted (Personal)", rarityWeight: 3, minMb: 1, maxMb: 100, minValue: 5000, maxValue: 25000, ext: ["key", "vault", "priv"] },
  { id: "enc_o", label: "Encrypted (Org)", rarityWeight: 2, minMb: 50, maxMb: 5000, minValue: 45000, maxValue: 150000, ext: ["corp", "sec", "int"] },
  { id: "enc_g", label: "Encrypted (Gov)", rarityWeight: 1, minMb: 500, maxMb: 50000, minValue: 250000, maxValue: 1200000, ext: ["gov", "top", "cls"] },
  { id: "spy", label: "Spy Intelligence", rarityWeight: 0.5, minMb: 0.01, maxMb: 10, minValue: 500000, maxValue: 5000000, ext: ["intel", "msg", "raw"], hidden: true },
  { id: "occult", label: "Occult Signal", rarityWeight: 0.2, minMb: 0.001, maxMb: 666, minValue: 666666, maxValue: 6666666, ext: ["sig", "dark", "void"], hidden: true },
  { id: "forbidden", label: "Forbidden Unknown", rarityWeight: 0.05, minMb: 0.0001, maxMb: 999999, minValue: 9999999, maxValue: 99999999, ext: ["???", "null", "none"], hidden: true },
];
var SCRAPER_STACK_MAX_FILES = 9999;
var SCRAPER_TYPE_UPGRADES = [
  { typeId: "photo", label: "Photo Scanner", priceUsd: 150 },
  { typeId: "audio", label: "Music Scanner", priceUsd: 350 },
  { typeId: "video", label: "Video Scanner", priceUsd: 600 },
  { typeId: "archive", label: "Archive Scanner", priceUsd: 900 },
  { typeId: "program", label: "Program Scanner", priceUsd: 1400 },
  { typeId: "game", label: "Game Scanner", priceUsd: 3200 },
  { typeId: "system", label: "System Scanner", priceUsd: 7000 },
  { typeId: "schema", label: "Logic Schema Scanner", priceUsd: 12000 },
  { typeId: "table", label: "Data Table Scanner", priceUsd: 25000 },
  { typeId: "db", label: "Database Scanner", priceUsd: 50000 },
  { typeId: "enc_p", label: "Locked files (Personal)", priceUsd: 100000 },
  { id: "ping-filter", label: "Ping Filter Module", priceUsd: 450, description: "Filter ping scans by specific file types." },
  { id: "auto-search", label: "Auto Search Module", priceUsd: 2500, description: "Hands-free continuous ping scanning." },
];
var SCRAPER_TARGET_TAB_PRICE_USD = 10000;
var SCRAPER_TARGET_HISTORY_LIMIT = 12;
var PING_UPGRADE_COSTS = {
  text: 50,
  photo: 200,
  audio: 400,
  video: 800,
  archive: 1200,
  program: 2500,
  game: 5000,
  system: 12000,
};
var DEFAULT_CLOUD_STATE = {
  files: [],
  scrapeRuns: 0,
  capacityGb: 1024,
  unlockedTypeIds: ["text"],
  scrapeStacks: [],
  downloadQueue: [],
  scraperTarget: "net://scan.default",
  scraperBookmarks: [],
  scraperTargetHistory: [],
  targetTabUnlocked: false,
  isScanning: false,
  scanProgress: 0,
  scanFinished: false,
  isPinging: false,
  pingProgress: 0,
  pingFinished: false,
  pingTarget: null,
  pingFilterMode: "all", // "all" or specific typeId
  pingFilterUnlocked: false,
  autoSearchUnlocked: false,
  autoSearchEnabled: false,
  pingSpeedLevels: {
    text: 1,
    photo: 1,
    audio: 1,
    video: 1,
    archive: 1,
    program: 1,
    game: 1,
    system: 1,
  },
};
var UPGRADE_CATALOG = [
  // CPUs
  { id: "cpu-budget", title: "Gen-X Lite 2.4", type: "hardware", price: "$150", effect: { cpu: "Gen-X Lite 2.4 GHz", storageSpeedMbps: 10, cpuPower: 1.2 }, description: "Low-end processor for basic tasks." },
  { id: "cpu-mid", title: "HX-Nexus 3.8", type: "hardware", price: "$450", effect: { cpu: "HX-Nexus 3.8 GHz Quad-Core", storageSpeedMbps: 25, cpuPower: 3.5 }, description: "Mid-range workhorse." },
  { id: "cpu-x2", title: "HX-2 Processor", type: "hardware", price: "$2400", effect: { cpu: "HX-2 Octa-Core 4.1 GHz", storageSpeedMbps: 50, cpuPower: 8.2 }, description: "Upgrades CPU and data bus speed." },
  { id: "cpu-beast", title: "Helix-Ripper Pro 6.0", type: "hardware", price: "$8500", effect: { cpu: "Helix-Ripper Pro 6.0 GHz 64-Core", storageSpeedMbps: 250, cpuPower: 25.0 }, description: "Massive parallel processing power." },
  { id: "cpu-quantum", title: "Quantum Logic Chip", type: "hardware", price: "$45000", effect: { cpu: "Q-Logic Gen 4", storageSpeedMbps: 1200, cpuPower: 100.0 }, description: "State of the art quantum computing unit." },

  // RAM
  { id: "ram-4gb", title: "4GB DDR3 Module", type: "hardware", price: "$80", effect: { ramGb: 4 }, description: "Legacy memory module." },
  { id: "ram-8gb", title: "8GB DDR4 Module", type: "hardware", price: "$180", effect: { ramGb: 8 }, description: "Standard system memory." },
  { id: "ram-16gb", title: "16GB DDR5 Module", type: "hardware", price: "$450", effect: { ramGb: 16 }, description: "Adds +16GB high-speed system memory." },
  { id: "ram-64gb", title: "64GB Server RAM", type: "hardware", price: "$1800", effect: { ramGb: 64 }, description: "Enterprise-grade high capacity RAM." },
  { id: "ram-256gb", title: "256GB ECC Rack", type: "hardware", price: "$12000", effect: { ramGb: 256 }, description: "Massive memory for extreme multitasking." },

  // Storage (SSDs)
  { id: "ssd-128gb", title: "128GB SATA SSD", type: "hardware", price: "$120", effect: { storageGb: 128, storageSpeedMbps: 80 }, description: "Budget storage upgrade." },
  { id: "ssd-512gb", title: "512GB NVMe SSD", type: "hardware", price: "$450", effect: { storageGb: 512, storageSpeedMbps: 350 }, description: "Adds +512GB faster storage." },
  { id: "ssd-2tb", title: "2TB NVMe Gen5", type: "hardware", price: "$1400", effect: { storageGb: 2048, storageSpeedMbps: 1200 }, description: "Ultra-fast high capacity storage." },
  { id: "ssd-16tb", title: "16TB NVMe Array", type: "hardware", price: "$9500", effect: { storageGb: 16384, storageSpeedMbps: 4500 }, description: "Massive storage for data hoarders." },

  // GPUs
  { id: "gpu-budget", title: "NV-Glow 750 2GB", type: "hardware", price: "$250", effect: { gpu: "NV-Glow 750 2GB" }, description: "Entry-level graphics card." },
  { id: "gpu-rx", title: "RX Shadow GPU", type: "hardware", price: "$1200", effect: { gpu: "RX Shadow 8GB" }, description: "Better graphics and compute acceleration." },
  { id: "gpu-rtx", title: "NV-Glow 5090 32GB", type: "hardware", price: "$4500", effect: { gpu: "NV-Glow 5090 32GB" }, description: "Top-tier gaming and compute power." },
  { id: "gpu-h100", title: "RX-Glow H100 Tensor", type: "hardware", price: "$28000", effect: { gpu: "RX-Glow H100 80GB" }, description: "Industrial AI and compute powerhouse." },

  // Software
  { id: "os-11", title: "CUBE OS 1.1 Upgrade", type: "software", price: "$700", effect: { os: "CUBE OS 1.1.00" }, description: "System software update with improved tooling." },
  { id: "os-pro", title: "CUBE OS Enterprise", type: "software", price: "$2500", effect: { os: "CUBE OS Enterprise v4" }, description: "Professional grade operating system." },
];
var DEFAULT_PC_STATE = {
  hostname: "HX-STATION",
  motherboard: "HackBoard B450",
  cpu: "HX-1 Quad-Core 3.2 GHz",
  ramGb: 8,
  storageGb: 256,
  storageSpeedMbps: 50,
  gpu: "NV-Glow 650 2GB",
  os: "CUBE OS 1.0.42",
  bios: "NEE BIOS v1.0.42",
  cpuHealth: 100,
  gpuHealth: 100,
  storageHealth: 100,
  cpuOverclock: 0, // Percentage boost
  gpuOverclock: 0,
  storageOverclock: 0,
  cooling: { model: "Stock Air Cooler", rpm: 1200, efficiency: 0.6, health: 100 },
  ethernet: { model: "RigLink Gigabit", active: false, speedBoost: 1.5, health: 100 },
  usb: { model: "Generic 32GB Flash", capacityGb: 32, usedMb: 0, connected: false },
  hardwarePositions: {
    cpu: { x: 50, y: 25 },
    gpu: { x: 75, y: 50 },
    ram: { x: 75, y: 25 },
    storage: { x: 75, y: 75 },
    psu: { x: 25, y: 75 },
    mobo: { x: 50, y: 50 },
    cooling: { x: 35, y: 25 },
    ethernet: { x: 25, y: 50 },
    usb: { x: 25, y: 25 },
  },
  files: [],
  ownedUpgradeIds: [],
  installedUpgradeIds: [],
};

var DEFAULT_DISPLAY_SETTINGS = {
  theme: "neo",
  /* 0.9, not 1. The desktop reads oversized at 100% - p-4/p-3 cards,
     rounded-xl chrome and an h-11 taskbar all crowd each other. Zoom scales
     the whole shell including the taskbar and windows, and getDesktopViewport()
     divides by uiScale so drag/resize maths stays correct at any value.
     Bump this back to1 if the density work later replaces it. */
  uiScale: 0.8,
  textScale: 1,
  background: "wp001",
  taskbarColor: "#0f172a",
  scrollbarStyle: "sleek",
  useCustomWindowColors: false,
  windowColors: DEFAULT_WINDOW_COLORS,
  masterVolume: 0.5,
  // Window Customization (New)
  windowBgColor: "#0f172a", // Slate 900
  windowBgOpacity: 0.2,
  windowBorderColor: "#000000",
  windowBorderWidth: 1,
  windowFont: "Inter",
  // Player PC Skin (Web Through the Ages)
  pcSkin: "neo",
  // Screensaver Settings
  screensaverEnabled: true,
  screensaverTimeout: 5, // minutes
  screensaverBackground: "stars.html",
  streamerMode: false,
};

var FONT_OPTIONS = [
  { id: "Inter", label: "Inter (Default)", family: "'Inter', sans-serif" },
  { id: "Mono", label: "Monospace", family: "'JetBrains Mono', 'Fira Code', monospace" },
  { id: "Serif", label: "Classic Serif", family: "Georgia, serif" },
  { id: "Pixel", label: "Pixel Art", family: "'VT323', monospace" },
];

var PC_SKIN_OPTIONS = [
  { id: "neo", label: "Neo (Default)" },
  { id: "1990", label: "1990 — Windows 3.1" },
  { id: "1993", label: "1993 — GeoCities" },
  { id: "1996", label: "1996 — Win95 Black" },
  { id: "2008", label: "2008 — Web 2.0" },
  { id: "2010", label: "2010 — Dark Glass" },
  { id: "2012", label: "2012 — Flat Metro" },
  { id: "2014", label: "2014 — Terminal" },
  { id: "2016", label: "2016 — Material Indigo" },
  { id: "2018", label: "2018 — Dark Zinc" },
  { id: "2020", label: "2020 — JS Framework" },
  { id: "2022", label: "2022 — CSS Playground" },
  { id: "2024", label: "2024 — AI Purple" },
  { id: "2026", label: "2026 — Future Glass" },
];

function hexToRgba(hex, alpha = 1) {
var r = parseInt(hex.slice(1, 3), 16);
var g = parseInt(hex.slice(3, 5), 16);
var b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function muteColor(hex, alpha = 0.4, isDark = false) {
  if (!isDark) return hexToRgba(hex, alpha);
  // In dark mode, we blend with black and reduce opacity even more for a "muted" look
var r = Math.floor(parseInt(hex.slice(1, 3), 16) * 0.4);
var g = Math.floor(parseInt(hex.slice(3, 5), 16) * 0.4);
var b = Math.floor(parseInt(hex.slice(5, 7), 16) * 0.4);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

var DISPLAY_THEMES = {
  neo: {
    id: "neo",
    label: "Neo Glass",
    windowColors: {
      activeFrom: "#6ec1ff",
      activeTo: "#1f4f95",
      inactiveFrom: "#8ca0c0",
      inactiveTo: "#394a63",
    },
  },
  classic: {
    id: "classic",
    label: "Classic Blue",
    windowColors: {
      activeFrom: "#86b5ff",
      activeTo: "#0e2f75",
      inactiveFrom: "#b4bdd0",
      inactiveTo: "#5e6981",
    },
  },
  matrix: {
    id: "matrix",
    label: "Matrix Terminal",
    windowColors: {
      activeFrom: "#4fffa1",
      activeTo: "#045a37",
      inactiveFrom: "#6ca08a",
      inactiveTo: "#234638",
    },
  },
};

var BACKGROUND_PRESETS = [
  { id: "wp001", label: "No Safe-Mode Default", style: { backgroundImage: "url('./art/wallpaper/wp001.jpg')", backgroundSize: "cover", backgroundPosition: "center" } },
  { id: "wp002", label: "Midnight Glitch", style: { backgroundImage: "url('./art/wallpaper/wp002.jpg')", backgroundSize: "cover", backgroundPosition: "center" } },
  { id: "wp003", label: "Neon City", style: { backgroundImage: "url('./art/wallpaper/wp003.jpg')", backgroundSize: "cover", backgroundPosition: "center" } },
  { id: "wp004", label: "Cyber Static", style: { backgroundImage: "url('./art/wallpaper/wp004.jpg')", backgroundSize: "cover", backgroundPosition: "center" } },
  { id: "wp005", label: "Data Stream", style: { backgroundImage: "url('./art/wallpaper/wp005.jpg')", backgroundSize: "cover", backgroundPosition: "center" } },
  { id: "wp006", label: "Abstract Flux", style: { backgroundImage: "url('./art/wallpaper/wp006.jpg')", backgroundSize: "cover", backgroundPosition: "center" } },
  { id: "wp007", label: "Void Horizon", style: { backgroundImage: "url('./art/wallpaper/wp007.jpg')", backgroundSize: "cover", backgroundPosition: "center" } },
  /* ── CUBE OS ERA WALLPAPERS ──────────────────────────────────
     art/wallpaper/cubeos/. Registered here rather than forced from CSS so
     they are ordinary wallpapers: the player can pick any of them from the
     Desktop wallpaper picker, and picking a different one is remembered. The
     era skin only CHANGES the selection when the era changes - it never
     overrides what the player later chooses. */
  { id: "cube-01", label: "Prism",              style: { backgroundImage: "url('./art/wallpaper/cubeos/cubeoswp (1).jpg')",  backgroundSize: "cover", backgroundPosition: "center" } },
  { id: "cube-02", label: "Blue Glass",         style: { backgroundImage: "url('./art/wallpaper/cubeos/cubeoswp (2).jpg')",  backgroundSize: "cover", backgroundPosition: "center" } },
  { id: "cube-03", label: "Tidal Glass",        style: { backgroundImage: "url('./art/wallpaper/cubeos/cubeoswp (3).jpg')",  backgroundSize: "cover", backgroundPosition: "center" } },
  { id: "cube-04", label: "Frosted Sky",        style: { backgroundImage: "url('./art/wallpaper/cubeos/cubeoswp (4).jpg')",  backgroundSize: "cover", backgroundPosition: "center" } },
  { id: "cube-05", label: "Alpine Lake",        style: { backgroundImage: "url('./art/wallpaper/cubeos/cubeoswp (5).jpg')",  backgroundSize: "cover", backgroundPosition: "center" } },
  { id: "cube-06", label: "Iridescent",         style: { backgroundImage: "url('./art/wallpaper/cubeos/cubeoswp (6).jpg')",  backgroundSize: "cover", backgroundPosition: "center" } },
  { id: "cube-07", label: "Monochrome",         style: { backgroundImage: "url('./art/wallpaper/cubeos/cubeoswp (7).jpg')",  backgroundSize: "cover", backgroundPosition: "center" } },
  { id: "cube-08", label: "Deep Space",         style: { backgroundImage: "url('./art/wallpaper/cubeos/cubeoswp (8).jpg')",  backgroundSize: "cover", backgroundPosition: "center" } },
  { id: "cube-09", label: "Violet Grid",        style: { backgroundImage: "url('./art/wallpaper/cubeos/cubeoswp (9).jpg')",  backgroundSize: "cover", backgroundPosition: "center" } },
  { id: "cube-10", label: "Flat Interior",      style: { backgroundImage: "url('./art/wallpaper/cubeos/cubeoswp (10).jpg')", backgroundSize: "cover", backgroundPosition: "center" } },
  { id: "cube-11", label: "Violet Night",       style: { backgroundImage: "url('./art/wallpaper/cubeos/cubeoswp (11).jpg')", backgroundSize: "cover", backgroundPosition: "center" } },
  { id: "cube-12", label: "Ember Triangle",     style: { backgroundImage: "url('./art/wallpaper/cubeos/cubeoswp (12).jpg')", backgroundSize: "cover", backgroundPosition: "center" } },
  { id: "cube-13", label: "Magenta Triangle",   style: { backgroundImage: "url('./art/wallpaper/cubeos/cubeoswp (13).jpg')", backgroundSize: "cover", backgroundPosition: "center" } },
  { id: "cube-14", label: "Orbital",            style: { backgroundImage: "url('./art/wallpaper/cubeos/cubeoswp (14).jpg')", backgroundSize: "cover", backgroundPosition: "center" } },
  { id: "cube-15", label: "Bubble Glass",       style: { backgroundImage: "url('./art/wallpaper/cubeos/cubeoswp (15).jpg')", backgroundSize: "cover", backgroundPosition: "center" } },
  {
    id: "crimson-grid",
    label: "Crimson Grid",
    style: {
      backgroundImage:
        "radial-gradient(70% 90% at 70% 20%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 60%), linear-gradient(135deg, rgba(2,6,23,0.98), rgba(15,23,42,0.95) 50%, rgba(2,6,23,0.98)), radial-gradient(100% 120% at 20% 70%, rgba(239,68,68,0.28) 0%, rgba(239,68,68,0) 55%), radial-gradient(100% 120% at 85% 60%, rgba(244,63,94,0.22) 0%, rgba(244,63,94,0) 55%)",
    },
  },
  {
    id: "ocean",
    label: "Ocean Blue",
    style: {
      backgroundImage:
        "radial-gradient(120% 120% at 10% 10%, rgba(125,211,252,0.26), rgba(125,211,252,0) 40%), radial-gradient(90% 120% at 85% 80%, rgba(59,130,246,0.35), rgba(59,130,246,0) 55%), linear-gradient(140deg, rgba(2,6,23,1), rgba(3,37,65,0.95), rgba(15,23,42,1))",
    },
  },
  {
    id: "matrix",
    label: "Matrix Code",
    style: {
      backgroundImage:
        "linear-gradient(180deg, rgba(2,20,8,0.98), rgba(3,35,14,0.98)), repeating-linear-gradient(to right, rgba(34,197,94,0.12) 0px, rgba(34,197,94,0.12) 1px, transparent 1px, transparent 38px), repeating-linear-gradient(to bottom, rgba(34,197,94,0.09) 0px, rgba(34,197,94,0.09) 1px, transparent 1px, transparent 38px)",
    },
  },
  {
    id: "sunset",
    label: "Neon Sunset",
    style: {
      backgroundImage:
        "radial-gradient(100% 100% at 80% 15%, rgba(244,114,182,0.3), rgba(244,114,182,0) 45%), radial-gradient(120% 120% at 20% 85%, rgba(251,146,60,0.32), rgba(251,146,60,0) 50%), linear-gradient(160deg, rgba(8,12,30,1), rgba(49,10,73,0.95), rgba(8,12,30,1))",
    },
  },
];
