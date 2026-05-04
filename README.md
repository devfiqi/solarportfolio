# solarportfolio

Personal portfolio for [Salman Fiqi](https://linkedin.com/in/salmanfiqi) — an interactive
orbital map of work, experience, leadership, and the way I think.

**Live:** [solarportfolio.vercel.app](https://solarportfolio.vercel.app)

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript
- Tailwind CSS v4
- Lucide icons
- Deployed on Vercel

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## Project structure

```
app/
  page.tsx              # all portfolio content lives here (timelineData)
  layout.tsx
  globals.css
components/ui/
  radial-orbital-timeline.tsx   # the orbital map component
  card.tsx, button.tsx, badge.tsx
lib/
  utils.ts
```

To update the portfolio, edit `timelineData` and `PROJECTS` in [`app/page.tsx`](app/page.tsx).
The orbital UI, animation, and command palette live in
[`components/ui/radial-orbital-timeline.tsx`](components/ui/radial-orbital-timeline.tsx).

## Keyboard shortcuts

- `⌘K` / `Ctrl+K` — command palette
- `/` — open command palette
- `Esc` — close panel / palette

## Deploy

Production deploys go to Vercel. Push to `main` triggers an auto-deploy via the Git
integration. To deploy manually:

```bash
vercel --prod
```
