/* Life Calendars — Location Calendar
 * No backend. Data lives in data.json (source of truth for PRs), with a
 * localStorage overlay for in-browser edits.
 */

const STORAGE_KEY = "life-calendar-data-v1";
const SETTINGS_KEY = "life-calendar-settings-v1";
const YEAR_START = 2009;

// Where "Copy JSON" points people to open a PR from.
const GITHUB_REPO = "bigomega/life-calendars";
const GITHUB_EDIT_BRANCH = "gh-pages";

const COUNTRY_HUES = {
  India: 14,
  USA: 214,
  Mexico: 145,
  UAE: 42,
  Georgia: 271,
  Turkey: 187,
  Kazakhstan: 328,
};
const LIGHTNESS_STEPS = [42, 56, 34, 66, 48, 60, 38, 70];

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

function countryFlag(country) {
  if (!country) return "";
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
let currentYear = null; // active/visible year, synced with #hash
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
function uid() {
  return "loc-" + Math.random().toString(36).slice(2, 9);
}
function stayComments(location, raw) {
  const comments = (raw || "").trim();
  if (!comments || comments === location) return "";
  return comments;
}
function stayTitle(loc) {
  const name = (loc.location || "").trim() || "Untitled";
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
      const country = (l.country || "").trim();
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

function updateUnsavedBanner() {
  const el = document.getElementById("unsaved-banner");
  if (!el) return;
  el.classList.toggle("hidden", !hasUnsavedChanges());
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateUnsavedBanner();
}

function applyPeopleFilter(ids) {
  const valid = ["B", "M"].filter((p) => ids.includes(p));
  selectedPeople = new Set(valid);
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
}

function persistSettings() {
  settings.people = ["B", "M"].filter((p) => selectedPeople.has(p));
  settings.tripMidOpacity = clampTripMidOpacity(settings.tripMidOpacity);
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// ---------- color map ----------

function rebuildColorMap() {
  colorMap = {};
  const byCountry = {};
  for (const loc of state.locations) {
    if (!loc.country) continue;
    const l = loc.location || "Unknown";
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
  const key = (loc.country || "") + "||" + (loc.location || "");
  return colorMap[key] || "hsl(0, 0%, 55%)";
}

function countryHue(country) {
  return COUNTRY_HUES[country] !== undefined
    ? COUNTRY_HUES[country]
    : hashHue(country);
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
    .map(([location, ranges]) => {
      ranges.sort((a, b) => a.start.localeCompare(b.start));
      return {
        location,
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
    if (!loc.location) continue;
    if (!overlapsRange(loc, start, end)) continue;
    const key = (loc.country || "") + "||" + loc.location;
    if (firstSeen[key] === undefined || loc.start < firstSeen[key].start) {
      firstSeen[key] = { loc, start: loc.start };
    }
  }
  return Object.values(firstSeen)
    .sort(
      (a, b) =>
        a.start.localeCompare(b.start) ||
        a.loc.location.localeCompare(b.loc.location),
    )
    .map((x) => x.loc);
}

// ---------- rendering: legend ----------

function renderLegend(locations) {
  const panel = document.getElementById("legend-panel");
  panel.innerHTML = "";

  const byCountry = {};
  for (const loc of locations) {
    if (!loc.country) continue;
    const l = loc.location || "Unknown";
    byCountry[loc.country] = byCountry[loc.country] || new Set();
    byCountry[loc.country].add(l);
  }

  const countries = Object.keys(byCountry).sort();
  for (const country of countries) {
    const group = document.createElement("div");
    group.className = "legend-group";
    const title = document.createElement("div");
    title.className = "country-name";
    title.textContent = `${countryFlag(country)} ${country}`.trim();
    group.appendChild(title);

    Array.from(byCountry[country])
      .sort()
      .forEach((l) => {
        const item = document.createElement("div");
        item.className = "legend-item";
        const sw = document.createElement("span");
        sw.className = "legend-swatch";
        sw.style.background = colorMap[country + "||" + l] || "#888";
        item.appendChild(sw);
        const lbl = document.createElement("span");
        lbl.textContent = l;
        item.appendChild(lbl);
        group.appendChild(item);
      });
    panel.appendChild(group);
  }
}

// ---------- rendering: calendar (all years, one long scroll) ----------

function computeYearEnd(locations) {
  const nowY = realCurrentYear();
  const dataYears = locations
    .map((l) => parseInt(l.start.slice(0, 4), 10))
    .filter((y) => !Number.isNaN(y));
  const maxDataYear = dataYears.length ? Math.max(...dataYears) : nowY;
  return Math.max(nowY, maxDataYear) + 2;
}

function buildMonthCard(year, month, locations) {
  const today = todayIso();
  const card = document.createElement("div");
  card.className = "month-card";
  const ym = `${year}-${pad2(month)}`;
  if (ym === today.slice(0, 7)) {
    card.classList.add("current-month");
  } else if (ym > today.slice(0, 7)) {
    card.classList.add("future-month");
  }

  const header = document.createElement("div");
  header.className = "month-header";

  const h3 = document.createElement("h3");
  h3.textContent = `${MONTH_NAMES[month - 1]} ${year}`;
  header.appendChild(h3);

  const monthStart = isoDate(year, month, 1);
  const monthEnd = isoDate(year, month, new Date(year, month, 0).getDate());
  const monthStays = uniqueStaysInRange(locations, monthStart, monthEnd);
  if (monthStays.length) {
    const legend = document.createElement("div");
    legend.className = "month-legend";
    monthStays.forEach((loc) => {
      const item = document.createElement("span");
      item.className = "month-legend-item";
      item.title = loc.country
        ? `${loc.location}, ${loc.country}`
        : loc.location;
      const sw = document.createElement("span");
      sw.className = "legend-swatch";
      sw.style.background = stayColor(loc);
      item.appendChild(sw);
      const lbl = document.createElement("span");
      lbl.textContent = loc.location;
      item.appendChild(lbl);
      legend.appendChild(item);
    });
    header.appendChild(legend);
  }
  card.appendChild(header);

  const weekdayRow = document.createElement("div");
  weekdayRow.className = "weekday-row";
  WEEKDAYS.forEach((w) => {
    const s = document.createElement("span");
    s.textContent = w;
    weekdayRow.appendChild(s);
  });
  card.appendChild(weekdayRow);

  const dayGrid = document.createElement("div");
  dayGrid.className = "day-grid";

  const firstDow = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let i = 0; i < firstDow; i++) {
    const empty = document.createElement("div");
    empty.className = "day-cell empty";
    dayGrid.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = isoDate(year, month, d);
    const dayLocations = locationsForDate(locations, dateStr);

    const cell = document.createElement("div");
    cell.className = "day-cell";
    cell.dataset.date = dateStr;
    if (dateStr === today) cell.classList.add("today");
    if (dayLocations.length) cell.classList.add("has-locations");

    if (dayLocations.length) {
      const tripStart = dayLocations.find((l) => l.start === dateStr);
      cell.style.setProperty("--stay-bg", stayColor(dayLocations[0]));
      cell.style.color = "#111";
      if (!tripStart) cell.classList.add("trip-mid");
      const flag = tripStart ? countryFlag(tripStart.country) : "";
      if (flag) {
        cell.classList.add("trip-start");
        const flagBg = document.createElement("span");
        flagBg.className = "flag-bg";
        flagBg.textContent = flag;
        flagBg.setAttribute("aria-hidden", "true");
        cell.appendChild(flagBg);
      }
      if (tripStart) {
        cell.dataset.tripStartId = tripStart.id;
        const days = document.createElement("span");
        days.className = "trip-days";
        days.textContent = `${isoDaysInclusive(tripStart.start, tripStart.end)}d`;
        cell.appendChild(days);
      }
      const tripEnd = dayLocations.find((l) => l.end === dateStr);
      if (tripEnd) cell.dataset.tripEndId = tripEnd.id;
    }

    const num = document.createElement("span");
    num.className = "num";
    num.textContent = d;
    cell.appendChild(num);

    if (dayLocations.length > 1) {
      const strip = document.createElement("div");
      strip.className = "stack-strip";
      dayLocations.slice(1, 4).forEach((l) => {
        const seg = document.createElement("span");
        seg.style.background = stayColor(l);
        strip.appendChild(seg);
      });
      cell.appendChild(strip);
    }

    if (dayLocations.length) {
      const titleParts = dayLocations.map((l) => {
        const range = l.start === l.end ? l.start : `${l.start} → ${l.end}`;
        return `${stayTitle(l)} [${range}]`;
      });
      cell.title = titleParts.join("\n");
    }

    dayGrid.appendChild(cell);
  }

  card.appendChild(dayGrid);
  return card;
}

function renderYears(locations) {
  const container = document.getElementById("years-container");
  container.innerHTML = "";
  yearEnd = computeYearEnd(locations);

  for (let y = YEAR_START; y <= yearEnd; y++) {
    const section = document.createElement("section");
    section.className = "year-section";
    section.id = "y" + y;
    section.dataset.year = String(y);

    const title = document.createElement("h2");
    title.className = "year-title";
    const missing = countMissingDays(locations, y);
    if (missing === 0) {
      const check = document.createElement("span");
      check.className = "year-complete";
      check.textContent = "✅";
      check.setAttribute("aria-hidden", "true");
      title.appendChild(check);
    }
    const yearLabel = document.createElement("span");
    yearLabel.textContent = String(y);
    title.appendChild(yearLabel);

    if (y === realCurrentYear()) {
      const remaining = Math.max(0, isoDaysInclusive(todayIso(), `${y}-12-31`));
      const go = document.createElement("span");
      go.className = "year-days-to-go";
      go.textContent = `${remaining} day${remaining === 1 ? "" : "s"} to go`;
      title.appendChild(go);
    }

    const stats = countryStatsInRange(locations, `${y}-01-01`, `${y}-12-31`);
    if (stats.length) {
      const row = document.createElement("span");
      row.className = "year-countries";
      stats.forEach((s) => {
        const el = document.createElement("span");
        el.className = "year-country";
        el.style.borderColor = s.color;
        el.setAttribute("role", "button");
        el.tabIndex = 0;
        el.setAttribute("aria-label", s.country);
        if (s.flag) {
          const flag = document.createElement("span");
          flag.className = "year-flag";
          flag.textContent = s.flag;
          el.appendChild(flag);
        }
        const days = document.createElement("span");
        days.className = "year-country-days";
        days.textContent = String(s.days);
        el.appendChild(days);
        const openTip = (e) => {
          if (e.button !== undefined && e.button !== 0) return;
          e.preventDefault();
          e.stopPropagation();
          openCountryTooltip(el, s, y, locations);
        };
        el.addEventListener("pointerdown", openTip);
        el.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") openTip(e);
        });
        row.appendChild(el);
      });
      title.appendChild(row);
      if (missing > 0) {
        const miss = document.createElement("span");
        miss.className = "year-missing";
        miss.textContent = `Missing ${missing} day${missing === 1 ? "" : "s"}`;
        title.appendChild(miss);
      }
    }
    section.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "months-grid";
    for (let m = 1; m <= 12; m++)
      grid.appendChild(buildMonthCard(y, m, locations));
    section.appendChild(grid);

    container.appendChild(section);
  }
}

function renderAll(opts = {}) {
  closeCountryTooltip();
  rebuildColorMap();
  const locations = filteredLocations();
  const savedScroll = opts.year === undefined ? window.scrollY : null;
  renderLegend(locations);
  renderYears(locations);
  populateYearJump();
  setupScrollSpy();
  if (opts.year !== undefined) {
    scrollToYear(opts.year, { smooth: false });
    return;
  }
  window.scrollTo({ top: savedScroll, behavior: "auto" });
}

// ---------- year navigation / scroll-spy ----------

function clampYear(y) {
  return Math.min(Math.max(y, YEAR_START), yearEnd);
}

function stickyHeaderHeight() {
  const el = document.querySelector(".sticky-top");
  return el ? el.offsetHeight : 0;
}

function syncStickyOffset() {
  document.documentElement.style.setProperty(
    "--sticky-header-height",
    stickyHeaderHeight() + "px",
  );
}

function setupStickyOffset() {
  const el = document.querySelector(".sticky-top");
  if (!el || setupStickyOffset._ro) return;
  setupStickyOffset._ro = new ResizeObserver(() => {
    syncStickyOffset();
    if (document.querySelector(".year-section")) setupScrollSpy();
  });
  setupStickyOffset._ro.observe(el);
  syncStickyOffset();
}

// Scrolls so the year's title lands just below the sticky header — plain
// scrollIntoView({block:"start"}) would put the section's top at viewport
// y=0, leaving its first row of days hidden (and unclickable) under the
// sticky header.
function scrollToYear(year, { smooth = false } = {}) {
  const y = clampYear(year);
  const el = document.getElementById("y" + y);
  if (!el) return;
  const top =
    el.getBoundingClientRect().top + window.scrollY - stickyHeaderHeight() - 8;
  window.scrollTo({
    top: Math.max(0, top),
    behavior: smooth ? "smooth" : "auto",
  });
  setCurrentYear(y);
}

function setCurrentYear(y) {
  currentYear = y;
  const sel = document.getElementById("year-select");
  if (sel && sel.value !== String(y)) sel.value = String(y);
  history.replaceState(null, "", "#" + y);
}

function setupScrollSpy() {
  if (scrollObserver) scrollObserver.disconnect();
  const sections = Array.from(document.querySelectorAll(".year-section"));

  // Trigger band must line up with where scrollToYear() actually lands a
  // section's top (stickyHeaderHeight + 8px) — a generic percentage-based
  // band can straddle the boundary between two years and misattribute the
  // "current" year to the one above, which then gets written to the URL
  // hash and compounds by one year on every reload.
  const offset = stickyHeaderHeight();
  const bandTop = offset + 4;
  const bandBottom = offset + 12;
  const marginBottom = Math.max(0, window.innerHeight - bandBottom);

  scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setCurrentYear(parseInt(entry.target.dataset.year, 10));
        }
      });
    },
    { rootMargin: `-${bandTop}px 0px -${marginBottom}px 0px`, threshold: 0 },
  );
  sections.forEach((s) => scrollObserver.observe(s));
}

function populateYearJump() {
  const sel = document.getElementById("year-select");
  const prevVal = sel.value;
  sel.innerHTML = "";
  for (let y = YEAR_START; y <= yearEnd; y++) {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    sel.appendChild(opt);
  }
  if (prevVal) sel.value = prevVal;
}

function parseHashYear() {
  const m = location.hash.match(/^#(\d{4})$/);
  return m ? parseInt(m[1], 10) : null;
}

function goToToday() {
  const cell = document.querySelector(".day-cell.today");
  if (cell) {
    // Center the cell within the space below the sticky header, not the
    // full viewport, so it doesn't land underneath it.
    const offset = stickyHeaderHeight();
    const rect = cell.getBoundingClientRect();
    const desiredCenter = offset + (window.innerHeight - offset) / 2;
    const currentCenter = rect.top + rect.height / 2;
    window.scrollTo({
      top: window.scrollY + (currentCenter - desiredCenter),
      behavior: "smooth",
    });
    cell.classList.add("flash");
    setTimeout(() => cell.classList.remove("flash"), 1200);
  } else {
    scrollToYear(realCurrentYear(), { smooth: true });
  }
}

// ---------- year-country tooltip ----------

let countryTooltipAnchor = null;

function closeCountryTooltip() {
  countryTooltipAnchor = null;
  const tip = document.getElementById("country-tooltip");
  if (tip) tip.classList.add("hidden");
}

function openCountryTooltip(el, stat, year, locations) {
  closeDayPopover();
  const tip = document.getElementById("country-tooltip");
  if (countryTooltipAnchor === el && !tip.classList.contains("hidden")) {
    closeCountryTooltip();
    return;
  }

  countryTooltipAnchor = el;
  const rangeStart = `${year}-01-01`;
  const rangeEnd = `${year}-12-31`;
  const stays = staysForCountryInRange(
    locations,
    stat.country,
    rangeStart,
    rangeEnd,
  );

  tip.innerHTML = "";
  tip.style.borderColor = stat.color;
  const title = document.createElement("div");
  title.className = "tt-title";
  title.style.background = stat.color;
  title.textContent = `${stat.flag ? stat.flag + " " : ""}${stat.country}`;
  tip.appendChild(title);

  if (!stays.length) {
    const empty = document.createElement("div");
    empty.className = "tt-range";
    empty.textContent = "No stays this year";
    tip.appendChild(empty);
  } else {
    groupStaysByLocation(stays).forEach((group) => {
      const wrap = document.createElement("div");
      wrap.className = "tt-group";
      const head = document.createElement("div");
      head.className = "tt-loc";
      head.append(group.location, " ");
      const count = document.createElement("span");
      count.className = "tt-count";
      count.textContent = `(${group.days})`;
      head.appendChild(count);
      wrap.appendChild(head);
      group.ranges.forEach((stay) => {
        const dates = document.createElement("div");
        dates.className = "tt-dates";
        dates.textContent = formatStayRange(stay.start, stay.end);
        wrap.appendChild(dates);
      });
      tip.appendChild(wrap);
    });
  }

  tip.classList.remove("hidden");
  const chip = el.getBoundingClientRect();
  const rect = tip.getBoundingClientRect();
  let x = chip.left;
  let y = chip.bottom + 6;
  if (x + rect.width > window.innerWidth - 8)
    x = Math.max(8, window.innerWidth - rect.width - 8);
  if (y + rect.height > window.innerHeight - 8)
    y = Math.max(8, chip.top - rect.height - 6);
  tip.style.left = x + "px";
  tip.style.top = y + "px";
}

// ---------- day popover ----------

function closeDayPopover() {
  document.getElementById("day-popover").classList.add("hidden");
}

function openDayPopover(clickEvent, dayLocations) {
  clickEvent.stopPropagation();
  const pop = document.getElementById("day-popover");
  pop.innerHTML = "";

  const header = document.createElement("div");
  header.className = "pop-header";
  header.innerHTML = `<span>${dayLocations.length} location${dayLocations.length > 1 ? "s" : ""}</span>`;
  pop.appendChild(header);

  dayLocations.forEach((loc) => {
    const row = document.createElement("div");
    row.className = "pop-event";
    const sw = document.createElement("span");
    sw.className = "sw";
    sw.style.background = stayColor(loc);
    row.appendChild(sw);
    const lbl = document.createElement("span");
    lbl.className = "lbl";
    lbl.textContent = stayTitle(loc);
    row.appendChild(lbl);
    const who = document.createElement("span");
    who.className = "who";
    who.textContent = stayPersonMark(loc);
    row.appendChild(who);
    row.addEventListener("click", () => {
      closeDayPopover();
      openLocationModal(loc);
    });
    pop.appendChild(row);
  });

  pop.classList.remove("hidden");
  const rect = pop.getBoundingClientRect();
  let x = clickEvent.clientX + 8;
  let y = clickEvent.clientY + 8;
  if (x + rect.width > window.innerWidth)
    x = window.innerWidth - rect.width - 8;
  if (y + rect.height > window.innerHeight)
    y = window.innerHeight - rect.height - 8;
  pop.style.left = x + "px";
  pop.style.top = y + "px";
}

// Close on the next pointerdown outside the popover, not on "click" — the
// pointerup that opens the popover is immediately followed by a synthetic
// "click" event on the same target, which would otherwise close it again.
document.addEventListener("pointerdown", (e) => {
  const pop = document.getElementById("day-popover");
  if (!pop.classList.contains("hidden") && !pop.contains(e.target))
    closeDayPopover();

  const tip = document.getElementById("country-tooltip");
  if (tip.classList.contains("hidden")) return;
  if (tip.contains(e.target) || e.target.closest(".year-country")) return;
  closeCountryTooltip();
});

window.addEventListener("scroll", closeCountryTooltip, true);

// ---------- click / click-and-drag to add a location ----------

function highlightRange(a, b) {
  clearHighlight();
  const lo = a < b ? a : b;
  const hi = a < b ? b : a;
  document
    .querySelectorAll("#years-container .day-cell[data-date]")
    .forEach((c) => {
      if (c.dataset.date >= lo && c.dataset.date <= hi)
        c.classList.add("selecting");
    });
}

function clearHighlight() {
  document
    .querySelectorAll("#years-container .day-cell.selecting")
    .forEach((c) => c.classList.remove("selecting"));
}

function cellAtPoint(x, y) {
  const el = document.elementFromPoint(x, y);
  return el && el.closest ? el.closest(".day-cell[data-date]") : null;
}

const RESIZE_EDGE_PX = 5;
let resizeHoverCell = null;

function tripEdgeAt(cell, clientX) {
  if (!cell) return null;
  const rect = cell.getBoundingClientRect();
  const startId = cell.dataset.tripStartId;
  const endId = cell.dataset.tripEndId;
  if (startId && clientX - rect.left <= RESIZE_EDGE_PX)
    return { edge: "start", id: startId };
  if (endId && rect.right - clientX <= RESIZE_EDGE_PX)
    return { edge: "end", id: endId };
  return null;
}

function setResizeHover(cell, on) {
  if (resizeHoverCell && resizeHoverCell !== cell)
    resizeHoverCell.classList.remove("resize-edge");
  resizeHoverCell = on && cell ? cell : null;
  if (cell) cell.classList.toggle("resize-edge", !!on);
}

function applyTripResize(resize) {
  const loc = state.locations.find((l) => l.id === resize.id);
  if (!loc) return false;
  const start = resize.edge === "start" ? resize.liveDate : loc.start;
  const end = resize.edge === "end" ? resize.liveDate : loc.end;
  if (start > end || (start === loc.start && end === loc.end)) return false;
  loc.start = start;
  loc.end = end;
  persist();
  renderAll();
  showToast("Location updated");
  return true;
}

function setupDragToAdd() {
  const container = document.getElementById("years-container");

  container.addEventListener("pointerdown", (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    const cell = e.target.closest(".day-cell[data-date]");
    if (!cell) return;
    const hit = tripEdgeAt(cell, e.clientX);
    if (hit) {
      const loc = state.locations.find((l) => l.id === hit.id);
      if (!loc) return;
      dragState = {
        mode: "resize",
        edge: hit.edge,
        id: loc.id,
        liveDate: hit.edge === "start" ? loc.start : loc.end,
        anchorDate: hit.edge === "start" ? loc.end : loc.start,
        clickDate: cell.dataset.date,
        moved: false,
      };
      highlightRange(loc.start, loc.end);
      document.body.classList.add("resizing-trip");
      if (container.setPointerCapture) container.setPointerCapture(e.pointerId);
      e.preventDefault();
      return;
    }
    dragState = {
      mode: "add",
      startDate: cell.dataset.date,
      endDate: cell.dataset.date,
      moved: false,
    };
    highlightRange(dragState.startDate, dragState.endDate);
    if (container.setPointerCapture) container.setPointerCapture(e.pointerId);
  });

  window.addEventListener("pointermove", (e) => {
    if (!dragState) {
      const cell = cellAtPoint(e.clientX, e.clientY);
      setResizeHover(cell, cell && tripEdgeAt(cell, e.clientX));
      return;
    }
    const cell = cellAtPoint(e.clientX, e.clientY);
    if (!cell) return;
    if (dragState.mode === "resize") {
      let live = cell.dataset.date;
      if (dragState.edge === "start" && live > dragState.anchorDate)
        live = dragState.anchorDate;
      if (dragState.edge === "end" && live < dragState.anchorDate)
        live = dragState.anchorDate;
      if (live !== dragState.liveDate) {
        dragState.liveDate = live;
        dragState.moved = true;
        const start = dragState.edge === "start" ? live : dragState.anchorDate;
        const end = dragState.edge === "end" ? live : dragState.anchorDate;
        highlightRange(start, end);
      }
      return;
    }
    if (cell.dataset.date !== dragState.endDate) {
      dragState.endDate = cell.dataset.date;
      dragState.moved = true;
      highlightRange(dragState.startDate, dragState.endDate);
    }
  });

  window.addEventListener("pointerup", (e) => {
    if (!dragState) return;
    const current = dragState;
    clearHighlight();
    document.body.classList.remove("resizing-trip");
    dragState = null;
    setResizeHover(null, false);

    if (current.mode === "resize") {
      if (current.moved) applyTripResize(current);
      else {
        const dayLocations = locationsForDate(
          filteredLocations(),
          current.clickDate,
        );
        if (dayLocations.length) openDayPopover(e, dayLocations);
      }
      return;
    }

    const { startDate, endDate, moved } = current;
    const lo = startDate < endDate ? startDate : endDate;
    const hi = startDate < endDate ? endDate : startDate;
    if (!moved) {
      const dayLocations = locationsForDate(filteredLocations(), startDate);
      if (dayLocations.length) openDayPopover(e, dayLocations);
      else openLocationModal(null, startDate, startDate);
    } else {
      openLocationModal(null, lo, hi);
    }
  });
}

// ---------- add/edit location modal ----------

function populateCountrySelect(selected) {
  const sel = document.getElementById("f-country");
  const names = new Set(COUNTRY_OPTIONS);
  if (selected) names.add(selected);
  const sorted = Array.from(names).sort((a, b) => a.localeCompare(b));
  sel.innerHTML = '<option value="">Select country</option>';
  sorted.forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    const flag = countryFlag(name);
    // Name first so native typeahead matches "India", not the flag code points.
    opt.textContent = flag ? `${name} ${flag}` : name;
    sel.appendChild(opt);
  });
  sel.value = selected || "";
  updateLocationModalFlag();
}

function pastLocations() {
  const byName = new Map();
  state.locations.forEach((l) => {
    const name = (l.location || "").trim();
    if (!name) return;
    const prev = byName.get(name.toLowerCase());
    if (!prev || l.start > prev.start) {
      byName.set(name.toLowerCase(), {
        name,
        country: l.country || "",
        start: l.start,
      });
    }
  });
  return Array.from(byName.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

function countryForLocationName(name) {
  const key = (name || "").trim().toLowerCase();
  if (!key) return "";
  const match = pastLocations().find((l) => l.name.toLowerCase() === key);
  return match ? match.country : "";
}

function applyCountryFromLocation() {
  const country = countryForLocationName(
    document.getElementById("f-location").value,
  );
  if (country) populateCountrySelect(country);
}

let locationComboIndex = -1;

function locationSuggestionOptions() {
  return [
    ...document.querySelectorAll("#location-suggestions li[role='option']"),
  ];
}

function chooseLocationSuggestion(item) {
  document.getElementById("f-location").value = item.name;
  if (item.country) populateCountrySelect(item.country);
  closeLocationSuggestions();
}

function highlightLocationSuggestion(index) {
  const options = locationSuggestionOptions();
  if (!options.length) {
    locationComboIndex = -1;
    return;
  }
  locationComboIndex =
    ((index % options.length) + options.length) % options.length;
  options.forEach((li, i) => {
    li.setAttribute(
      "aria-selected",
      i === locationComboIndex ? "true" : "false",
    );
    if (i === locationComboIndex) li.scrollIntoView({ block: "nearest" });
  });
}

function closeLocationSuggestions() {
  locationComboIndex = -1;
  const list = document.getElementById("location-suggestions");
  if (list) list.classList.add("hidden");
}

function renderLocationSuggestions(query) {
  const list = document.getElementById("location-suggestions");
  const q = (query || "").trim().toLowerCase();
  const items = pastLocations().filter(
    (l) => !q || l.name.toLowerCase().includes(q),
  );
  list.innerHTML = "";
  locationComboIndex = -1;
  if (!items.length) {
    const empty = document.createElement("li");
    empty.className = "combo-empty";
    empty.textContent = q
      ? "No matching past locations"
      : "No past locations yet";
    list.appendChild(empty);
  } else {
    items.forEach((item) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", "false");
      li.textContent = item.name;
      li.addEventListener("mousedown", (e) => {
        e.preventDefault();
        chooseLocationSuggestion(item);
      });
      list.appendChild(li);
    });
  }
  list.classList.remove("hidden");
}

function setupLocationCombo() {
  const input = document.getElementById("f-location");
  const toggle = document.getElementById("f-location-toggle");
  input.addEventListener("focus", () => renderLocationSuggestions(input.value));
  input.addEventListener("input", () => {
    renderLocationSuggestions(input.value);
    applyCountryFromLocation();
  });
  input.addEventListener("keydown", (e) => {
    const list = document.getElementById("location-suggestions");
    const open = list && !list.classList.contains("hidden");
    const options = locationSuggestionOptions();

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) renderLocationSuggestions(input.value);
      highlightLocationSuggestion(locationComboIndex + 1);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) renderLocationSuggestions(input.value);
      highlightLocationSuggestion(
        locationComboIndex < 0
          ? locationSuggestionOptions().length - 1
          : locationComboIndex - 1,
      );
      return;
    }
    if (
      e.key === "Enter" &&
      open &&
      locationComboIndex >= 0 &&
      options[locationComboIndex]
    ) {
      e.preventDefault();
      options[locationComboIndex].dispatchEvent(
        new MouseEvent("mousedown", { bubbles: true }),
      );
      return;
    }
    if (e.key === "Escape" && open) {
      e.preventDefault();
      e.stopPropagation();
      closeLocationSuggestions();
    }
  });
  input.addEventListener("blur", () => {
    setTimeout(closeLocationSuggestions, 120);
  });
  toggle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    const list = document.getElementById("location-suggestions");
    if (!list.classList.contains("hidden")) {
      closeLocationSuggestions();
      return;
    }
    input.focus();
    renderLocationSuggestions("");
  });
}

function updateLocationModalFlag() {
  const el = document.getElementById("location-modal-flag");
  if (!el) return;
  const flag = countryFlag(document.getElementById("f-country").value);
  el.textContent = flag;
  el.classList.toggle("hidden", !flag);
}

function openLocationModal(loc, prefillStart, prefillEnd) {
  const overlay = document.getElementById("location-modal-overlay");
  const title = document.getElementById("location-modal-title");
  const deleteBtn = document.getElementById("f-delete");

  document.getElementById("f-id").value = loc ? loc.id : "";
  document.getElementById("f-person").value = loc ? loc.person : "Both";
  document.getElementById("f-start").value = loc
    ? loc.start
    : prefillStart || "";
  document.getElementById("f-end").value = loc
    ? loc.end
    : prefillEnd || prefillStart || "";
  document.getElementById("f-location").value = loc ? loc.location || "" : "";
  populateCountrySelect(loc ? loc.country || "" : "");
  document.getElementById("f-comments").value = loc ? loc.comments || "" : "";

  title.textContent = loc ? "Edit Location" : "Add Location";
  deleteBtn.classList.toggle("hidden", !loc);
  closeLocationSuggestions();
  overlay.classList.remove("hidden");
}

function closeLocationModal() {
  closeLocationSuggestions();
  document.getElementById("location-modal-overlay").classList.add("hidden");
}

document.getElementById("location-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("f-id").value || uid();
  const start = document.getElementById("f-start").value;
  const end = document.getElementById("f-end").value || start;

  if (end < start) {
    alert("End date must be on or after the start date.");
    return;
  }

  const loc = {
    id,
    person: document.getElementById("f-person").value,
    start,
    end,
    location: document.getElementById("f-location").value.trim(),
    country: document.getElementById("f-country").value.trim(),
    comments: stayComments(
      document.getElementById("f-location").value.trim(),
      document.getElementById("f-comments").value,
    ),
  };

  const idx = state.locations.findIndex((x) => x.id === id);
  if (idx >= 0) state.locations[idx] = loc;
  else state.locations.push(loc);

  persist();
  renderAll();
  renderManageList();
  closeLocationModal();
  showToast(idx >= 0 ? "Location updated" : "Location added");
});

document
  .getElementById("f-country")
  .addEventListener("change", updateLocationModalFlag);
document
  .getElementById("f-cancel")
  .addEventListener("click", closeLocationModal);
document
  .getElementById("location-modal-overlay")
  .addEventListener("click", (e) => {
    if (e.target.id === "location-modal-overlay") closeLocationModal();
  });

document.getElementById("f-delete").addEventListener("click", () => {
  const id = document.getElementById("f-id").value;
  if (!id) return;
  if (!confirm("Delete this location?")) return;
  state.locations = state.locations.filter((x) => x.id !== id);
  persist();
  renderAll();
  renderManageList();
  closeLocationModal();
  showToast("Location deleted");
});

document
  .getElementById("btn-add-location")
  .addEventListener("click", () => openLocationModal(null));

// ---------- manage locations modal ----------

function renderManageList() {
  const container = document.getElementById("manage-list");
  container.innerHTML = "";
  const sorted = [...state.locations].sort((a, b) =>
    a.start.localeCompare(b.start),
  );

  if (!sorted.length) {
    container.innerHTML = '<p class="hint">No locations yet.</p>';
    return;
  }

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.style.fontSize = "12.5px";

  sorted.forEach((loc) => {
    const row = document.createElement("tr");
    row.style.borderBottom = "1px solid var(--border)";

    const range =
      loc.start === loc.end ? loc.start : `${loc.start} → ${loc.end}`;
    const where = `${loc.location || ""}${loc.country ? ", " + loc.country : ""}`;
    const person =
      loc.person === "M"
        ? "♀ Mariana"
        : loc.person === "Both"
          ? "⚥ Both"
          : "♂ Bharath";

    row.innerHTML = `
      <td style="padding:7px 6px;white-space:nowrap;">${range}</td>
      <td style="padding:7px 6px;white-space:nowrap;">${person}</td>
      <td style="padding:7px 6px;">${stayTitle(loc)}</td>
      <td style="padding:7px 6px;color:var(--text-dim);">${where}</td>
      <td style="padding:7px 6px;text-align:right;white-space:nowrap;">
        <button data-id="${loc.id}" class="edit-btn">Edit</button>
      </td>
    `;
    table.appendChild(row);
  });

  container.appendChild(table);

  container.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const loc = state.locations.find((x) => x.id === btn.dataset.id);
      closeManageModal();
      openLocationModal(loc);
    });
  });
}

function openManageModal() {
  renderManageList();
  document.getElementById("manage-modal-overlay").classList.remove("hidden");
}
function closeManageModal() {
  document.getElementById("manage-modal-overlay").classList.add("hidden");
}
document
  .getElementById("btn-manage-locations")
  .addEventListener("click", openManageModal);
document
  .getElementById("manage-close")
  .addEventListener("click", closeManageModal);
document
  .getElementById("manage-modal-overlay")
  .addEventListener("click", (e) => {
    if (e.target.id === "manage-modal-overlay") closeManageModal();
  });

// ---------- copy JSON ----------

function openJsonModal() {
  const sorted = {
    people: state.people,
    locations: [...state.locations].sort((a, b) =>
      a.start.localeCompare(b.start),
    ),
  };
  document.getElementById("json-output").value = JSON.stringify(
    sorted,
    null,
    2,
  );
  const editLink = document.getElementById("json-edit-link");
  editLink.href = `https://github.com/${GITHUB_REPO}/edit/${GITHUB_EDIT_BRANCH}/data.json`;
  document.getElementById("json-modal-overlay").classList.remove("hidden");
}
document
  .getElementById("btn-copy-json")
  .addEventListener("click", openJsonModal);
document
  .getElementById("unsaved-copy")
  .addEventListener("click", openJsonModal);
document.getElementById("json-close").addEventListener("click", () => {
  document.getElementById("json-modal-overlay").classList.add("hidden");
});
document.getElementById("json-modal-overlay").addEventListener("click", (e) => {
  if (e.target.id === "json-modal-overlay")
    document.getElementById("json-modal-overlay").classList.add("hidden");
});
document.getElementById("json-copy-btn").addEventListener("click", async () => {
  const text = document.getElementById("json-output").value;
  try {
    await navigator.clipboard.writeText(text);
    showToast("Copied to clipboard");
  } catch (e) {
    const ta = document.getElementById("json-output");
    ta.select();
    document.execCommand("copy");
    showToast("Copied to clipboard");
  }
});

// ---------- settings ----------

function openSettingsModal() {
  applyTripMidOpacity(settings.tripMidOpacity);
  document.getElementById("settings-modal-overlay").classList.remove("hidden");
}

function setupSettingsControls() {
  const slider = document.getElementById("s-trip-mid");
  slider.addEventListener("input", () => {
    applyTripMidOpacity(slider.value);
    persistSettings();
  });
}

function closeSettingsModal() {
  document.getElementById("settings-modal-overlay").classList.add("hidden");
}

document
  .getElementById("btn-settings")
  .addEventListener("click", openSettingsModal);
document
  .getElementById("settings-close")
  .addEventListener("click", closeSettingsModal);
document
  .getElementById("settings-modal-overlay")
  .addEventListener("click", (e) => {
    if (e.target.id === "settings-modal-overlay") closeSettingsModal();
  });

// ---------- filters ----------

function setupPersonChips() {
  ["B", "M"].forEach((p) => {
    const chip = document.getElementById("chip-" + p);
    const checkbox = chip.querySelector("input");
    checkbox.checked = selectedPeople.has(p);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) selectedPeople.add(p);
      else selectedPeople.delete(p);
      chip.classList.toggle("checked", checkbox.checked);
      persistSettings();
      renderAll();
    });
    chip.classList.toggle("checked", checkbox.checked);
  });
}

function setupYearControls() {
  const sel = document.getElementById("year-select");
  sel.addEventListener("change", () =>
    scrollToYear(parseInt(sel.value, 10), { smooth: true }),
  );
  document.getElementById("year-prev").addEventListener("click", () => {
    scrollToYear((currentYear || realCurrentYear()) - 1, { smooth: true });
  });
  document.getElementById("year-next").addEventListener("click", () => {
    scrollToYear((currentYear || realCurrentYear()) + 1, { smooth: true });
  });
  document.getElementById("btn-today").addEventListener("click", goToToday);
  document.getElementById("btn-legend").addEventListener("click", () => {
    const panel = document.getElementById("legend-panel");
    const btn = document.getElementById("btn-legend");
    const opening = panel.classList.contains("hidden");
    panel.classList.toggle("hidden", !opening);
    btn.setAttribute("aria-pressed", opening ? "true" : "false");
  });
}

// ---------- reset ----------

document.getElementById("btn-reset").addEventListener("click", async () => {
  if (!confirm("Discard local edits and reload data from data.json?")) return;
  localStorage.removeItem(STORAGE_KEY);
  await loadData();
  renderAll();
  closeSettingsModal();
  showToast("Reset to data.json");
});

// ---------- escape closes any open modal/popover ----------

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const locList = document.getElementById("location-suggestions");
  if (locList && !locList.classList.contains("hidden")) {
    closeLocationSuggestions();
    return;
  }
  closeLocationModal();
  closeManageModal();
  document.getElementById("json-modal-overlay").classList.add("hidden");
  closeSettingsModal();
  closeDayPopover();
  closeCountryTooltip();
});

// ---------- boot ----------

window.addEventListener("hashchange", () => {
  const y = parseHashYear();
  if (y) scrollToYear(y, { smooth: true });
});

(async function init() {
  loadSettings();
  await loadData();
  setupPersonChips();
  setupYearControls();
  setupSettingsControls();
  setupLocationCombo();
  setupStickyOffset();
  setupDragToAdd();
  const initialYear = parseHashYear() || realCurrentYear();
  renderAll({ year: initialYear });
})();
