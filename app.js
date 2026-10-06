/* Life Calendars — Location Calendar
 * Data lives in data.json on GitHub Pages, with a localStorage overlay for
 * in-browser edits. Save opens a prefilled GitHub issue; an allowlisted
 * Action writes data.json. No personal token in the browser.
 */

const STORAGE_KEY = "life-calendar-data-v1";
const SETTINGS_KEY = "life-calendar-settings-v1";
const YEAR_START = 2009;

const GITHUB_REPO = "bigomega/life-calendars";
const GITHUB_DATA_BRANCH = "gh-pages";
const SAVE_ISSUE_TITLE = "life-calendars-save";
const SAVE_URL_MAX = 7200;

const COUNTRY_HUES = {
  India: 14,
  USA: 214,
  Mexico: 145,
  UAE: 42,
  Georgia: 271,
  Turkey: 187,
  Kazakhstan: 328,
  Transit: 204,
};
const LIGHTNESS_STEPS = [42, 56, 34, 66, 48, 60, 38, 70];

const TRANSIT_COUNTRY = "Transit";
const TRANSIT_COUNTRY_ALIASES = new Set(["transit", "international transit"]);

// Display name + ISO 3166-1 alpha-2. Flags come from the code; the dropdown
// is this full list so a stay is never missing a country (Cyprus, etc.).
const COUNTRIES = [
  ["Afghanistan", "AF"],
  ["Albania", "AL"],
  ["Algeria", "DZ"],
  ["Andorra", "AD"],
  ["Angola", "AO"],
  ["Antigua and Barbuda", "AG"],
  ["Argentina", "AR"],
  ["Armenia", "AM"],
  ["Australia", "AU"],
  ["Austria", "AT"],
  ["Azerbaijan", "AZ"],
  ["Bahamas", "BS"],
  ["Bahrain", "BH"],
  ["Bangladesh", "BD"],
  ["Barbados", "BB"],
  ["Belarus", "BY"],
  ["Belgium", "BE"],
  ["Belize", "BZ"],
  ["Benin", "BJ"],
  ["Bhutan", "BT"],
  ["Bolivia", "BO"],
  ["Bosnia and Herzegovina", "BA"],
  ["Botswana", "BW"],
  ["Brazil", "BR"],
  ["Brunei", "BN"],
  ["Bulgaria", "BG"],
  ["Burkina Faso", "BF"],
  ["Burundi", "BI"],
  ["Cabo Verde", "CV"],
  ["Cambodia", "KH"],
  ["Cameroon", "CM"],
  ["Canada", "CA"],
  ["Central African Republic", "CF"],
  ["Chad", "TD"],
  ["Chile", "CL"],
  ["China", "CN"],
  ["Colombia", "CO"],
  ["Comoros", "KM"],
  ["Congo", "CG"],
  ["Costa Rica", "CR"],
  ["Croatia", "HR"],
  ["Cuba", "CU"],
  ["Cyprus", "CY"],
  ["Czechia", "CZ"],
  ["DR Congo", "CD"],
  ["Denmark", "DK"],
  ["Djibouti", "DJ"],
  ["Dominica", "DM"],
  ["Dominican Republic", "DO"],
  ["Ecuador", "EC"],
  ["Egypt", "EG"],
  ["El Salvador", "SV"],
  ["Equatorial Guinea", "GQ"],
  ["Eritrea", "ER"],
  ["Estonia", "EE"],
  ["Eswatini", "SZ"],
  ["Ethiopia", "ET"],
  ["Fiji", "FJ"],
  ["Finland", "FI"],
  ["France", "FR"],
  ["Gabon", "GA"],
  ["Gambia", "GM"],
  ["Georgia", "GE"],
  ["Germany", "DE"],
  ["Ghana", "GH"],
  ["Greece", "GR"],
  ["Grenada", "GD"],
  ["Guatemala", "GT"],
  ["Guinea", "GN"],
  ["Guinea-Bissau", "GW"],
  ["Guyana", "GY"],
  ["Haiti", "HT"],
  ["Honduras", "HN"],
  ["Hong Kong", "HK"],
  ["Hungary", "HU"],
  ["Iceland", "IS"],
  ["India", "IN"],
  ["Indonesia", "ID"],
  ["Iran", "IR"],
  ["Iraq", "IQ"],
  ["Ireland", "IE"],
  ["Israel", "IL"],
  ["Italy", "IT"],
  ["Ivory Coast", "CI"],
  ["Jamaica", "JM"],
  ["Japan", "JP"],
  ["Jordan", "JO"],
  ["Kazakhstan", "KZ"],
  ["Kenya", "KE"],
  ["Kiribati", "KI"],
  ["Kosovo", "XK"],
  ["Kuwait", "KW"],
  ["Kyrgyzstan", "KG"],
  ["Laos", "LA"],
  ["Latvia", "LV"],
  ["Lebanon", "LB"],
  ["Lesotho", "LS"],
  ["Liberia", "LR"],
  ["Libya", "LY"],
  ["Liechtenstein", "LI"],
  ["Lithuania", "LT"],
  ["Luxembourg", "LU"],
  ["Macau", "MO"],
  ["Madagascar", "MG"],
  ["Malawi", "MW"],
  ["Malaysia", "MY"],
  ["Maldives", "MV"],
  ["Mali", "ML"],
  ["Malta", "MT"],
  ["Marshall Islands", "MH"],
  ["Mauritania", "MR"],
  ["Mauritius", "MU"],
  ["Mexico", "MX"],
  ["Micronesia", "FM"],
  ["Moldova", "MD"],
  ["Monaco", "MC"],
  ["Mongolia", "MN"],
  ["Montenegro", "ME"],
  ["Morocco", "MA"],
  ["Mozambique", "MZ"],
  ["Myanmar", "MM"],
  ["Namibia", "NA"],
  ["Nauru", "NR"],
  ["Nepal", "NP"],
  ["Netherlands", "NL"],
  ["New Zealand", "NZ"],
  ["Nicaragua", "NI"],
  ["Niger", "NE"],
  ["Nigeria", "NG"],
  ["North Korea", "KP"],
  ["North Macedonia", "MK"],
  ["Norway", "NO"],
  ["Oman", "OM"],
  ["Pakistan", "PK"],
  ["Palau", "PW"],
  ["Palestine", "PS"],
  ["Panama", "PA"],
  ["Papua New Guinea", "PG"],
  ["Paraguay", "PY"],
  ["Peru", "PE"],
  ["Philippines", "PH"],
  ["Poland", "PL"],
  ["Portugal", "PT"],
  ["Puerto Rico", "PR"],
  ["Qatar", "QA"],
  ["Romania", "RO"],
  ["Russia", "RU"],
  ["Rwanda", "RW"],
  ["Saint Kitts and Nevis", "KN"],
  ["Saint Lucia", "LC"],
  ["Saint Vincent and the Grenadines", "VC"],
  ["Samoa", "WS"],
  ["San Marino", "SM"],
  ["Sao Tome and Principe", "ST"],
  ["Saudi Arabia", "SA"],
  ["Senegal", "SN"],
  ["Serbia", "RS"],
  ["Seychelles", "SC"],
  ["Sierra Leone", "SL"],
  ["Singapore", "SG"],
  ["Slovakia", "SK"],
  ["Slovenia", "SI"],
  ["Solomon Islands", "SB"],
  ["Somalia", "SO"],
  ["South Africa", "ZA"],
  ["South Korea", "KR"],
  ["South Sudan", "SS"],
  ["Spain", "ES"],
  ["Sri Lanka", "LK"],
  ["Sudan", "SD"],
  ["Suriname", "SR"],
  ["Sweden", "SE"],
  ["Switzerland", "CH"],
  ["Syria", "SY"],
  ["Taiwan", "TW"],
  ["Tajikistan", "TJ"],
  ["Tanzania", "TZ"],
  ["Thailand", "TH"],
  ["Timor-Leste", "TL"],
  ["Togo", "TG"],
  ["Tonga", "TO"],
  ["Trinidad and Tobago", "TT"],
  ["Tunisia", "TN"],
  ["Turkey", "TR"],
  ["Turkmenistan", "TM"],
  ["Tuvalu", "TV"],
  ["UAE", "AE"],
  ["UK", "GB"],
  ["USA", "US"],
  ["Uganda", "UG"],
  ["Ukraine", "UA"],
  ["Uruguay", "UY"],
  ["Uzbekistan", "UZ"],
  ["Vanuatu", "VU"],
  ["Vatican City", "VA"],
  ["Venezuela", "VE"],
  ["Vietnam", "VN"],
  ["Yemen", "YE"],
  ["Zambia", "ZM"],
  ["Zimbabwe", "ZW"],
];

const COUNTRY_ALIASES = {
  "united states": "US",
  "united states of america": "US",
  "united kingdom": "GB",
  "great britain": "GB",
  "united arab emirates": "AE",
  türkiye: "TR",
  turkiye: "TR",
  "czech republic": "CZ",
  korea: "KR",
  "republic of korea": "KR",
  "cote d'ivoire": "CI",
  "côte d'ivoire": "CI",
  "congo-brazzaville": "CG",
  "republic of the congo": "CG",
  "congo-kinshasa": "CD",
  "democratic republic of the congo": "CD",
  swaziland: "SZ",
  macedonia: "MK",
  "east timor": "TL",
  burma: "MM",
  cypress: "CY",
  hongkong: "HK",
  macao: "MO",
};

const COUNTRY_CODES = Object.fromEntries([
  ...COUNTRIES.map(([name, code]) => [name.toLowerCase(), code]),
  ...Object.entries(COUNTRY_ALIASES),
]);

function isTransitCountry(country) {
  return TRANSIT_COUNTRY_ALIASES.has((country || "").trim().toLowerCase());
}
function canonicalCountry(country) {
  const trimmed = (country || "").trim();
  return isTransitCountry(trimmed) ? TRANSIT_COUNTRY : trimmed;
}

function countryFlag(country) {
  if (!country) return "";
  if (isTransitCountry(country)) return "✈️";
  const code = COUNTRY_CODES[country.trim().toLowerCase()];
  if (!code) return "";
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const COUNTRY_OPTIONS = COUNTRIES.map(([name]) => name);

let state = { people: [], locations: [] };
let fileSnapshot = "";
let colorMap = {}; // "Country||Location" -> hsl string
let selectedPeople = new Set(["B", "M"]);
let currentYear = null; // active/visible year, synced with #YYYY-MM
let currentMonth = null; // 1–12, synced with #YYYY-MM
let yearEnd = YEAR_START;
let scrollObserver = null;
let dragState = null;
let settings = {};

// ---------- utils ----------

function pad2(n) {
  return n < 10 ? "0" + n : "" + n;
}
function isoDate(y, m, d) {
  return `${y}-${pad2(m)}-${pad2(d)}`;
}
function todayIso() {
  const d = new Date();
  return isoDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
}
function realCurrentYear() {
  return new Date().getFullYear();
}
function realCurrentMonth() {
  return new Date().getMonth() + 1;
}
function uid() {
  return "loc-" + Math.random().toString(36).slice(2, 9);
}
function stayComments(location, raw) {
  const comments = (raw || "").trim();
  if (!comments || comments === location) return "";
  return comments;
}
function stayLocationName(loc) {
  if (isTransitCountry(loc.country)) return "Transit";
  return (loc.location || "").trim() || "Untitled";
}
function stayTitle(loc) {
  const name = stayLocationName(loc);
  const comments = (loc.comments || "").trim();
  return comments ? `${name} : ${comments}` : name;
}
function stayPersonMark(loc) {
  const isPerson = loc.person === "B" || loc.person === "M";
  return isPerson ? `👤 ${loc.person}` : "👥";
}
function hashHue(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % 360;
}
function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.add("hidden"), 2200);
}

// ---------- data load / persist ----------

function normalizeLocations(locations) {
  return (locations || [])
    .filter((l) => l && (!l.type || l.type === "stay") && !l.cancelled)
    .map((l) => {
      const location = (l.location || "").trim();
      const country = canonicalCountry(l.country);
      return {
        id: l.id || uid(),
        person: l.person || "B",
        start: l.start,
        end: l.end || l.start,
        location,
        country,
        comments: stayComments(location, l.comments || l.label),
      };
    })
    .filter((l) => l.start && l.end);
}

function applyData(raw) {
  state = {
    people: raw.people && raw.people.length ? raw.people : [],
    locations: normalizeLocations(raw.locations),
  };
}

function canonicalData(data) {
  return JSON.stringify({
    people: (data.people || []).map((p) => ({
      id: p.id,
      name: p.name,
      icon: p.icon,
    })),
    locations: [...(data.locations || [])]
      .map((l) => ({
        id: l.id,
        person: l.person || "B",
        start: l.start,
        end: l.end,
        location: l.location || "",
        country: l.country || "",
        comments: l.comments || "",
      }))
      .sort((a, b) => (a.id || "").localeCompare(b.id || "")),
  });
}

function hasUnsavedChanges() {
  return canonicalData(state) !== fileSnapshot;
}

function exportCalendar() {
  return {
    people: (state.people || []).map((p) => ({
      id: p.id,
      name: p.name,
      icon: p.icon,
    })),
    locations: [...(state.locations || [])]
      .map((l) => ({
        id: l.id,
        person: l.person || "B",
        start: l.start,
        end: l.end,
        location: l.location || "",
        country: l.country || "",
        comments: l.comments || "",
      }))
      .sort((a, b) => a.start.localeCompare(b.start) || (a.id || "").localeCompare(b.id || "")),
  };
}

function bytesToBase64Url(u8) {
  let bin = "";
  const step = 0x8000;
  for (let i = 0; i < u8.length; i += step) {
    bin += String.fromCharCode.apply(null, u8.subarray(i, i + step));
  }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function gzipBytes(bytes) {
  if (typeof CompressionStream !== "function") {
    throw new Error("This browser cannot compress Save payloads.");
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip"));
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}

async function encodeSavePayload(data) {
  const json = JSON.stringify(data);
  const gz = await gzipBytes(new TextEncoder().encode(json));
  return "v1." + bytesToBase64Url(gz);
}

function saveIssueUrl(payload) {
  const body = `<!-- life-calendars-save v1 -->\n\n${payload}\n`;
  return (
    `https://github.com/${GITHUB_REPO}/issues/new?title=` +
    encodeURIComponent(SAVE_ISSUE_TITLE) +
    "&body=" +
    encodeURIComponent(body)
  );
}

let saveWatchTimer = null;

function stopSaveWatch() {
  if (saveWatchTimer) {
    clearTimeout(saveWatchTimer);
    saveWatchTimer = null;
  }
}

function updateUnsavedBanner() {
  const el = document.getElementById("unsaved-banner");
  if (!el) return;
  const dirty = hasUnsavedChanges();
  const pending =
    dirty &&
    settings.pendingSaveCanonical &&
    settings.pendingSaveCanonical === canonicalData(state);
  const text = document.getElementById("unsaved-banner-text");
  if (text) {
    text.textContent = pending
      ? "Waiting for GitHub Pages to publish this save…"
      : "Unsaved changes — not published to GitHub Pages yet.";
  }
  el.classList.toggle("is-pending", !!pending);
  el.classList.toggle("hidden", !dirty);
}

function markCleanFromPublished(canonical) {
  fileSnapshot = canonical;
  if (settings.pendingSaveCanonical) {
    delete settings.pendingSaveCanonical;
    persistSettings();
  }
  stopSaveWatch();
  updateUnsavedBanner();
}

async function publishedMatches(expected) {
  const res = await fetch("./data.json?watch=" + Date.now(), {
    cache: "no-store",
  });
  if (!res.ok) return false;
  const raw = await res.json();
  const published = {
    people: raw.people && raw.people.length ? raw.people : [],
    locations: normalizeLocations(raw.locations),
  };
  return canonicalData(published) === expected;
}

function watchPublishedSave(expected, until) {
  stopSaveWatch();
  const deadline = until || Date.now() + 180000;
  const tick = async () => {
    if (canonicalData(state) !== expected) {
      stopSaveWatch();
      return;
    }
    try {
      if (await publishedMatches(expected)) {
        markCleanFromPublished(expected);
        showToast("Published to GitHub Pages");
        return;
      }
    } catch (e) {
      // keep waiting
    }
    if (Date.now() >= deadline) {
      stopSaveWatch();
      showToast("Save opened on GitHub. This banner clears after Pages updates.");
      return;
    }
    saveWatchTimer = setTimeout(tick, 4000);
  };
  saveWatchTimer = setTimeout(tick, 2500);
}

function resumePendingSaveWatch() {
  const expected = settings.pendingSaveCanonical;
  if (!expected) return;
  if (canonicalData(state) !== expected) {
    delete settings.pendingSaveCanonical;
    persistSettings();
    return;
  }
  if (canonicalData(state) === fileSnapshot) {
    delete settings.pendingSaveCanonical;
    persistSettings();
    updateUnsavedBanner();
    return;
  }
  updateUnsavedBanner();
  watchPublishedSave(expected);
}

async function startGithubSave() {
  if (!hasUnsavedChanges()) {
    showToast("Nothing to save");
    return;
  }
  persist();
  let payload;
  try {
    payload = await encodeSavePayload(exportCalendar());
  } catch (e) {
    showToast(e && e.message ? e.message : "Could not encode save");
    return;
  }
  const url = saveIssueUrl(payload);
  if (url.length > SAVE_URL_MAX) {
    showToast("Save payload is too large for a GitHub issue URL");
    return;
  }
  const expected = canonicalData(state);
  settings.pendingSaveCanonical = expected;
  persistSettings();
  updateUnsavedBanner();
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) {
    showToast("Allow pop-ups to open the GitHub save issue");
  }
  watchPublishedSave(expected);
}

async function loadData() {
  let base = { people: [], locations: [] };
  try {
    const res = await fetch("./data.json", { cache: "no-store" });
    if (res.ok) base = await res.json();
  } catch (e) {
    // ignore; localStorage overlay may still have data
  }

  const fileState = {
    people: base.people && base.people.length ? base.people : [],
    locations: normalizeLocations(base.locations),
  };
  fileSnapshot = canonicalData(fileState);

  const local = localStorage.getItem(STORAGE_KEY);
  if (local) {
    try {
      applyData(JSON.parse(local));
      persist();
      return;
    } catch (e) {
      // corrupted local copy, fall through to base
    }
  }
  applyData(JSON.parse(JSON.stringify(fileState)));
  updateUnsavedBanner();
}

function persist() {
  state.locations = normalizeLocations(state.locations);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateUnsavedBanner();
}

function applyPeopleFilter(ids) {
  const valid = ["B", "M"].filter((p) => ids.includes(p));
  selectedPeople = new Set(valid.length ? valid : ["B", "M"]);
}

function currentPeopleSelection() {
  if (selectedPeople.size === 1 && selectedPeople.has("B")) return "B";
  if (selectedPeople.size === 1 && selectedPeople.has("M")) return "M";
  return "Both";
}

function selectPeople(value) {
  selectedPeople =
    value === "B" || value === "M"
      ? new Set([value])
      : new Set(["B", "M"]);
}

const DEFAULT_TRIP_MID_OPACITY = 32;

function clampTripMidOpacity(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return DEFAULT_TRIP_MID_OPACITY;
  return Math.min(100, Math.max(0, Math.round(v)));
}

function applyTripMidOpacity(n) {
  const v = clampTripMidOpacity(n);
  settings.tripMidOpacity = v;
  document.documentElement.style.setProperty("--trip-mid-mix", v + "%");
  const slider = document.getElementById("s-trip-mid");
  const label = document.getElementById("s-trip-mid-val");
  if (slider && slider.value !== String(v)) slider.value = String(v);
  if (label) label.textContent = v + "%";
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        settings = parsed;
        if (Array.isArray(parsed.people)) applyPeopleFilter(parsed.people);
      }
    }
  } catch (e) {
    // ignore corrupt settings
  }
  applyTripMidOpacity(settings.tripMidOpacity);
  applyLayoutSettings();
}

function persistSettings() {
  settings.people = ["B", "M"].filter((p) => selectedPeople.has(p));
  settings.tripMidOpacity = clampTripMidOpacity(settings.tripMidOpacity);
  const layout = layoutSettings();
  settings.yearChips = layout.yearChips;
  settings.dayNums = layout.dayNums;
  settings.cellH = layout.cellH;
  settings.cellW = layout.cellW;
  settings.chipSize = layout.chipSize;
  settings.tab = document.body.dataset.tab === "spiral" ? "spiral" : "location";
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

const DAY_NUM_VALUES = new Set(["all", "sun", "sat", "none"]);
const SIZE_VALUES = new Set(["normal", "compact"]);

function layoutSettings() {
  return {
    yearChips: settings.yearChips === "hide" ? "hide" : "show",
    dayNums: DAY_NUM_VALUES.has(settings.dayNums) ? settings.dayNums : "all",
    cellH: SIZE_VALUES.has(settings.cellH) ? settings.cellH : "normal",
    cellW: SIZE_VALUES.has(settings.cellW) ? settings.cellW : "normal",
    chipSize: SIZE_VALUES.has(settings.chipSize) ? settings.chipSize : "normal",
  };
}

function syncSeg(id, value) {
  document.querySelectorAll(`#${id} [data-value]`).forEach((btn) => {
    btn.setAttribute(
      "aria-pressed",
      btn.dataset.value === value ? "true" : "false",
    );
  });
}

function applyLayoutSettings() {
  const s = layoutSettings();
  const root = document.documentElement;
  root.dataset.yearChips = s.yearChips;
  root.dataset.dayNums = s.dayNums;
  root.dataset.cellH = s.cellH;
  root.dataset.cellW = s.cellW;
  root.dataset.chipSize = s.chipSize;
  const chips = document.getElementById("s-year-chips");
  if (chips) chips.checked = s.yearChips === "show";
  syncSeg("s-day-nums", s.dayNums);
  syncSeg("s-cell-h", s.cellH);
  syncSeg("s-cell-w", s.cellW);
  syncSeg("s-chip-size", s.chipSize);
  syncStickyOffset();
}

// ---------- color map ----------

function rebuildColorMap() {
  colorMap = {};
  const byCountry = {};
  for (const loc of state.locations) {
    if (!loc.country) continue;
    const l = stayLocationName(loc);
    byCountry[loc.country] = byCountry[loc.country] || new Set();
    byCountry[loc.country].add(l);
  }
  for (const country of Object.keys(byCountry)) {
    const hue =
      COUNTRY_HUES[country] !== undefined
        ? COUNTRY_HUES[country]
        : hashHue(country);
    const locs = Array.from(byCountry[country]).sort();
    locs.forEach((l, i) => {
      const lightness = LIGHTNESS_STEPS[i % LIGHTNESS_STEPS.length];
      colorMap[country + "||" + l] = `hsl(${hue}, 58%, ${lightness}%)`;
    });
  }
}

function stayColor(loc) {
  const key = (loc.country || "") + "||" + stayLocationName(loc);
  return colorMap[key] || "hsl(0, 0%, 55%)";
}

function countryHue(country) {
  const name = canonicalCountry(country);
  return COUNTRY_HUES[name] !== undefined
    ? COUNTRY_HUES[name]
    : hashHue(name);
}

function countryColor(country) {
  return `hsl(${countryHue(country)}, 58%, ${LIGHTNESS_STEPS[0]}%)`;
}

function isoDaysInclusive(start, end) {
  const a = Date.parse(start + "T00:00:00");
  const b = Date.parse(end + "T00:00:00");
  return Math.round((b - a) / 86400000) + 1;
}

function mergeIntervalDays(intervals) {
  intervals.sort((a, b) => a[0].localeCompare(b[0]));
  let days = 0;
  let curS = null;
  let curE = null;
  for (const [s, e] of intervals) {
    if (curS === null) {
      curS = s;
      curE = e;
    } else if (s <= curE) {
      if (e > curE) curE = e;
    } else {
      days += isoDaysInclusive(curS, curE);
      curS = s;
      curE = e;
    }
  }
  if (curS !== null) days += isoDaysInclusive(curS, curE);
  return days;
}

function clippedIntervals(locations, rangeStart, rangeEnd, country) {
  const intervals = [];
  for (const loc of locations) {
    if (country && loc.country !== country) continue;
    if (!overlapsRange(loc, rangeStart, rangeEnd)) continue;
    const s = loc.start < rangeStart ? rangeStart : loc.start;
    const e = loc.end > rangeEnd ? rangeEnd : loc.end;
    if (s <= e) intervals.push([s, e]);
  }
  return intervals;
}

function countStayDays(locations, country, rangeStart, rangeEnd) {
  return mergeIntervalDays(
    clippedIntervals(locations, rangeStart, rangeEnd, country),
  );
}

function countMissingDays(locations, year) {
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;
  const covered = mergeIntervalDays(clippedIntervals(locations, start, end));
  return isoDaysInclusive(start, end) - covered;
}

function countMovesInYear(locations, year) {
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;
  return locations.filter(
    (l) =>
      !isTransitCountry(l.country) && l.start >= start && l.start <= end
  ).length;
}

function countryStatsInRange(locations, start, end) {
  const firstSeen = {};
  for (const loc of locations) {
    if (!loc.country) continue;
    if (!overlapsRange(loc, start, end)) continue;
    if (
      firstSeen[loc.country] === undefined ||
      loc.start < firstSeen[loc.country]
    ) {
      firstSeen[loc.country] = loc.start;
    }
  }
  return Object.keys(firstSeen)
    .map((country) => ({
      country,
      flag: countryFlag(country),
      color: countryColor(country),
      days: countStayDays(locations, country, start, end),
    }))
    .sort((a, b) => b.days - a.days || a.country.localeCompare(b.country));
}

function buildYearDonut(stats) {
  const slices = stats.filter((s) => s.days > 0);
  const total = slices.reduce((n, s) => n + s.days, 0);
  if (!slices.length || total <= 0) return null;

  let acc = 0;
  const stops = slices.map((s, i) => {
    const start = acc;
    acc += (s.days / total) * 100;
    const end = i === slices.length - 1 ? 100 : acc;
    return `${s.color} ${start}% ${end}%`;
  });

  const pctLabel = (days) => {
    const pct = (days / total) * 100;
    if (pct > 0 && pct < 1) return "<1%";
    return `${Math.round(pct)}%`;
  };

  const el = document.createElement("span");
  el.className = "year-donut";
  el.style.background = `conic-gradient(${stops.join(", ")})`;
  el.setAttribute("role", "img");
  el.setAttribute(
    "aria-label",
    slices.map((s) => `${s.country} ${pctLabel(s.days)}`).join(", "),
  );
  el.title = slices
    .map((s) => `${s.country} ${pctLabel(s.days)} (${s.days}d)`)
    .join("\n");
  return el;
}

function staysForCountryInRange(locations, country, rangeStart, rangeEnd) {
  return locations
    .filter(
      (l) => l.country === country && overlapsRange(l, rangeStart, rangeEnd),
    )
    .sort(
      (a, b) =>
        a.start.localeCompare(b.start) ||
        (a.location || "").localeCompare(b.location || ""),
    )
    .map((l) => ({
      location: l.location || country,
      start: l.start < rangeStart ? rangeStart : l.start,
      end: l.end > rangeEnd ? rangeEnd : l.end,
    }));
}

function groupStaysByLocation(stays) {
  const byName = new Map();
  for (const stay of stays) {
    const key = stay.location || "";
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key).push(stay);
  }
  return Array.from(byName.entries())
    .map(([, ranges]) => {
      ranges.sort((a, b) => a.start.localeCompare(b.start));
      return {
        location: stayLocationName(ranges[0]),
        ranges,
        days: mergeIntervalDays(ranges.map((r) => [r.start, r.end])),
      };
    })
    .sort(
      (a, b) => b.days - a.days || a.location.localeCompare(b.location),
    );
}

function formatDayNoYear(iso) {
  const parts = (iso || "").split("-");
  if (parts.length < 3) return iso;
  const month = MONTH_SHORT[parseInt(parts[1], 10) - 1] || parts[1];
  return `${month} ${parseInt(parts[2], 10)}`;
}

function formatStayRange(start, end) {
  if (start === end) return formatDayNoYear(start);
  return `${formatDayNoYear(start)} → ${formatDayNoYear(end)}`;
}

// ---------- filtering ----------

function filteredLocations() {
  return state.locations.filter((l) =>
    l.person === "Both"
      ? selectedPeople.size > 0
      : selectedPeople.has(l.person),
  );
}

function locationsForDate(locations, dateStr) {
  return locations.filter((l) => l.start <= dateStr && dateStr <= l.end);
}

function overlapsRange(loc, start, end) {
  return loc.start <= end && loc.end >= start;
}

// Unique stay locations overlapping [start, end], in first-appearance order.
function uniqueStaysInRange(locations, start, end) {
  const firstSeen = {};
  for (const loc of locations) {
    if (!isTransitCountry(loc.country) && !loc.location) continue;
    if (!overlapsRange(loc, start, end)) continue;
    const key = (loc.country || "") + "||" + stayLocationName(loc);
    if (firstSeen[key] === undefined || loc.start < firstSeen[key].start) {
      firstSeen[key] = { loc, start: loc.start };
    }
  }
  return Object.values(firstSeen)
    .sort(
      (a, b) =>
        a.start.localeCompare(b.start) ||
        stayLocationName(a.loc).localeCompare(stayLocationName(b.loc)),
    )
    .map((x) => x.loc);
}


function setActiveTab(tab, opts = {}) {
  const next = tab === "spiral" ? "spiral" : "location";
  const prev = document.body.dataset.tab || "location";
  if (prev === next && !opts.force) {
    if (next === "spiral") startSpiral();
    return;
  }
  if (prev === "location" && next === "spiral")
    spiral.savedScrollY = window.scrollY;
  document.body.dataset.tab = next;
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === next);
    btn.setAttribute("aria-selected", btn.dataset.tab === next ? "true" : "false");
  });
  if (next === "spiral") {
    if (!opts.skipHash) {
      const url = location.pathname + location.search + "#spiral";
      if (location.hash !== "#spiral") history.replaceState(null, "", url);
    }
    startSpiral();
  } else {
    stopSpiral();
    if (!opts.skipHash) {
      const y = currentYear || realCurrentYear();
      const m = currentMonth || realCurrentMonth();
      const hash = `#${y}-${pad2(m)}`;
      const url = location.pathname + location.search + hash;
      if (location.hash !== hash) history.replaceState(null, "", url);
    }
    requestAnimationFrame(() => {
      if (spiral.savedScrollY > 40) {
        window.scrollTo({ top: spiral.savedScrollY, behavior: "auto" });
      } else {
        scrollToMonth(realCurrentYear(), realCurrentMonth(), { smooth: false });
      }
      syncStickyOffset();
    });
  }
  syncStickyOffset();
  if (opts.persist !== false) persistSettings();
}

function startSpiral() {
  resizeSpiralCanvas();
  if (!spiral.faces.length) rebuildSpiral();
  spiral.running = true;
  spiral.dirty = true;
  if (!spiral.raf) spiral.raf = requestAnimationFrame(spiralLoop);
}

function stopSpiral() {
  spiral.running = false;
  if (spiral.raf) cancelAnimationFrame(spiral.raf);
  spiral.raf = 0;
  syncSpiralHud(null);
}

function setupTabs() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => setActiveTab(btn.dataset.tab));
  });
}

