/* Life Calendars — Location Calendar
 * No backend. Data lives in data.json (source of truth for PRs), with a
 * localStorage overlay for in-browser edits and an embedded fallback copy
 * so the page still works if fetch() is blocked (e.g. opened via file://).
 */

const STORAGE_KEY = "life-calendar-data-v1";
const YEAR_START = 2009;

// Where "Copy JSON" points people to open a PR from.
const GITHUB_REPO = "bigomega/life-calendars";
const GITHUB_EDIT_BRANCH = "gh-pages";

// Fallback copy of data.json — used only if fetch('./data.json') fails.
// Keep this in sync with data.json when you hand-edit the file directly.
const FALLBACK_DATA = {
  "people": [
    { "id": "B", "name": "Bharath", "icon": "♂" },
    { "id": "M", "name": "Mariana", "icon": "♀" }
  ],
  "locations": [
    { "id": "loc-001", "person": "B", "type": "stay", "start": "2024-09-28", "end": "2024-10-02", "location": "Bir", "country": "India", "label": "Bir Trip", "emoji": "✔️" },
    { "id": "loc-002", "person": "B", "type": "stay", "start": "2024-10-30", "end": "2024-11-14", "location": "Mumbai", "country": "India", "label": "Mariana - Mumbai", "emoji": "✔️" },
    { "id": "loc-003", "person": "B", "type": "transit", "start": "2025-05-17", "end": "2025-05-18", "from": "Mumbai", "to": "Karnal", "country": "India", "label": "Mumbai - Karnal", "emoji": "🏍" },
    { "id": "loc-004", "person": "B", "type": "transit", "start": "2025-06-01", "end": "2025-06-01", "from": "Karnal", "to": "Bir", "country": "India", "label": "Karnal - Bir", "emoji": "🏍" },
    { "id": "loc-005", "person": "B", "type": "stay", "start": "2025-07-20", "end": "2025-07-20", "location": "Delhi", "country": "India", "label": "Delhi", "emoji": "" },
    { "id": "loc-006", "person": "B", "type": "stay", "start": "2025-07-23", "end": "2025-07-26", "location": "Kolkata", "country": "India", "label": "Kolkata US Visa interview", "emoji": "" },
    { "id": "loc-007", "person": "B", "type": "stay", "start": "2025-07-27", "end": "2025-07-27", "location": "Delhi", "country": "India", "label": "Delhi transit day", "emoji": "" },
    { "id": "loc-008", "person": "B", "type": "flight", "start": "2025-08-22", "end": "2025-08-23", "from": "Delhi", "to": "NYC", "label": "Fly Delhi to NYC", "emoji": "✈️" },
    { "id": "loc-009", "person": "B", "type": "stay", "start": "2025-08-23", "end": "2025-10-26", "location": "New York", "country": "USA", "label": "New York", "emoji": "", "inferred": true },
    { "id": "loc-010", "person": "B", "type": "flight", "start": "2025-10-26", "end": "2025-10-26", "from": "New York", "to": "Mexico", "label": "Fly New York to Mexico", "emoji": "✈️" },
    { "id": "loc-011", "person": "B", "type": "stay", "start": "2025-10-27", "end": "2025-10-31", "location": "Mexico City", "country": "Mexico", "label": "Mexico City", "emoji": "🏡" },
    { "id": "loc-012", "person": "B", "type": "stay", "start": "2025-11-01", "end": "2025-11-01", "location": "Patzcuaro", "country": "Mexico", "label": "Patzcuaro", "emoji": "" },
    { "id": "loc-013", "person": "B", "type": "stay", "start": "2025-11-02", "end": "2025-11-15", "location": "Morelia", "country": "Mexico", "label": "Morelia", "emoji": "🏡" },
    { "id": "loc-014", "person": "B", "type": "stay", "start": "2025-11-16", "end": "2025-11-30", "location": "Guanajuato", "country": "Mexico", "label": "Guanajuato", "emoji": "🏡" },
    { "id": "loc-015", "person": "B", "type": "stay", "start": "2025-12-01", "end": "2026-01-25", "location": "Mexico", "country": "Mexico", "label": "Mexico", "emoji": "", "inferred": true },
    { "id": "loc-016", "person": "B", "type": "flight", "start": "2026-01-25", "end": "2026-01-25", "from": "Mexico", "to": "Orlando", "label": "Fly Mexico to Orlando", "emoji": "✈️" },
    { "id": "loc-017", "person": "B", "type": "stay", "start": "2026-01-25", "end": "2026-01-29", "location": "Florida", "country": "USA", "label": "Orlando / Fort Lauderdale", "emoji": "", "inferred": true },
    { "id": "loc-018", "person": "B", "type": "flight", "start": "2026-01-29", "end": "2026-01-29", "from": "Fort-Lauderdale", "to": "Seattle", "label": "Fly Fort-Lauderdale to Seattle", "emoji": "✈️" },
    { "id": "loc-019", "person": "B", "type": "stay", "start": "2026-01-29", "end": "2026-02-01", "location": "Seattle", "country": "USA", "label": "Seattle", "emoji": "", "inferred": true },
    { "id": "loc-020", "person": "B", "type": "flight", "start": "2026-02-01", "end": "2026-02-02", "from": "Seattle", "to": "Dubai", "label": "Fly Seattle to Dubai", "emoji": "✈️" },
    { "id": "loc-021", "person": "B", "type": "stay", "start": "2026-02-02", "end": "2026-02-14", "location": "Dubai", "country": "UAE", "label": "Dubai", "emoji": "", "inferred": true },
    { "id": "loc-022", "person": "B", "type": "flight", "start": "2026-02-14", "end": "2026-02-14", "from": "Dubai", "to": "Tbilisi", "label": "Fly Dubai to Tbilisi", "emoji": "✈️" },
    { "id": "loc-023", "person": "B", "type": "stay", "start": "2026-02-14", "end": "2026-02-27", "location": "Tbilisi", "country": "Georgia", "label": "Tbilisi", "emoji": "", "inferred": true },
    { "id": "loc-024", "person": "B", "type": "flight", "start": "2026-02-28", "end": "2026-02-28", "from": "Tbilisi", "to": "Dubai", "label": "Fly Tbilisi to Dubai", "emoji": "✈️", "cancelled": true },
    { "id": "loc-025", "person": "B", "type": "stay", "start": "2026-02-28", "end": "2026-03-03", "location": "Tbilisi", "country": "Georgia", "label": "Stay in Tbilisi", "emoji": "🏨" },
    { "id": "loc-026", "person": "B", "type": "flight", "start": "2026-03-01", "end": "2026-03-01", "from": "Dubai", "to": "Delhi", "label": "Fly Dubai to Delhi", "emoji": "✈️", "cancelled": true },
    { "id": "loc-027", "person": "B", "type": "flight", "start": "2026-03-01", "end": "2026-03-01", "from": "Tbilisi", "to": "Delhi", "label": "Fly Tbilisi to Delhi", "emoji": "✈️" },
    { "id": "loc-028", "person": "B", "type": "flight", "start": "2026-03-05", "end": "2026-03-05", "from": "Istanbul", "to": "Almaty", "label": "Fly Istanbul to Almaty", "emoji": "✈️" },
    { "id": "loc-029", "person": "B", "type": "stay", "start": "2026-03-05", "end": "2026-03-21", "location": "Almaty", "country": "Kazakhstan", "label": "Almaty", "emoji": "", "inferred": true },
    { "id": "loc-030", "person": "B", "type": "flight", "start": "2026-03-21", "end": "2026-03-21", "from": "Almaty", "to": "Delhi", "label": "Fly Almaty to Delhi", "emoji": "✈️" },
    { "id": "loc-031", "person": "B", "type": "stay", "start": "2026-03-21", "end": "2026-05-24", "location": "Delhi", "country": "India", "label": "Delhi", "emoji": "", "inferred": true },
    { "id": "loc-032", "person": "B", "type": "flight", "start": "2026-05-24", "end": "2026-05-25", "from": "Delhi", "to": "NYC", "label": "Fly Delhi to NYC", "emoji": "✈️" },
    { "id": "loc-033", "person": "B", "type": "stay", "start": "2026-05-25", "end": "2026-08-16", "location": "New York", "country": "USA", "label": "New York", "emoji": "", "inferred": true },
    { "id": "loc-034", "person": "B", "type": "flight", "start": "2026-08-16", "end": "2026-08-16", "from": "NYC", "to": "MEX", "label": "NYC to MEX", "emoji": "✈️" }
  ]
};

const COUNTRY_HUES = {
  "India": 14,
  "USA": 214,
  "Mexico": 145,
  "UAE": 42,
  "Georgia": 271,
  "Turkey": 187,
  "Kazakhstan": 328
};
const LIGHTNESS_STEPS = [42, 56, 34, 66, 48, 60, 38, 70];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

let state = { people: [], locations: [] };
let colorMap = {}; // "Country||Location" -> hsl string
let selectedPeople = new Set(["B", "M"]);
let currentYear = null; // active/visible year, synced with #hash
let yearEnd = YEAR_START;
let scrollObserver = null;
let dragState = null;

// ---------- utils ----------

function pad2(n) { return n < 10 ? "0" + n : "" + n; }
function isoDate(y, m, d) { return `${y}-${pad2(m)}-${pad2(d)}`; }
function todayIso() {
  const d = new Date();
  return isoDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
}
function realCurrentYear() { return new Date().getFullYear(); }
function uid() {
  return "loc-" + Math.random().toString(36).slice(2, 9);
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

async function loadData() {
  let base = null;
  try {
    const res = await fetch("./data.json", { cache: "no-store" });
    if (res.ok) base = await res.json();
  } catch (e) {
    // ignore, fall back below
  }
  if (!base) base = FALLBACK_DATA;

  const local = localStorage.getItem(STORAGE_KEY);
  if (local) {
    try {
      state = JSON.parse(local);
      return;
    } catch (e) {
      // corrupted local copy, fall through to base
    }
  }
  state = JSON.parse(JSON.stringify(base));
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ---------- color map ----------

function rebuildColorMap() {
  colorMap = {};
  const byCountry = {};
  for (const loc of state.locations) {
    if (loc.type !== "stay" || !loc.country) continue;
    const l = loc.location || "Unknown";
    byCountry[loc.country] = byCountry[loc.country] || new Set();
    byCountry[loc.country].add(l);
  }
  for (const country of Object.keys(byCountry)) {
    const hue = COUNTRY_HUES[country] !== undefined ? COUNTRY_HUES[country] : hashHue(country);
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

// ---------- filtering ----------

function filteredLocations() {
  return state.locations.filter((l) => (l.person === "Both" ? selectedPeople.size > 0 : selectedPeople.has(l.person)));
}

function locationsForDate(locations, dateStr) {
  return locations.filter((l) => l.start <= dateStr && dateStr <= l.end);
}

// ---------- rendering: legend ----------

function renderLegend(locations) {
  const panel = document.getElementById("legend-panel");
  panel.innerHTML = "";

  const byCountry = {};
  for (const loc of locations) {
    if (loc.type !== "stay" || !loc.country) continue;
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
    title.textContent = country;
    group.appendChild(title);

    Array.from(byCountry[country]).sort().forEach((l) => {
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

  // Static legend entries
  const misc = document.createElement("div");
  misc.className = "legend-group";
  const miscTitle = document.createElement("div");
  miscTitle.className = "country-name";
  miscTitle.textContent = "Travel";
  misc.appendChild(miscTitle);

  const flightItem = document.createElement("div");
  flightItem.className = "legend-item";
  flightItem.innerHTML = `<span class="legend-swatch" style="background:transparent;border:1.5px dashed rgba(255,255,255,0.6);"></span><span>✈️ / 🏍 Flight or transit</span>`;
  misc.appendChild(flightItem);

  const cancelledItem = document.createElement("div");
  cancelledItem.className = "legend-item";
  cancelledItem.innerHTML = `<span class="legend-swatch" style="background:transparent;border:1.5px dashed rgba(255,255,255,0.3);opacity:0.5;"></span><span style="text-decoration:line-through;opacity:0.7;">Cancelled</span>`;
  misc.appendChild(cancelledItem);

  const inferredItem = document.createElement("div");
  inferredItem.className = "legend-item";
  inferredItem.innerHTML = `<span class="legend-swatch" style="background:transparent;border:1.5px dashed rgba(255,255,255,0.5);"></span><span style="font-style:italic;opacity:0.85;">(inferred) deduced from flights, not confirmed</span>`;
  misc.appendChild(inferredItem);

  panel.appendChild(misc);
}

// ---------- rendering: calendar (all years, one long scroll) ----------

function computeYearEnd(locations) {
  const nowY = realCurrentYear();
  const dataYears = locations.map((l) => parseInt(l.start.slice(0, 4), 10)).filter((y) => !Number.isNaN(y));
  const maxDataYear = dataYears.length ? Math.max(...dataYears) : nowY;
  return Math.max(nowY, maxDataYear) + 2;
}

function buildMonthCard(year, month, locations) {
  const card = document.createElement("div");
  card.className = "month-card";

  const h3 = document.createElement("h3");
  h3.textContent = `${MONTH_NAMES[month - 1]} ${year}`;
  card.appendChild(h3);

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
  const today = todayIso();

  for (let i = 0; i < firstDow; i++) {
    const empty = document.createElement("div");
    empty.className = "day-cell empty";
    dayGrid.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = isoDate(year, month, d);
    const dayLocations = locationsForDate(locations, dateStr);
    const stays = dayLocations.filter((l) => l.type === "stay");
    const travel = dayLocations.filter((l) => l.type !== "stay");

    const cell = document.createElement("div");
    cell.className = "day-cell";
    cell.dataset.date = dateStr;
    if (dateStr === today) cell.classList.add("today");
    if (dayLocations.length) cell.classList.add("has-locations");

    if (stays.length) {
      cell.style.background = stayColor(stays[0]);
      cell.style.color = "#111";
    }

    const num = document.createElement("span");
    num.className = "num";
    num.textContent = d;
    cell.appendChild(num);

    if (stays.length > 1) {
      const strip = document.createElement("div");
      strip.className = "stack-strip";
      stays.slice(1, 4).forEach((l) => {
        const seg = document.createElement("span");
        seg.style.background = stayColor(l);
        strip.appendChild(seg);
      });
      cell.appendChild(strip);
    }

    if (travel.length) {
      const anyCancelled = travel.every((l) => l.cancelled);
      const marker = document.createElement("div");
      marker.className = "transit-marker dashed";
      marker.style.opacity = anyCancelled ? "0.5" : "1";
      marker.textContent = travel[0].emoji || (travel[0].type === "flight" ? "✈️" : "🏍");
      cell.appendChild(marker);
      if (travel.some((l) => l.cancelled)) {
        const badge = document.createElement("span");
        badge.className = "cancelled-badge";
        badge.textContent = "❌";
        cell.appendChild(badge);
      }
    }

    if (dayLocations.length) {
      const titleParts = dayLocations.map((l) => {
        const range = l.start === l.end ? l.start : `${l.start} → ${l.end}`;
        const cancelled = l.cancelled ? " (cancelled)" : "";
        const inferred = l.inferred ? " (inferred)" : "";
        return `${l.emoji || ""} ${l.label}${cancelled}${inferred} [${range}]`;
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
    title.textContent = String(y);
    section.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "months-grid";
    for (let m = 1; m <= 12; m++) grid.appendChild(buildMonthCard(y, m, locations));
    section.appendChild(grid);

    container.appendChild(section);
  }
}

function renderAll(opts = {}) {
  rebuildColorMap();
  const locations = filteredLocations();
  renderLegend(locations);
  renderYears(locations);
  populateYearJump();
  setupScrollSpy();
  const target = opts.year !== undefined ? opts.year : (currentYear || realCurrentYear());
  scrollToYear(target, { smooth: false });
}

// ---------- year navigation / scroll-spy ----------

function clampYear(y) {
  return Math.min(Math.max(y, YEAR_START), yearEnd);
}

function stickyHeaderHeight() {
  const el = document.querySelector(".sticky-top");
  return el ? el.offsetHeight : 0;
}

// Scrolls so the year's title lands just below the sticky header — plain
// scrollIntoView({block:"start"}) would put the section's top at viewport
// y=0, leaving its first row of days hidden (and unclickable) under the
// sticky header.
function scrollToYear(year, { smooth = false } = {}) {
  const y = clampYear(year);
  const el = document.getElementById("y" + y);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - stickyHeaderHeight() - 8;
  window.scrollTo({ top: Math.max(0, top), behavior: smooth ? "smooth" : "auto" });
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
  scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setCurrentYear(parseInt(entry.target.dataset.year, 10));
        }
      });
    },
    { rootMargin: "-10% 0px -85% 0px", threshold: 0 }
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
    window.scrollTo({ top: window.scrollY + (currentCenter - desiredCenter), behavior: "smooth" });
    cell.classList.add("flash");
    setTimeout(() => cell.classList.remove("flash"), 1200);
  } else {
    scrollToYear(realCurrentYear(), { smooth: true });
  }
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
    row.className = "pop-event" + (loc.cancelled ? " cancelled" : "");
    const sw = document.createElement("span");
    sw.className = "sw";
    sw.style.background = loc.type === "stay" ? stayColor(loc) : "transparent";
    if (loc.type !== "stay") sw.style.border = "1.5px dashed rgba(255,255,255,0.6)";
    row.appendChild(sw);
    const lbl = document.createElement("span");
    lbl.className = "lbl";
    lbl.textContent = `${loc.emoji || ""} ${loc.label}${loc.inferred ? " (inferred)" : ""}`.trim();
    row.appendChild(lbl);
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
  if (x + rect.width > window.innerWidth) x = window.innerWidth - rect.width - 8;
  if (y + rect.height > window.innerHeight) y = window.innerHeight - rect.height - 8;
  pop.style.left = x + "px";
  pop.style.top = y + "px";
}

// Close on the next pointerdown outside the popover, not on "click" — the
// pointerup that opens the popover is immediately followed by a synthetic
// "click" event on the same target, which would otherwise close it again.
document.addEventListener("pointerdown", (e) => {
  const pop = document.getElementById("day-popover");
  if (pop.classList.contains("hidden")) return;
  if (!pop.contains(e.target)) closeDayPopover();
});

// ---------- click / click-and-drag to add a location ----------

function highlightRange(grid, a, b) {
  clearHighlight(grid);
  const lo = a < b ? a : b;
  const hi = a < b ? b : a;
  grid.querySelectorAll(".day-cell[data-date]").forEach((c) => {
    if (c.dataset.date >= lo && c.dataset.date <= hi) c.classList.add("selecting");
  });
}

function clearHighlight(grid) {
  grid.querySelectorAll(".day-cell.selecting").forEach((c) => c.classList.remove("selecting"));
}

function setupDragToAdd() {
  const container = document.getElementById("years-container");

  container.addEventListener("pointerdown", (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    const cell = e.target.closest(".day-cell[data-date]");
    if (!cell) return;
    const grid = cell.closest(".day-grid");
    dragState = { grid, startDate: cell.dataset.date, endDate: cell.dataset.date, moved: false };
    highlightRange(grid, dragState.startDate, dragState.endDate);
  });

  container.addEventListener("pointermove", (e) => {
    if (!dragState) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const cell = el && el.closest ? el.closest(".day-cell[data-date]") : null;
    if (!cell || cell.closest(".day-grid") !== dragState.grid) return;
    if (cell.dataset.date !== dragState.endDate) {
      dragState.endDate = cell.dataset.date;
      dragState.moved = true;
      highlightRange(dragState.grid, dragState.startDate, dragState.endDate);
    }
  });

  window.addEventListener("pointerup", (e) => {
    if (!dragState) return;
    const { grid, startDate, endDate, moved } = dragState;
    clearHighlight(grid);
    dragState = null;
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

function setFormMode(type) {
  document.getElementById("stay-fields").classList.toggle("hidden", type !== "stay");
  document.getElementById("route-fields").classList.toggle("hidden", type === "stay");
}

function openLocationModal(loc, prefillStart, prefillEnd) {
  const overlay = document.getElementById("location-modal-overlay");
  const title = document.getElementById("location-modal-title");
  const deleteBtn = document.getElementById("f-delete");

  document.getElementById("f-id").value = loc ? loc.id : "";
  document.getElementById("f-person").value = loc
    ? loc.person
    : selectedPeople.has("B")
    ? "B"
    : selectedPeople.has("M")
    ? "M"
    : "Both";
  document.getElementById("f-type").value = loc ? loc.type : "stay";
  document.getElementById("f-start").value = loc ? loc.start : prefillStart || "";
  document.getElementById("f-end").value = loc ? loc.end : prefillEnd || prefillStart || "";
  document.getElementById("f-location").value = loc ? loc.location || "" : "";
  document.getElementById("f-country").value = loc ? loc.country || "" : "";
  document.getElementById("f-from").value = loc ? loc.from || "" : "";
  document.getElementById("f-to").value = loc ? loc.to || "" : "";
  document.getElementById("f-label").value = loc ? loc.label : "";
  document.getElementById("f-emoji").value = loc ? loc.emoji || "" : "";
  document.getElementById("f-cancelled").checked = loc ? !!loc.cancelled : false;

  setFormMode(loc ? loc.type : "stay");
  title.textContent = loc ? "Edit Location" : "Add Location";
  deleteBtn.classList.toggle("hidden", !loc);
  overlay.classList.remove("hidden");
}

function closeLocationModal() {
  document.getElementById("location-modal-overlay").classList.add("hidden");
}

document.getElementById("f-type").addEventListener("change", (e) => setFormMode(e.target.value));

document.getElementById("location-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("f-id").value || uid();
  const type = document.getElementById("f-type").value;
  const start = document.getElementById("f-start").value;
  const end = document.getElementById("f-end").value || start;

  if (end < start) {
    alert("End date must be on or after the start date.");
    return;
  }

  const loc = {
    id,
    person: document.getElementById("f-person").value,
    type,
    start,
    end,
    label: document.getElementById("f-label").value.trim(),
    emoji: document.getElementById("f-emoji").value.trim()
  };

  if (type === "stay") {
    loc.location = document.getElementById("f-location").value.trim();
    loc.country = document.getElementById("f-country").value.trim();
  } else {
    loc.from = document.getElementById("f-from").value.trim();
    loc.to = document.getElementById("f-to").value.trim();
  }

  if (document.getElementById("f-cancelled").checked) loc.cancelled = true;

  if (!loc.label) {
    loc.label = type === "stay" ? loc.location || "Untitled" : `${loc.from || "?"} → ${loc.to || "?"}`;
  }

  const idx = state.locations.findIndex((x) => x.id === id);
  if (idx >= 0) state.locations[idx] = loc;
  else state.locations.push(loc);

  persist();
  renderAll();
  renderManageList();
  closeLocationModal();
  showToast(idx >= 0 ? "Location updated" : "Location added");
});

document.getElementById("f-cancel").addEventListener("click", closeLocationModal);
document.getElementById("location-modal-overlay").addEventListener("click", (e) => {
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

document.getElementById("btn-add-location").addEventListener("click", () => openLocationModal(null));

// ---------- manage locations modal ----------

function renderManageList() {
  const container = document.getElementById("manage-list");
  container.innerHTML = "";
  const sorted = [...state.locations].sort((a, b) => a.start.localeCompare(b.start));

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

    const range = loc.start === loc.end ? loc.start : `${loc.start} → ${loc.end}`;
    const where =
      loc.type === "stay"
        ? `${loc.location || ""}${loc.country ? ", " + loc.country : ""}`
        : `${loc.from || "?"} → ${loc.to || "?"}`;
    const person = loc.person === "M" ? "♀ Mariana" : loc.person === "Both" ? "⚥ Both" : "♂ Bharath";
    const inferredTag = loc.inferred
      ? ' <span style="opacity:.6;font-style:italic;">(inferred)</span>'
      : "";

    row.innerHTML = `
      <td style="padding:7px 6px;white-space:nowrap;">${range}</td>
      <td style="padding:7px 6px;white-space:nowrap;">${person}</td>
      <td style="padding:7px 6px;">${loc.emoji || ""} ${loc.label}${loc.cancelled ? " ❌" : ""}${inferredTag}</td>
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
document.getElementById("btn-manage-locations").addEventListener("click", openManageModal);
document.getElementById("manage-close").addEventListener("click", closeManageModal);
document.getElementById("manage-modal-overlay").addEventListener("click", (e) => {
  if (e.target.id === "manage-modal-overlay") closeManageModal();
});

// ---------- copy JSON ----------

function openJsonModal() {
  const sorted = {
    people: state.people,
    locations: [...state.locations].sort((a, b) => a.start.localeCompare(b.start))
  };
  document.getElementById("json-output").value = JSON.stringify(sorted, null, 2);
  const editLink = document.getElementById("json-edit-link");
  editLink.href = `https://github.com/${GITHUB_REPO}/edit/${GITHUB_EDIT_BRANCH}/data.json`;
  document.getElementById("json-modal-overlay").classList.remove("hidden");
}
document.getElementById("btn-copy-json").addEventListener("click", openJsonModal);
document.getElementById("json-close").addEventListener("click", () => {
  document.getElementById("json-modal-overlay").classList.add("hidden");
});
document.getElementById("json-modal-overlay").addEventListener("click", (e) => {
  if (e.target.id === "json-modal-overlay") document.getElementById("json-modal-overlay").classList.add("hidden");
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

// ---------- filters ----------

function setupPersonChips() {
  ["B", "M"].forEach((p) => {
    const chip = document.getElementById("chip-" + p);
    const checkbox = chip.querySelector("input");
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) selectedPeople.add(p);
      else selectedPeople.delete(p);
      chip.classList.toggle("checked", checkbox.checked);
      renderAll();
    });
    chip.classList.toggle("checked", checkbox.checked);
  });
}

function setupYearControls() {
  const sel = document.getElementById("year-select");
  sel.addEventListener("change", () => scrollToYear(parseInt(sel.value, 10), { smooth: true }));
  document.getElementById("year-prev").addEventListener("click", () => {
    scrollToYear((currentYear || realCurrentYear()) - 1, { smooth: true });
  });
  document.getElementById("year-next").addEventListener("click", () => {
    scrollToYear((currentYear || realCurrentYear()) + 1, { smooth: true });
  });
  document.getElementById("btn-today").addEventListener("click", goToToday);
}

// ---------- reset ----------

document.getElementById("btn-reset").addEventListener("click", async () => {
  if (!confirm("Discard local edits and reload data from data.json?")) return;
  localStorage.removeItem(STORAGE_KEY);
  await loadData();
  renderAll();
  showToast("Reset to data.json");
});

// ---------- boot ----------

window.addEventListener("hashchange", () => {
  const y = parseHashYear();
  if (y) scrollToYear(y, { smooth: true });
});

(async function init() {
  await loadData();
  setupPersonChips();
  setupYearControls();
  setupDragToAdd();
  const initialYear = parseHashYear() || realCurrentYear();
  renderAll({ year: initialYear });
})();
