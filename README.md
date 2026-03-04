# Weekly Planner

A minimal web app to plan your week day-by-day and export it as a PDF.

## Motivation

This app exists to give you a simple, visual way to plan your week without complexity: see all seven days at once, add items (with optional title, description, color, and emoji) via a modal, and export the result as a PDF to save or print. Everything runs in the browser with no backend; your data is stored locally.

## Quick Start

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (e.g. `http://localhost:5173`).

## Usage

- **Week view** — All 7 days (Monday–Sunday) are shown in one view. Use the arrows to switch weeks; use **This week** to jump back to the current week.
- **Add item** — Click **+ Add item** on any day to open a modal where you can set a title, optional description, background color, and emoji.
- **Edit item** — Click an existing item card to open the same modal and edit it.
- **Remove item** — Click the × next to an item to remove it.
- **Save as PDF** — Click **Save as PDF** to download the current week. Your browser will ask where to save the file (e.g. `week-2025-03-03.pdf`).
- **Persistence** — The current week and its items are stored in `localStorage`, so they survive refresh and closing the tab.

**Tech:** React 19, TypeScript, Vite, and [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) for client-side PDF export.

## Contributing

Contributions are welcome. Please open an issue to discuss larger changes, or submit a pull request with a clear description of what you changed and why.
