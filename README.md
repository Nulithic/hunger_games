# Hunger Games

A small web app that turns a list of names into a Hunger Games-style elimination sim. Names are paired into districts (2 per district). Portrait search returns up to five web image results (DuckDuckGo via local API, Wikipedia backup) so you can pick one, with avatars as a fallback.

## Run

```bash
npm install
npm run dev
```

The app is built for **`/hunger_games/`** (as on `https://taenae.app/hunger_games/`). `npm run dev` redirects `/` to `/hunger_games/`. Override with `VITE_BASE=/` in `.env.local` if you want the host root instead.

## Scripts

- `npm run dev` — local app
- `npm test` — unit tests
- `npm run test:coverage` — coverage report
- `npm run build` — production build (`tsc -b && vite build`; use `npx vite build` if typecheck fails)
- `npm run image-search` — portrait API on `127.0.0.1:4174` (VPS / production)

## Deploy (taenae.app)

Live layout on the VPS:

| URL | Serves |
|-----|--------|
| `https://taenae.app/` | Portal from [deploy/portal](deploy/portal) |
| `https://taenae.app/hunger_games/` | This app’s `dist/` |
| `https://taenae.app/api/kokoro/` | Docker Kokoro on `127.0.0.1:8880` |
| `https://taenae.app/api/image-search` | Dedicated image-search unit on `127.0.0.1:4174` |

Paths on the box:

```text
/home/ubuntu/taenae/hunger_games      # git clone
/home/ubuntu/taenae/www/hunger_games  # published dist/
/home/ubuntu/taenae/www/portal        # home portal
```

Caddy config: [deploy/Caddyfile](deploy/Caddyfile). Image search unit: [deploy/image-search.service](deploy/image-search.service) (`hunger-games-image-search`). Build with `VITE_KOKORO_URL=/api/kokoro`.

### Update an existing VPS

```bash
cd /home/ubuntu/taenae/hunger_games
git pull
npm ci
npx vite build
rsync -a --delete dist/ /home/ubuntu/taenae/www/hunger_games/
rsync -a --delete deploy/portal/ /home/ubuntu/taenae/www/portal/
```

Restart `hunger-games-image-search` only if the image-search server code changed:

```bash
sudo systemctl restart hunger-games-image-search
```

Kokoro and Caddy stay running.

## How it works

1. Paste names in pairs (2 per district; one per line or comma-separated)
2. Review fetched portraits (re-search or use avatar)
3. Watch day-by-day arena events until one victor remains

Image search uses `/api/image-search`. Locally that is the Vite plugin (`npm run dev`). On the VPS it is the dedicated `hunger-games-image-search` unit (see Deploy).

## Narration

Arena narration uses the browser speech API by default. For higher-quality local voices, run Kokoro TTS in Docker on your PC (CPU or NVIDIA GPU) — the app probes it automatically, offers a voice picker, and falls back to the browser if it is offline.

See [docs/narration-kokoro.md](docs/narration-kokoro.md). For a VPS behind Caddy (same host as the app), use [deploy/Caddyfile](deploy/Caddyfile) and keep `VITE_KOKORO_URL=/api/kokoro` at build time.
