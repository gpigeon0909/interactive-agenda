# Weekly Planner

A minimal web app to plan your week day-by-day and export it as a PDF.

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (e.g. http://localhost:5173).

## Features

- **Week view** — All 7 days (Monday–Sunday) in one view.
- **Add items** — Type in the input under each day and click "Add" (or press Enter) to add items.
- **Remove items** — Click the × next to any item to remove it.
- **Week navigation** — Use ← / → to move to previous/next week. "This week" jumps back to the current week.
- **Save as PDF** — Click "Save as PDF" to download the current week. Your browser will prompt you where to save the file (e.g. `week-2025-03-03.pdf`).
- **Persistence** — The current week and its items are stored in `localStorage`, so they survive refresh and closing the tab.

## Tech

- React 19 + TypeScript + Vite
- [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) for client-side PDF export (no backend)
