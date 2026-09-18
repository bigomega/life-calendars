/* Life Calendars — Location Calendar
 * No backend. Data lives in data.json (source of truth for PRs), with a
 * localStorage overlay for in-browser edits and an embedded fallback copy
 * so the page still works if fetch() is blocked (e.g. opened via file://).
 */

const STORAGE_KEY = "life-calendar-data-v1";

// Fallback copy of data.json — used only if fetch('./data.json') fails.
// Keep this in sync with data.json when you hand-edit the file directly.
const FALLBACK_DATA = {
  "people": [
    { "id": "B", "name": "Bharath", "icon": "♂" },
    { "id": "M", "name": "Mariana", "icon": "♀" }
  ],
  "events": [
    { "id": "evt-001", "person": "B", "type": "stay", "start": "2024-09-28", "end": "2024-10-02", "location": "Bir", "country": "India", "label": "Bir Trip", "emoji": "✔️" },
    { "id": "evt-002", "person": "B", "type": "stay", "start": "2024-10-30", "end": "2024-11-14", "location": "Mumbai", "country": "India", "label": "Mariana - Mumbai", "emoji": "✔️" },
    { "id": "evt-003", "person": "B", "type": "transit", "start": "2025-05-17", "end": "2025-05-18", "from": "Mumbai", "to": "Karnal", "country": "India", "label": "Mumbai - Karnal", "emoji": "🏍" },
    { "id": "evt-004", "person": "B", "type": "transit", "start": "2025-06-01", "end": "2025-06-01", "from": "Karnal", "to": "Bir", "country": "India", "label": "Karnal - Bir", "emoji": "🏍" },
    { "id": "evt-005", "person": "B", "type": "stay", "start": "2025-07-20", "end": "2025-07-20", "location": "Delhi", "country": "India", "label": "Delhi", "emoji": "" },
    { "id": "evt-006", "person": "B", "type": "stay", "start": "2025-07-23", "end": "2025-07-26", "location": "Kolkata", "country": "India", "label": "Kolkata US Visa interview", "emoji": "" },
    { "id": "evt-007", "person": "B", "type": "stay", "start": "2025-07-27", "end": "2025-07-27", "location": "Delhi", "country": "India", "label": "Delhi transit day", "emoji": "" },
    { "id": "evt-008", "person": "B", "type": "flight", "start": "2025-08-22", "end": "2025-08-23", "from": "Delhi", "to": "NYC", "label": "Fly Delhi to NYC", "emoji": "✈️" },
    { "id": "evt-009", "person": "B", "type": "flight", "start": "2025-10-26", "end": "2025-10-26", "from": "New York", "to": "Mexico", "label": "Fly New York to Mexico", "emoji": "✈️" },
    { "id": "evt-010", "person": "B", "type": "stay", "start": "2025-10-27", "end": "2025-10-31", "location": "Mexico City", "country": "Mexico", "label": "Mexico City", "emoji": "🏡" },
    { "id": "evt-011", "person": "B", "type": "stay", "start": "2025-11-01", "end": "2025-11-01", "location": "Patzcuaro", "country": "Mexico", "label": "Patzcuaro", "emoji": "" },
    { "id": "evt-012", "person": "B", "type": "stay", "start": "2025-11-02", "end": "2025-11-15", "location": "Morelia", "country": "Mexico", "label": "Morelia", "emoji": "🏡" },
    { "id": "evt-013", "person": "B", "type": "stay", "start": "2025-11-16", "end": "2025-11-30", "location": "Guanajuato", "country": "Mexico", "label": "Guanajuato", "emoji": "🏡" },
    { "id": "evt-014", "person": "B", "type": "flight", "start": "2026-01-25", "end": "2026-01-25", "from": "Mexico", "to": "Orlando", "label": "Fly Mexico to Orlando", "emoji": "✈️" },
    { "id": "evt-015", "person": "B", "type": "flight", "start": "2026-01-29", "end": "2026-01-29", "from": "Fort-Lauderdale", "to": "Seattle", "label": "Fly Fort-Lauderdale to Seattle", "emoji": "✈️" },
    { "id": "evt-016", "person": "B", "type": "flight", "start": "2026-02-01", "end": "2026-02-02", "from": "Seattle", "to": "Dubai", "label": "Fly Seattle to Dubai", "emoji": "✈️" },
    { "id": "evt-017", "person": "B", "type": "flight", "start": "2026-02-14", "end": "2026-02-14", "from": "Dubai", "to": "Tbilisi", "label": "Fly Dubai to Tbilisi", "emoji": "✈️" },
    { "id": "evt-018", "person": "B", "type": "flight", "start": "2026-02-28", "end": "2026-02-28", "from": "Tbilisi", "to": "Dubai", "label": "Fly Tbilisi to Dubai", "emoji": "✈️", "cancelled": true },
    { "id": "evt-019", "person": "B", "type": "stay", "start": "2026-02-28", "end": "2026-03-03", "location": "Tbilisi", "country": "Georgia", "label": "Stay in Tbilisi", "emoji": "🏨" },
    { "id": "evt-020", "person": "B", "type": "flight", "start": "2026-03-01", "end": "2026-03-01", "from": "Dubai", "to": "Delhi", "label": "Fly Dubai to Delhi", "emoji": "✈️", "cancelled": true },
    { "id": "evt-021", "person": "B", "type": "flight", "start": "2026-03-01", "end": "2026-03-01", "from": "Tbilisi", "to": "Delhi", "label": "Fly Tbilisi to Delhi", "emoji": "✈️" },
    { "id": "evt-022", "person": "B", "type": "flight", "start": "2026-03-05", "end": "2026-03-05", "from": "Istanbul", "to": "Almaty", "label": "Fly Istanbul to Almaty", "emoji": "✈️" },
    { "id": "evt-023", "person": "B", "type": "flight", "start": "2026-03-21", "end": "2026-03-21", "from": "Almaty", "to": "Delhi", "label": "Fly Almaty to Delhi", "emoji": "✈️" },
    { "id": "evt-024", "person": "B", "type": "flight", "start": "2026-05-24", "end": "2026-05-25", "from": "Delhi", "to": "NYC", "label": "Fly Delhi to NYC", "emoji": "✈️" },
    { "id": "evt-025", "person": "B", "type": "flight", "start": "2026-08-16", "end": "2026-08-16", "from": "NYC", "to": "MEX", "label": "NYC to MEX", "emoji": "✈️" }
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

let state = { people: [], events: [] };
let colorMap = {}; // "Country||Location" -> hsl string
let selectedPeople = new Set(["B", "M"]);
let selectedYear = new Date().getFullYear();

// ---------- utils ----------

function pad2(n) { return n < 10 ? "0" + n : "" + n; }
function isoDate(y, m, d) { return `${y}-${pad2(m)}-${pad2(d)}`; }
function todayIso() {
  const d = new Date();
  return isoDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
}
function uid() {
  return "evt-" + Math.random().toString(36).slice(2, 9);
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
  for (const ev of state.events) {
    if (ev.type !== "stay" || !ev.country) continue;
    const loc = ev.location || "Unknown";
    byCountry[ev.country] = byCountry[ev.country] || new Set();
    byCountry[ev.country].add(loc);
  }
  for (const country of Object.keys(byCountry)) {
    const hue = COUNTRY_HUES[country] !== undefined ? COUNTRY_HUES[country] : hashHue(country);
    const locations = Array.from(byCountry[country]).sort();
    locations.forEach((loc, i) => {
      const lightness = LIGHTNESS_STEPS[i % LIGHTNESS_STEPS.length];
      colorMap[country + "||" + loc] = `hsl(${hue}, 58%, ${lightness}%)`;
    });
  }
}

function stayColor(ev) {
  const key = (ev.country || "") + "||" + (ev.location || "");
  return colorMap[key] || "hsl(0, 0%, 55%)";
}

// ---------- filtering ----------

function filteredEvents() {
  return state.events.filter((e) => selectedPeople.has(e.person));
}

function eventsForDate(events, dateStr) {
  return events.filter((e) => e.start <= dateStr && dateStr <= e.end);
}

// ---------- rendering: legend ----------

function renderLegend(events) {
  const panel = document.getElementById("legend-panel");
  panel.innerHTML = "";

  const byCountry = {};
  for (const ev of events) {
    if (ev.type !== "stay" || !ev.country) continue;
    const loc = ev.location || "Unknown";
    byCountry[ev.country] = byCountry[ev.country] || new Set();
    byCountry[ev.country].add(loc);
  }

  const countries = Object.keys(byCountry).sort();
  for (const country of countries) {
    const group = document.createElement("div");
    group.className = "legend-group";
    const title = document.createElement("div");
    title.className = "country-name";
    title.textContent = country;
    group.appendChild(title);

    Array.from(byCountry[country]).sort().forEach((loc) => {
      const item = document.createElement("div");
      item.className = "legend-item";
      const sw = document.createElement("span");
      sw.className = "legend-swatch";
      sw.style.background = colorMap[country + "||" + loc] || "#888";
      item.appendChild(sw);
      const lbl = document.createElement("span");
      lbl.textContent = loc;
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

  panel.appendChild(misc);
}

// ---------- rendering: calendar ----------

function renderMonths(events) {
  const grid = document.getElementById("months-grid");
  grid.innerHTML = "";
  const today = todayIso();

  for (let m = 1; m <= 12; m++) {
    const card = document.createElement("div");
    card.className = "month-card";

    const h3 = document.createElement("h3");
    h3.textContent = `${MONTH_NAMES[m - 1]} ${selectedYear}`;
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

    const firstDow = new Date(selectedYear, m - 1, 1).getDay();
    const daysInMonth = new Date(selectedYear, m, 0).getDate();

    for (let i = 0; i < firstDow; i++) {
      const empty = document.createElement("div");
      empty.className = "day-cell empty";
      dayGrid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = isoDate(selectedYear, m, d);
      const dayEvents = eventsForDate(events, dateStr);
      const stays = dayEvents.filter((e) => e.type === "stay");
      const travel = dayEvents.filter((e) => e.type !== "stay");

      const cell = document.createElement("div");
      cell.className = "day-cell";
      if (dateStr === today) cell.classList.add("today");
      if (dayEvents.length) cell.classList.add("has-events");

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
        stays.slice(1, 4).forEach((e) => {
          const seg = document.createElement("span");
          seg.style.background = stayColor(e);
          strip.appendChild(seg);
        });
        cell.appendChild(strip);
      }

      if (travel.length) {
        const anyCancelled = travel.every((e) => e.cancelled);
        const marker = document.createElement("div");
        marker.className = "transit-marker dashed";
        marker.style.opacity = anyCancelled ? "0.5" : "1";
        marker.textContent = travel[0].emoji || (travel[0].type === "flight" ? "✈️" : "🏍");
        cell.appendChild(marker);
        if (travel.some((e) => e.cancelled)) {
          const badge = document.createElement("span");
          badge.className = "cancelled-badge";
          badge.textContent = "❌";
          cell.appendChild(badge);
        }
      }

      if (dayEvents.length) {
        const titleParts = dayEvents.map((e) => {
          const range = e.start === e.end ? e.start : `${e.start} → ${e.end}`;
          const cancelled = e.cancelled ? " (cancelled)" : "";
          return `${e.emoji || ""} ${e.label}${cancelled} [${range}]`;
        });
        cell.title = titleParts.join("\n");
        cell.addEventListener("click", (ev) => openDayPopover(ev, dayEvents));
      }

      dayGrid.appendChild(cell);
    }

    card.appendChild(dayGrid);
    grid.appendChild(card);
  }
}

function renderAll() {
  rebuildColorMap();
  const events = filteredEvents();
  renderLegend(events);
  renderMonths(events);
}

// ---------- year selector ----------

function populateYearSelect() {
  const sel = document.getElementById("year-select");
  const years = state.events.map((e) => parseInt(e.start.slice(0, 4), 10));
  const nowYear = new Date().getFullYear();
  years.push(nowYear);
  let minYear = Math.min(...years) - 1;
  let maxYear = Math.max(...years) + 1;

  sel.innerHTML = "";
  for (let y = minYear; y <= maxYear; y++) {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    sel.appendChild(opt);
  }
  if (!years.includes(selectedYear)) {
    // keep selectedYear if within new bounds, else default to current year
    selectedYear = years.includes(nowYear) ? nowYear : minYear;
  }
  sel.value = selectedYear;
}

// ---------- day popover ----------

function closeDayPopover() {
  document.getElementById("day-popover").classList.add("hidden");
}

function openDayPopover(clickEvent, dayEvents) {
  clickEvent.stopPropagation();
  const pop = document.getElementById("day-popover");
  pop.innerHTML = "";

  const header = document.createElement("div");
  header.className = "pop-header";
  header.innerHTML = `<span>${dayEvents.length} event${dayEvents.length > 1 ? "s" : ""}</span>`;
  pop.appendChild(header);

  dayEvents.forEach((ev) => {
    const row = document.createElement("div");
    row.className = "pop-event" + (ev.cancelled ? " cancelled" : "");
    const sw = document.createElement("span");
    sw.className = "sw";
    sw.style.background = ev.type === "stay" ? stayColor(ev) : "transparent";
    if (ev.type !== "stay") sw.style.border = "1.5px dashed rgba(255,255,255,0.6)";
    row.appendChild(sw);
    const lbl = document.createElement("span");
    lbl.className = "lbl";
    lbl.textContent = `${ev.emoji || ""} ${ev.label}`.trim();
    row.appendChild(lbl);
    row.addEventListener("click", () => {
      closeDayPopover();
      openEventModal(ev);
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

document.addEventListener("click", (e) => {
  const pop = document.getElementById("day-popover");
  if (!pop.contains(e.target)) closeDayPopover();
});

// ---------- event add/edit modal ----------

function setFormMode(type) {
  document.getElementById("stay-fields").classList.toggle("hidden", type !== "stay");
  document.getElementById("route-fields").classList.toggle("hidden", type === "stay");
}

function openEventModal(ev) {
  const overlay = document.getElementById("event-modal-overlay");
  const title = document.getElementById("event-modal-title");
  const deleteBtn = document.getElementById("f-delete");

  document.getElementById("f-id").value = ev ? ev.id : "";
  document.getElementById("f-person").value = ev ? ev.person : (selectedPeople.has("B") ? "B" : "M");
  document.getElementById("f-type").value = ev ? ev.type : "stay";
  document.getElementById("f-start").value = ev ? ev.start : "";
  document.getElementById("f-end").value = ev ? ev.end : "";
  document.getElementById("f-location").value = ev ? (ev.location || "") : "";
  document.getElementById("f-country").value = ev ? (ev.country || "") : "";
  document.getElementById("f-from").value = ev ? (ev.from || "") : "";
  document.getElementById("f-to").value = ev ? (ev.to || "") : "";
  document.getElementById("f-label").value = ev ? ev.label : "";
  document.getElementById("f-emoji").value = ev ? (ev.emoji || "") : "";
  document.getElementById("f-cancelled").checked = ev ? !!ev.cancelled : false;

  setFormMode(ev ? ev.type : "stay");
  title.textContent = ev ? "Edit Event" : "Add Event";
  deleteBtn.classList.toggle("hidden", !ev);
  overlay.classList.remove("hidden");
}

function closeEventModal() {
  document.getElementById("event-modal-overlay").classList.add("hidden");
}

document.getElementById("f-type").addEventListener("change", (e) => setFormMode(e.target.value));

document.getElementById("event-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("f-id").value || uid();
  const type = document.getElementById("f-type").value;
  const start = document.getElementById("f-start").value;
  const end = document.getElementById("f-end").value || start;

  if (end < start) {
    alert("End date must be on or after the start date.");
    return;
  }

  const ev = {
    id,
    person: document.getElementById("f-person").value,
    type,
    start,
    end,
    label: document.getElementById("f-label").value.trim(),
    emoji: document.getElementById("f-emoji").value.trim()
  };

  if (type === "stay") {
    ev.location = document.getElementById("f-location").value.trim();
    ev.country = document.getElementById("f-country").value.trim();
  } else {
    ev.from = document.getElementById("f-from").value.trim();
    ev.to = document.getElementById("f-to").value.trim();
  }

  const cancelled = document.getElementById("f-cancelled").checked;
  if (cancelled) ev.cancelled = true;

  if (!ev.label) {
    ev.label = type === "stay" ? (ev.location || "Untitled") : `${ev.from || "?"} → ${ev.to || "?"}`;
  }

  const idx = state.events.findIndex((x) => x.id === id);
  if (idx >= 0) state.events[idx] = ev;
  else state.events.push(ev);

  persist();
  populateYearSelect();
  renderAll();
  renderManageList();
  closeEventModal();
  showToast(idx >= 0 ? "Event updated" : "Event added");
});

document.getElementById("f-cancel").addEventListener("click", closeEventModal);
document.getElementById("event-modal-overlay").addEventListener("click", (e) => {
  if (e.target.id === "event-modal-overlay") closeEventModal();
});

document.getElementById("f-delete").addEventListener("click", () => {
  const id = document.getElementById("f-id").value;
  if (!id) return;
  if (!confirm("Delete this event?")) return;
  state.events = state.events.filter((x) => x.id !== id);
  persist();
  populateYearSelect();
  renderAll();
  renderManageList();
  closeEventModal();
  showToast("Event deleted");
});

document.getElementById("btn-add-event").addEventListener("click", () => openEventModal(null));

// ---------- manage events modal ----------

function renderManageList() {
  const container = document.getElementById("manage-list");
  container.innerHTML = "";
  const sorted = [...state.events].sort((a, b) => a.start.localeCompare(b.start));

  if (!sorted.length) {
    container.innerHTML = '<p class="hint">No events yet.</p>';
    return;
  }

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.style.fontSize = "12.5px";

  sorted.forEach((ev) => {
    const row = document.createElement("tr");
    row.style.borderBottom = "1px solid var(--border)";

    const range = ev.start === ev.end ? ev.start : `${ev.start} → ${ev.end}`;
    const where = ev.type === "stay" ? `${ev.location || ""}${ev.country ? ", " + ev.country : ""}` : `${ev.from || "?"} → ${ev.to || "?"}`;
    const person = ev.person === "M" ? "♀ Mariana" : "♂ Bharath";

    row.innerHTML = `
      <td style="padding:7px 6px;white-space:nowrap;">${range}</td>
      <td style="padding:7px 6px;white-space:nowrap;">${person}</td>
      <td style="padding:7px 6px;">${ev.emoji || ""} ${ev.label}${ev.cancelled ? " ❌" : ""}</td>
      <td style="padding:7px 6px;color:var(--text-dim);">${where}</td>
      <td style="padding:7px 6px;text-align:right;white-space:nowrap;">
        <button data-id="${ev.id}" class="edit-btn">Edit</button>
      </td>
    `;
    table.appendChild(row);
  });

  container.appendChild(table);

  container.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ev = state.events.find((x) => x.id === btn.dataset.id);
      closeManageModal();
      openEventModal(ev);
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
document.getElementById("btn-manage").addEventListener("click", openManageModal);
document.getElementById("manage-close").addEventListener("click", closeManageModal);
document.getElementById("manage-modal-overlay").addEventListener("click", (e) => {
  if (e.target.id === "manage-modal-overlay") closeManageModal();
});

// ---------- copy JSON ----------

function openJsonModal() {
  const sorted = {
    people: state.people,
    events: [...state.events].sort((a, b) => a.start.localeCompare(b.start))
  };
  document.getElementById("json-output").value = JSON.stringify(sorted, null, 2);
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
  sel.addEventListener("change", () => {
    selectedYear = parseInt(sel.value, 10);
    renderAll();
  });
  document.getElementById("year-prev").addEventListener("click", () => {
    const idx = sel.selectedIndex;
    if (idx > 0) sel.selectedIndex = idx - 1;
    selectedYear = parseInt(sel.value, 10);
    renderAll();
  });
  document.getElementById("year-next").addEventListener("click", () => {
    const idx = sel.selectedIndex;
    if (idx < sel.options.length - 1) sel.selectedIndex = idx + 1;
    selectedYear = parseInt(sel.value, 10);
    renderAll();
  });
}

// ---------- reset ----------

document.getElementById("btn-reset").addEventListener("click", async () => {
  if (!confirm("Discard local edits and reload data from data.json?")) return;
  localStorage.removeItem(STORAGE_KEY);
  await loadData();
  populateYearSelect();
  renderAll();
  showToast("Reset to data.json");
});

// ---------- boot ----------

(async function init() {
  await loadData();
  setupPersonChips();
  populateYearSelect();
  setupYearControls();
  renderAll();
})();
