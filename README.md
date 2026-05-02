# 🎬 MyMovieList

A personal movie and TV series tracker. Search for titles, organize them into categories, track episodes, grade entries, and keep notes — backed by a REST API with JWT authentication.

[Live Demo](https://augustin-ploteanu.github.io/tum-web-lab7/)

---

## Features

- **Search** movies and TV shows via the TMDB API with pagination
- **My List** — add entries to one of four categories: Watching, Completed, Plan to Watch, Dropped
- **Episode tracking** — track watched vs total episodes
- **Grade & notes** — rate entries 1–10 and attach a personal note
- **Stats panel** — per-category counts, total episodes watched, and average grade
- **Search, sort, filter & paginate** within the list
- **Grid / list view**
- **Light / dark theme**
- **REST API** — full CRUD backed by Express, data persisted to `server/data/db.json`
- **JWT auth** — all API routes protected; token auto-fetched and refreshed by the frontend
- **Swagger UI** — interactive API docs at `http://localhost:3001/docs`

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `VITE_TMDB_API_KEY` | TMDB API key |
| `VITE_API_BASE_URL` | Backend URL (default `http://localhost:3001`) |

### 3. Run

```bash
npm run dev
```

This starts both the Express server (port `3001`) and the Vite dev server (port `5173`) concurrently.

| URL | What |
|---|---|
| `http://localhost:5173` | Frontend |
| `http://localhost:3001` | API |
| `http://localhost:3001/docs` | Swagger UI |

---

## API

### Authentication

All `/entries` endpoints require a `Bearer` token. Obtain one first:

```
POST /token
```

Returns `{ "token": "eyJ..." }` — valid for **1 minute**.

### Endpoints

| Method | Path | Permission | Description |
|---|---|---|---|
| `POST` | `/token` | — | Issue a JWT |
| `GET` | `/entries?page=1&limit=20` | `READ` | List entries (paginated) |
| `GET` | `/entries/:id` | `READ` | Get one entry |
| `POST` | `/entries` | `WRITE` | Create entry |
| `PUT` | `/entries/:id` | `WRITE` | Replace entry |
| `DELETE` | `/entries/:id` | `DELETE` | Delete entry |

---

## Screenshots

![1](screenshots/1.png)

![2](screenshots/2.png)

![3](screenshots/3.png)

![4](screenshots/4.png)

![5](screenshots/5.png)

![6](screenshots/6.png)

![7](screenshots/7.png)

