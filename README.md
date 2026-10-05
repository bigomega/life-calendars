# Life Calendars

A static, no-backend web page that shows a 12-month calendar of where you've
been, color-coded by location. Currently one tab: **Location Calendar**.

Live site: https://bigomega.github.io/life-calendars/ (served from the
`gh-pages` branch — see "Deployment" below).

## Stack

Plain HTML/CSS/vanilla JS. No framework, no bundler, no dependencies — the
files run as-is, both opened locally and hosted on GitHub Pages.

- `index.html` — page structure and modals
- `style.css` — dark-mode styling, responsive month grid
- `app.js` — all app logic (rendering, filtering, editing, persistence)
- `data.json` — the event data (source of truth for PRs)

## Data model

```jsonc
{
  "people": [{ "id": "B", "name": "Bharath", "icon": "♂" }, ...],
  "locations": [
    {
      "id": "loc-001",
      "person": "B",              // "B", "M", or "Both"
      "start": "2024-09-28",      // ISO date, inclusive
      "end": "2024-10-02",        // ISO date, inclusive
      "location": "Bir",
      "country": "India",         // drives legend color and flag
      "label": "Bir Trip"
    }
  ]
}
```

Colors are assigned automatically: each **country** gets a hue, and each
distinct **location** within that country gets a different shade of that
hue, so e.g. Mumbai and Delhi are both reddish but visually distinct.

## Editing data

The page is fully editable in the browser:

- **+ Add** / click a colored day / **Manage** → edit or delete
- Edits are saved to `localStorage` so they survive a page refresh
- **Reset** discards local edits and reloads from `data.json`
- **Save** opens a prefilled GitHub issue. The dataset is gzip-compressed and
  base64url-encoded (`v1.…`) so it fits in the issue URL. An allowlisted
  GitHub Action (`bigomega`; add another login with `ALLOWED_ACTORS`, e.g.
  Mariana later) checks the opener and payload, writes `data.json` on
  `gh-pages` using `GITHUB_TOKEN`, then closes and redacts the issue. No
  personal access token is used in the browser. The unsaved banner stays
  until the published `data.json` matches the saved snapshot (or you Reset).

`issues` workflows only run from the repository **default branch**, which is
`gh-pages`. Pages and Save therefore share one branch. The Action checks
out only the trusted apply script and never interpolates issue contents
into a shell.

## Deployment

The site has no build step. GitHub Pages is **Deploy from a branch →
`gh-pages` / `(root)`**, and `gh-pages` is the repository default so the
Save workflow on this branch can run.

To publish an update: merge into `gh-pages`.
