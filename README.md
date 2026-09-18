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
  "events": [
    {
      "id": "evt-001",
      "person": "B",              // "B" or "M"
      "type": "stay",              // "stay" | "flight" | "transit"
      "start": "2024-09-28",       // ISO date, inclusive
      "end": "2024-10-02",         // ISO date, inclusive
      "location": "Bir",           // stay only
      "country": "India",          // stay only — drives legend color
      "from": "Delhi", "to": "NYC",// flight/transit only
      "label": "Bir Trip",
      "emoji": "✔️",
      "cancelled": true             // optional
    }
  ]
}
```

Colors are assigned automatically: each **country** gets a hue, and each
distinct **location** within that country gets a different shade of that
hue, so e.g. Mumbai and Delhi are both reddish but visually distinct.
Flights/transit legs are drawn as a dashed marker instead of a location
fill, since they represent movement, not a place you stayed.

## Editing data

The page is fully editable in the browser:

- **+ Add Event** / click a colored day / **Manage Events** → edit or delete
- Edits are saved to `localStorage` so they survive a page refresh
- **Reset** discards local edits and reloads from `data.json`
- **Copy JSON** shows the current full dataset (pretty-printed, sorted by
  date) and copies it to your clipboard — paste it over `data.json` to open
  a PR with your changes

There is no backend: nothing is written back to the repo automatically.

## Deployment

The site has no build step, so the `gh-pages` branch is just a copy of
these static files. GitHub Pages must be pointed at it once, in the repo's
**Settings → Pages → Build and deployment → Source: Deploy from a branch →
Branch: `gh-pages` / `(root)`**.

To publish an update: merge your change into the branch this repo deploys
from, then re-sync `gh-pages` with the latest files and push it.
