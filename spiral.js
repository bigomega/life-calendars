// ---------- spiral tab (canvas helix) ----------

const SPIRAL_R = 1;
const SPIRAL_HALF = 0.26;
const SPIRAL_THICK = 0.07;
const SPIRAL_PITCH = 0.68;
const SPIRAL_INNER = SPIRAL_R - SPIRAL_HALF;
const SPIRAL_OUTER = SPIRAL_R + SPIRAL_HALF;
const SPIRAL_EMPTY = "hsl(220, 10%, 30%)";
const SPIRAL_EMPTY_FUTURE = "hsl(220, 8%, 22%)";

const spiral = {
  yaw: 0.62,
  pitch: 0.62,
  zoom: 1.15,
  lookY: 0,
  dirty: true,
  running: false,
  faces: [],
  ticks: [],
  rims: [],
  flags: [],
  labels: [],
  hover: null,
  raf: 0,
  dragging: false,
  moved: false,
  lastX: 0,
  lastY: 0,
  pointerId: null,
  anim: null,
  yearCount: 1,
  startYear: YEAR_START,
  savedScrollY: 0,
};

function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInYear(year) {
  return isLeapYear(year) ? 366 : 365;
}

function dayOfYear(year, month, day) {
  const dim = [0, 31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let n = day;
  for (let i = 1; i < month; i++) n += dim[i];
  return n;
}

function spiralDataYears(locations) {
  return (locations || [])
    .map((l) => parseInt(String(l.start || "").slice(0, 4), 10))
    .filter((y) => !Number.isNaN(y));
}

function spiralMonthLabelFrom(lastDate) {
  if (!lastDate) return null;
  const [y, m] = lastDate.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1 - 11, 1));
  return isoDate(start.getUTCFullYear(), start.getUTCMonth() + 1, 1);
}

function spiralLastDate(locations) {
  let last = "";
  for (const l of locations || []) {
    const end = l.end || l.start || "";
    if (end > last) last = end;
  }
  return last;
}

function spiralYearStart(locations) {
  const years = spiralDataYears(locations);
  const minData = years.length ? Math.min(...years) : YEAR_START;
  return Math.max(YEAR_START, minData);
}

function spiralYearEnd(locations) {
  const last = spiralLastDate(locations);
  if (last) return parseInt(last.slice(0, 4), 10);
  return spiralYearStart(locations);
}

function spiralT(year, month, day) {
  const total = daysInYear(year);
  return year - spiral.startYear + (dayOfYear(year, month, day) - 1) / total;
}

function helixPoint(t, radius, yOff = 0) {
  const a = t * Math.PI * 2;
  return {
    x: radius * Math.cos(a),
    y: t * SPIRAL_PITCH + yOff,
    z: radius * Math.sin(a),
  };
}

function shadeHsl(color, lightMul, satMul = 1) {
  const m = String(color).match(
    /hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)/i,
  );
  if (!m) return color;
  const s = Math.max(0, Math.min(100, parseFloat(m[2]) * satMul));
  const l = Math.max(6, Math.min(84, parseFloat(m[3]) * lightMul));
  return `hsl(${m[1]}, ${s}%, ${l}%)`;
}

function spiralDayColor(loc, iso, today) {
  if (!loc) return iso > today ? SPIRAL_EMPTY_FUTURE : SPIRAL_EMPTY;
  const base = stayColor(loc);
  return iso > today ? shadeHsl(base, 0.72, 0.75) : base;
}

function addSpiralFace(pts, color, meta) {
  spiral.faces.push({ pts, color, ...meta });
}

function rebuildSpiral() {
  const locations = filteredLocations();
  const today = todayIso();
  const yStart = spiralYearStart(locations);
  const yEnd = spiralYearEnd(locations);
  const lastDate = spiralLastDate(locations);
  const yearCount = Math.max(1, yEnd - yStart + 1);
  spiral.startYear = yStart;
  spiral.yearCount = yearCount;
  spiral.faces = [];
  spiral.ticks = [];
  spiral.rims = [];
  spiral.flags = [];
  spiral.labels = [];

  const top = SPIRAL_THICK / 2;
  const bot = -SPIRAL_THICK / 2;
  const labelFrom = spiralMonthLabelFrom(lastDate);
  let prevCountry = "";

  for (let year = yStart; year <= yEnd; year++) {
    const total = daysInYear(year);
    let month = 1;
    let day = 1;
    let remain = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let drewYear = false;

    for (let i = 0; i < total; i++) {
      const iso = isoDate(year, month, day);
      if (lastDate && iso > lastDate) break;
      drewYear = true;
      const locs = locationsForDate(locations, iso);
      const loc = locs[0] || null;
      const color = spiralDayColor(loc, iso, today);
      const t0 = (year - yStart) + i / total;
      const t1 = (year - yStart) + (i + 1) / total;
      const i0 = helixPoint(t0, SPIRAL_INNER, top);
      const o0 = helixPoint(t0, SPIRAL_OUTER, top);
      const o1 = helixPoint(t1, SPIRAL_OUTER, top);
      const i1 = helixPoint(t1, SPIRAL_INNER, top);
      const o0b = helixPoint(t0, SPIRAL_OUTER, bot);
      const o1b = helixPoint(t1, SPIRAL_OUTER, bot);
      const isToday = iso === today;
      addSpiralFace([i0, o0, o1, i1], color, {
        kind: "day",
        date: iso,
        loc,
        highlight: isToday,
      });
      addSpiralFace([o0, o0b, o1b, o1], shadeHsl(color, 0.72), {
        kind: "edge",
        date: iso,
        loc,
      });
      spiral.rims.push({
        a: helixPoint(t0, SPIRAL_INNER, top + 0.006),
        b: helixPoint(t1, SPIRAL_INNER, top + 0.006),
      });

      if (day === 1) {
        const lift = top + 0.008;
        const weight =
          month === 1
            ? "year"
            : month === 4 || month === 7 || month === 10
              ? "quarter"
              : "month";
        const tick = {
          a: helixPoint(t0, SPIRAL_INNER, lift),
          b: helixPoint(t0, SPIRAL_OUTER, lift),
          weight,
        };
        if (labelFrom && iso >= labelFrom) {
          tick.label = MONTH_SHORT[month - 1];
          tick.labelP = helixPoint(
            t0 + 0.016,
            (SPIRAL_INNER + SPIRAL_OUTER) / 2,
            lift,
          );
        }
        spiral.ticks.push(tick);
      }

      if (iso === today) {
        spiral.labels.push({
          text: "Today",
          p: helixPoint(t0, SPIRAL_OUTER + 0.06, top),
        });
      }

      const country = loc ? canonicalCountry(loc.country) : "";
      if (country && country !== prevCountry) {
        const flag = countryFlag(country);
        if (flag) {
          spiral.flags.push({
            p: helixPoint(
              t0,
              (SPIRAL_INNER + SPIRAL_OUTER) / 2,
              top + 0.03,
            ),
            flag,
            country,
          });
        }
      }
      prevCountry = country;

      day += 1;
      if (day > remain[month - 1]) {
        day = 1;
        month += 1;
      }
    }

    if (drewYear) {
      spiral.labels.push({
        text: String(year),
        p: helixPoint(year - yStart, SPIRAL_OUTER + 0.22, top),
      });
    }
  }

  if (!spiral.centered) applySpiralHomeView();
  spiral.dirty = true;
}

function rotateSpiralPoint(p) {
  const y = p.y - spiral.lookY;
  const cy = Math.cos(spiral.yaw);
  const sy = Math.sin(spiral.yaw);
  const x1 = p.x * cy - p.z * sy;
  const z1 = p.x * sy + p.z * cy;
  const cp = Math.cos(spiral.pitch);
  const sp = Math.sin(spiral.pitch);
  return { x: x1, y: y * cp - z1 * sp, z: y * sp + z1 * cp };
}

function projectSpiral(p, w, h) {
  const r = rotateSpiralPoint(p);
  const dist = 4.4;
  const z = r.z + dist;
  const f = Math.min(w, h) * 0.46 * spiral.zoom;
  return {
    x: r.x,
    y: r.y,
    z,
    sx: w / 2 + (r.x * f) / z,
    sy: h / 2 - (r.y * f) / z,
  };
}

function quadNormal(pts) {
  const a = pts[0];
  const b = pts[1];
  const c = pts[2];
  const ux = b.x - a.x;
  const uy = b.y - a.y;
  const uz = b.z - a.z;
  const vx = c.x - a.x;
  const vy = c.y - a.y;
  const vz = c.z - a.z;
  const nx = uy * vz - uz * vy;
  const ny = uz * vx - ux * vz;
  const nz = ux * vy - uy * vx;
  const len = Math.hypot(nx, ny, nz) || 1;
  return { x: nx / len, y: ny / len, z: nz / len };
}

function lightFace(color, pts) {
  if (color.startsWith("rgba")) return color;
  const n = quadNormal(pts);
  const lit = 0.6 + 0.4 * Math.max(0, n.x * 0.22 + n.y * 0.84 + n.z * 0.38);
  return shadeHsl(color, lit);
}

function pointInTri(px, py, a, b, c) {
  const v0x = c.sx - a.sx;
  const v0y = c.sy - a.sy;
  const v1x = b.sx - a.sx;
  const v1y = b.sy - a.sy;
  const v2x = px - a.sx;
  const v2y = py - a.sy;
  const den = v0x * v1y - v1x * v0y;
  if (Math.abs(den) < 1e-6) return false;
  const u = (v2x * v1y - v1x * v2y) / den;
  const v = (v0x * v2y - v2x * v0y) / den;
  return u >= 0 && v >= 0 && u + v <= 1;
}

function pointInQuad(px, py, q) {
  return (
    pointInTri(px, py, q[0], q[1], q[2]) || pointInTri(px, py, q[0], q[2], q[3])
  );
}

function formatSpiralDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTH_SHORT[m - 1]} ${y}`;
}

function fillSpiralHud(hud, hit) {
  hud.innerHTML = "";
  const locs = hit.loc
    ? locationsForDate(filteredLocations(), hit.date)
    : [];
  const header = document.createElement("div");
  header.className = "pop-header";
  const when = document.createElement("span");
  when.textContent = formatSpiralDate(hit.date);
  header.appendChild(when);
  if (locs.length) {
    const count = document.createElement("span");
    count.textContent = `${locs.length} location${locs.length > 1 ? "s" : ""}`;
    header.appendChild(count);
  }
  hud.appendChild(header);
  if (!locs.length) {
    const empty = document.createElement("div");
    empty.className = "pop-event";
    empty.textContent = "No location";
    hud.appendChild(empty);
    return;
  }
  locs.forEach((loc) => {
    const row = document.createElement("div");
    row.className = "pop-event";
    appendStayRow(row, loc);
    hud.appendChild(row);
  });
}

function syncSpiralHud(hit, clientX, clientY) {
  const hud = document.getElementById("spiral-hud");
  if (!hud) return;
  if (!hit || hit.kind !== "day") {
    hud.classList.add("hidden");
    hud.dataset.date = "";
    hud.innerHTML = "";
    return;
  }
  if (hud.dataset.date !== hit.date) {
    hud.dataset.date = hit.date;
    fillSpiralHud(hud, hit);
  }
  hud.classList.remove("hidden");
  const pad = 12;
  const rect = hud.getBoundingClientRect();
  let x = clientX + pad;
  let y = clientY + pad;
  if (x + rect.width > window.innerWidth - 8)
    x = Math.max(8, clientX - rect.width - pad);
  if (y + rect.height > window.innerHeight - 8)
    y = Math.max(8, clientY - rect.height - pad);
  hud.style.left = x + "px";
  hud.style.top = y + "px";
}

function spiralInCloserHole(pr, projected, w, h) {
  const seen = new Set();
  for (const item of projected) {
    if (item.face.kind !== "day") continue;
    if (item.z >= pr.z - 0.05) continue;
    const y = (item.face.pts[0].y + item.face.pts[2].y) / 2;
    const key = Math.round(y * 10);
    if (seen.has(key)) continue;
    seen.add(key);
    const c = projectSpiral({ x: 0, y, z: 0 }, w, h);
    let rx = 10;
    let ry = 10;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const rim = projectSpiral(
        {
          x: SPIRAL_INNER * Math.cos(a),
          y,
          z: SPIRAL_INNER * Math.sin(a),
        },
        w,
        h,
      );
      rx = Math.max(rx, Math.abs(rim.sx - c.sx));
      ry = Math.max(ry, Math.abs(rim.sy - c.sy));
    }
    rx *= 1.08;
    ry *= 1.08;
    const nx = (pr.sx - c.sx) / rx;
    const ny = (pr.sy - c.sy) / ry;
    if (nx * nx + ny * ny < 1) return true;
  }
  return false;
}

function spiralCoveredByCloserBand(pr, projected) {
  for (const item of projected) {
    const kind = item.face.kind;
    if (kind !== "day" && kind !== "edge") continue;
    if (item.z >= pr.z - 0.08) continue;
    if (pointInQuad(pr.sx, pr.sy, item.pts)) return true;
  }
  return false;
}

function spiralOnVisibleBand(p, projected, w, h) {
  const pr = projectSpiral(p, w, h);
  if (pr.z <= 0.25) return false;
  if (spiralInCloserHole(pr, projected, w, h)) return false;
  let onBand = false;
  for (const item of projected) {
    const kind = item.face.kind;
    if (kind !== "day" && kind !== "edge") continue;
    if (!pointInQuad(pr.sx, pr.sy, item.pts)) continue;
    if (item.z < pr.z - 0.1) return false;
    if (Math.abs(item.z - pr.z) < 0.24) onBand = true;
  }
  return onBand;
}

function resizeSpiralCanvas() {
  const canvas = document.getElementById("spiral-canvas");
  const view = document.getElementById("spiral-view");
  if (!canvas || !view) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, view.clientWidth);
  const h = Math.max(1, view.clientHeight);
  const pw = Math.round(w * dpr);
  const ph = Math.round(h * dpr);
  if (canvas.width !== pw || canvas.height !== ph) {
    canvas.width = pw;
    canvas.height = ph;
  }
  spiral.dirty = true;
}

function drawSpiral() {
  const canvas = document.getElementById("spiral-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#0f1216";
  ctx.fillRect(0, 0, w, h);

  const projected = spiral.faces.map((face) => {
    const pts = face.pts.map((p) => projectSpiral(p, w, h));
    const z = (pts[0].z + pts[1].z + pts[2].z + pts[3].z) / 4;
    return { face, pts, z };
  });
  projected.sort((a, b) => b.z - a.z);

  for (const item of projected) {
    const { face, pts } = item;
    if (pts.some((p) => p.z <= 0.2)) continue;
    ctx.beginPath();
    ctx.moveTo(pts[0].sx, pts[0].sy);
    ctx.lineTo(pts[1].sx, pts[1].sy);
    ctx.lineTo(pts[2].sx, pts[2].sy);
    ctx.lineTo(pts[3].sx, pts[3].sy);
    ctx.closePath();
    let fill = face.kind === "month" ? face.color : lightFace(face.color, face.pts);
    if (face.highlight) fill = shadeHsl(face.color, 1.18);
    if (spiral.hover && face.kind === "day" && face.date === spiral.hover.date)
      fill = shadeHsl(face.color, 1.22);
    ctx.fillStyle = fill;
    ctx.fill();
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  ctx.lineCap = "round";
  ctx.font = `${Math.round(10 * dpr)}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const tick of spiral.ticks) {
    const mid = {
      x: (tick.a.x + tick.b.x) / 2,
      y: (tick.a.y + tick.b.y) / 2,
      z: (tick.a.z + tick.b.z) / 2,
    };
    if (!spiralOnVisibleBand(mid, projected, w, h)) continue;
    const a = projectSpiral(tick.a, w, h);
    const b = projectSpiral(tick.b, w, h);
    ctx.beginPath();
    ctx.moveTo(a.sx, a.sy);
    ctx.lineTo(b.sx, b.sy);
    const tickStyle =
      tick.weight === "year"
        ? { color: "rgba(255,255,255,0.62)", width: 2.2 }
        : tick.weight === "quarter"
          ? { color: "rgba(255,255,255,0.5)", width: 1.9 }
          : { color: "rgba(255,255,255,0.28)", width: 1.15 };
    ctx.strokeStyle = tickStyle.color;
    ctx.lineWidth = tickStyle.width * dpr;
    ctx.stroke();
    if (tick.label && spiralOnVisibleBand(tick.labelP, projected, w, h)) {
      const lp = projectSpiral(tick.labelP, w, h);
      const tw = ctx.measureText(tick.label).width;
      const padX = 3.5 * dpr;
      const padY = 1.6 * dpr;
      const bw = tw + padX * 2;
      const bh = 10 * dpr + padY * 2;
      const bx = lp.sx - bw / 2;
      const by = lp.sy - bh / 2;
      const r = Math.min(3 * dpr, bh / 2);
      ctx.beginPath();
      ctx.moveTo(bx + r, by);
      ctx.arcTo(bx + bw, by, bx + bw, by + bh, r);
      ctx.arcTo(bx + bw, by + bh, bx, by + bh, r);
      ctx.arcTo(bx, by + bh, bx, by, r);
      ctx.arcTo(bx, by, bx + bw, by, r);
      ctx.closePath();
      ctx.fillStyle = "rgba(255,255,255,0.16)";
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.48)";
      ctx.fillText(tick.label, lp.sx, lp.sy);
    }
  }

  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 1.15 * dpr;
  ctx.lineJoin = "round";
  for (const rim of spiral.rims) {
    const mid = {
      x: (rim.a.x + rim.b.x) / 2,
      y: (rim.a.y + rim.b.y) / 2,
      z: (rim.a.z + rim.b.z) / 2,
    };
    const pr = projectSpiral(mid, w, h);
    if (pr.z <= 0.25) continue;
    if (spiralCoveredByCloserBand(pr, projected)) continue;
    const a = projectSpiral(rim.a, w, h);
    const b = projectSpiral(rim.b, w, h);
    if (a.z <= 0.2 || b.z <= 0.2) continue;
    ctx.beginPath();
    ctx.moveTo(a.sx, a.sy);
    ctx.lineTo(b.sx, b.sy);
    ctx.stroke();
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${Math.round(34 * dpr)}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
  ctx.fillStyle = "#fff";
  ctx.globalAlpha = 1;
  for (const mark of spiral.flags) {
    if (!spiralOnVisibleBand(mark.p, projected, w, h)) continue;
    const p = projectSpiral(mark.p, w, h);
    ctx.fillText(mark.flag, p.sx, p.sy);
    ctx.fillText(mark.flag, p.sx, p.sy);
  }
  ctx.globalAlpha = 1;

  ctx.font = `${Math.round(11 * dpr)}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  const labels = spiral.labels
    .map((lab) => ({ ...lab, p: projectSpiral(lab.p, w, h) }))
    .filter((lab) => {
      if (lab.p.z <= 0.4) return false;
      if (lab.text === "Today") return true;
      return !projected.some(
        (item) =>
          (item.face.kind === "day" || item.face.kind === "edge") &&
          item.z < lab.p.z - 0.1 &&
          pointInQuad(lab.p.sx, lab.p.sy, item.pts),
      );
    })
    .sort((a, b) => b.p.z - a.p.z);
  for (const lab of labels) {
    let x = lab.p.sx;
    let y = lab.p.sy;
    if (lab.text === "Today") {
      const dx = x - w / 2;
      const dy = y - h / 2;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const emptyAt = (px, py) => {
        if (px < 2 || py < 2 || px > w - 3 || py > h - 3) return false;
        const d = ctx.getImageData(Math.round(px), Math.round(py), 1, 1).data;
        const spread = Math.max(d[0], d[1], d[2]) - Math.min(d[0], d[1], d[2]);
        return spread < 18 && d[0] < 90;
      };
      let dist = 18 * dpr;
      const limit = h - 16 * dpr;
      for (let step = 0; step < 22; step++) {
        const tx = lab.p.sx + ux * dist;
        const ty = lab.p.sy + uy * dist;
        if (ty >= limit) {
          x = lab.p.sx + ux * Math.max(12 * dpr, limit - lab.p.sy);
          y = limit;
          break;
        }
        if (emptyAt(tx, ty)) {
          x = tx;
          y = ty;
          break;
        }
        dist += 6 * dpr;
      }
    }
    if (x < 4 || y < 4 || x > w - 4 || y > h - 4) continue;
    ctx.fillStyle = "rgba(232,234,237,0.78)";
    ctx.fillText(lab.text, x, y);
  }
}

function pickSpiral(clientX, clientY) {
  const canvas = document.getElementById("spiral-canvas");
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const sx = ((clientX - rect.left) / rect.width) * canvas.width;
  const sy = ((clientY - rect.top) / rect.height) * canvas.height;
  const w = canvas.width;
  const h = canvas.height;
  let best = null;
  let bestZ = Infinity;
  for (const face of spiral.faces) {
    if (face.kind !== "day") continue;
    const pts = face.pts.map((p) => projectSpiral(p, w, h));
    if (pts.some((p) => p.z <= 0.2)) continue;
    if (!pointInQuad(sx, sy, pts)) continue;
    const z = (pts[0].z + pts[1].z + pts[2].z + pts[3].z) / 4;
    if (z < bestZ) {
      bestZ = z;
      best = face;
    }
  }
  return best;
}

function shortestAngle(from, to) {
  let d = to - from;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return from + d;
}

function stepSpiralAnim() {
  const anim = spiral.anim;
  if (!anim) return;
  const t = Math.min(1, (performance.now() - anim.t0) / anim.dur);
  const e = 1 - (1 - t) ** 3;
  spiral.yaw = anim.fromYaw + (anim.toYaw - anim.fromYaw) * e;
  spiral.lookY = anim.fromLook + (anim.toLook - anim.fromLook) * e;
  spiral.zoom = anim.fromZoom + (anim.toZoom - anim.fromZoom) * e;
  if (anim.fromPitch != null)
    spiral.pitch = anim.fromPitch + (anim.toPitch - anim.fromPitch) * e;
  spiral.dirty = true;
  if (t >= 1) spiral.anim = null;
}

function spiralLoop() {
  if (!spiral.running) return;
  stepSpiralAnim();
  if (spiral.dirty || spiral.dragging || spiral.anim) {
    drawSpiral();
    spiral.dirty = false;
  }
  spiral.raf = requestAnimationFrame(spiralLoop);
}

function spiralFocusT() {
  const today = todayIso();
  const last = spiralLastDate(filteredLocations());
  const iso = last && today > last ? last : today;
  const [y, m, d] = iso.split("-").map(Number);
  return spiralT(y, m, d);
}

function spiralPoseZoom(pose, { margin = 0.045, fit = "x", gap = 0, focusYear = false } = {}) {
  const canvas = document.getElementById("spiral-canvas");
  if (!canvas || canvas.width < 2 || canvas.height < 2) return pose.zoom || 2.6;
  const w = canvas.width;
  const h = canvas.height;
  const pad =
    gap > 0 ? gap * (w / Math.max(1, canvas.clientWidth || w)) : 0;
  const saved = {
    yaw: spiral.yaw,
    pitch: spiral.pitch,
    lookY: spiral.lookY,
    zoom: spiral.zoom,
  };
  spiral.yaw = pose.yaw;
  spiral.pitch = pose.pitch;
  spiral.lookY = pose.lookY;
  let zoom = pose.zoom || 1.8;
  const lifts = [SPIRAL_THICK / 2, -SPIRAL_THICK / 2];
  for (let iter = 0; iter < 10; iter++) {
    spiral.zoom = zoom;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let n = 0;
    const focusYi = Math.min(
      spiral.yearCount - 1,
      Math.max(0, Math.floor(spiralFocusT())),
    );
    for (let yi = 0; yi < spiral.yearCount; yi++) {
      if (focusYear && yi !== focusYi) continue;
      for (let k = 0; k < 36; k++) {
        const t = yi + k / 36;
        for (const lift of lifts) {
          const p = projectSpiral(helixPoint(t, SPIRAL_OUTER, lift), w, h);
          if (p.z < 0.7) continue;
          if (fit === "x" && (p.sy < -h * 0.08 || p.sy > h * 1.02)) continue;
          minX = Math.min(minX, p.sx);
          maxX = Math.max(maxX, p.sx);
          minY = Math.min(minY, p.sy);
          maxY = Math.max(maxY, p.sy);
          n += 1;
        }
      }
    }
    if (!n) break;
    const halfX = Math.max(w / 2 - minX, maxX - w / 2, 1);
    const halfY = Math.max(Math.abs(minY - h / 2), Math.abs(maxY - h / 2), 1);
    const zx =
      (pad > 0 ? w / 2 - pad : (w / 2) * (1 - margin * 2)) / halfX;
    const zy = ((h / 2) * (1 - margin * 2)) / halfY;
    const bottomOffset = maxY - h / 2;
    const bottomTarget = pad > 0 ? h / 2 - pad : h * (0.5 - margin);
    const zBottom = bottomOffset > 1 ? bottomTarget / bottomOffset : 4;
    const scale =
      fit === "touch" ? Math.min(zx, zBottom) : fit === "both" ? Math.min(zx, zy) : zx;
    const next = Math.max(0.55, Math.min(4.6, zoom * scale));
    if (Math.abs(next - zoom) < 0.03) {
      zoom = next;
      break;
    }
    zoom = next;
  }
  spiral.yaw = saved.yaw;
  spiral.pitch = saved.pitch;
  spiral.lookY = saved.lookY;
  spiral.zoom = saved.zoom;
  return zoom;
}

function spiralHomePose() {
  const t = spiralFocusT();
  const pose = {
    yaw: (3 * Math.PI) / 2 - t * Math.PI * 2,
    pitch: -0.95,
    lookY: t * SPIRAL_PITCH - SPIRAL_PITCH * 0.28,
    zoom: 2.6,
  };
  pose.zoom = spiralPoseZoom(pose, { fit: "touch", gap: 50, focusYear: true });
  return pose;
}

function spiralFullPose() {
  const t = spiralFocusT();
  const pose = {
    yaw: (3 * Math.PI) / 2 - t * Math.PI * 2,
    pitch: -1.5,
    lookY: t * SPIRAL_PITCH,
    zoom: 1.15,
  };
  pose.zoom = spiralPoseZoom(pose, { margin: 0.08, fit: "both" });
  return pose;
}

function applySpiralHomeView() {
  const pose = spiralHomePose();
  spiral.yaw = pose.yaw;
  spiral.pitch = pose.pitch;
  spiral.lookY = pose.lookY;
  spiral.zoom = pose.zoom;
  spiral.centered = true;
  spiral.dirty = true;
}

function animateSpiralPose(pose) {
  spiral.anim = {
    fromYaw: spiral.yaw,
    toYaw: shortestAngle(spiral.yaw, pose.yaw),
    fromPitch: spiral.pitch,
    toPitch: pose.pitch,
    fromLook: spiral.lookY,
    toLook: pose.lookY,
    fromZoom: spiral.zoom,
    toZoom: pose.zoom,
    t0: performance.now(),
    dur: 700,
  };
  spiral.dirty = true;
}

function focusSpiralToday() {
  animateSpiralPose(spiralHomePose());
}

function focusSpiralFull() {
  animateSpiralPose(spiralFullPose());
}

function setupSpiral() {
  const canvas = document.getElementById("spiral-canvas");
  const view = document.getElementById("spiral-view");
  if (!canvas || !view || setupSpiral.ready) return;
  setupSpiral.ready = true;

  const ro = new ResizeObserver(() => {
    if (document.body.dataset.tab === "spiral") resizeSpiralCanvas();
  });
  ro.observe(view);

  canvas.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 && e.button !== 2) return;
    canvas.setPointerCapture(e.pointerId);
    spiral.dragging = true;
    spiral.moved = false;
    spiral.pointerId = e.pointerId;
    spiral.lastX = e.clientX;
    spiral.lastY = e.clientY;
    spiral.anim = null;
    canvas.classList.add("is-dragging");
    syncSpiralHud(null);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (spiral.dragging && spiral.pointerId === e.pointerId) {
      const dx = e.clientX - spiral.lastX;
      const dy = e.clientY - spiral.lastY;
      if (Math.abs(dx) + Math.abs(dy) > 3) spiral.moved = true;
      spiral.lastX = e.clientX;
      spiral.lastY = e.clientY;
      if (e.shiftKey || e.buttons === 2) {
        const maxY = Math.max(0.2, spiral.yearCount * SPIRAL_PITCH);
        spiral.lookY = Math.min(maxY, Math.max(0, spiral.lookY + dy * 0.0045));
      } else {
        spiral.yaw += dx * 0.008;
        spiral.pitch += dy * 0.006;
      }
      spiral.dirty = true;
      return;
    }
    if (document.body.dataset.tab !== "spiral") return;
    const hit = pickSpiral(e.clientX, e.clientY);
    const next = hit && hit.kind === "day" ? hit : null;
    const same =
      (!!spiral.hover === !!next) &&
      (!next || spiral.hover.date === next.date);
    if (!same) {
      spiral.hover = next;
      spiral.dirty = true;
    }
    syncSpiralHud(next, e.clientX, e.clientY);
  });
  canvas.addEventListener("pointerup", (e) => {
    if (spiral.pointerId !== e.pointerId) return;
    const wasDrag = spiral.moved;
    spiral.dragging = false;
    spiral.pointerId = null;
    canvas.classList.remove("is-dragging");
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch (err) {
      /* already released */
    }
    if (wasDrag || e.button === 2) return;
    const hit = pickSpiral(e.clientX, e.clientY);
    if (hit && hit.loc) {
      const locs = locationsForDate(filteredLocations(), hit.date);
      if (locs.length) openDayPopover(e, locs);
    }
  });
  canvas.addEventListener("pointercancel", () => {
    spiral.dragging = false;
    spiral.pointerId = null;
    canvas.classList.remove("is-dragging");
  });
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.92 : 1.08;
      spiral.zoom = Math.max(0.45, Math.min(4.6, spiral.zoom * factor));
      spiral.dirty = true;
    },
    { passive: false },
  );
  canvas.addEventListener("pointerleave", () => {
    if (spiral.dragging) return;
    if (spiral.hover) {
      spiral.hover = null;
      syncSpiralHud(null);
      spiral.dirty = true;
    }
  });
}

