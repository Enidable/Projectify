# 🧩 Projectify

A customizable, gamified planner for projects, milestones, and days — built for neurodivergent brains that thrive on structure, energy-aware scheduling, and a bit of XP.

**Projectify ≠ SummerQuest.** SummerQuest was a fixed 17-day summer snapshot; Projectify is the general, *editable* version: you create your own projects, checkpoints, and planned days entirely through the UI. No config files, no code diving.

## Features

- **Projects** — add, edit, delete. Each project has an icon, color, energy type (cognitively taxing / creative / hands-on / self-care), a goal, and optional start + target dates.
- **Planner (Calendar)** — add days, set your free time ranges per day, add a note, then schedule work blocks by picking a project + checkpoint + time + type. No code needed.
- **Timeline** — give projects start/target dates and see them as a shared visual timeline (day-first, EU dates).
- **Themes** — **☰ Menu → Theme**: pick Lilac (pink/purple), Sunset (warm orange), Ocean (blues), or Forest (greens). Saved in your config.
- **Gamification** — XP, levels, badges, and a day streak keep the momentum going.
- **Portable data** — everything lives in your browser (localStorage). Use **☰ Menu → Export backup** to download a JSON you can keep, restore, or share with a friend (they import it on their side).

## Run it

```bash
npm install
npm run dev      # start the dev server
```

Build for production:

```bash
npm run build
npm run preview
```

## Stack

- React 19 + Vite + Tailwind CSS v4 + Recharts
- State persisted to `localStorage` under `projectify_state_v1`

## How data works

- Projects and milestones are stored as plain objects.
- The calendar is keyed by date (`YYYY-MM-DD`) → `{ note, ranges, blocks }`.
- All editing happens in the UI; the context (`src/context/AppDataContext.jsx`) is the single source of truth.
- Export/Import wraps the same structure as JSON.

## Sharing with a friend

1. **☰ Menu → Export backup** → download `.json`.
2. Send them the file.
3. On their machine: **☰ Menu → Import JSON** and pick the file.

If you want *shared/cloud* data (multi-user, same store), that's a future upgrade — Projectify is designed so the data layer can swap from localStorage to a backend without touching the UI.

## Project structure

```
src/
  App.jsx                 # shell + page routing
  context/AppDataContext.jsx  # state, CRUD, persistence, derived XP
  data/defaults.js        # energies, colors, icons, flavors, config
  utils/helpers.js        # levels, badges, streaks, color styles
  components/             # Sidebar, Header, Modal, ImportExport
  pages/                  # Dashboard, Projects, Calendar, Timeline, Progress
```
