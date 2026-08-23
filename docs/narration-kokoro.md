# Local Kokoro narrator (Windows PC)

The arena can use **Kokoro TTS** when a local server is running, and falls back to the **browser Web Speech API** automatically.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) for Windows (WSL2 backend)
- This repo’s Vite app (`npm run dev`)

## Start Kokoro (CPU)

From the repo root:

```bash
docker compose -f docker/kokoro/docker-compose.yml up -d
```

First boot downloads the model (can take a few minutes). Check health:

```bash
curl http://127.0.0.1:8880/health
```

## Start Kokoro (GPU / NVIDIA)

If you have an NVIDIA GPU with Docker GPU support (Desktop + WSL2 GPU, or Linux NVIDIA Container Toolkit):

```bash
docker compose -f docker/kokoro/docker-compose.yml -f docker/kokoro/docker-compose.gpu.yml up -d
```

That swaps in `kokoro-fastapi-gpu` and requests one NVIDIA device. Verify the host can see the GPU first:

```bash
docker run --rm --gpus all nvidia/cuda:12.3.2-base-ubuntu22.04 nvidia-smi
```

GPU is optional — CPU is fine for short arena beats. Use GPU if you want lower latency / faster warmup on a gaming PC.

## Run the app

```bash
npm run dev
```

Vite proxies `/api/kokoro` → `http://127.0.0.1:8880` (see `vite.config.ts`), so the browser avoids CORS issues. The UI lives at `/hunger_games/`; APIs stay on the host root (`/api/kokoro`, `/api/image-search`).

In the arena, the footer shows **Narrator: Kokoro** when the probe succeeds, or **Narrator: Browser** when Kokoro is down. With Kokoro active, use the **Voice** dropdown to pick a narrator (choice is saved in local storage).

## VPS (taenae.app, CPU, same host)

On the server, run the CPU compose file only. Keep port 8880 on localhost. Put Caddy in front using [deploy/Caddyfile](../deploy/Caddyfile) so the browser calls `https://taenae.app/api/kokoro` (same origin — no CORS). Build with:

```env
VITE_BASE=/hunger_games/
VITE_KOKORO_URL=/api/kokoro
```

Publish `dist/` to `/var/www/taenae.app/hunger_games/`. The home portal at `/` is a separate static site.

## Stop Kokoro

```bash
docker compose -f docker/kokoro/docker-compose.yml down
```

If you started with the GPU override, include both files:

```bash
docker compose -f docker/kokoro/docker-compose.yml -f docker/kokoro/docker-compose.gpu.yml down
```

## Config

Copy `.env.example` to `.env.local` if you need a custom URL:

```env
VITE_KOKORO_URL=/api/kokoro
```

## Notes

- CPU image is enough for short arena beats; GPU helps when you have NVIDIA and want snappier synthesis.
- If Docker is stopped mid-game, narration falls back to the browser voice on the next line.
- Speed slider uses playback rate for Kokoro audio and utterance rate for browser TTS.
- Voice selection applies to the next spoken line (and later lines) while Narrator is Kokoro.
