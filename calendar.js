// ---------- rendering: legend ----------

function renderLegend(locations) {
  const panel = document.getElementById("legend-panel");
  panel.innerHTML = "";

  const byCountry = {};
  for (const loc of locations) {
    if (!loc.country) continue;
    const l = stayLocationName(loc);
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
  card.id = monthId(year, month);
  card.dataset.year = String(year);
  card.dataset.month = String(month);
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
      item.title = isTransitCountry(loc.country)
        ? TRANSIT_COUNTRY
        : loc.country
          ? `${loc.location}, ${loc.country}`
          : loc.location;
      const sw = document.createElement("span");
      sw.className = "legend-swatch";
      sw.style.background = stayColor(loc);
      item.appendChild(sw);
      const lbl = document.createElement("span");
      lbl.textContent = stayLocationName(loc);
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
    cell.classList.add("dow-" + ((firstDow + d - 1) % 7));
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
    const heading = document.createElement("div");
    heading.className = "year-heading";
    const missing = countMissingDays(locations, y);
    if (missing === 0) {
      const check = document.createElement("span");
      check.className = "year-complete";
      check.textContent = "✅";
      check.setAttribute("aria-hidden", "true");
      heading.appendChild(check);
    }
    const yearLabel = document.createElement("span");
    yearLabel.className = "year-label";
    yearLabel.textContent = String(y);
    heading.appendChild(yearLabel);

    if (y === realCurrentYear()) {
      const remaining = Math.max(0, isoDaysInclusive(todayIso(), `${y}-12-31`));
      const go = document.createElement("span");
      go.className = "year-days-to-go";
      go.textContent = `${remaining} day${remaining === 1 ? "" : "s"} to go`;
      heading.appendChild(go);
    }

    const moves = countMovesInYear(locations, y);
    if (moves > 0) {
      const moveEl = document.createElement("span");
      moveEl.className = "year-moves";
      moveEl.textContent = `${moves} move${moves === 1 ? "" : "s"}`;
      heading.appendChild(moveEl);
    }
    title.appendChild(heading);

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
      const donut = buildYearDonut(stats);
      if (donut) row.prepend(donut);
      title.appendChild(row);
    }
    if (missing > 0) {
      const miss = document.createElement("span");
      miss.className = "year-missing";
      miss.textContent = `Missing ${missing} day${missing === 1 ? "" : "s"}`;
      title.appendChild(miss);
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
  if (document.body.dataset.tab === "spiral") rebuildSpiral();
  if (opts.year !== undefined) {
    scrollToMonth(opts.year, opts.month || 1, { smooth: false });
    return;
  }
  window.scrollTo({ top: savedScroll, behavior: "auto" });
}

// ---------- year navigation / scroll-spy ----------

function clampYear(y) {
  return Math.min(Math.max(y, YEAR_START), yearEnd);
}

function clampMonth(m) {
  return Math.min(Math.max(m, 1), 12);
}

function monthId(year, month) {
  return `m${year}-${pad2(month)}`;
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
  scrollToMonth(year, 1, { smooth });
}

function scrollToMonth(year, month, { smooth = false } = {}) {
  const y = clampYear(year);
  const m = clampMonth(month);
  setCurrentView(y, m);
  const el =
    m === 1
      ? document.getElementById("y" + y)
      : document.getElementById(monthId(y, m));
  if (!el) return;
  let offset = stickyHeaderHeight();
  if (m !== 1) {
    const title = document.querySelector(`#y${y} .year-title`);
    if (title) offset += title.offsetHeight;
  }
  const top =
    el.getBoundingClientRect().top + window.scrollY - offset - 8;
  window.scrollTo({
    top: Math.max(0, top),
    behavior: smooth ? "smooth" : "auto",
  });
}

function setCurrentView(year, month) {
  const y = clampYear(year);
  const m = clampMonth(month);
  currentYear = y;
  currentMonth = m;
  const sel = document.getElementById("year-select");
  if (sel && sel.value !== String(y)) sel.value = String(y);
  const hash = `#${y}-${pad2(m)}`;
  const next = location.pathname + location.search + hash;
  if (location.pathname + location.search + location.hash !== next) {
    history.replaceState(null, "", next);
  }
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
          setCurrentView(
            parseInt(entry.target.dataset.year, 10),
            currentMonth || 1,
          );
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

function parseHashView() {
  const raw = (location.hash || "").replace(/^#/, "");
  if (raw === "spiral") return { tab: "spiral" };
  const match = raw.match(/^(\d{4})(?:-(\d{1,2}))?$/);
  if (!match) return null;
  const year = parseInt(match[1], 10);
  const month = match[2] != null ? parseInt(match[2], 10) : 1;
  if (!Number.isFinite(year)) return null;
  return {
    tab: "location",
    year,
    month: Number.isFinite(month) && month >= 1 && month <= 12 ? month : 1,
  };
}

function defaultView() {
  return { year: realCurrentYear(), month: realCurrentMonth() };
}

function goToToday() {
  if (document.body.dataset.tab === "spiral") {
    focusSpiralToday();
    return;
  }
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
    setCurrentView(realCurrentYear(), realCurrentMonth());
  } else {
    scrollToMonth(realCurrentYear(), realCurrentMonth(), { smooth: true });
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

function appendStayRow(row, loc) {
  const sw = document.createElement("span");
  sw.className = "sw";
  sw.style.background = stayColor(loc);
  row.appendChild(sw);
  const flag = countryFlag(loc.country);
  if (flag) {
    const mark = document.createElement("span");
    mark.className = "flag";
    mark.textContent = flag;
    row.appendChild(mark);
  }
  const lbl = document.createElement("span");
  lbl.className = "lbl";
  lbl.textContent = stayTitle(loc);
  row.appendChild(lbl);
  const who = document.createElement("span");
  who.className = "who";
  who.textContent = stayPersonMark(loc);
  row.appendChild(who);
}

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
    appendStayRow(row, loc);
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
  names.delete(TRANSIT_COUNTRY);
  const sorted = Array.from(names).sort((a, b) => a.localeCompare(b));
  sel.innerHTML = '<option value="">Select country</option>';
  [TRANSIT_COUNTRY, ...sorted].forEach((name) => {
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
    if (toggle.disabled) return;
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
  const country = document.getElementById("f-country").value;
  const flag = countryFlag(country);
  el.textContent = flag;
  el.classList.toggle("hidden", !flag);
  syncLocationFieldForCountry(country);
}

function syncLocationFieldForCountry(country) {
  const transit = isTransitCountry(country);
  const input = document.getElementById("f-location");
  const toggle = document.getElementById("f-location-toggle");
  const row = input.closest(".form-row");
  input.disabled = transit;
  toggle.disabled = transit;
  if (row) row.classList.toggle("is-disabled", transit);
  if (transit) {
    input.value = "";
    closeLocationSuggestions();
  }
}

function openLocationModal(loc, prefillStart, prefillEnd) {
  const overlay = document.getElementById("location-modal-overlay");
  const title = document.getElementById("location-modal-title");
  const deleteBtn = document.getElementById("f-delete");

  document.getElementById("f-id").value = loc ? loc.id : "";
  document.getElementById("f-person").value = loc
    ? loc.person || "B"
    : currentPeopleSelection();
  document.getElementById("f-start").value = loc
    ? loc.start
    : prefillStart || "";
  document.getElementById("f-end").value = loc
    ? loc.end
    : prefillEnd || prefillStart || "";
  document.getElementById("f-location").value = loc ? loc.location || "" : "";
  populateCountrySelect(loc ? canonicalCountry(loc.country) : "");
  document.getElementById("f-comments").value = loc ? loc.comments || "" : "";

  title.textContent = loc ? "Edit Location" : "Add Location";
  deleteBtn.classList.toggle("hidden", !loc);
  closeLocationSuggestions();
  overlay.classList.remove("hidden");
  if (!loc) {
    const input = document.getElementById("f-location");
    requestAnimationFrame(() => {
      input.focus();
      input.select();
    });
  }
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

  const country = canonicalCountry(
    document.getElementById("f-country").value,
  );
  const location = isTransitCountry(country)
    ? ""
    : document.getElementById("f-location").value.trim();
  const loc = {
    id,
    person: document.getElementById("f-person").value,
    start,
    end,
    location,
    country,
    comments: stayComments(
      location,
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
    const where = isTransitCountry(loc.country)
      ? TRANSIT_COUNTRY
      : `${loc.location || ""}${loc.country ? ", " + loc.country : ""}`;
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

// ---------- save to GitHub ----------

document.getElementById("btn-save").addEventListener("click", startGithubSave);
document
  .getElementById("btn-save-banner")
  .addEventListener("click", startGithubSave);

// ---------- settings ----------

function openSettingsModal() {
  applyTripMidOpacity(settings.tripMidOpacity);
  applyLayoutSettings();
  document.getElementById("settings-modal-overlay").classList.remove("hidden");
}

function setupSettingsControls() {
  const slider = document.getElementById("s-trip-mid");
  slider.addEventListener("input", () => {
    applyTripMidOpacity(slider.value);
    persistSettings();
  });
  document.getElementById("s-year-chips").addEventListener("change", (e) => {
    settings.yearChips = e.target.checked ? "show" : "hide";
    persistSettings();
    applyLayoutSettings();
  });
  document.querySelectorAll(".setting-seg .seg").forEach((group) => {
    group.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-value]");
      if (!btn || !group.contains(btn)) return;
      const key =
        group.id === "s-day-nums"
          ? "dayNums"
          : group.id === "s-cell-h"
            ? "cellH"
            : group.id === "s-cell-w"
              ? "cellW"
              : group.id === "s-chip-size"
                ? "chipSize"
                : null;
      if (!key) return;
      settings[key] = btn.dataset.value;
      persistSettings();
      applyLayoutSettings();
    });
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

function setupPeopleFilter() {
  const filter = document.getElementById("people-filter");
  filter.value = currentPeopleSelection();
  filter.addEventListener("change", () => {
    selectPeople(filter.value);
    persistSettings();
      renderAll();
  });
}

function setupYearControls() {
  const sel = document.getElementById("year-select");
  sel.addEventListener("change", () =>
    scrollToMonth(parseInt(sel.value, 10), currentMonth || 1, { smooth: true }),
  );
  document.getElementById("year-prev").addEventListener("click", () => {
    scrollToMonth(
      (currentYear || realCurrentYear()) - 1,
      currentMonth || 1,
      { smooth: true },
    );
  });
  document.getElementById("year-next").addEventListener("click", () => {
    scrollToMonth(
      (currentYear || realCurrentYear()) + 1,
      currentMonth || 1,
      { smooth: true },
    );
  });
  document.getElementById("btn-today").addEventListener("click", goToToday);
  document.getElementById("btn-spiral-full").addEventListener("click", () => {
    if (document.body.dataset.tab !== "spiral") setActiveTab("spiral");
    focusSpiralFull();
  });
  document.getElementById("btn-legend").addEventListener("click", () => {
    const panel = document.getElementById("legend-panel");
    const btn = document.getElementById("btn-legend");
    const opening = panel.classList.contains("hidden");
    panel.classList.toggle("hidden", !opening);
    btn.setAttribute("aria-pressed", opening ? "true" : "false");
  });
  const bar = document.querySelector(".controls-bar");
  const toggle = document.getElementById("btn-controls");
  if (bar && toggle) {
    toggle.addEventListener("click", () => {
      const open = bar.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      syncStickyOffset();
    });
  }
}

// ---------- reset ----------

document.getElementById("btn-reset").addEventListener("click", async () => {
  if (!confirm("Discard local edits and reload data from data.json?")) return;
  stopSaveWatch();
  if (settings.pendingSaveCanonical) {
    delete settings.pendingSaveCanonical;
    persistSettings();
  }
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
  closeSettingsModal();
  closeDayPopover();
  closeCountryTooltip();
});

