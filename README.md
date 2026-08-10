# Hunger Games

A small web app that turns a list of names into a Hunger Games-style elimination sim. Names are paired into districts (2 per district). Portrait search returns up to five web image results (DuckDuckGo via local API, Wikipedia backup) so you can pick one, with avatars as a fallback.

## Run

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — local app
- `npm test` — unit tests
- `npm run test:coverage` — coverage report
- `npm run build` — production build

## How it works

1. Paste names in pairs (2 per district; one per line or comma-separated)
2. Review fetched portraits (re-search or use avatar)
3. Watch day-by-day arena events until one victor remains

Image search uses the Vite/preview server route `/api/image-search` (needs `npm run dev` or `npm run preview`).
