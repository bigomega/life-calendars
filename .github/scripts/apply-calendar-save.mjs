#!/usr/bin/env node
/**
 * Apply a life-calendars Save payload from a GitHub issue.
 * Reads GITHUB_EVENT_PATH (never interpolates payload into a shell).
 * Writes data.json on TARGET_BRANCH via the Contents API (GITHUB_TOKEN).
 */
import { gunzipSync, gzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const SAVE_ISSUE_TITLE = "life-calendars-save";
export const PAYLOAD_PREFIX = "v1.";
export const MARKER = "<!-- life-calendars-save v1 -->";
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const LOC_ID = /^loc-[A-Za-z0-9-]{1,40}$/;
const PERSON = new Set(["B", "M", "Both"]);
const MAX_JSON_BYTES = 200_000;
const MAX_LOCATIONS = 1000;
const MAX_PEOPLE = 20;
const MAX_STR = { id: 48, name: 80, icon: 8, location: 120, country: 80, comments: 500 };

export function allowedActors() {
  return String(process.env.ALLOWED_ACTORS || "bigomega,Euterpixel")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedActor(login) {
  return allowedActors().includes(String(login || "").trim().toLowerCase());
}

export function extractPayload(body) {
  const text = String(body || "");
  const token = text.match(/\bv1\.[A-Za-z0-9_-]+\b/);
  return token ? token[0] : null;
}

export function decodePayload(token) {
  if (typeof token !== "string" || !token.startsWith(PAYLOAD_PREFIX)) {
    throw new Error("payload version");
  }
  const b64 = token.slice(PAYLOAD_PREFIX.length);
  if (!/^[A-Za-z0-9_-]+$/.test(b64) || b64.length > 80_000) {
    throw new Error("payload charset");
  }
  const buf = Buffer.from(b64, "base64url");
  if (buf.length < 20 || buf[0] !== 0x1f || buf[1] !== 0x8b) {
    throw new Error("payload gzip");
  }
  const jsonBytes = gunzipSync(buf);
  if (jsonBytes.length > MAX_JSON_BYTES) throw new Error("payload too large");
  const parsed = JSON.parse(jsonBytes.toString("utf8"));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("payload root");
  }
  return parsed;
}

export function encodePayload(data) {
  const json = JSON.stringify(data);
  const gz = gzipSync(Buffer.from(json, "utf8"), { level: 9 });
  return PAYLOAD_PREFIX + gz.toString("base64url");
}

function str(v, max) {
  const s = typeof v === "string" ? v : v == null ? "" : String(v);
  if (s.length > max) throw new Error("field too long");
  if (s.includes("\u0000")) throw new Error("nul");
  return s;
}

function isoDate(v) {
  const s = str(v, 10);
  if (!ISO_DATE.test(s)) throw new Error("date");
  const t = Date.parse(s + "T00:00:00Z");
  if (!Number.isFinite(t)) throw new Error("date");
  return s;
}

export function sanitizeCalendar(raw) {
  if (!raw || typeof raw !== "object") throw new Error("calendar");
  const peopleIn = Array.isArray(raw.people) ? raw.people : [];
  const locsIn = Array.isArray(raw.locations) ? raw.locations : [];
  if (peopleIn.length > MAX_PEOPLE || locsIn.length > MAX_LOCATIONS) {
    throw new Error("too many records");
  }
  const people = peopleIn.map((p) => {
    if (!p || typeof p !== "object") throw new Error("person");
    return {
      id: str(p.id, MAX_STR.id),
      name: str(p.name, MAX_STR.name),
      icon: str(p.icon, MAX_STR.icon),
    };
  });
  if (!people.some((p) => p.id === "B") || !people.some((p) => p.id === "M")) {
    throw new Error("people");
  }
  const seen = new Set();
  const locations = locsIn.map((l) => {
    if (!l || typeof l !== "object") throw new Error("location");
    const id = str(l.id, MAX_STR.id);
    if (!LOC_ID.test(id) || seen.has(id)) throw new Error("location id");
    seen.add(id);
    const person = str(l.person || "B", 8);
    if (!PERSON.has(person)) throw new Error("person");
    const start = isoDate(l.start);
    const end = isoDate(l.end || l.start);
    if (end < start) throw new Error("range");
    return {
      id,
      person,
      start,
      end,
      location: str(l.location, MAX_STR.location),
      country: str(l.country, MAX_STR.country),
      comments: str(l.comments, MAX_STR.comments),
    };
  });
  locations.sort(
    (a, b) => a.start.localeCompare(b.start) || a.id.localeCompare(b.id),
  );
  return { people, locations };
}

export function prettyCalendar(data) {
  return JSON.stringify(data, null, 2) + "\n";
}

export function issueBody(token) {
  return `${MARKER}\n\n${token}\n`;
}

function repoSlug(repo) {
  const s = String(repo || "");
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(s)) throw new Error("repo");
  return s;
}

function issueNumber(n) {
  const num = typeof n === "number" ? n : Number(n);
  if (!Number.isInteger(num) || num < 1 || num > 2_000_000_000) {
    throw new Error("issue");
  }
  return num;
}

function branchName(name) {
  const s = String(name || "gh-pages");
  if (!/^[A-Za-z0-9._\/-]{1,200}$/.test(s) || s.includes("..")) {
    throw new Error("branch");
  }
  return s;
}

function apiError(res, path, json) {
  const msg = json && json.message ? json.message : res.statusText;
  const err = new Error(`GitHub API ${res.status} ${path}: ${msg}`);
  err.status = res.status;
  return err;
}

async function gh(path, opts = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("missing GITHUB_TOKEN");
  if (typeof path !== "string" || !path.startsWith("/")) {
    throw new Error("api path");
  }
  const res = await fetch(`https://api.github.com${path}`, {
    ...opts,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
      ...opts.headers,
    },
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!res.ok) throw apiError(res, path, json);
  return json;
}

async function redactAndClose(repo, number, message) {
  await gh(`/repos/${repo}/issues/${number}`, {
    method: "PATCH",
    body: JSON.stringify({
      state: "closed",
      body: message,
    }),
  });
}

export async function applyFromEvent(event) {
  const repo = repoSlug(process.env.GITHUB_REPOSITORY);
  const branch = branchName(process.env.TARGET_BRANCH || "gh-pages");
  const issue = event && event.issue;
  if (!issue) throw new Error("event");
  const number = issueNumber(issue.number);
  const login = issue.user && issue.user.login;
  const title = issue.title || "";

  if (title !== SAVE_ISSUE_TITLE) {
    return { skipped: true, reason: "title" };
  }

  const redactFail = async (reason) => {
    await redactAndClose(
      repo,
      number,
      `Save rejected (${reason}). Payload removed.`,
    );
    return { ok: false, reason, redacted: true };
  };

  if (!isAllowedActor(login)) {
    return redactFail("actor");
  }

  try {
    const token = extractPayload(issue.body);
    if (!token) throw new Error("missing");
    const raw = decodePayload(token);
    const data = sanitizeCalendar(raw);
    const content = prettyCalendar(data);

    let current = null;
    try {
      current = await gh(
        `/repos/${repo}/contents/data.json?ref=${encodeURIComponent(branch)}`,
      );
    } catch (err) {
      if (!err || err.status !== 404) throw err;
    }

    const nextB64 = Buffer.from(content, "utf8").toString("base64");
    if (current && current.content) {
      const cur = Buffer.from(
        String(current.content).replace(/\n/g, ""),
        "base64",
      ).toString("utf8");
      if (cur === content) {
        await redactAndClose(
          repo,
          number,
          `Save matched current \`data.json\` on \`${branch}\`. Payload removed.`,
        );
        return { ok: true, unchanged: true };
      }
    }

    const putBody = {
      message: "Update data.json",
      content: nextB64,
      branch,
    };
    if (current && current.sha) putBody.sha = current.sha;

    const put = await gh(`/repos/${repo}/contents/data.json`, {
      method: "PUT",
      body: JSON.stringify(putBody),
    });
    const sha = put.commit && put.commit.sha ? put.commit.sha : "";
    await redactAndClose(
      repo,
      number,
      `Save applied on \`${branch}\`${sha ? ` (\`${sha.slice(0, 7)}\`)` : ""}. Payload removed.`,
    );
    return { ok: true, sha };
  } catch (err) {
    const reason = err && err.message ? err.message : "error";
    try {
      await redactAndClose(
        repo,
        number,
        `Save failed (${reason}). Payload removed.`,
      );
    } catch {
      // still surface original
    }
    return { ok: false, reason };
  }
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function withMockGithub(handler, fn) {
  const orig = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, opts = {}) => {
    const method = String(opts.method || "GET").toUpperCase();
    const body = opts.body ? JSON.parse(opts.body) : null;
    calls.push({ url: String(url), method, body });
    return handler(String(url), method, body, calls);
  };
  try {
    return await fn(calls);
  } finally {
    globalThis.fetch = orig;
  }
}

function issueEvent(overrides = {}) {
  const { user, ...rest } = overrides;
  return {
    issue: {
      number: 42,
      title: SAVE_ISSUE_TITLE,
      body: "",
      user: { login: (user && user.login) || "bigomega" },
      ...rest,
    },
  };
}

async function selfTest() {
  const failures = [];
  const assert = (cond, msg) => {
    if (!cond) failures.push(msg);
  };

  const sample = {
    people: [
      { id: "B", name: "Bharath", icon: "♂" },
      { id: "M", name: "Mariana", icon: "♀" },
    ],
    locations: [
      {
        id: "loc-test1",
        person: "Both",
        start: "2024-01-02",
        end: "2024-01-01",
        location: "X",
        country: "India",
        comments: "",
      },
    ],
  };
  try {
    sanitizeCalendar(sample);
    assert(false, "expected invalid range");
  } catch {
    assert(true, "range");
  }

  sample.locations[0].end = "2024-01-03";
  const injected = JSON.parse(
    JSON.stringify({
      people: sample.people,
      locations: [
        {
          ...sample.locations[0],
          extra: "drop-me",
        },
      ],
    }).replace(
      /"comments":""/,
      '"comments":"","__proto__":{"polluted":true}',
    ),
  );
  const clean = sanitizeCalendar(injected);
  assert(clean.locations[0].id === "loc-test1", "id");
  assert(!("polluted" in Object.prototype), "object proto");
  assert(!Object.prototype.hasOwnProperty.call(clean.locations[0], "extra"), "drop extra");
  assert(!Object.prototype.hasOwnProperty.call(clean.locations[0], "polluted"), "loc proto");
  assert(clean.locations[0].end === "2024-01-03", "end");

  const token = encodePayload(clean);
  assert(token.startsWith("v1."), "prefix");
  const round = sanitizeCalendar(decodePayload(token));
  assert(JSON.stringify(round) === JSON.stringify(clean), "roundtrip");

  const body = issueBody(token);
  assert(extractPayload(body) === token, "extract");
  const url =
    "https://github.com/bigomega/life-calendars/issues/new?title=" +
    encodeURIComponent(SAVE_ISSUE_TITLE) +
    "&body=" +
    encodeURIComponent(body);
  assert(url.length < 7200, "url " + url.length);

  const file = resolve("data.json");
  const disk = JSON.parse(readFileSync(file, "utf8"));
  const live = sanitizeCalendar(disk);
  const liveToken = encodePayload(live);
  const liveUrl =
    "https://github.com/bigomega/life-calendars/issues/new?title=" +
    encodeURIComponent(SAVE_ISSUE_TITLE) +
    "&body=" +
    encodeURIComponent(issueBody(liveToken));
  assert(liveUrl.length < 7200, "live url " + liveUrl.length);

  process.env.ALLOWED_ACTORS = "bigomega,Euterpixel";
  assert(isAllowedActor("bigomega"), "allow bigomega");
  assert(isAllowedActor("BigOmega"), "allow bigomega case");
  assert(isAllowedActor("Euterpixel"), "allow Euterpixel");
  assert(isAllowedActor("euterpixel"), "allow euterpixel");
  assert(isAllowedActor("EUTERPIXEL"), "allow EUTERPIXEL");
  assert(!isAllowedActor("octocat"), "deny other");
  assert(!isAllowedActor("euterpixelx"), "deny near-miss");
  assert(!isAllowedActor(""), "deny empty");

  try {
    decodePayload("v1.$$$$");
    assert(false, "bad charset");
  } catch {
    assert(true, "charset");
  }

  process.env.ALLOWED_ACTORS = "bigomega,wife-login";
  assert(isAllowedActor("wife-login"), "extend allowlist");
  process.env.ALLOWED_ACTORS = "bigomega,Euterpixel";

  const prev = {
    token: process.env.GITHUB_TOKEN,
    repo: process.env.GITHUB_REPOSITORY,
    branch: process.env.TARGET_BRANCH,
    actors: process.env.ALLOWED_ACTORS,
  };
  process.env.GITHUB_TOKEN = "test-token";
  process.env.GITHUB_REPOSITORY = "bigomega/life-calendars";
  process.env.TARGET_BRANCH = "gh-pages";
  process.env.ALLOWED_ACTORS = "bigomega,Euterpixel";

  const liveContent = prettyCalendar(live);
  const liveB64 = Buffer.from(liveContent, "utf8").toString("base64");

  const skip = await applyFromEvent({
    issue: { number: 1, title: "other", user: { login: "bigomega" }, body: "" },
  });
  assert(skip.skipped && skip.reason === "title", "skip title");

  await withMockGithub(async () => jsonResponse({}), async (calls) => {
    const result = await applyFromEvent(
      issueEvent({ user: { login: "octocat" }, body: issueBody(liveToken) }),
    );
    assert(result.ok === false && result.reason === "actor", "deny actor");
    assert(
      calls.length === 1 && calls[0].method === "PATCH" && !calls.some((c) => c.method === "PUT"),
      "actor redacts only",
    );
    assert(
      calls[0].body && String(calls[0].body.body).includes("Payload removed"),
      "actor redacts body",
    );
  });

  await withMockGithub(async () => jsonResponse({}), async (calls) => {
    const result = await applyFromEvent(
      issueEvent({ user: { login: "NotAllowed" }, body: issueBody(liveToken) }),
    );
    assert(result.ok === false && result.reason === "actor", "deny mixed-case other");
    assert(!calls.some((c) => c.method === "PUT"), "deny mixed-case no put");
  });

  await withMockGithub(async () => jsonResponse({}), async (calls) => {
    const result = await applyFromEvent(issueEvent({ body: "no payload here" }));
    assert(result.ok === false && result.reason === "missing", "missing payload");
    assert(!calls.some((c) => c.method === "PUT"), "missing no put");
    assert(calls.some((c) => c.method === "PATCH"), "missing redacts");
  });

  await withMockGithub(async (url, method) => {
    if (method === "GET" && url.includes("/contents/data.json")) {
      return jsonResponse({ sha: "sha-1", content: liveB64 });
    }
    if (method === "PATCH") return jsonResponse({});
    return jsonResponse({ message: "unexpected" }, 500);
  }, async (calls) => {
    const result = await applyFromEvent(issueEvent({ body: issueBody(liveToken) }));
    assert(result.ok && result.unchanged, "unchanged");
    assert(!calls.some((c) => c.method === "PUT"), "unchanged no put");
  });

  await withMockGithub(async (url, method) => {
    if (method === "GET" && url.includes("/contents/data.json")) {
      return jsonResponse({ sha: "sha-1", content: liveB64 });
    }
    if (method === "PATCH") return jsonResponse({});
    return jsonResponse({ message: "unexpected" }, 500);
  }, async (calls) => {
    const result = await applyFromEvent(
      issueEvent({
        user: { login: "Euterpixel" },
        body: issueBody(liveToken),
      }),
    );
    assert(result.ok && result.unchanged, "euterpixel allowed");
    assert(!calls.some((c) => c.method === "PUT"), "euterpixel unchanged no put");
  });

  await withMockGithub(async (url, method) => {
    if (method === "GET" && url.includes("/contents/data.json")) {
      return jsonResponse({ sha: "sha-1", content: liveB64 });
    }
    if (method === "PATCH") return jsonResponse({});
    return jsonResponse({ message: "unexpected" }, 500);
  }, async (calls) => {
    const result = await applyFromEvent(
      issueEvent({
        user: { login: "eUtErPiXeL" },
        body: issueBody(liveToken),
      }),
    );
    assert(result.ok && result.unchanged, "euterpixel mixed case allowed");
    assert(calls.some((c) => c.method === "PATCH"), "euterpixel mixed case redacts");
  });

  const changed = sanitizeCalendar({
    people: live.people,
    locations: live.locations.map((l, i) =>
      i === 0 ? { ...l, comments: "save-flow-test" } : l,
    ),
  });
  const changedToken = encodePayload(changed);

  await withMockGithub(async (url, method) => {
    if (method === "GET" && url.includes("/contents/data.json")) {
      return jsonResponse({ sha: "sha-1", content: liveB64 });
    }
    if (method === "PUT") {
      return jsonResponse({ commit: { sha: "abcdef1234567" } });
    }
    if (method === "PATCH") return jsonResponse({});
    return jsonResponse({ message: "unexpected" }, 500);
  }, async (calls) => {
    const result = await applyFromEvent(issueEvent({ body: issueBody(changedToken) }));
    assert(result.ok && result.sha === "abcdef1234567", "applied sha");
    const put = calls.find((c) => c.method === "PUT");
    assert(put, "applied put");
    assert(put.body.message === "Update data.json", "commit message");
    assert(put.body.branch === "gh-pages", "put branch");
    assert(put.body.sha === "sha-1", "put sha");
    const decoded = Buffer.from(put.body.content, "base64").toString("utf8");
    assert(decoded === prettyCalendar(changed), "put contents");
    assert(!decoded.includes(changedToken), "put has no token");
    const patch = calls.find((c) => c.method === "PATCH");
    assert(patch && String(patch.body.body).includes("Payload removed"), "close redacts");
    assert(patch.body.state === "closed", "closes issue");
  });

  await withMockGithub(async (url, method) => {
    if (method === "GET" && url.includes("/contents/data.json")) {
      return jsonResponse({ message: "Not Found" }, 404);
    }
    if (method === "PUT") {
      return jsonResponse({ commit: { sha: "newfile01" } });
    }
    if (method === "PATCH") return jsonResponse({});
    return jsonResponse({ message: "unexpected" }, 500);
  }, async (calls) => {
    const result = await applyFromEvent(issueEvent({ body: issueBody(changedToken) }));
    assert(result.ok && result.sha === "newfile01", "create on 404");
    const put = calls.find((c) => c.method === "PUT");
    assert(put && put.body.sha == null, "create without sha");
  });

  if (prev.token === undefined) delete process.env.GITHUB_TOKEN;
  else process.env.GITHUB_TOKEN = prev.token;
  if (prev.repo === undefined) delete process.env.GITHUB_REPOSITORY;
  else process.env.GITHUB_REPOSITORY = prev.repo;
  if (prev.branch === undefined) delete process.env.TARGET_BRANCH;
  else process.env.TARGET_BRANCH = prev.branch;
  if (prev.actors === undefined) delete process.env.ALLOWED_ACTORS;
  else process.env.ALLOWED_ACTORS = prev.actors;

  if (failures.length) {
    console.error("self-test failed:", failures);
    process.exit(1);
  }
  console.log(
    JSON.stringify({
      ok: true,
      liveLocations: live.locations.length,
      liveUrlLength: liveUrl.length,
      tokenBytes: liveToken.length,
    }),
  );
}

const isMain = process.argv[1] && process.argv[1].endsWith("apply-calendar-save.mjs");
if (isMain && process.argv.includes("--self-test")) {
  selfTest().catch((err) => {
    console.error(err && err.message ? err.message : err);
    process.exit(1);
  });
} else if (isMain) {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error("GITHUB_EVENT_PATH required");
    process.exit(1);
  }
  const event = JSON.parse(readFileSync(eventPath, "utf8"));
  applyFromEvent(event)
    .then((result) => {
      console.log(JSON.stringify({ result: { ...result, sha: result.sha || undefined } }));
      if (result.skipped) process.exit(0);
      if (result.ok) process.exit(0);
      if (result.reason === "actor" && result.redacted) process.exit(0);
      process.exit(1);
    })
    .catch((err) => {
      console.error(err && err.message ? err.message : err);
      process.exit(1);
    });
}
