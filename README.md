# tinf0il

A clean, fast proxy portal built on [Scramjet](https://github.com/MercuryWorkshop/scramjet) with libcurl transport. Browse, play, and work — privately.

---

## Features

- **Scramjet proxy** — full URL rewriting via service worker, libcurl transport
- **Tab cloaking** — spoof the tab title, favicon, and address bar host; presets for Schoology, Canvas, and Google Classroom; or import from any URL
- **Game & app catalog** — thousands of games via [3kh0 lite](https://github.com/3kh0/3kh0-lite), plus a curated app list
- **Themes** — midnight, daylight, acid, bubblegum
- **No logs** — zero telemetry, no tracking

---

## Stack

| Layer | Tech |
|---|---|
| Proxy | Scramjet |
| Transport | Wisp + libcurl |
| Server | Express 5 |
| UI | React 18 (CDN, no build step) |
| Runtime | Node.js ≥ 20.11 |

---

## Getting Started

```bash
npm install
npm start
```

Open `http://localhost:8787`.

To refresh the game catalog from 3kh0 lite:

```bash
npm run build:games
```

---

## Deployment

The server binds to `process.env.PORT` (default `8787`). It will walk up ports automatically if the port is in use. Works out of the box on any Node-capable host (Railway, Render, Heroku, VPS, etc.).

---

## License

MIT
