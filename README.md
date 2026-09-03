<img width="1900" height="572" alt="RoadmapFlow timeline view" src="https://github.com/user-attachments/assets/222c7fd6-a15a-4143-94f2-10374feca654" />

# RoadmapFlow

An interactive, Gantt-style roadmap planner. Lay out projects as rows, stack task bars across a custom month-by-month timeline, and drag or resize them directly on the chart. Every change is written straight to SQLite.

Built as a small full-stack app: a React + Vite frontend talking to an Express + `better-sqlite3` API.

---

## Features

**Direct manipulation timeline**
- Drag a task bar horizontally to shift its start date
- Drag it vertically to move it to a different stacking layer within its project row
- Grab either edge to resize the bar and change its duration
- Drag the bottom edge of a project row to change that row's height (persisted per project)
- Changes save automatically on mouse-up, with a "Saving..." indicator in the header

**Editing**
- Click any bar to open a modal for name, project, start day, duration, layer, and colour
- Click a project name to rename or delete it (deleting a project removes its tasks)
- Month names are edited inline in the header — saved on blur or `Enter`
- Add and remove projects, months, and tasks from the toolbar

**Custom timeline**
- The timeline is built from a list of months you define, not a fixed calendar
- Each month contributes its own day count, so the total width adapts as you add or remove months
- Ships seeded with `Jul`–`Dec` and three sample projects

---

## Tech stack

| Layer | Details |
|---|---|
| Frontend | React 19, Vite 8, TypeScript entry point with JSX components |
| Styling | Plain CSS (`Roadmap.css`, `App.css`, `index.css`) |
| Backend | Node.js, Express 4, `cors` |
| Database | SQLite via `better-sqlite3` (synchronous, file-backed) |
| Tooling | ESLint 10, `typescript-eslint` |

---

## Project structure

```text
roadmap/
├── backend/
│   ├── server.js          # Express app, schema bootstrap, seed data, all REST routes
│   ├── roadmap.db         # SQLite file (auto-created and seeded on first run)
│   └── package.json
├── frontend/
│   ├── index.html         # Entry — loads /src/main.tsx
│   ├── src/
│   │   ├── main.tsx       # React root
│   │   ├── App.tsx        # Page shell
│   │   ├── components/
│   │   │   ├── Roadmap.jsx    # The whole chart: drag, resize, modals, CRUD
│   │   │   └── Roadmap.css
│   │   ├── api/
│   │   │   ├── api.js         # fetch wrappers for the REST API
│   │   │   └── mockApi.js     # legacy localStorage stub, not currently wired in
│   │   └── assets/
│   ├── vite.config.ts
│   └── package.json
└── read.txt               # original scratch setup notes
```

---

## Getting started

### Prerequisites

- Node.js 18 or newer (`better-sqlite3` ships prebuilt binaries; on some platforms you may need build tools for a native compile)
- npm

### 1. Backend

```bash
cd backend
npm install
npm start          # or: node server.js
```

Runs on **http://localhost:3000**. On first start it creates `roadmap.db`, builds the tables, and inserts sample projects, months, and tasks.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite serves on **http://localhost:5173** by default.

The API base URL is hardcoded in `frontend/src/api/api.js`:

```js
const API_URL = 'http://localhost:3000/api';
```

Change that line if your backend runs elsewhere. CORS is open on the server, so no proxy is needed for local development.

### Other scripts

```bash
# frontend
npm run build      # tsc -b && vite build
npm run preview    # serve the production build
npm run lint       # eslint

# backend
npm run dev        # nodemon server.js (install nodemon separately)
```

---

## Data model

```sql
projects (id INTEGER PK, name TEXT, height INTEGER DEFAULT 120)
months   (id INTEGER PK, name TEXT, days INTEGER DEFAULT 31)
tasks    (id INTEGER PK, name TEXT, projectId INTEGER,
          startDay INTEGER, durationDays INTEGER,
          layer INTEGER DEFAULT 0, color TEXT)
```

Notes on the geometry:

- `startDay` and `durationDays` are counted in days from the very start of the timeline, across all months — not within a single month.
- `layer` is the vertical slot inside a project row. Multiple tasks can overlap in time by sitting on different layers.
- Rendering constants live in `Roadmap.jsx`: `DAY_WIDTH = 30` px per day, and 40 px per layer.
- `height` on a project is the pixel height of its row, so rows with many layers can be given more space.

---

## API reference

Base URL: `http://localhost:3000/api`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/data` | Returns `{ projects, months, tasks }` — the whole board in one call |
| `POST` | `/projects` | Create a project (`{ name }`), defaults to height 120 |
| `PUT` | `/projects/:id` | Update `{ name, height }` |
| `DELETE` | `/projects/:id` | Delete the project **and all of its tasks** |
| `POST` | `/months` | Create a month (`{ name }`), defaults to 31 days |
| `PUT` | `/months/:id` | Rename `{ name }` |
| `DELETE` | `/months/:id` | Delete a month |
| `POST` | `/tasks` | Create `{ name, projectId, startDay, durationDays, layer, color }` |
| `PUT` | `/tasks/:id` | Update the same fields |
| `DELETE` | `/tasks/:id` | Delete a task |

The frontend loads everything once via `GET /data`, then keeps local state in sync and writes individual mutations back as you edit.

---

## Known rough edges

Worth being aware of if you plan to build on this:

- **Duplicate entry points.** `src/main.jsx` and `src/App.jsx` are unused leftovers; `index.html` loads `main.tsx` → `App.tsx`. Deleting the `.jsx` pair would avoid confusion.
- **`mockApi.js` is stale.** It uses an older `{ category, startMonth, duration }` shape backed by `localStorage` and isn't imported anywhere. Either rewrite it against the current model or remove it.
- **Month day counts are fixed at 31.** The schema supports a per-month `days` value, but nothing in the UI or API sets it to anything else.
- **No `PORT` env var.** The backend port is a constant in `server.js`.
- **`roadmap.db` is committed.** The database file is tracked in the repo, so pulling brings someone else's data with it. Consider gitignoring it and relying on the seed logic.
- **Interactions are mouse-only.** `mousedown`/`mousemove` handlers mean drag and resize don't work on touch devices.
- **Some code comments are in Persian.**

---

## Contributing

Issues and pull requests are welcome — see [Issues](../../issues).

---

## License

No `LICENSE` file is currently present in the repository. Add one before relying on this in another project.
